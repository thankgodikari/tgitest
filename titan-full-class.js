class TitanPredictionEngine {

    constructor(configManager) {
        this.config = configManager;
        this.adapter = null;
        this.qTable = new Map(); // Session Q-Learning memory (Map used by adviceRecovery / Q-signal)
        this.logger = new Logger(this.config);

        // --- In-memory buffers (no disk persistence) ---
        this.historyMicro = [];
        this.historyShort = [];
        this.historyMedium = [];
        this.historyLong = [];

        // state flags
        this.ghostMode = false;
        this.probationMode = false;
        this.probationWins = 0;
        this.consecutiveToxicLosses = 0;
        this.virtualWins = 0;
        this.followUpCount = 0;
        this.lastEntropy = { micro: 0, meso: 0, macro: 0 };

        // internal tracking
        this.warmupCounter = 0;
        this.inWarmup = true;
        this._initialized = false;
        this.decisionLog = [];      // stores {ts, lane, chosenMult, shouldBet, pbs..., pmins..., ensemble, reason}
        this.shadowSamples = [];    // stores { decision, outcome } for in-run backtest/bootstrapping
        // per-run bootstrap tail probability (computed once after warmup)
        this._prob_k_losses = 1.0; // default conservative value until bootstrap runs
        // CUSUM internal state for quick change detection
        this.cusumPos = 0;
        this.cusumNeg = 0;

        // runtime stats for new detectors
        this.lastEWMA = { micro: 0, meso: 0, macro: 0 };
        this.lastAutocorr = { micro: 0, meso: 0, macro: 0 };
        this.lastSkewKurt = { micro: {skew:0,kurt:0}, meso: {skew:0,kurt:0}, macro: {skew:0,kurt:0} };

        // shadow mode decision/outcome recording
        this.shadowSamples = [];

        // Ensure qTable exists (defensive)
        if (!this.qTable) this.qTable = new Map();

        // --- Optional: sync prediction warmupDefault to global warmup rounds (single source of truth)
        // Sync prediction warmup to global warmup if requested
        if (this.config.get('prediction','syncWarmupToGlobal')) {
            try {
                const gw = this.config.get('warmup','rounds');
                if (typeof gw === 'number' && gw > 0) {
                    // Use ConfigManager.update API to keep changes consistent
                    if (typeof this.config.update === 'function') {
                        this.config.update({ prediction: { warmupDefault: { value: gw } } });
                    } else {
                        this.config.prediction.warmupDefault = gw;
                    }
                }
            } catch (e) { /* safe no-op */ }
        }

        // Apply operational-mode bundle
        const mode = (this.config.get('prediction','operationalMode') || 'balanced').toLowerCase();
        if (mode === 'conservative') {
            // tighten thresholds
            if (typeof this.config.update === 'function') {
                this.config.update({
                    prediction: {
                        pMinReference: { value: 0.97 },
                        ensembleVarThresholdNormal: { value: 0.02 },
                        cpIncreaseFactor: { value: 1.6 }
                    }
                });
            } else {
                this.config.prediction.pMinReference = 0.97;
                this.config.prediction.ensembleVarThresholdNormal = 0.02;
                this.config.prediction.cpIncreaseFactor = 1.6;
            }
        } else if (mode === 'aggressive') {
            // loosen thresholds for sniper behaviour
            if (typeof this.config.update === 'function') {
                this.config.update({
                    prediction: {
                        pMinReference: { value: 0.90 },
                        ensembleVarThresholdNormal: { value: 0.20 },
                        cpIncreaseFactor: { value: 1.1 }
                    }
                });
            } else {
                this.config.prediction.pMinReference = 0.90;
                this.config.prediction.ensembleVarThresholdNormal = 0.20;
                this.config.prediction.cpIncreaseFactor = 1.1;
            }
        } else {
            // balanced (defaults) — ensure sensible defaults are present
            if (typeof this.config.update === 'function') {
                this.config.update({
                    prediction: {
                        pMinReference: { value: this.config.get('prediction', 'pMinReference') || 0.95 },
                        ensembleVarThresholdNormal: { value: this.config.get('prediction', 'ensembleVarThresholdNormal') || 0.05 },
                        cpIncreaseFactor: { value: this.config.get('prediction', 'cpIncreaseFactor') || 1.5 }
                    }
                });
            }
        }

        // BOCPD state (approximation using Bernoulli observations on reference multiplier)
        this._bocpd = {
            runProb: 1.0,       // probability mass at r=0 (we keep a scalar "change probability" estimate)
            lastAlpha: this.config.get('prediction', 'priorAlpha'),
            lastBeta: this.config.get('prediction', 'priorBeta')
        };

        // GARCH state (keep last variance estimate)
        this.lastGARCH = { micro: 0, meso: 0, macro: 0 };

        // +++ Auto-tuner runtime state +++
        this.autoTune = {
            enabled: this.config.get('prediction','autoTune_enable'),
            intervalRounds: this.config.get('prediction','autoTune_intervalRounds'),
            lr: this.config.get('prediction','autoTune_learningRate'),
            minFactor: this.config.get('prediction','autoTune_minFactor'),
            maxFactor: this.config.get('prediction','autoTune_maxFactor'),
            minTrials: this.config.get('prediction','autoTune_minTrials'),
            targets: this.config.get('prediction','autoTune_targets') || { low:0.95, med:0.88, high:0.82 },
            lastRunAtRound: 0,
            factors: { low: 1.0, med: 1.0, high: 1.0 } // multiplicative tuning factors (1.0 = neutral)
        };
        // ensure decisionLog and shadowSamples exist
        this.decisionLog = this.decisionLog || [];
        this.shadowSamples = this.shadowSamples || []; // {round, multLabel, outcome:true/false, ts}
    }

    // Bridge for UI / StatsPanel: provide compact brain state
    getStats() {
        return {
            climate: (this.lastEntropy && this.lastEntropy.macro !== undefined) ? this.lastEntropy.macro.toFixed(2) : "0.00",
            frozen: !!this.ghostMode,
            pingPong: (this.lastEntropy && this.lastEntropy.micro !== undefined) ? (this.lastEntropy.micro >= 0.5) : false
        };
    }

    // initialize(adapter) -- expected by rest of bot; do not rely on adapter.getHistory()
    initialize(adapter) {
        this.adapter = adapter;

        // start with empty in-memory buffers; warmup will fill them as rounds arrive
        this._clearAllBuffers();

        // set warmup counter from config (in-memory only)
        this.warmupCounter = 0;
        this.inWarmup = true;

        if (this.config.get('debug')) {
            console.log('🧠 TitanPredictionEngine v9.0 initialized (in-memory buffers). Warmup rounds:', this.config.get('prediction', 'warmupDefault'));
        }

        // mark initial analysis state
        this._analyzeMarketHealth();
        this._initialized = true;

        // +++ Runtime tracking object (must exist early so other methods can reference it)
        // This is intentionally initialized here (constructor) so code that runs soon after
        // can safely access this.runtime.roundsSinceStart and other runtime counters.
        this.runtime = {
            // incremented once per observed round (pushRound)
            roundsSinceStart: 0,
            // number of scheduled resumes that have occurred
            resumesDone: 0,
            // current schedule key (null when not scheduled)
            currentScheduleKey: null,
            // whether we are paused due to take-profit (used by scheduling logic)
            pausedBecauseTP: false
        };
    }

    // +++ RESTORED & UPGRADED: update(lastCrash, wasWin, currentRecoveryLevel)
    // Purpose: receive each round result, handle Sniper Events, update buffers, detectors, shadow samples.
    update(lastCrash, wasWin = false, currentRecoveryLevel = 0) {
        try {
            // =========================================================
            // +++ PHASE 5: SNIPER EVENT HANDLING (Smart Follow-Up & Safe Landing) +++
            // =========================================================

            // SANDBOX SAFETY PATCH:
            // 1. Check if 'window' exists (Bustabit/Browser).
            // 2. Check if 'crashBot' is initialized.
            // 3. Check if 'strategy.runtime' is ready.
            const globalScope = (typeof window !== 'undefined') ? window : (typeof self !== 'undefined' ? self : null);

            if (globalScope && globalScope.crashBot?.strategy?.runtime) {
                const rt = globalScope.crashBot.strategy.runtime;
                const cfg = this.config;

                if (rt.recoveryMode) {
                    if (wasWin) {
                        // --- SCENARIO: RECOVERY WIN ---
                        rt.emergencyFollowUp = 0; // Cancel Emergency
                        rt.lastBetWasRecoveryWin = true; // Trigger Discipline Check

                        // Check for Safe Landing (Debt Cleared)
                        // Note: currentDebt is maintained by StrategyEngine. We check here to trigger cooldown.
                        if (rt.currentDebt <= 0) {
                            const cooldownRounds = cfg.get('prediction', 'recovery_postExitCooldown') || 2;
                            rt.postRecoveryCooldown = cooldownRounds;
                            if (cfg.get('debug')) console.log(`[SNIPER] Recovery Exit. Safe Landing activated for ${cooldownRounds} rounds.`);
                        }
                    } else {
                        // --- SCENARIO: RECOVERY LOSS ---
                        // Trigger Emergency Smart Follow-Up
                        const limit = cfg.get('prediction', 'recovery_smartFollowUpLimit') || 3;
                        rt.emergencyFollowUp = limit;
                        if (cfg.get('debug')) console.log(`[SNIPER] Recovery Loss. Emergency Follow-Up engaged (${limit} shots authorized).`);
                    }
                } else {
                    // --- SCENARIO: NORMAL MODE ---
                    if (wasWin) {
                        rt.lastBetWon = true; // Trigger Strike-Watch-Strike Pacing
                    }
                }
            }
            // =========================================================
            // END SNIPER EVENT HANDLING
            // =========================================================

            // buffer sizes (fall back to sensible defaults)
            const bMicro = Number(this.config.get('prediction', 'bufferMicro')) || 5;
            const bShort = Number(this.config.get('prediction', 'bufferShort')) || 10;
            const bMedium = Number(this.config.get('prediction', 'bufferMedium')) || 25;
            const bLong = Number(this.config.get('prediction', 'bufferLong')) || 100;

            // --- 1) push into multi-scale in-memory buffers (newest at index 0)
            this.historyMicro.unshift(Number(lastCrash));
            if (this.historyMicro.length > bMicro) this.historyMicro.pop();

            this.historyShort.unshift(Number(lastCrash));
            if (this.historyShort.length > bShort) this.historyShort.pop();

            this.historyMedium.unshift(Number(lastCrash));
            if (this.historyMedium.length > bMedium) this.historyMedium.pop();

            this.historyLong.unshift(Number(lastCrash));
            if (this.historyLong.length > bLong) this.historyLong.pop();

            // --- 2) virtual wins (simple baseline)
            const baseline = 2.0;
            if (Number(lastCrash) >= baseline) this.virtualWins++;
            else this.virtualWins = 0;

            // --- 3) detectors & feature updates
            if (typeof this._analyzeMarketHealth === 'function') {
                this._analyzeMarketHealth();
            }

            // --- Continuous & decaying change-point penalty ---
            try {
                const phScore = (typeof this._detectChangePointPH === 'function') ? (this._detectChangePointPH(this.historyMicro) || 0) : 0;
                const cusumScore = (typeof this._detectChangePointCUSUM === 'function') ? (this._detectChangePointCUSUM(this.historyMicro) || 0) : 0;
                let bocpdScore = 0;
                if (this.config.get('prediction', 'enableBOCPD') && typeof this._detectChangePointBOCPD === 'function') {
                    bocpdScore = this._detectChangePointBOCPD(this.historyMicro) || 0;
                }

                const normalizeScore = s => (typeof s === 'boolean') ? (s ? 1.0 : 0.0) : (isFinite(s) ? Math.max(0, Math.min(1, s)) : 0);
                const sPH = normalizeScore(phScore);
                const sCUSUM = normalizeScore(cusumScore);
                const sBOCPD = normalizeScore(bocpdScore);

                const cpCombined = (sPH + sCUSUM + sBOCPD) / 3;

                const cpFactorMax = this.config.get('prediction', 'cpIncreaseFactor') || 1.5;
                const sigmoid = x => 1 / (1 + Math.exp(-x));
                const rawPenalty = 1 + (cpFactorMax - 1) * sigmoid(6 * (cpCombined - 0.5));

                this.cpPenalty = (this.cpPenalty || 1.0) * 0.7 + rawPenalty * 0.3;
                if (!isFinite(this.cpPenalty) || this.cpPenalty < 1) this.cpPenalty = 1;

                this.changePointActive = cpCombined > 0.05;
                this.lastChangeScore = cpCombined;

                if (this.changePointActive) {
                    this._lastChangePointAt = Date.now();
                    if (this.config.get('debug')) console.log(`⚠️ Change point elevated (score=${cpCombined.toFixed(3)}, penalty=${this.cpPenalty.toFixed(3)})`);
                }
            } catch (e) {
                if (this.config.get && this.config.get('debug')) console.warn('Continuous CPD penalty error', e);
            }

            // --- 4) warmup handling
            if (this.inWarmup) {
                this.warmupCounter = (this.warmupCounter || 0) + 1;
                const warmupDefault = Number(this.config.get('prediction', 'warmupDefault')) || 25;

                if (this.warmupCounter >= warmupDefault) {
                    this.inWarmup = false;
                    try {
                        const k = Number(this.config.get('prediction', 'business_k_loss_tolerance')) || 3;
                        this._prob_k_losses = (typeof this._bootstrapTailEstimate === 'function')
                            ? this._bootstrapTailEstimate(k, 1000)
                            : 1.0;
                    } catch (e) {
                        this._prob_k_losses = 1.0;
                    }
                    this._initialized = true;
                }
            }

            // --- 5) shadow sample recording
            try {
                this.shadowSamples = this.shadowSamples || [];
                this.shadowSamples.push({
                    crash: Number(lastCrash),
                    wasWin: !!wasWin,
                    recoveryLevel: Number(currentRecoveryLevel) || 0,
                    ts: Date.now(),
                    // +++ FIX: Store Lane Data for Auto-Tuner +++
                    data: this.decisionLog.length > 0 ? this.decisionLog[this.decisionLog.length - 1] : null
                });
                if (this.shadowSamples.length > bLong) this.shadowSamples.shift();

                // Q-Learning Update
                try {
                    let pending = null;
                    for (let i = this.decisionLog.length - 1; i >= 0; i--) {
                        const d = this.decisionLog[i];
                        if (d && d.awaitOutcome) {
                            pending = d;
                            break;
                        }
                    }
                    if (pending) {
                        pending.outcome = { crash: Number(lastCrash), wasWin: !!wasWin, ts: Date.now() };
                        pending.awaitOutcome = false;

                        const rewardType = this.config.get('learning', 'rewardType') || 'binary';
                        let reward = 0;
                        if (rewardType === 'binary') reward = wasWin ? 1.0 : 0.0;
                        else {
                            reward = wasWin ? ((pending.chosenMult ? (Number(pending.chosenMult) - 1) : 1.0)) : -1.0;
                        }

                        const key = `${pending.lane || 'L'}|${pending.chosenMult || 'M'}`;
                        if (!this.qTable.has(key)) this.qTable.set(key, { q: 0.0, n: 0 });
                        const entry = this.qTable.get(key);
                        const alpha = Number(this.config.get('learning', 'alpha')) || 0.08;

                        const qOld = entry.q || 0.0;
                        const qNew = ((1 - alpha) * qOld) + (alpha * reward);

                        entry.q = qNew;
                        entry.n = (entry.n || 0) + 1;
                        this.qTable.set(key, entry);
                    }
                } catch (e) {
                    // Q-learning error
                }
            } catch (e) {
                if (this.config.get('debug')) console.warn('shadow sample push error', e);
            }

        } catch (e) {
            if (this.config.get && this.config.get('debug')) console.error('TitanPredictionEngine.update error:', e);
        }
    }

    // Centralized warmup completion helper:
    // - ensures effective-sample (nEff) is sufficient or warmupMax reached
    // - flips inWarmup -> false
    // - resets warmupCounter
    // - sets probation rounds
    // - runs in-run bootstrap tail estimate and stores result in this._prob_k_losses
    _completeWarmup() {
        if (!this.inWarmup) return; // already completed

        // get config-driven parameters (no fallback logic here)
        const warmupDefault = this.config.get('prediction', 'warmupDefault');
        const warmupMax = this.config.get('prediction', 'warmupMax');
        const minEff = this.config.get('prediction', 'minEffectiveSample');
        const refMult = this.config.get('prediction', 'pMinReferenceMult');

        // compute effective sample for the reference multiplier
        const stats = this._computePosteriorStats(refMult);
        const nEff = stats.nEff;

        // If effective sample is insufficient and we haven't reached warmupMax, defer completion
        if (typeof nEff === 'number' && nEff < minEff && this.warmupCounter < warmupMax) {
            if (this.config.get('debug')) {
                console.log('Warmup deferred: nEff', nEff, 'minEff', minEff, 'warmupCounter', this.warmupCounter, 'warmupMax', warmupMax);
            }
            // keep warming — caller will call _completeWarmup() again in future iterations
            return;
        }

        // Complete warmup: flip flags, reset counters, and set probation window
        this.inWarmup = false;
        this.warmupCounter = 0;
        this._probationRemaining = this.config.get('prediction', 'postWarmProbationRounds');

        // Run bootstrap tail estimate (in-memory). Let exceptions be caught and logged.
        try {
            const k = this.config.get('prediction', 'business_k_loss_tolerance');
            // moderate iterations for startup speed (tunable in config)
            this._prob_k_losses = this._bootstrapTailEstimate(k, 1000);
            if (this.config.get('debug')) console.log('Warmup complete — Bootstrap tail estimate (k=' + k + '):', this._prob_k_losses);
        } catch (e) {
            if (this.config.get('debug')) console.warn('bootstrap tail estimator error', e);
            // conservative assignment in exceptional cases
            this._prob_k_losses = 1.0;
        }
    }

    // Public alias so external scheduler/timer code can explicitly end warmup:
    completeWarmup() { this._completeWarmup(); }

    // -----------------------
    // Public compatibility method
    // -----------------------
    decide(mode, lastResult) {
        // 0. UPDATE RUNTIME STATE (Virtual Wins & Pacing)
        if (lastResult) {
            if (lastResult.isWin) {
                this.virtualWins = (this.virtualWins || 0) + 1;
                this.runtime.lastBetWon = true; // Flag for Strike-Watch-Strike

                // RECOVERY TRACKING
                if (mode === 'RECOVERY') {
                    this.runtime.emergencyFollowUp = 0; // Cancel emergency
                    this.runtime.lastBetWasRecoveryWin = true; // Trigger Discipline Check

                    // Check if debt cleared for Safe Landing
                    if (this.runtime.currentDebt <= 0) {
                        const cooldown = this.config.get('prediction', 'recovery_postExitCooldown') || 2;
                        this.runtime.postRecoveryCooldown = cooldown;
                    }
                }
            } else {
                // LOSS
                this.virtualWins = 0;
                this.runtime.lastBetWon = false;

                // RECOVERY EMERGENCY TRIGGER
                if (mode === 'RECOVERY') {
                    const limit = this.config.get('prediction', 'recovery_smartFollowUpLimit') || 3;
                    this.runtime.emergencyFollowUp = limit;
                }
            }
        }

        // 1. POST-RECOVERY COOLDOWN (Safe Landing)
        // If we recently cleared debt, force "Paper Trading" for X rounds
        if (this.runtime.postRecoveryCooldown > 0) {
            this.runtime.postRecoveryCooldown--;
            return { allow: false, target: 1.0, regime: 'COOLDOWN', reason: `SAFE_LANDING (${this.runtime.postRecoveryCooldown})` };
        }

        // 2. GET MARKET STABILITY DATA (MSV)
        // We assume predict() now returns the enhanced object with .msv attached (from Phase 4)
        const prediction = this.predict();
        const msv = prediction.msv || { score: 0, status: 'UNKNOWN', mode: 'BALANCED' };

        // ============================================
        // RECOVERY MODE LOGIC (The Deep Striker)
        // ============================================
        if (mode === 'RECOVERY') {
            const recoveryTarget = this.config.get('recovery', 'target') || 2.0;

            // A. EMERGENCY FOLLOW-UP (Smart Follow-Up)
            // If we just lost a recovery bet, attack the gap immediately
            if (this.runtime.emergencyFollowUp > 0) {
                this.runtime.emergencyFollowUp--;
                // In emergency, we bypass strict MSV but check for absolute toxicity (-5.0)
                if (msv.score > -5.0) {
                    return {
                        allow: true,
                        target: recoveryTarget,
                        regime: 'RECOVERY_EMERGENCY',
                        reason: `SMART_FOLLOW_UP (${this.runtime.emergencyFollowUp})`
                    };
                }
            }

            // B. PARTIAL WIN DISCIPLINE (The "Bank It" Rule)
            // If we won but are still in debt, PAUSE unless market is Mooning
            if (this.runtime.lastBetWasRecoveryWin && this.runtime.currentDebt > 0) {
                const moonMode = (msv.mode === 'AGGRESSIVE' && msv.score > 5.0);
                const lockedPingPong = (msv.isPingPong && msv.pingPongTarget === 'HIGH');

                if (!moonMode && !lockedPingPong) {
                    this.runtime.lastBetWasRecoveryWin = false; // Reset flag so we can bet next round if stable
                    return { allow: false, target: recoveryTarget, regime: 'RECOVERY_PAUSE', reason: "DISCIPLINE: BANKED_PARTIAL_WIN" };
                }
            }

            // C. STANDARD ENTRY GATE (Strict MSV)
            // Do not enter recovery if the market is a storm
            if (msv.status === 'UNSTABLE') {
                return { allow: false, target: recoveryTarget, regime: 'RECOVERY_WAIT', reason: `MSV: UNSTABLE (${msv.score.toFixed(2)})` };
            }

            // D. STANDARD ADVICE
            // Fallback to standard advice (bet sizing checks)
            const advice = this.adviceRecovery();
            return {
                allow: advice.action === 'BET',
                target: recoveryTarget,
                regime: 'RECOVERY',
                reason: advice.reason || 'MSV_APPROVED'
            };
        }

            // ============================================
            // NORMAL MODE LOGIC (The Sentient Sniper)
        // ============================================
        else if (mode === 'NORMAL') {
            // A. PING-PONG OVERRIDE
            // If OPR detects Ping-Pong, ignore standard variance checks
            if (msv.isPingPong) {
                if (msv.pingPongTarget === 'HIGH') {
                    // Strike on the predicted High Swing
                    const ppTarget = this.config.get('prediction', 'normalBullMult') || 2.0;
                    return {
                        allow: true,
                        target: ppTarget,
                        regime: 'SPECIALIST',
                        reason: `SNIPER: PING-PONG HIGH`
                    };
                } else {
                    return { allow: false, target: 1.0, regime: 'SPECIALIST', reason: "PING-PONG: WAITING FOR LOW" };
                }
            }

            // B. STANDARD STABILITY CHECK (WCDA + AGA)
            if (msv.status === 'UNSTABLE') {
                this.lastRegime = 'STORM';
                return { allow: false, target: 1.0, regime: 'STORM', reason: `MSV: CLUSTER RISK (${msv.score.toFixed(2)})` };
            }

            // C. PACING (Strike-Watch-Strike)
            // If we won last round, force a skip to verify trend (unless Aggressive Mode)
            if (this.runtime.lastBetWon && msv.mode !== 'AGGRESSIVE') {
                this.runtime.lastBetWon = false; // Consume flag
                return { allow: false, target: 1.0, regime: 'OBSERVING', reason: "PACING: SNIPER PAUSE" };
            }

            // D. STANDARD PREDICTION EXECUTION
            // Uses the adjustedPMin calculated in Phase 4
            this.lastRegime = prediction.lane.toUpperCase ? prediction.lane.toUpperCase() : prediction.lane;

            return {
                allow: prediction.shouldBet,
                target: prediction.multiplier,
                regime: this.lastRegime,
                reason: prediction.shouldBet ? `SNIPER_HIT (${prediction.lane})` : `WAIT (${prediction.lane} | Conf:${prediction.confidence?.toFixed(2)})`
            };
        }

        return { allow: false, reason: 'UNKNOWN_MODE' };
    }

    // PHASE 4: MARKET STABILITY VALIDATOR (MSV)
    // PHASE 4: MARKET STABILITY VALIDATOR (MSV)
    _analyzeMarketStability(historyMicro) {
        if (!historyMicro || historyMicro.length < 8) return { score: 0, status: 'UNKNOWN', mode: 'BALANCED' };

        const strictness = this.config.get('prediction', 'sniper_msvStrictness') || 'Medium';
        const pingPongEnabled = this.config.get('prediction', 'sniper_pingPongMode');

        // --- ENGINE A: WCDA (Weighted Cluster Density) ---
        let densityScore = 0;
        // Weights: Recent has higher impact.
        // Crash > 2.0 = +1. Crash < 1.5 = -1.5 (Asymmetric penalty)
        for (let i = 0; i < 8; i++) {
            const crash = historyMicro[i];
            const weight = (8 - i) / 8; // 1.0, 0.87, ... 0.12

            if (crash >= 2.0) densityScore += (1.0 * weight);
            else if (crash < 1.5) densityScore -= (1.5 * weight); // Penalize low crashes heavily
            else densityScore += (0.2 * weight); // Neutral zone (1.5 - 1.99)
        }

        // --- ENGINE B: OPR (Oscillatory Pattern Recognition) ---
        let isPingPong = false;
        let pingPongTarget = null;
        if (pingPongEnabled) {
            // Check alternating pattern L/H/L/H or H/L/H/L
            // Simple polarity check: >2.0 vs <2.0
            let flips = 0;
            for (let i = 0; i < 5; i++) {
                const curr = historyMicro[i] >= 2.0;
                const prev = historyMicro[i+1] >= 2.0;
                if (curr !== prev) flips++;
            }
            if (flips >= 4) {
                isPingPong = true;
                // Predict next: If last was Low, next is High
                pingPongTarget = (historyMicro[0] < 2.0) ? 'HIGH' : 'LOW';
            }
        }

        // --- ENGINE C: AGA (Adaptive Gap Analysis) ---
        // Calculate dynamic threshold based on historyMicro
        let gapRisk = false;

        // +++ ADDED: Real Gap Logic +++
        let currentGap = 0;
        let gaps = [];
        let lastCrashIdx = -1;

        // Scan history to find gaps between low crashes (< 1.5x)
        for(let i = 0; i < historyMicro.length; i++) {
            if (historyMicro[i] < 1.5) {
                if (lastCrashIdx !== -1) {
                    gaps.push(i - lastCrashIdx);
                }
                lastCrashIdx = i;
            }
        }

        // If we have data, analyze deviation
        if (gaps.length >= 2) {
            const meanGap = gaps.reduce((a,b)=>a+b,0) / gaps.length;
            // Current gap is distance from index 0 to next low crash
            const distToLow = historyMicro.findIndex(x => x < 1.5);
            const activeGap = (distToLow === -1) ? historyMicro.length : distToLow;

            // If the current safe gap is significantly shorter than average, risk is high
            // (We assume "Mean Reversion" of gap sizes)
            const gapConf = this.config.get('prediction', 'sniper_gapConfidence') || 2.0;
            if (activeGap < (meanGap / gapConf)) {
                gapRisk = true;
            }
        }

        // Add gapRisk to threshold logic
        if (gapRisk && !isPingPong) {
            densityScore -= 2.0; // Heavy penalty for timing risk
        }

        // --- PHASE 3: REGIME DECISION ---
        let regime = 'BALANCED';
        let safeToBet = true;

        // Thresholds based on Strictness
        const threshold = (strictness === 'High') ? 1.5 : (strictness === 'Low') ? -1.0 : 0.0;

        if (isPingPong) {
            regime = 'SPECIALIST'; // Sniper mode for PingPong
            // Only safe if we are targeting the HIGH swing
            safeToBet = (pingPongTarget === 'HIGH');
        } else if (densityScore < threshold) {
            regime = 'CONSERVATIVE'; // Storm detected
            safeToBet = false;
        } else if (densityScore > 3.0) {
            regime = 'AGGRESSIVE'; // Clear skies
        }

        return {
            score: densityScore,
            status: safeToBet ? 'STABLE' : 'UNSTABLE',
            mode: regime,
            isPingPong: isPingPong,
            pingPongTarget: pingPongTarget
        };
    }

    // -----------------------
    // Core prediction entry (normal mode)
    // -----------------------
    predict(currentMultiplier) {
        // ensure we have up-to-date health metrics
        this._analyzeMarketHealth();

        // +++ PHASE 4: MARKET STABILITY VALIDATOR (MSV) +++
        // Analyze the immediate micro-history for Clusters, Ping-Pong, and Gaps
        const msv = this._analyzeMarketStability(this.historyMicro || []);

        // +++ PHASE 3: AUTO-AGGRESSIVENESS (REGIME SWITCHING) +++
        // Dynamically adjust pMinReference based on MSV Regime
        const basePMinRef = this.config.get('prediction', 'pMinReference') || 0.90;
        let adjustedPMinRef = basePMinRef;

        if (msv.mode === 'AGGRESSIVE') {
            // Lower requirement to capture volume in clear skies
            adjustedPMinRef = Math.max(0.75, basePMinRef - 0.10);
        } else if (msv.mode === 'CONSERVATIVE') {
            // Demand perfection in storms
            adjustedPMinRef = Math.min(0.99, basePMinRef + 0.05);
        }

        // Calculate a scalar to apply to the calculated pMins later
        // If Base=0.90 and Adj=0.80, Scalar = 0.88 (Easier to bet)
        const regimeScalar = (basePMinRef > 0) ? (adjustedPMinRef / basePMinRef) : 1.0;

        // multi-scale tri-lane mapping (green/yellow/red) but decision is posterior-driven
        let targetLane = 'yellow';
        const trend = this._calculateTrendSlope();
        const entropy = this.lastEntropy.macro;
        const highThreshold = this.config.get('entropy_highThreshold');
        if (entropy < highThreshold) {
            if (trend > this.config.get('prediction', 'trendSlopeThreshold')) targetLane = 'green';
            else if (trend >= -0.05) targetLane = 'yellow';
            else targetLane = 'red';
        } else {
            targetLane = 'red';
        }

        // choose multiplier candidates from normal config
        const lowMult = this.config.get('normal', 'normalSurvivalMult'); // low lane -> survival
        const medMult = this.config.get('normal', 'normalBearMult');     // medium
        const highMult = this.config.get('normal', 'normalBullMult');    // high

        // Evaluate per-mult posterior lower bounds (using decay-weighted windows)
        const lowPB = this._computePosteriorLowerBound(lowMult);
        const medPB = this._computePosteriorLowerBound(medMult);
        const highPB = this._computePosteriorLowerBound(highMult);

        // Compute per-mult p_min scaled according to config.reference
        const base_pMinLow = this._computeScaledPmin(lowMult);
        const base_pMinMed = this._computeScaledPmin(medMult);
        const base_pMinHigh = this._computeScaledPmin(highMult);
        const cp = (this.cpPenalty || 1.0);

        const pMinCeil = this.config.get('prediction', 'pMinCeiling') || 0.99;

        // incorporate runtime auto-tune factors
        const tuneFactorLow  = (this.autoTune && this.autoTune.factors && Number(this.autoTune.factors.low))  || 1.0;
        const tuneFactorMed  = (this.autoTune && this.autoTune.factors && Number(this.autoTune.factors.med))  || 1.0;
        const tuneFactorHigh = (this.autoTune && this.autoTune.factors && Number(this.autoTune.factors.high)) || 1.0;

        // +++ APPLY REGIME SCALAR HERE +++
        // We multiply by regimeScalar to dynamically loosen or tighten the requirement
        const pMinLow  = Math.min(pMinCeil, base_pMinLow  * cp * tuneFactorLow * regimeScalar);
        const pMinMed  = Math.min(pMinCeil, base_pMinMed  * cp * tuneFactorMed * regimeScalar);
        const pMinHigh = Math.min(pMinCeil, base_pMinHigh * cp * tuneFactorHigh * regimeScalar);

        // ensemble variance & mean
        const ensemble = this._computeEnsemble({ lowPB, medPB, highPB });

        // +++ SPECIALIST MODE (PING-PONG) OVERRIDE +++
        // If MSV detects Ping-Pong, we ignore the Variance Threshold for the specific target
        const isSpecialist = (msv.mode === 'SPECIALIST');
        const varThreshold = this.config.get('prediction', 'ensembleVarThresholdNormal');

        const allowLow = lowPB >= pMinLow && (ensemble.var < varThreshold || (isSpecialist && msv.pingPongTarget === 'LOW'));
        const allowMed = medPB >= pMinMed && (ensemble.var < varThreshold); // Usually avoid med in ping pong
        const allowHigh = highPB >= pMinHigh && (ensemble.var < varThreshold || (isSpecialist && msv.pingPongTarget === 'HIGH'));

        let shouldBet = false;
        let chosenMult = lowMult;

        // Priority Logic:
        // 1. If Specialist, strictly target the Predicted Swing
        if (isSpecialist) {
            if (msv.pingPongTarget === 'HIGH' && allowHigh) { chosenMult = highMult; shouldBet = true; }
            else if (msv.pingPongTarget === 'LOW' && allowLow) { chosenMult = lowMult; shouldBet = true; }
        } else {
            // 2. Normal Logic: prefer highest acceptable but tie-break to frequency
            if (allowLow)  { chosenMult = lowMult;  shouldBet = true; }
            else if (allowMed) { chosenMult = medMult; shouldBet = true; }
            else if (allowHigh) { chosenMult = highMult; shouldBet = true; }
        }

        // Apply conservative Q influence
        try {
            if (typeof chosenMult !== 'undefined' && chosenMult !== null) {
                const qKey = `${targetLane}|${chosenMult}`;
                const qEntry = this.qTable.get(qKey);
                const minQ = Number(this.config.get('learning','minQSamples')) || 16;
                if (qEntry && (qEntry.n || 0) >= minQ) {
                    const qInfluence = Number(this.config.get('learning','qInfluence')) || 0.10;
                    ensemble.mean = (ensemble.mean || 0) + qInfluence * ((qEntry.q || 0) - 0.5);
                }
            }
        } catch (e) { /* ignore */ }

        // Warmup & probation enforcement
        const warmupDefault = this.config.get('prediction', 'warmupDefault');
        if (this.inWarmup) {
            if (this.warmupCounter < warmupDefault) {
                shouldBet = false;
            } else {
                this._completeWarmup();
            }
        } else if (this._probationRemaining > 0) {
            const boost = 1.05;
            const actualPB = (chosenMult === highMult) ? highPB : (chosenMult === medMult ? medPB : lowPB);
            // Re-check against boosted threshold
            let reqP = (chosenMult === highMult ? pMinHigh : (chosenMult === medMult ? pMinMed : pMinLow));
            if (actualPB < reqP * boost) shouldBet = false;
            this._probationRemaining -= 1;
        }

        // Append explainable decision record to in-memory log
        try {
            const decisionId = `d_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
            try {
                const pb = (chosenMult === highMult) ? highPB : (chosenMult === medMult ? medPB : lowPB);
                const decisionRecord = {
                    id: decisionId,
                    ts: new Date().toISOString(),
                    mode: this.mode || 'NORMAL',
                    regime: msv.mode, // Log the Regime
                    chosenMultiplier: chosenMult || null,
                    allow: shouldBet === true,
                    posterior: (typeof pb === 'number') ? pb : null,
                    pmin_adjusted: (chosenMult === highMult ? pMinHigh : (chosenMult === medMult ? pMinMed : pMinLow)),
                    ensemble_mean: (ensemble && typeof ensemble.mean !== 'undefined') ? ensemble.mean : null,
                    ensemble_var: (ensemble && typeof ensemble.var !== 'undefined') ? ensemble.var : null,
                    cpPenalty: this.cpPenalty || 1.0,
                    reason: shouldBet ? 'SNIPER_HIT' : 'WAIT',
                    msvScore: msv.score, // Log MSV Score
                    awaitOutcome: !!shouldBet
                };

                if (!Array.isArray(this.decisionLog)) this.decisionLog = [];
                this.decisionLog.push(decisionRecord);
                if (this.decisionLog.length > 2000) this.decisionLog.shift();
                this._lastDecisionId = decisionId;

                // Auto-tune hook
                if (typeof this._autoTuneAdjust === 'function') {
                    this._autoTuneAdjust( Number(this.runtime && this.runtime.roundsSinceStart) || Number(this.warmupCounter || 0) );
                }

                // Debug Log
                if (this.config.get('debug')) {
                    this.logger.log(`DECISION [${msv.mode}]: allow=${decisionRecord.allow} mult=${decisionRecord.chosenMultiplier} pb=${(decisionRecord.posterior||0).toFixed(3)} req=${(decisionRecord.pmin_adjusted||0).toFixed(3)} msv=${msv.score.toFixed(2)}`, decisionRecord.allow ? 'bet' : 'skip');
                }

            } catch (e) { console.warn('Logging error', e); }
        } catch (e) { /* safe no-op */ }

        // Log decision into shadowSamples for auto-tuning
        const decision = {
            ts: Date.now(),
            mode: 'NORMAL',
            lane: targetLane,
            chosenMult,
            shouldBet,
            pbs: { lowPB, medPB, highPB },
            pmins: { pMinLow, pMinMed, pMinHigh },
            ensemble,
            msv: msv // Capture MSV state for future analysis
        };
        decision.id = this._lastDecisionId || (`d_${Date.now()}_${Math.floor(Math.random() * 100000)}`);
        if (!Array.isArray(this.shadowSamples)) this.shadowSamples = [];
        this.shadowSamples.push({ type: 'DECISION', data: decision });

        // +++ RETURN OBJECT WITH MSV DATA +++
        return {
            shouldBet: shouldBet,
            multiplier: chosenMult,
            lane: targetLane,
            entropy: this.lastEntropy.macro.toFixed(2),
            msv: msv, // Pass the tactical analysis to Strategy Engine
            adjustedPMin: adjustedPMinRef, // Pass the effective reference PMin
            debug: {
                lowPB, medPB, highPB, pMinLow, pMinMed, pMinHigh, ensemble
            }
        };
    }

    // -----------------------
    // Recovery advice (conservative)
    // -----------------------
    adviceRecovery() {
        // If in ghost mode due to cliff guard, skip
        if (this.consecutiveToxicLosses >= this.config.get('safety_cliffGuardTrigger')) {
            this.ghostMode = true;
            this.probationMode = false;
        }

        if (this.ghostMode) {
            return { action: 'SKIP', reason: this.probationMode ? '🛡️ Probation: Validating Reversal' : '🛡️ Cliff Guard Active (Ghosting)' };
        }

        // Q-learning acts only as additive modifier: get current qScore but do not veto unless qTable has many samples
        const currentPattern = this._getPattern(4);
        const qScore = this.qTable.get(currentPattern) || 0;
        // q veto only if configured and q table has enough evidence (min sample)
        const qMinSamples = this.config.get('prediction', 'minEffectiveSample');
        if (this.qTable.has(currentPattern) && this.qTable.get(currentPattern + '_count') >= qMinSamples) {
            const vetoThreshold = this.config.get('qLearn_vetoThreshold');
            if (qScore <= vetoThreshold) {
                return { action: 'SKIP', reason: `🧠 Q-Veto: Toxic Pattern (${qScore} pts)` };
            }
        }

        // dynamic follow-up decision: only allow follow-ups when posterior+trend stability justify them
        const maxFollow = this.config.get('recovery', 'maxFollowUps');
        const isTrendy = this._calculateTrendSlope() > this.config.get('prediction', 'trendSlopeThreshold');

        const recoveryTarget = this.config.get('recovery', 'target');
        const pb = this._computePosteriorLowerBound(recoveryTarget);
        const pmin = this._computeScaledPmin(recoveryTarget);
        const trendStable = isTrendy && this._runLengthBelow(recoveryTarget, 2) === false; // require not extreme ping-pong

        // record recovery decision for shadow samples
        const recoveryDecision = {
            ts: Date.now(),
            mode: 'RECOVERY',
            target: recoveryTarget,
            pb: pb,
            pmin: pmin,
            trendStable: trendStable
        };
        if (!Array.isArray(this.shadowSamples)) this.shadowSamples = [];
        this.shadowSamples.push({ type: 'DECISION_RECOVERY', data: recoveryDecision });

        // allow bet if pb >= pmin and trendStable or isTrendy
        if (pb >= pmin && (trendStable || isTrendy)) {
            // optionally use Thompson/UCB follow-up selector (config-gated)
            const enableThompson = this.config.get('prediction', 'enableThompsonFollowUp');
            const maxFollowLocal = Number(maxFollow) || 2;
            let followUpCount = 1;
            if (enableThompson) {
                const method = this.config.get('prediction', 'followUpSelectionMethod') || 'thompson';
                if (method === 'ucb') {
                    followUpCount = this._selectFollowUpCountUCB(recoveryTarget, maxFollowLocal);
                } else {
                    followUpCount = this._selectFollowUpCountThompson(recoveryTarget, maxFollowLocal);
                }
            } else {
                // legacy deterministic margin logic (conservative)
                if (this.followUpCount < maxFollowLocal) {
                    const extraMargin = this.config.get('prediction', 'followUpExtraMargin');
                    const pbForExtra = this._computePosteriorLowerBound(recoveryTarget, extraMargin);
                    if (pbForExtra >= (pmin + extraMargin)) followUpCount = Math.min(maxFollowLocal, this.followUpCount + 1);
                    else followUpCount = 1;
                } else {
                    followUpCount = Math.min(maxFollowLocal, this.followUpCount);
                }
            }
            // set tracked followUpCount and return bet
            this.followUpCount = followUpCount;
            if (this.followUpCount > 1) {
                return { action: 'BET', reason: `🔥 Recovery Follow-Up (${this.followUpCount}/${maxFollowLocal})` };
            } else {
                return { action: 'BET', reason: `🔁 Recovery Single Follow-Up` };
            }
        }

        return { action: 'SKIP', reason: 'Recovery posterior / trend insufficient' };
    }

    // Public API: record bet result so shadowSamples can be paired (call this from your bet-result handler)
    recordBetResult(result) {
        // result expected shape: { roundId?, multiplier?, win: true|false, payout?, stake?, timestamp? }
        if (!Array.isArray(this.shadowSamples)) this.shadowSamples = [];
        this.shadowSamples.push({ type: 'OUTCOME', data: result, ts: Date.now() });
    }

    // -----------------------
    // --- Helper / internal methods (all in-memory)
    // -----------------------
    _clearAllBuffers() {
        this.historyMicro = [];
        this.historyShort = [];
        this.historyMedium = [];
        this.historyLong = [];
    }

    // +++ compute observed win rate for a multiplier label from shadowSamples
    _observedWinRateFor(multLabel, decayAlpha = 0.1) {
        // 1. Map abstract Auto-Tune labels to the concrete 'lanes' stored in history
        const labelMap = { 'low': 'red', 'med': 'yellow', 'high': 'green' };
        const targetLane = labelMap[multLabel];

        // Guard: Invalid label or empty memory
        if (!targetLane || !Array.isArray(this.decisionLog) || this.decisionLog.length === 0) {
            return { count: 0, ewma: 0, raw: 0 };
        }

        // 2. Filter for finalized decisions matching the target lane
        // We use decisionLog because it is the only array where 'outcome' is strictly paired with 'decision'
        const history = this.decisionLog.filter(d =>
            d.lane === targetLane &&          // Must match the requested lane
            d.outcome &&                      // Must have a processed result
            typeof d.outcome.wasWin === 'boolean' // Result must be valid
        );

        if (history.length === 0) return { count: 0, ewma: 0, raw: 0 };

        // 3. Calculate Stats
        let wins = 0;
        // Initialize EWMA with the oldest relevant sample to prevent zero-bias
        let currentEwma = history[0].outcome.wasWin ? 1.0 : 0.0;

        // Iterate Oldest -> Newest so recent results have the highest weight in EWMA
        for (let i = 0; i < history.length; i++) {
            const val = history[i].outcome.wasWin ? 1.0 : 0.0;
            wins += val;

            if (i > 0) {
                // Standard EWMA: Average = (Previous * (1 - Alpha)) + (New * Alpha)
                currentEwma = (currentEwma * (1 - decayAlpha)) + (val * decayAlpha);
            }
        }

        return {
            count: history.length,
            ewma: currentEwma,
            raw: wins / history.length
        };
    }

    // +++ runtime auto-tuner: called periodically (every intervalRounds) +++
    _autoTuneAdjust(currentRoundNumber) {
        if (!this.autoTune || !this.autoTune.enabled) return;
        // guard: don't tune during active change-point
        if (this.changePointActive) return;

        const nowRound = Number(currentRoundNumber || (this.runtime && this.runtime.roundsSinceStart) || 0);
        if (nowRound - (this.autoTune.lastRunAtRound || 0) < this.autoTune.intervalRounds) return;
        this.autoTune.lastRunAtRound = nowRound;

        // for each mult label: 'low','med','high'
        ['low','med','high'].forEach(label => {
            const obs = this._observedWinRateFor(label, 0.08);
            // require minimum trials before tuning
            if (obs.count < this.autoTune.minTrials) {
                if (this.config.get('debug')) this.logger.log(`AutoTune: insufficient samples for ${label} (${obs.count}/${this.autoTune.minTrials})`, 'info');
                return;
            }
            const target = (this.autoTune.targets && this.autoTune.targets[label]) || 0.9;
            const error = target - obs.ewma; // positive => we are under-performing target -> become more conservative
            // multiplicative update
            const lr = this.autoTune.lr;
            let factor = this.autoTune.factors[label] || 1.0;
            // If observed < target => increase factor (more conservative). If observed > target => decrease factor.
            factor = factor * (1 + lr * error);
            // clamp
            factor = Math.max(this.autoTune.minFactor, Math.min(this.autoTune.maxFactor, factor));
            // save
            this.autoTune.factors[label] = factor;
            if (this.config.get('debug')) {
                this.logger.log(`AutoTune: ${label} obs_ewma=${obs.ewma.toFixed(3)} target=${target} -> factor=${factor.toFixed(3)} (count=${obs.count})`, 'info');
            }
            // push a decisionLog entry so you can audit adjustments
            this.decisionLog.push({
                ts: new Date().toISOString(),
                type: 'autoTuneAdjust',
                label,
                observed: obs,
                target,
                factor
            });
            if (this.decisionLog.length > 2000) this.decisionLog.shift();
        });
    }

    // +++ helper: compute a decay-weighted effective sample size for an array of observations
    _effectiveSample(arr, decay = 0.92) {
        // arr is ordered oldest -> newest
        if (!Array.isArray(arr) || arr.length === 0) return 0;
        let weight = 1.0;
        let total = 0;
        for (let i = arr.length - 1; i >= 0; i--) { // recent rounds get higher weight
            total += weight;
            weight *= decay;
            // small optimization: stop when weight tiny
            if (weight < 1e-4) break;
        }
        return total;
    }

    // Called externally by the bot per-round to push observed crash (float)
    pushRound(crashFloat) {
        // push into each buffer and trim by config sizes
        this.historyMicro.push(crashFloat);
        this._trimBuffer(this.historyMicro, this.config.get('prediction', 'bufferMicro'));

        this.historyShort.push(crashFloat);
        this._trimBuffer(this.historyShort, this.config.get('prediction', 'bufferShort'));

        this.historyMedium.push(crashFloat);
        this._trimBuffer(this.historyMedium, this.config.get('prediction', 'bufferMedium'));

        this.historyLong.push(crashFloat);
        this._trimBuffer(this.historyLong, this.config.get('prediction', 'bufferLong'));

        // warmup counting — increment if still warming
        if (this.inWarmup) this.warmupCounter += 1;
        // If numeric warmup threshold reached here (counter-driven warmup), complete warmup now.
        try {
            // adaptive warmup completion logic
            const warmupDefault = this.config.get('prediction', 'warmupDefault');
            const warmupMax = this.config.get('prediction','warmupMax');
            const minEff = this.config.get('prediction','minEffectiveSample');

            // compute a conservative effective sample across micro+short buffers
            const microEff = this._effectiveSample(this.historyMicro);
            const shortEff = this._effectiveSample(this.historyShort);
            const nEff = microEff + 0.7 * shortEff; // weight short-window slightly less

            // If we have reached counter threshold OR nEff >= minEffectiveSample, complete warmup.
            // Otherwise extend warmup up to warmupMax
            if (this.inWarmup) {
                if (this.warmupCounter >= warmupDefault && nEff >= minEff) {
                    this._completeWarmup();
                } else if (this.warmupCounter >= warmupMax) {
                    // force-complete at warmupMax to avoid infinite warmup
                    this._completeWarmup();
                } else {
                    // remain in warmup — this is expected when nEff low
                    if (this.warmupCounter >= warmupDefault) {
                        // log a one-off informational message that warmup is extended due to low nEff
                        this.logger.log(`Warmup deferred: nEff ${nEff.toFixed(2)} < minEff ${minEff} (counter ${this.warmupCounter}/${warmupMax})`, 'warning');
                    }
                }
            }
        } catch (e) { /* safe no-op on config read error */ }
    }

    _trimBuffer(buf, size) {
        while (buf.length > size) buf.shift();
    }

    // --- compute exponential-weighted moving average (volatility proxy)
    _calcEWMA(arr, alpha = 0.2) {
        if (!Array.isArray(arr) || arr.length === 0) return 0;
        let ewma = arr[0];
        for (let i = 1; i < arr.length; i++) {
            ewma = alpha * arr[i] + (1 - alpha) * ewma;
        }
        // Convert to volatility proxy: variance of residuals vs ewma
        let s = 0;
        for (let i = 0; i < arr.length; i++) {
            const d = arr[i] - ewma;
            s += d * d;
        }
        return Math.sqrt(s / arr.length);
    }

    // --- NEW: simple autocorrelation (lag-1 by default)
    _calcAutocorr(arr, lag = 1) {
        if (!Array.isArray(arr) || arr.length <= lag) return 0;
        const n = arr.length;
        let mean = 0;
        for (let i = 0; i < n; i++) mean += arr[i];
        mean /= n;
        let num = 0, den = 0;
        for (let i = 0; i < n; i++) {
            const v = arr[i] - mean;
            den += v * v;
            if (i + lag < n) num += v * (arr[i + lag] - mean);
        }
        if (den === 0) return 0;
        return num / den;
    }

    // --- skew & kurtosis calculator
    _calcSkewKurtosis(arr) {
        if (!Array.isArray(arr) || arr.length < 3) return { skew: 0, kurt: 0 };
        const n = arr.length;
        let mean = 0;
        for (let i = 0; i < n; i++) mean += arr[i];
        mean /= n;
        let m2 = 0, m3 = 0, m4 = 0;
        for (let i = 0; i < n; i++) {
            const d = arr[i] - mean;
            const d2 = d * d;
            m2 += d2;
            m3 += d2 * d;
            m4 += d2 * d2;
        }
        m2 /= n; m3 /= n; m4 /= n;
        const skew = m3 / Math.pow(m2, 1.5);
        const kurt = m4 / (m2 * m2) - 3;
        return { skew, kurt };
    }

    // --- NEW: compute weighted posterior stats: lower bound and effective sample
    _computePosteriorStats(multiplier, lambda = 0.18) {
        // Uses same weighting approach as _computePosteriorLowerBound but returns nEff and wins
        const merged = this._mergeWeighted(this.historyMicro, this.historyShort, this.historyMedium);
        const n = merged.length;
        if (n === 0) return { lower: 0, nEff: 0, wWins: 0, n: 0 };
        const weights = this._calcExpWeights(n, lambda);
        let wWins = 0, wSum = 0;
        for (let i = 0; i < n; i++) {
            const w = weights[i];
            wSum += w;
            if (merged[i] >= multiplier) wWins += w;
        }
        // effective sample size (Schwarz/ Kish-style)
        const nEff = (wSum * wSum) / weights.reduce((s, w) => s + w * w, 0);
        const priorA = this.config.get('prediction', 'priorAlpha');
        const priorB = this.config.get('prediction', 'priorBeta');
        const alpha = priorA + wWins;
        const beta = priorB + (wSum - wWins);
        const pHat = alpha / (alpha + beta);
        const z = 1.96;
        const denom = 1 + (z * z) / Math.max(1, nEff);
        const center = pHat + (z * z) / (2 * Math.max(1, nEff));
        const margin = z * Math.sqrt((pHat * (1 - pHat) + (z * z) / (4 * Math.max(1, nEff))) / Math.max(1, nEff));
        const lower = (center - margin) / denom;
        return { lower, nEff, wWins, n: wSum };
    }

    _analyzeMarketHealth() {
        // --- 1) Basic variance (entropy-like proxy) ---
        const microVar = this._calcVariance(this.historyMicro);
        const mesoVar = this._calcVariance(this.historyShort);
        const macroVar = this._calcVariance(this.historyMedium);
        this.lastEntropy.micro = microVar;
        this.lastEntropy.meso = mesoVar;
        this.lastEntropy.macro = macroVar;

        // --- 2) Additional detectors for ensemble & stability ---
        // EWMA volatility (proxy), autocorrelation (lag-1), skew & kurtosis
        this.lastEWMA.micro = this._calcEWMA(this.historyMicro, 0.2);
        this.lastEWMA.meso = this._calcEWMA(this.historyShort, 0.2);
        this.lastEWMA.macro = this._calcEWMA(this.historyMedium, 0.2);

        this.lastAutocorr.micro = this._calcAutocorr(this.historyMicro, 1);
        this.lastAutocorr.meso = this._calcAutocorr(this.historyShort, 1);
        this.lastAutocorr.macro = this._calcAutocorr(this.historyMedium, 1);

        this.lastSkewKurt.micro = this._calcSkewKurtosis(this.historyMicro);
        this.lastSkewKurt.meso = this._calcSkewKurtosis(this.historyShort);
        this.lastSkewKurt.macro = this._calcSkewKurtosis(this.historyMedium);

        // --- Continuous & decaying change-point penalty (replace old boolean inflation) ---
        // compute detector scores (0..1). If detectors return boolean, treat true as 1.0
        const normalizeScore = s => (typeof s === 'boolean') ? (s ? 1.0 : 0.0) : (isFinite(s) ? Math.max(0, Math.min(1, s)) : 0);

        let phScore = 0, cusumScore = 0, bocpdScore = 0;
        try {
            phScore = this._detectChangePointPH(this.historyMicro, 0.6, 0.02) || 0;
        } catch (e) {
            if (this.config.get('debug')) logger.log('ChangePoint (PH) detector error', 'warning', e);
            phScore = 0;
        }
        try {
            cusumScore = this._detectChangePointCUSUM(this.historyMicro) || 0;
        } catch (e) {
            if (this.config.get('debug')) logger.log('CUSUM detector error', 'warning', e);
            cusumScore = 0;
        }
        try {
            if (this.config.get('prediction', 'enableBOCPD') && this.historyMicro.length > 0 && typeof this._detectChangePointBOCPD === 'function') {
                bocpdScore = this._detectChangePointBOCPD(this.historyMicro) || 0;
            }
        } catch (e) {
            if (this.config.get('debug')) logger.log('BOCPD detector error', 'warning', e);
            bocpdScore = 0;
        }

        const sPH = normalizeScore(phScore);
        const sCUSUM = normalizeScore(cusumScore);
        const sBOCPD = normalizeScore(bocpdScore);

        // combined change score (0..1)
        const cpCombined = (sPH + sCUSUM + sBOCPD) / 3;

        // continuous penalty mapping: map cpCombined [0..1] -> penalty [1..cpFactorMax] smoothly
        const cpFactorMax = Number(this.config.get('prediction', 'cpIncreaseFactor')) || 1.5;
        const sigmoid = x => 1 / (1 + Math.exp(-x));
        const rawPenalty = 1 + (cpFactorMax - 1) * sigmoid(6 * (cpCombined - 0.5)); // smooth step

        // exponential smoothing of penalty so single spike decays: alpha chosen conservatively
        const alpha = Number(this.config.get('prediction', 'cpPenaltyAlpha')) || 0.3;
        this.cpPenalty = (this.cpPenalty || 1.0) * (1 - alpha) + rawPenalty * alpha;
        if (!isFinite(this.cpPenalty) || this.cpPenalty < 1) this.cpPenalty = 1;

        // logical flag: active when combined score exceeds small epsilon
        this.changePointActive = cpCombined > 0.05;
        this.lastChangeScore = cpCombined;
        if (this.config.get('debug')) logger.log('CPD scores', { ph: sPH, cusum: sCUSUM, bocpd: sBOCPD, combined: cpCombined, cpPenalty: this.cpPenalty });

        // --- 6) Optional GARCH(1,1) variance estimation (fast approximation) ---
        try {
            if (this.config.get('prediction', 'enableGARCH')) {
                const omega = this.config.get('prediction', 'garchOmega');
                const alpha = this.config.get('prediction', 'garchAlpha');
                const beta = this.config.get('prediction', 'garchBeta');
                this.lastGARCH.micro = this._calcGARCH(this.historyMicro, omega, alpha, beta);
                this.lastGARCH.meso = this._calcGARCH(this.historyShort, omega, alpha, beta);
                this.lastGARCH.macro = this._calcGARCH(this.historyMedium, omega, alpha, beta);
            } else {
                this.lastGARCH.micro = this.lastGARCH.meso = this.lastGARCH.macro = 0;
            }
        } catch (e) {
            if (this.config.get('debug')) logger.log('GARCH calc error', 'warning', e);
        }

        // (changePointActive already set above if either PH or CUSUM fired)

        // --- 5) Effective sample / adaptive warmup (ESS check) ---
        // Use reference multiplier to compute effective sample (nEff) from weighted posterior stats
        const refMult = this.config.get('prediction', 'pMinReferenceMult');
        const stats = this._computePosteriorStats(refMult);
        const nEff = stats.nEff || 0;

        const warmupDefault = this.config.get('prediction', 'warmupDefault');
        const warmupMax = this.config.get('prediction', 'warmupMax');
        const minEff = this.config.get('prediction', 'minEffectiveSample');

        if (this.inWarmup) {
            // If we've reached the nominal warmup count, require effective sample threshold or allow extension up to warmupMax
            if (this.warmupCounter >= warmupDefault) {
                if (nEff >= minEff) {
                    // complete warmup — _completeWarmup will perform bootstrapping and set probation
                    this._completeWarmup();
                } else {
                    // keep warming until ESS improves or warmupMax reached
                    if (this.warmupCounter >= warmupMax) {
                        // forced completion to avoid infinite warmup
                        this._completeWarmup();
                    } else {
                        // otherwise remain in warmup (wait for more rounds to accumulate)
                        if (this.config.get('debug')) logger.log('Warmup extended — nEff', nEff, 'minEff', minEff);
                    }
                }
            }
        }
        // end _analyzeMarketHealth
    }

    _calcVariance(arr) {
        if (!Array.isArray(arr) || arr.length === 0) return 0;
        const n = arr.length;
        let mean = 0;
        for (let i = 0; i < n; i++) mean += arr[i];
        mean = mean / n;
        let v = 0;
        for (let i = 0; i < n; i++) {
            const d = (arr[i] - mean);
            v += d * d;
        }
        return v / n;
    }

    _calculateTrendSlope() {
        // quick linear slope estimate on medium window (least squares simplified)
        const arr = this.historyMedium;
        const n = arr.length;
        if (n < 3) return 0;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (let i = 0; i < n; i++) {
            const x = i;
            const y = arr[i];
            sumX += x; sumY += y; sumXY += x * y; sumXX += x * x;
        }
        const denom = (n * sumXX - sumX * sumX);
        if (denom === 0) return 0;
        const slope = (n * sumXY - sumX * sumY) / denom;
        return slope;
    }

    _computePosteriorLowerBound(multiplier, adjustment = 0, lambda = 0.18) {
        // use the explicit merge helper so merge behavior is centralized and adjustable
        const combined = this._mergeWeighted(this.historyMicro, this.historyShort, this.historyMedium);
        const n = combined.length;
        if (n === 0) return 0;

        // compute exponential weights that sum to 1 (older indices smaller)
        const weights = this._calcExpWeights(n, lambda);

        // weighted counts (wWins as fraction of weighted mass)
        let wWins = 0;
        let wTotal = 0;
        for (let i = 0; i < n; i++) {
            const w = weights[i];
            wTotal += w;
            if (combined[i] >= multiplier) wWins += w;
        }

        // Use priors and convert weighted counts to pseudo-counts by scaling with n
        const priorA = this.config.get('prediction', 'priorAlpha') || 1;
        const priorB = this.config.get('prediction', 'priorBeta') || 1;

        // convert the weighted fraction into pseudo-counts (scale by n)
        const alpha = priorA + (wWins * n);
        const beta = priorB + ((wTotal - wWins) * n);

        // effective sample size (n_eff): scale of weighted data
        const nEff = Math.max(1e-6, wTotal * n);

        // Wilson lower bound using nEff
        const pHat = alpha / (alpha + beta);
        const z = 1.96;
        const denom = 1 + (z * z) / nEff;
        const center = pHat + (z * z) / (2 * nEff);
        const margin = z * Math.sqrt((pHat * (1 - pHat) + (z * z) / (4 * nEff)) / nEff);
        const lower = (center - margin) / denom;

        // small safety adjustment
        const out = Math.max(0, lower - adjustment);
        return out;
    }

    _mergeWeighted(micro, short, medium) {
        // simple concatenation with recency bias — micro most recent, then short, then medium
        // no persistence, just an in-memory merged view
        const merged = [];
        for (let i = 0; i < micro.length; i++) merged.push(micro[i]);
        for (let i = 0; i < short.length; i++) merged.push(short[i]);
        for (let i = 0; i < medium.length; i++) merged.push(medium[i]);
        return merged;
    }

    // Exponential weights generator: length n -> array of weights (oldest->newest)
    _calcExpWeights(n, lambda = 0.15) {
        if (n <= 0) return [];
        const weights = new Array(n);
        let sum = 0;
        for (let i = 0; i < n; i++) {
            // index 0 treated as oldest — recent items get larger exponent
            weights[i] = Math.exp(-lambda * (n - 1 - i));
            sum += weights[i];
        }
        for (let i = 0; i < n; i++) weights[i] /= sum;
        return weights;
    }

    // Simple in-run bootstrap tail estimator to estimate prob of k consecutive failures
    _bootstrapTailEstimate(k = 3, iterations = 2000) {
        const arr = this.historyLong.slice();
        const n = arr.length;
        if (n < Math.max(20, k)) return 1.0; // conservative: if too little data assume high tail risk
        let count = 0;
        for (let it = 0; it < iterations; it++) {
            const idx = Math.floor(Math.random() * n);
            let ok = true;
            for (let j = 0; j < k; j++) {
                const v = arr[(idx + j) % n];
                // use recovery target from config if present; default to 2.0
                const recTarget = this.config.get('recovery','target') || 2.0;
                if (v >= recTarget) { ok = false; break; }
            }
            if (ok) count++;
        }
        return count / iterations;
    }

    // Simple Page–Hinkley change-point detector for a numeric window (micro reflex)
    _detectChangePointPH(windowArr, threshold = 0.6, alpha = 0.02) {
        if (!Array.isArray(windowArr) || windowArr.length < 5) return false;
        const n = windowArr.length;
        // running mean m_t and cumulative deviation ph
        let mT = 0;
        let ph = 0;
        for (let i = 0; i < n; i++) {
            const x = windowArr[i];
            mT = (1 - alpha) * mT + alpha * x;
            ph += x - mT - 0.001; // small drift allowance
            if (ph < 0) ph = 0;
            if (ph > threshold) return true;
        }
        return false;
    }

    // --- Simple CUSUM detector (fast reflex); returns true when change detected
    _detectChangePointCUSUM(arr) {
        if (!Array.isArray(arr) || arr.length < 5) return false;
        const delta = this.config.get('prediction', 'cusumDrift');
        const thresh = this.config.get('prediction', 'cusumThreshold');
        // compute simple running mean
        const n = arr.length;
        let mean = 0;
        for (let i = 0; i < n; i++) mean += arr[i];
        mean /= n;
        // update cusum states using the last value
        const x = arr[arr.length - 1];
        this.cusumPos = Math.max(0, this.cusumPos + (x - mean - delta));
        this.cusumNeg = Math.max(0, this.cusumNeg + (mean - x - delta));
        if (this.cusumPos > thresh || this.cusumNeg > thresh) {
            // reset a bit after detection to avoid repeated immediate triggers
            this.cusumPos = 0;
            this.cusumNeg = 0;
            return true;
        }
        return false;
    }

    // --- lightweight BOCPD-like detector (Bernoulli-run approximate)
    // Uses a simple running Bayesian update on a Bernoulli success model to estimate
    // the 'run' probability mass and flag when the change probability exceeds threshold.
    _detectChangePointBOCPD(windowArr) {
        // require a bit of history
        if (!Array.isArray(windowArr) || windowArr.length < 5) return false;

        // treat each round as "success" when crash >= reference multiplier (use referenceMult)
        const refMult = this.config.get('prediction', 'pMinReferenceMult');
        const hazard = this.config.get('prediction', 'bocpdHazard') || (1 / 200);
        const trigger = this.config.get('prediction', 'bocpdThreshold') || 0.7;

        // ensure _bocpd state exists (initialized in constructor)
        if (!this._bocpd) {
            this._bocpd = { runProb: 1.0, lastAlpha: this.config.get('prediction','priorAlpha'), lastBeta: this.config.get('prediction','priorBeta') };
        }

        // update pseudo-Bayesian run probability using the last observation
        const last = windowArr[windowArr.length - 1];
        const isSuccess = (last >= refMult) ? 1 : 0;

        // update Beta posterior (simple online incremental update)
        this._bocpd.lastAlpha += isSuccess;
        this._bocpd.lastBeta += (1 - isSuccess);

        // update run probability mass (approx): P(r=0) *= (1 - hazard) * predictive_likelihood
        const pred = (this._bocpd.lastAlpha) / (this._bocpd.lastAlpha + this._bocpd.lastBeta);
        // mix hazard to decay old run
        this._bocpd.runProb = (1 - hazard) * this._bocpd.runProb * (isSuccess ? pred : (1 - pred)) + hazard;

        // normalize and compute a "change-probability"
        const changeProb = 1 - Math.min(1, this._bocpd.runProb);
        return changeProb >= trigger;
    }

    // --- simple GARCH(1,1) estimator for variance (operates on crash-level values)
    // Returns the latest variance estimate (scalar). Very lightweight.
    _calcGARCH(arr, omega = 1e-4, alpha = 0.08, beta = 0.90) {
        if (!Array.isArray(arr) || arr.length < 5) return 0;
        const n = arr.length;
        // use returns relative to 1.0 baseline: r_t = (x_t - mean)^2 (simple)
        let mean = 0;
        for (let i = 0; i < n; i++) mean += arr[i];
        mean /= n;
        // init var as sample variance
        let varPrev = 0;
        for (let i = 0; i < n; i++) {
            const d = arr[i] - mean;
            varPrev += d * d;
        }
        varPrev = varPrev / Math.max(1, n);
        // run recursion over window to produce final estimate
        for (let i = 1; i < n; i++) {
            const d = arr[i] - mean;
            const resid2 = d * d;
            const varT = omega + alpha * resid2 + beta * varPrev;
            varPrev = varT;
        }
        return Math.max(0, varPrev);
    }

    // --- Beta sampler using simple gamma approximations (Marsaglia & Tsang for gamma)
    _gammaSample(shape) {
        // handle edge cases
        if (shape < 1) {
            // Johnk's algorithm for shape < 1
            const c = 1 / shape;
            const d = (1 - shape) * Math.pow(shape, shape / (1 - shape));
            while (true) {
                const u = Math.random();
                const v = Math.random();
                const x = Math.pow(u, c);
                if (v <= (2 - x) || v <= Math.pow(x, shape - 1)) return x;
            }
        } else {
            // Marsaglia & Tsang
            const d = shape - 1 / 3;
            const c = 1 / Math.sqrt(9 * d);
            while (true) {
                let x = 0, v = 0;
                do {
                    x = this._normalSample();
                    v = 1 + c * x;
                } while (v <= 0);
                v = v * v * v;
                const u = Math.random();
                if (u < 1 - 0.0331 * x * x * x * x) return d * v;
                if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
            }
        }
    }

    _normalSample() {
        // Box-Muller
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    _betaSample(a, b) {
        // sample two gamma and return Beta
        if (a <= 0 || b <= 0) return Math.random();
        const ga = this._gammaSample(a);
        const gb = this._gammaSample(b);
        return ga / (ga + gb);
    }

    // --- Thompson-sampling based follow-up selector (returns integer followUpCount)
    _selectFollowUpCountThompson(recoveryTarget, maxFollow = 2) {
        const samples = Number(this.config.get('prediction', 'followUpSamples')) || 500;
        // compute weighted posterior stats for target
        const stats = this._computePosteriorStats(recoveryTarget);
        const priorA = this.config.get('prediction', 'priorAlpha') || 1;
        const priorB = this.config.get('prediction', 'priorBeta') || 1;
        const alpha = priorA + (stats.wWins || 0);
        const beta = priorB + (Math.max(1, stats.n || 0) - (stats.wWins || 0));
        const threshold = this._computeScaledPmin(recoveryTarget) + this.config.get('prediction', 'followUpExtraMargin');
        let countAbove = 0;
        for (let i = 0; i < samples; i++) {
            const draw = this._betaSample(alpha, beta);
            if (draw >= threshold) countAbove++;
        }
        const frac = countAbove / samples;
        const utilThresh = this.config.get('prediction', 'followUpUtilityThreshold') || 0.6;
        if (frac >= utilThresh && maxFollow >= 2) return 2;
        return 1;
    }

    // --- simple UCB-style follow-up selector (conservative) ---
    _selectFollowUpCountUCB(recoveryTarget, maxFollow = 2) {
        // use posterior upper confidence bound
        const stats = this._computePosteriorStats(recoveryTarget);
        const priorA = this.config.get('prediction', 'priorAlpha') || 1;
        const priorB = this.config.get('prediction', 'priorBeta') || 1;
        const alpha = priorA + (stats.wWins || 0);
        const beta = priorB + (Math.max(1, stats.n || 0) - (stats.wWins || 0));
        // approximate upper bound (Wilson-like but for UCB) using normal approx
        const pHat = alpha / (alpha + beta);
        const nEff = Math.max(1, stats.nEff || (stats.n || 1));
        const z = 1.64; // ~ 95% one-sided
        const se = Math.sqrt((pHat * (1 - pHat)) / nEff);
        const ub = Math.min(1, pHat + z * se);
        const threshold = this._computeScaledPmin(recoveryTarget) + this.config.get('prediction', 'followUpExtraMargin');
        if (ub >= threshold && maxFollow >= 2) return 2;
        return 1;
    }

    _computeScaledPmin(multiplier) {
        // +++ FIX: Strict Config Access (No hardcoded fallbacks) +++
        const refP = this.config.get('prediction', 'pMinReference');
        const refM = this.config.get('prediction', 'pMinReferenceMult');
        const floor = this.config.get('prediction', 'pMinFloor');
        const ceil = this.config.get('prediction', 'pMinCeiling');

        // Debug check to prevent silent NaN
        if (refP === undefined || refM === undefined) {
            if (this.config.get('debug')) console.error("CRITICAL: Tuning config is UNDEFINED. Check var config mapping.");
            return 0.99; // Fail safe high
        }

        if (!multiplier || multiplier <= 1) return (floor !== undefined ? floor : 0.40);

        // 1. Calculate Edge
        const breakEvenRef = 1 / refM;
        const impliedEdge = Math.max(0.02, refP - breakEvenRef);

        // 2. Calculate Requirement
        const breakEvenTarget = 1 / multiplier;
        let req = breakEvenTarget + impliedEdge;

        // Ensure floor/ceil are valid numbers before Math.max/min
        const validFloor = (typeof floor === 'number') ? floor : 0.40;
        const validCeil = (typeof ceil === 'number') ? ceil : 0.95;

        return Math.max(validFloor, Math.min(validCeil, req));
    }

    // +++ Normalized ensemble aggregator + explainability + GARCH/Autocorr wiring + safety + normalization +++
    _computeEnsemble(detectorScores = {}) {
        // detectorScores is optional input: { posterior: 0.9, entropy: 0.2, volatility: 0.05, autocorr: 0.1, ewma: 0.05, garch: 0.03 }
        // Read configured weights
        const cfg = this.config.get.bind(this.config, 'prediction');

        const wPosterior = cfg('ensembleWeightPosterior');
        const wEntropy = cfg('ensembleWeightEntropy');
        const wVol = cfg('ensembleWeightVolatility');
        const wAutocorr = cfg('ensembleWeightAutocorr');
        const wEWMA = cfg('ensembleWeightEWMA');
        const wGarch = cfg('ensembleWeightGARCH') || 0;

        // Collect detector values (fallback to 0 if missing)
        const posteriorScore = (typeof detectorScores.posterior === 'number') ? detectorScores.posterior : (this.lastPosterior || 0);
        const entropyScore = (typeof detectorScores.entropy === 'number') ? detectorScores.entropy : (this.lastEntropy ? (this.lastEntropy.micro || 0) : 0);
        const volScore = (typeof detectorScores.volatility === 'number') ? detectorScores.volatility : (this.lastVolatility || 0);
        const autocorrScore = (typeof detectorScores.autocorr === 'number') ? detectorScores.autocorr : (this.lastAutocorr || 0);
        const ewmaScore = (typeof detectorScores.ewma === 'number') ? detectorScores.ewma : (this.lastEWMA || 0);
        const garchScore = (typeof detectorScores.garch === 'number') ? detectorScores.garch : (this.lastGARCH ? (this.lastGARCH.micro || 0) : 0);

        // If some detectors use "higher is worse" (entropy/volatility), convert to a "confidence" [0..1]
        // For entropy/volatility/autocorr/ewma/garch we use a conservative transform: conf = 1 / (1 + score_scaled)
        // This keeps posterior (which is already a P(win)) aligned with other detectors.
        const entropyConf = 1 / (1 + entropyScore);
        const volConf = 1 / (1 + volScore);
        const autocorrConf = 1 / (1 + Math.abs(autocorrScore)); // absolute because negative/positive both indicate instability
        const ewmaConf = 1 / (1 + ewmaScore);
        const garchConf = 1 / (1 + garchScore);

        const weightSum = wPosterior + wEntropy + wVol + wAutocorr + wEWMA + wGarch;
        const safeSum = (weightSum > 0) ? weightSum : 1.0;

        let mean = (wPosterior * posteriorScore + wEntropy * entropyConf + wVol * volConf + wAutocorr * autocorrConf + wEWMA * ewmaConf + wGarch * garchConf) / safeSum;

        // If config is bad and produces NaN, fallback to Posterior (pb)
        if (!Number.isFinite(mean)) {
            if (this.config.get('debug')) console.warn("⚠️ Ensemble is NaN. Falling back to Posterior.");
            mean = Number.isFinite(posteriorScore) ? posteriorScore : 0;
        }

        // Simple variance proxy across normalized detector confidences (posterior + confs)
        const vals = [
            posteriorScore,
            entropyConf,
            volConf,
            autocorrConf,
            ewmaConf,
            garchConf
        ];
        const avg = vals.reduce((s, x) => s + x, 0) / vals.length;
        const variance = vals.reduce((s, x) => s + Math.pow(x - avg, 2), 0) / vals.length;

        // Build explainability object
        const details = {
            weights: {
                posterior: wPosterior / safeSum,
                entropy: wEntropy / safeSum,
                volatility: wVol / safeSum,
                autocorr: wAutocorr / safeSum,
                ewma: wEWMA / safeSum,
                garch: (wGarch / safeSum)
            },
            raw: {
                posterior: posteriorScore,
                entropy: entropyScore,
                volatility: volScore,
                autocorr: autocorrScore,
                ewma: ewmaScore,
                garch: garchScore
            },
            confs: {
                posterior: posteriorScore,
                entropy: entropyConf,
                volatility: volConf,
                autocorr: autocorrConf,
                ewma: ewmaConf,
                garch: garchConf
            }
        };

        // return full object for downstream gating & logging
        return {
            mean,
            var: variance,
            details
        };
    }

    _getPattern(n) {
        // produce a simple string pattern of last n rounds rounded to two digits
        const arr = this.historyShort.slice(-n);
        return arr.map(v => v.toFixed(2)).join('|');
    }

    _runLengthBelow(multiplier, length) {
        // return true if last `length` rounds are below multiplier (ping-pong / low crash train)
        const arr = this.historyShort;
        if (arr.length < length) return false;
        for (let i = arr.length - length; i < arr.length; i++) {
            if (arr[i] >= multiplier) return false;
        }
        return true;
    }
}
