var config = {
    // ===================================
    // UNIFIED CONFIGURATION UI
    // ===================================
    // === Meta Information ===
    meta: {
        name: 'Titan',
        version: '8.0-OC',
        edition: 'Sentient AI',
        author: 'TGI',
        id: ""
    },

    // === Normal Mode ===
    normalBaseBet: { value: 100, type: 'balance', label: 'Normal Base Bet (bits)' },
    normalBaseBetMax: { value: 300, type: 'number', label: 'Normal Base Bet (bits) max stake bit' },
    normalBaseBetPercentOfBal: { value: 0.0025, type: 'number', label: 'Normal Base Bet (bits) percent of balance to stake' },
    // Dynamic Multipliers (The Gearbox)
    normalBullMult: { value: 2.17, type: 'multiplier', label: 'Green Lane Target (Bull)' },
    normalBearMult: { value: 1.87, type: 'multiplier', label: 'Yellow Lane Target (Bear)' },
    normalSurvivalMult: { value: 1.66, type: 'multiplier', label: 'Red Lane Target (Survival)' },

    // === Recovery Mode ===
    enableRecovery: { value: true, type: 'checkbox', label: 'Enable Recovery Mode' },
    recoveryMultiplier: { value: 2.01, type: 'multiplier', label: 'Recovery Fixed Target (x)' },
    recoveryCapMult: { value: 20, type: 'number', label: 'Recovery Cap (x Initial Loss)' },
    recoveryLevelSimThreshold: { value: 50, type: 'number', label: 'Recovery Level Simulation Threshold' },
    maxFollowUps: { value: 2, type: 'number', label: 'Recovery: Max Follow-Up Bets (Trend/PingPong)' },

    // === SENTIENT SNIPER & MSV TACTICS ===
    sniper_msvStrictness: { value: 'Medium', type: 'text', label: 'MSV Strictness (Low/Medium/High)' },
    sniper_gapConfidence: { value: 2.0, type: 'number', label: 'Adaptive Gap Confidence (Sigma)' },
    sniper_pingPongMode: { value: true, type: 'checkbox', label: 'Enable Ping-Pong Exploiter' },
    recovery_smartFollowUpLimit: { value: 3, type: 'number', label: 'Max Rapid Recovery Bets (Emergency)' },
    recovery_postExitCooldown: { value: 2, type: 'number', label: 'Post-Recovery Safety Rounds (Paper Trade)' },

    // Debt Slicing Logic
    enableDebtSlicing: { value: true, type: 'checkbox', label: 'Enable Debt Slicing' },
    sliceTwoLossThreshold: { value: 4, type: 'number', label: 'Slice /2 after losses' },
    sliceThreeLossThreshold: { value: 3, type: 'number', label: 'Slice /3 after addtl losses' },
    sliceFourLossThreshold: { value: 2, type: 'number', label: 'Slice /4 after addtl losses' },

    // === TITAN BRAIN / SNIPER TUNING (Flattened for Correct Mapping) ===

    // Core Probability Settings
    pMinReference: { value: 0.60, type: 'number', label: 'Brain: Base Confidence (0.60 = 60%)' },
    pMinReferenceMult: { value: 2.00, type: 'multiplier', label: 'Brain: Reference Multiplier (2.00x)' },
    pMinFloor: { value: 0.40, type: 'number', label: 'Brain: Min Confidence Floor' },
    pMinCeiling: { value: 0.95, type: 'number', label: 'Brain: Max Confidence Ceiling' },

    // Ensemble Weights (Must sum to ~1.0)
    weightPosterior: { value: 0.50, type: 'number', label: 'Weight: Bayesian Posterior' },
    weightEntropy: { value: 0.15, type: 'number', label: 'Weight: Entropy' },
    weightVolatility: { value: 0.15, type: 'number', label: 'Weight: Volatility' },
    weightAutocorr: { value: 0.10, type: 'number', label: 'Weight: Autocorrelation' },
    weightEWMA: { value: 0.10, type: 'number', label: 'Weight: EWMA Trend' },
    weightGARCH: { value: 0.00, type: 'number', label: 'Weight: GARCH (Experimental)' },

    // Technical Thresholds & System
    varThreshold: { value: 0.20, type: 'number', label: 'Variance Threshold (0.20)' },
    warmupDefault: { value: 25, type: 'number', label: 'Warmup Rounds' },
    warmupMax: { value: 50, type: 'number', label: 'Warmup Max Rounds' },
    minEffectiveSample: { value: 12, type: 'number', label: 'Min Effective Sample Size' },

    // Tuning Scalar
    cpIncreaseFactor: { value: 1.5, type: 'number', label: 'CPD Penalty Factor' },

    // === Prediction / Titan Brain (Grouped Params) ===
    prediction: {
        // buffer sizes (in-memory only)
        bufferMicro: { value: 5, type: 'number', label: 'Prediction: Micro Buffer Size' },
        bufferShort: { value: 10, type: 'number', label: 'Prediction: Short Buffer Size' },
        bufferMedium: { value: 25, type: 'number', label: 'Prediction: Medium Buffer Size' },
        bufferLong: { value: 100, type: 'number', label: 'Prediction: Long Buffer Size (calibration)' },

        // follow-up and recovery
        followUpExtraMargin: { value: 0.02, type: 'number', label: 'Prediction: extra margin required per follow-up (p_k)' },
        postWarmProbationRounds: { value: 3, type: 'number', label: 'Prediction: rounds after warmup for probation' },

        // priors for Beta/Binomial posterior
        priorAlpha: { value: 1, type: 'number', label: 'Prediction: posterior prior alpha' },
        priorBeta: { value: 1, type: 'number', label: 'Prediction: posterior prior beta' },

        // volatility & trend sensitivity
        trendSlopeThreshold: { value: 0.02, type: 'number', label: 'Prediction: trend slope threshold for "trendy"' },

        // --- BOCPD (approx) change point detection
        enableBOCPD: { value: true, type: 'checkbox', label: 'Prediction: enable BOCPD-like detector' },
        bocpdHazard: { value: 1/200, type: 'number', label: 'Prediction: BOCPD hazard (1/expected run length)' },
        bocpdThreshold: { value: 0.70, type: 'number', label: 'Prediction: BOCPD trigger threshold (0-1)' },

        // --- GARCH(1,1) volatility (optional)
        enableGARCH: { value: true, type: 'checkbox', label: 'Prediction: enable GARCH(1,1) variance' },
        garchOmega: { value: 1e-4, type: 'number', label: 'Prediction: GARCH omega (constant)' },
        garchAlpha: { value: 0.08, type: 'number', label: 'Prediction: GARCH alpha (ARCH term)' },
        garchBeta: { value: 0.90, type: 'number', label: 'Prediction: GARCH beta (GARCH term)' },

        // --- follow-up optimizer (Thompson/UCB)
        enableThompsonFollowUp: { value: true, type: 'checkbox', label: 'Prediction: enable Thompson follow-up selector' },
        followUpSelectionMethod: { value: 'thompson', type: 'string', label: 'Prediction: follow-up method (thompson|ucb)' },
        followUpUtilityThreshold: { value: 0.60, type: 'number', label: 'Prediction: follow-up expected-success threshold' },
        followUpSamples: { value: 500, type: 'number', label: 'Prediction: Thompson sampler draws' },

        // --- Auto-tuner (runtime adaptive p_min multipliers) ---
        autoTune_enable: { value: true, type: 'checkbox', label: 'Prediction: enable auto-tuner (runtime)' },
        autoTune_intervalRounds: { value: 50, type: 'number', label: 'Prediction: auto-tune interval (rounds)' },
        autoTune_learningRate: { value: 0.05, type: 'number', label: 'Prediction: auto-tune learning rate (LR)' },
        autoTune_minFactor: { value: 0.8, type: 'number', label: 'Prediction: auto-tune min factor' },
        autoTune_maxFactor: { value: 1.25, type: 'number', label: 'Prediction: auto-tune max factor' },
        autoTune_minTrials: { value: 30, type: 'number', label: 'Prediction: min trials before tuning' },
        autoTune_targets: { value: { low: 0.95, med: 0.88, high: 0.82 }, type: 'object', label: 'Prediction: per-mult target win rates' },

        // convenience
        syncWarmupToGlobal: { value: true, type: 'checkbox', label: 'Prediction: sync warmupDefault to global warmup.rounds on start' },

        // Change-point (CUSUM) params
        cusumThreshold: { value: 0.5, type: 'number', label: 'Prediction: CUSUM threshold' },
        cusumDrift: { value: 0.01, type: 'number', label: 'Prediction: CUSUM drift term' },

        // safety business caps
        business_k_loss_tolerance: { value: 3, type: 'number', label: 'Prediction: max consecutive recovery losses tolerated (business rule)' },

        // operational mode
        operationalMode: { value: 'balanced', type: 'string', label: 'Prediction: operational mode (conservative|balanced|aggressive)' }
    },

    // --- Pattern Adaptation Engine (PAE) & Q-Learning ---
    qLearn_enable: { value: true, type: 'checkbox', label: 'Enable Session Q-Learning' },
    qLearn_criticalLevel: { value: 6, type: 'number', label: 'Critical Stress Level (Recovery Step)' },
    qLearn_rewardWin: { value: 10, type: 'number', label: 'Q-Reward: Standard Recovery Win' },
    qLearn_rewardSave: { value: 30, type: 'number', label: 'Q-Reward: High Level Save (Lvl 4-5)' },
    qLearn_penaltyCritical: { value: -50, type: 'number', label: 'Q-Penalty: Critical Event Trigger' },
    qLearn_vetoThreshold: { value: -40, type: 'number', label: 'Q-Veto Threshold (Score)' },

    // --- Multi-Scale Entropy (Chaos Detection) ---
    entropy_microWindow: { value: 5, type: 'number', label: 'Micro-Entropy Window (Reflex)' },
    entropy_mesoWindow: { value: 12, type: 'number', label: 'Meso-Entropy Window (Tactician)' },
    entropy_macroWindow: { value: 20, type: 'number', label: 'Macro-Entropy Window (Strategist)' },
    entropy_highThreshold: { value: 0.5, type: 'number', label: 'High Entropy Threshold (0.0 - 1.0)' },

    // --- Context-Aware Safety ---
    safety_cliffGuardTrigger: { value: 2, type: 'number', label: 'Cliff Guard: Cons. Low Losses to Ghost' },
    safety_sniperColdWait: { value: 2, type: 'number', label: 'Adaptive Sniper: Cold Market Wait (Wins)' },
    safety_probationWait: { value: 1, type: 'number', label: 'Probation: Virtual Wins to Exit Ghost Mode' },

    // --- Learning config ---
    learning: {
        alpha: { value: 0.08, type: 'number', label: 'Learning: alpha (learning rate)' },
        gamma: { value: 0.0, type: 'number', label: 'Learning: gamma (discount factor)' },
        minQSamples: { value: 16, type: 'number', label: 'Learning: min Q-samples to use signal' },
        qInfluence: { value: 0.10, type: 'number', label: 'Learning: influence of Q on ensemble (scale)' },
        rewardType: { value: 'binary', type: 'string', label: 'Learning: reward type (binary|profit)' }
    },

    // Schedule times: accept either an ISO timestamp string, epoch ms, or "HH:MM" (24h)
    // Examples:
    //   "2025-12-20T13:30:00Z"  -> exact UTC time
    //   1763650200000           -> epoch ms (UTC)
    //   "13:30"                 -> daily time (local / bot timezone) — implementation may parse as next occurrence
    sch1Time: { value: null, type: 'time', label: 'Schedule 1 Time (ISO / epoch ms / HH:MM)' },
    sch2Time: { value: null, type: 'time', label: 'Schedule 2 Time (ISO / epoch ms / HH:MM)' },
    sch3Time: { value: null, type: 'time', label: 'Schedule 3 Time (ISO / epoch ms / HH:MM)' },

    // === Stop Limits ===
    takeProfitBits: { value: 250, type: 'number', label: 'Take Profit (bits)' },
    sch1ProfitBits: { value: 250, type: 'number', label: 'Schedule 1 Profit (bits)' },
    sch2ProfitBits: { value: 250, type: 'number', label: 'Schedule 2 Profit (bits)' },
    sch3ProfitBits: { value: 250, type: 'number', label: 'Schedule 3 Profit (bits)' },
    minBalanceBits: { value: 1, type: 'number', label: 'Stop Loss (bits)' },

    // === Protection UI keys (mapped if you want UI control) ===
    protectionUiThrottleMs: { value: 0, type: 'number', label: 'UI Throttle (ms)' },
    protectionBetPlacementTimeoutMs: { value: 350, type: 'number', label: 'Bet Placement Timeout (ms)' },
    protectionPlaceBetRetries: { value: 2, type: 'number', label: 'Place Bet Retries' },

    testBalanceBits: { value:100, type: 'number', label: 'Test Balance (ms)' },

    // === System ===
    debug: { value: true, type: 'checkbox', label: 'Enable Debug Logging' }
};

class Logger {
    constructor(config) {
        this.config = config;
    }

    log(message, type = 'info') {
        if (!this.config.get('debug')) return;

        const timestamp = new Date().toISOString();
        const icons = {
            info: '📝',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            bet: '💰',
            skip: '⏭️',
            crash: '💥',
            stats: '📊'
        };

        console.log(`${timestamp} ${icons[type] || '📝'} ${message}`);
    }

    logBetResult(result) {
        if (!this.config.get('debug')) return;

        // Prefer bit-fields when available (new shape)
        const betBits = (typeof result.betAmountBits !== 'undefined') ? result.betAmountBits : (result.betAmountSat ? result.betAmountSat / 100 : (result.betAmount || 0) / 100);
        const profitBits = (typeof result.profitBits !== 'undefined') ? result.profitBits : (result.profitSat ? result.profitSat / 100 : (result.profit || 0) / 100);

        // Balance in bits for display
        const initialBits = result.initialBalanceSat ? Math.floor(result.initialBalanceSat / 100) : ((this.config.getRunMode ? this.config.getRunMode() === 'test' : (this.config.get ? this.config.get('runMode') === 'test' : false)) ? (this.config.get('testBalanceBits') || 0) : Math.floor((this.config.getCurrentBalance() || 0) / 100));
        const currentBits = result.currentBalanceSat ? Math.floor(result.currentBalanceSat / 100) : Math.floor((this.config.getCurrentBalance() || 0) / 100);

        const label = result.isWin ? '🎉 WIN' : '💸 LOSS';
        const profitStr = profitBits > 0 ? `+${profitBits.toFixed(2)}` : `${profitBits.toFixed(2)}`;

        if (result.isWin) {
            const winningsBits = ((result.betAmountSat || (betBits * 100)) * (result.multiplier || 0) / 100);
            this.log(`${label} | Bet: ${betBits.toFixed(2)} bits | Target: ${result.multiplier}x | Crash: ${result.crashValue}x | Winnings: ${winningsBits.toFixed(2)} bits | Net P/L: ${profitStr} bits`, 'success');
        } else {
            this.log(`${label} | Bet: ${betBits} bits | Target: ${result.multiplier}x | Crash: ${result.crashValue}x | Lost: ${betBits} bits | Net P/L: ${profitStr} bits`, 'error');
        }
        this.log(`💰 Balance: ${initialBits.toFixed(2)} → ${currentBits.toFixed(2)} bits | Total P/L: ${(currentBits - initialBits).toFixed(2)} bits`, 'stats');

        // Also log Last P/L explicitly so debugging greps are easy
        this.log(`🧾 Last P/L (bits): ${profitStr}`, 'stats');
    }

    logSkip(reason, crashValue = null) {
        if (!this.config.get('debug')) return;

        const crashStr = crashValue ? ` | Crash: ${crashValue}x` : '';
        this.log(`⏭️ SKIP | Reason: ${reason}${crashStr}`, 'skip');
    }
}

const BETTING_MODE = "test"; // Set to 'test' or 'live'
// Auto-detect platform based on available objects
// Bustabit exposes 'userInfo', Coinscrash uses 'engine.getUsername'
const PLATFORM = (typeof userInfo !== 'undefined') ? 'Bustabit' : 'Coinscrash';

// Safe username retrieval  for the ID string based on the detected platform
const SAFE_USERNAME = (PLATFORM === 'Bustabit' && typeof userInfo !== 'undefined' && userInfo.uname) ? userInfo.uname :
    (typeof engine !== 'undefined' && typeof engine.getUsername === 'function') ? engine.getUsername() : "Guest";

// Updated BOT_SCRIPT_ID with Platform included
const BOT_SCRIPT_ID = config.meta.name + "-v" + config.meta.version +
    " @ " + PLATFORM + " Mode: " + BETTING_MODE.toUpperCase() + " User: " + SAFE_USERNAME + "  " + config.meta.id;

// Quick runtime fingerprint
try { console.info('⚙️ ' + BOT_SCRIPT_ID + ' — loaded at ' + new Date().toISOString()); } catch(_) {}

class UnifiedEngineAdapter {
    constructor() {
        this.platform = this.detectPlatform();
        console.log(`🔌 Unified Adapter attached to: ${this.platform}`);

        // Event Emitter delegates
        this.listeners = {
            'GAME_STARTING': [],
            'GAME_ENDED': []
        };

        this.bindNativeEvents();
    }

    detectPlatform() {
        if (typeof engine.placeBet === 'function') return 'COINSCRASH';
        if (typeof engine.bet === 'function') return 'BUSTABIT';
        return 'UNKNOWN';
    }

    // --- API UNIFICATION ---

    getUsername() {
        if (this.platform === 'BUSTABIT' && typeof userInfo !== 'undefined') return userInfo.uname;
        if (this.platform === 'COINSCRASH') return engine.getUsername();
        return 'Guest';
    }

    getBalance() {
        // Returns Satoshis
        if (this.platform === 'BUSTABIT' && typeof userInfo !== 'undefined') return userInfo.balance;
        if (this.platform === 'COINSCRASH') return engine.getBalance();
        return 0;
    }

    placeBet(satoshis, multiplierFloat) {
        if (this.platform === 'BUSTABIT') {
            engine.bet(satoshis, multiplierFloat);
        } else if (this.platform === 'COINSCRASH') {
            // Coinscrash expects integer multiplier (e.g. 200 for 2.0x)
            engine.placeBet(satoshis, Math.round(multiplierFloat * 100));
        }
    }

    getHistory() {
        // Returns array of crash floats
        if (this.platform === 'BUSTABIT') {
            // FIX: Use toArray() for Bustabit compatibility
            if (engine.history && typeof engine.history.toArray === 'function') {
                return engine.history.toArray().slice(0, 50).map(g => g.crash / 100);
            }
            return [];
        }

        if (this.platform === 'COINSCRASH') {
            // FIX: Coinscrash does not provide history getter. Return empty.
            return [];
        }
        return [];
    }

    // --- EVENT NORMALIZATION ---

    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }

    // Added to silence dead bot instances
    disconnect() {
        this.listeners = {
            'GAME_STARTING': [],
            'GAME_ENDED': []
        };
    }

    bindNativeEvents() {
        const self = this;

        // --- HELPER: Normalize Timestamps to Epoch Milliseconds ---
        const normalizeToMs = (val) => {
            if (val === undefined || val === null) return null;
            const n = Number(val);
            if (!Number.isFinite(n)) return null;
            // If number looks like seconds (small float or int < 1e10), treat as seconds
            // Bustabit/Coinscrash sometimes send '5' for 5s, sometimes epoch ms.
            if (n > 0 && n < 10000000000) return Math.round(n * 1000);
            return Math.round(n);
        };

        // Helper to handle the "Preparing -> Running" transition reliably
        const handleGameStarting = (info) => {
            self.emit('GAME_STARTING', info || {});

            if (self._startTimer) clearTimeout(self._startTimer);

            // Parse time_till_start robustly
            let delayMs = 5000; // Default fallback
            if (info && info.time_till_start !== undefined) {
                const raw = Number(info.time_till_start);
                if (Number.isFinite(raw) && raw > 0) {
                    // If raw is small (< 1000), assume seconds, else ms
                    delayMs = (raw < 1000) ? Math.round(raw * 1000) : Math.round(raw);
                }
            }

            // Calculate projected start time (Epoch MS)
            // Use server provided projected start if available, else calc from delay
            const projectedEpochMs = (info && info.projectedStartTime)
                ? normalizeToMs(info.projectedStartTime)
                : (Date.now() + delayMs);

            // Set backup timer to emit GAME_STARTED with the PRECISE timestamp
            self._startTimer = setTimeout(() => {
                self.emit('GAME_STARTED', { startTime: projectedEpochMs });
            }, delayMs);
        };

        const handleGameStarted = (info) => {
            if (self._startTimer) clearTimeout(self._startTimer);

            // Normalize start time if provided, else use Now
            let startMs = Date.now();
            if (info && (info.start_time || info.startTime || info.started_at)) {
                const normalized = normalizeToMs(info.start_time || info.startTime || info.started_at);
                if (normalized) startMs = normalized;
            }

            // Emit with normalized timestamp so Bot can sync UI
            self.emit('GAME_STARTED', { startTime: startMs });
        };

        const handleGameEnded = (data) => {
            if (self._startTimer) clearTimeout(self._startTimer);

            let crashVal = 0;

            if (self.platform === 'BUSTABIT') {
                if (engine.history && typeof engine.history.first === 'function') {
                    const last = engine.history.first();
                    if (last && typeof last.bust === 'number') crashVal = Number(last.bust);
                }
                if (!crashVal && data && data.crash) crashVal = Number(data.crash);

                // Bustabit usually provides float (e.g. 1.98), ensure it's not scaled integer
                if (crashVal > 1000) crashVal = crashVal / 100;
            }
            else {
                // Coinscrash usually provides integer (e.g. 198 for 1.98x)
                if (data && data.game_crash) crashVal = Number(data.game_crash);
                else if (data && data.crash) crashVal = Number(data.crash);

                // Normalize Coinscrash integer to float
                if (crashVal > 10) crashVal = crashVal / 100;
            }

            self.emit('GAME_ENDED', { crash: crashVal, ...data });
        };

        // --- PLATFORM BINDINGS ---
        if (this.platform === 'BUSTABIT') {
            engine.on('GAME_STARTING', handleGameStarting);
            engine.on('GAME_STARTED', handleGameStarted);
            engine.on('GAME_ENDED', handleGameEnded);
        }
        else if (this.platform === 'COINSCRASH') {
            // Coinscrash event names are lowercase
            engine.on('game_starting', handleGameStarting);
            engine.on('game_started', handleGameStarted);
            engine.on('game_crash', handleGameEnded);
        }
    }
}

/* === DROP-IN REPLACEMENT: ConfigManager (START) === */
class ConfigManager {
    // ==========================================
    // 1. Static Constants (Defaults)
    // ==========================================
    static DEFAULTS = {
        MAX_STAKE_BITS: 10000,
        TEST_BALANCE_BITS: config.testBalanceBits.value,
        WARMUP_ROUNDS: config.warmupDefault.value,
        SCHEDULE_TP_1: config.sch1ProfitBits.value,
        SCHEDULE_TP_2: config.sch2ProfitBits.value,
        SCHEDULE_TP_3: config.sch3ProfitBits.value,
        MIN_BALANCE_BITS: 1,
        TAKE_PROFIT_BITS: config.takeProfitBits.value,
        NORMAL_BASE_BET_PERCENT: config.normalBaseBetPercentOfBal.value,
        NORMAL_BASE_BET_MAX: config.normalBaseBetMax.value
    };

    constructor(adapter) {
        this.adapter = adapter; // Initialize adapter first
        this.initialBalance = null;

        // --- Read External Config (once) ---
        // Prefer window.config if present, otherwise global config variable.
        const cfg = (typeof window !== 'undefined' && typeof window.config !== 'undefined') ? window.config :
            (typeof config !== 'undefined' ? config : {});

        // Namespace the UI-provided config for clarity (keeps single source of truth)
        try {
            if (typeof window !== 'undefined') {
                window.TITAN_UI_CONFIG = cfg;
            }
        } catch (e) {
            // ignore if we can't write to window
        }

        // The original helper kept: val(key, def)
        const val = (key, def) => (cfg[key] && cfg[key].value !== undefined && cfg[key].value !== null) ? cfg[key].value : def;

        // --- Build Configuration Object ---
        this.config = {
            meta: cfg.meta,
            // System
            runMode: typeof BETTING_MODE !== 'undefined' ? BETTING_MODE : 'test',
            debug: val('debug', true),
            testBalanceBits: ConfigManager.DEFAULTS.TEST_BALANCE_BITS,
            showPanel: true,

            // Limits
            takeProfitBits: val('takeProfitBits', ConfigManager.DEFAULTS.TAKE_PROFIT_BITS),
            minBalanceBits: val('minBalanceBits', ConfigManager.DEFAULTS.MIN_BALANCE_BITS),
            maxStakeBits: ConfigManager.DEFAULTS.MAX_STAKE_BITS,

            // Normal Mode (User Facing)
            normal: {
                baseBetBits: val('normalBaseBet', cfg.normalBaseBet.value) / 100, // Convert Sat to Bits
                normalBullMult: val('normalBullMult', cfg.normalBullMult.value),
                normalBearMult: val('normalBearMult', cfg.normalBearMult.value),
                normalSurvivalMult: val('normalSurvivalMult', cfg.normalSurvivalMult.value),
                minWinRate: 0.50,
                lookback: 20,
                baseBetBitPercent: ConfigManager.DEFAULTS.NORMAL_BASE_BET_PERCENT,
                baseBetBitMax: ConfigManager.DEFAULTS.NORMAL_BASE_BET_MAX
            },

            // Recovery Mode
            recovery: {
                enabled: val('enableRecovery', true),
                target: val('recoveryMultiplier', cfg.recoveryMultiplier.value),
                capMultiplier: val('recoveryCapMult', cfg.recoveryCapMult.value),
                recoveryLevelSimThreshold: val('recoveryLevelSimThreshold', cfg.recoveryLevelSimThreshold.value),
                baseProfitMult: 0,
                maxFollowUps: val('maxFollowUps', cfg.maxFollowUps?.value ?? 2),
                // Fallback for legacy getters if needed
                takeProfitBits: val('takeProfitBits', ConfigManager.DEFAULTS.TAKE_PROFIT_BITS),

                // Debt slicing
                debtSlicing: {
                    enabled: val('enableDebtSlicing', cfg.enableDebtSlicing?.value ?? false),
                    sliceTwo: val('sliceTwoLossThreshold', cfg.sliceTwoLossThreshold?.value ?? 4),
                    sliceThree: val('sliceThreeLossThreshold', cfg.sliceThreeLossThreshold?.value ?? 3),
                    sliceFour: val('sliceFourLossThreshold', cfg.sliceFourLossThreshold?.value ?? 2)
                }
            },

            // Map Sniper Configs
            sniper_msvStrictness: val('sniper_msvStrictness', cfg.sniper_msvStrictness?.value ?? 'Medium'),
            sniper_gapConfidence: val('sniper_gapConfidence', cfg.sniper_gapConfidence?.value ?? 2.0),
            sniper_pingPongMode: val('sniper_pingPongMode', cfg.sniper_pingPongMode?.value ?? true),
            recovery_smartFollowUpLimit: val('recovery_smartFollowUpLimit', cfg.recovery_smartFollowUpLimit?.value ?? 3),
            recovery_postExitCooldown: val('recovery_postExitCooldown', cfg.recovery_postExitCooldown?.value ?? 2),

            // --- Prediction / Titan Brain  ---
            // +++ Direct Mapping from Root Config (Single Source of Truth) +++
            prediction: {
                // 1. Core Tuning (Mapped from Root)
                pMinReference: val('pMinReference', cfg.pMinReference?.value ?? 0.60),
                pMinReferenceMult: val('pMinReferenceMult', cfg.pMinReferenceMult?.value ?? 2.00),
                pMinFloor: val('pMinFloor', cfg.pMinFloor?.value ?? 0.40),
                pMinCeiling: val('pMinCeiling', cfg.pMinCeiling?.value ?? 0.95),

                // 2. Weights (Mapped from Root)
                ensembleWeightPosterior: val('weightPosterior', cfg.weightPosterior?.value ?? 0.50),
                ensembleWeightEntropy: val('weightEntropy', cfg.weightEntropy?.value ?? 0.15),
                ensembleWeightVolatility: val('weightVolatility', cfg.weightVolatility?.value ?? 0.15),
                ensembleWeightAutocorr: val('weightAutocorr', cfg.weightAutocorr?.value ?? 0.10),
                ensembleWeightEWMA: val('weightEWMA', cfg.weightEWMA?.value ?? 0.10),
                ensembleWeightGARCH: val('weightGARCH', cfg.weightGARCH?.value ?? 0.00),
                ensembleVarThresholdNormal: val('varThreshold', cfg.varThreshold?.value ?? 0.20),

                // 3. System & Warmup (Mapped from Root)
                warmupDefault: val('warmupDefault', cfg.warmupDefault?.value ?? 25),
                warmupMax: val('warmupMax', cfg.warmupMax?.value ?? 50),
                minEffectiveSample: val('minEffectiveSample', cfg.minEffectiveSample?.value ?? 12),
                cpIncreaseFactor: val('cpIncreaseFactor', cfg.cpIncreaseFactor?.value ?? 1.5),

                // 4. Buffers (Still in prediction sub-object in var config)
                bufferMicro: val('bufferMicro', cfg.prediction?.bufferMicro?.value ?? 5),
                bufferShort: val('bufferShort', cfg.prediction?.bufferShort?.value ?? 10),
                bufferMedium: val('bufferMedium', cfg.prediction?.bufferMedium?.value ?? 25),
                bufferLong: val('bufferLong', cfg.prediction?.bufferLong?.value ?? 100),

                // 5. Misc / Safety / Recovery Logic
                followUpExtraMargin: val('followUpExtraMargin', cfg.prediction?.followUpExtraMargin?.value ?? 0.02),
                postWarmProbationRounds: val('postWarmProbationRounds', cfg.prediction?.postWarmProbationRounds?.value ?? 3),
                priorAlpha: val('priorAlpha', cfg.prediction?.priorAlpha?.value ?? 1),
                priorBeta: val('priorBeta', cfg.prediction?.priorBeta?.value ?? 1),
                trendSlopeThreshold: val('trendSlopeThreshold', cfg.prediction?.trendSlopeThreshold?.value ?? 0.02),

                // BOCPD
                enableBOCPD: val('enableBOCPD', cfg.prediction?.enableBOCPD?.value ?? true),
                bocpdHazard: val('bocpdHazard', cfg.prediction?.bocpdHazard?.value ?? 0.005),
                bocpdThreshold: val('bocpdThreshold', cfg.prediction?.bocpdThreshold?.value ?? 0.70),

                // GARCH
                enableGARCH: val('enableGARCH', cfg.prediction?.enableGARCH?.value ?? true),
                garchOmega: val('garchOmega', cfg.prediction?.garchOmega?.value ?? 1e-4),
                garchAlpha: val('garchAlpha', cfg.prediction?.garchAlpha?.value ?? 0.08),
                garchBeta: val('garchBeta', cfg.prediction?.garchBeta?.value ?? 0.90),

                // Follow-up Optimizer
                enableThompsonFollowUp: val('enableThompsonFollowUp', cfg.prediction?.enableThompsonFollowUp?.value ?? true),
                followUpSelectionMethod: val('followUpSelectionMethod', cfg.prediction?.followUpSelectionMethod?.value ?? 'thompson'),
                followUpUtilityThreshold: val('followUpUtilityThreshold', cfg.prediction?.followUpUtilityThreshold?.value ?? 0.60),
                followUpSamples: val('followUpSamples', cfg.prediction?.followUpSamples?.value ?? 500),

                // Auto-Tuner
                autoTune_enable: val('autoTune_enable', cfg.prediction?.autoTune_enable?.value ?? true),
                autoTune_intervalRounds: val('autoTune_intervalRounds', cfg.prediction?.autoTune_intervalRounds?.value ?? 50),
                autoTune_learningRate: val('autoTune_learningRate', cfg.prediction?.autoTune_learningRate?.value ?? 0.05),
                autoTune_minFactor: val('autoTune_minFactor', cfg.prediction?.autoTune_minFactor?.value ?? 0.8),
                autoTune_maxFactor: val('autoTune_maxFactor', cfg.prediction?.autoTune_maxFactor?.value ?? 1.25),
                autoTune_minTrials: val('autoTune_minTrials', cfg.prediction?.autoTune_minTrials?.value ?? 30),
                autoTune_targets: val('autoTune_targets', cfg.prediction?.autoTune_targets?.value ?? { low: 0.95, med: 0.88, high: 0.82 }),

                // Misc
                syncWarmupToGlobal: val('syncWarmupToGlobal', cfg.prediction?.syncWarmupToGlobal?.value ?? true),
                cusumThreshold: val('cusumThreshold', cfg.prediction?.cusumThreshold?.value ?? 0.5),
                cusumDrift: val('cusumDrift', cfg.prediction?.cusumDrift?.value ?? 0.01),
                business_k_loss_tolerance: val('business_k_loss_tolerance', cfg.prediction?.business_k_loss_tolerance?.value ?? 3),
                operationalMode: val('operationalMode', cfg.prediction?.operationalMode?.value ?? 'balanced')
            },

            // Brain Config Mapping
            qLearn_enable: val('qLearn_enable', cfg.qLearn_enable?.value ?? true),
            qLearn_criticalLevel: val('qLearn_criticalLevel', cfg.qLearn_criticalLevel?.value ?? 6),
            qLearn_rewardWin: val('qLearn_rewardWin', cfg.qLearn_rewardWin?.value ?? 10),
            qLearn_rewardSave: val('qLearn_rewardSave', cfg.qLearn_rewardSave?.value ?? 30),
            qLearn_penaltyCritical: val('qLearn_penaltyCritical', cfg.qLearn_penaltyCritical?.value ?? -50),
            qLearn_vetoThreshold: val('qLearn_vetoThreshold', cfg.qLearn_vetoThreshold?.value ?? -40),

            entropy_microWindow: val('entropy_microWindow', cfg.entropy_microWindow?.value ?? 5),
            entropy_mesoWindow: val('entropy_mesoWindow', cfg.entropy_mesoWindow?.value ?? 12),
            entropy_macroWindow: val('entropy_macroWindow', cfg.entropy_macroWindow?.value ?? 20),
            entropy_highThreshold: val('entropy_highThreshold', cfg.entropy_highThreshold?.value ?? 0.4),

            safety_cliffGuardTrigger: val('safety_cliffGuardTrigger', cfg.safety_cliffGuardTrigger?.value ?? 2),
            safety_sniperColdWait: val('safety_sniperColdWait', cfg.safety_sniperColdWait?.value ?? 2),
            safety_probationWait: val('safety_probationWait', cfg.safety_probationWait?.value ?? 1),

            // Learning (Q) runtime mapping
            learning: {
                alpha: val('learningAlpha', cfg.learning?.alpha?.value ?? 0.08),
                gamma: val('learningGamma', cfg.learning?.gamma?.value ?? 0.0),
                minQSamples: val('minQSamples', cfg.learning?.minQSamples?.value ?? 16),
                qInfluence: val('qInfluence', cfg.learning?.qInfluence?.value ?? 0.10),
                rewardType: val('rewardType', cfg.learning?.rewardType?.value ?? 'binary')
            },

            // UI & Protections
            protection: {
                uiThrottleMs: 0,
                betPlacementTimeoutMs: 350,
                placeBetRetries: 2
            },

            // Warmup
            warmup: {
                enabled: true,
                rounds: ConfigManager.DEFAULTS.WARMUP_ROUNDS,
                startInWarmup: true,
                timeOfDay: { enabled: true }
            },

            // Schedules
            schedules: {
                betSchedule1: {
                    time: readVal('sch1Time'),              // maps config.sch1Time.value
                    takeProfitBits: readVal('sch1ProfitBits')
                },
                betSchedule2: {
                    time: readVal('sch2Time'),
                    takeProfitBits: readVal('sch2ProfitBits')
                },
                betSchedule3: {
                    time: readVal('sch3Time'),
                    takeProfitBits: readVal('sch3ProfitBits')
                }
            },
            behavior: {
                stopOnTakeProfitOnlyFrom: 'betSchedule3'
            }
        };

        // --- Dynamic Initialization ---

        // 1. Set Initial Balance
        this.setInitialBalance();

        // 2. Compute dynamic base bet based on percentage of balance
        this.computeAndSetBaseBetFromPercent();

        // 3. Populate Schedule Take Profits (dependent on base bet)
        this.initializeScheduleTakeProfits();
    }

    // ==========================================
    // 2. Computation Logic
    // ==========================================

    /**
     * Calculates and sets this.config.normal.baseBetBits based on current balance percent.
     */
    computeAndSetBaseBetFromPercent() {
        const norm = this.config.normal;
        const pct = (typeof norm.baseBetBitPercent === 'number') ? norm.baseBetBitPercent : 0.006;
        const maxBits = Number.isFinite(Number(norm.baseBetBitMax)) ? Number(norm.baseBetBitMax) : 300;

        // Legacy fallback
        const minBits = Number(this.config.baseBetBits) || 1;

        // Get Balance (Satoshis) -> Convert to Bits
        const sat = Number(this.getCurrentBalance()) || 0;
        const balanceBits = Math.floor(sat / 100);

        // Calculate
        let computed = Math.floor(balanceBits * pct);
        if (!Number.isFinite(computed)) computed = minBits;

        // Clamp
        const numeric = Math.max(minBits, Math.min(maxBits, Math.max(0, Math.floor(computed))));

        // Write result
        this.config.normal.baseBetBits = numeric;

        return numeric;
    }

    /**
     * loops through schedules and calculates TP based on the calculated base bet.
     */
    initializeScheduleTakeProfits() {
        if (!this.config.schedules) return;

        for (const sk of Object.keys(this.config.schedules)) {
            this.config.schedules[sk].takeProfitBits = this.computeTakeProfitAmount(
                this.config.normal.baseBetBits,
                sk
            );
        }
    }

    computeTakeProfitAmount(normalBetBit, scheduleKey) {
        const multipliers = {
            betSchedule1: ConfigManager.DEFAULTS.SCHEDULE_TP_1,
            betSchedule2: ConfigManager.DEFAULTS.SCHEDULE_TP_2,
            betSchedule3: ConfigManager.DEFAULTS.SCHEDULE_TP_3
        };

        const multiplier = Number(multipliers[scheduleKey] ?? ConfigManager.DEFAULTS.SCHEDULE_TP_1);

        // Defensive read of base bet
        const base = Number(
            normalBetBit ??
            this.config?.normal?.baseBetBits ??
            this.config?.baseBetBits ??
            0
        );

        return multiplier * base;
    }

    // ==========================================
    // 3. State Management
    // ==========================================

    setInitialBalance() {
        if (this.initialBalance === null) {
            this.initialBalance = this.getCurrentBalance();
        }
    }

    getCurrentBalance() {
        if (this.config.runMode === 'test') {
            return (this.config.testBalanceBits || 0) * 100;
        }
        return this.adapter.getBalance();
    }

    updateBalance(newBalance) {
        const isTest = (this.getRunMode() === 'test');
        if (isTest) {
            // Store as bits for test mode consistency
            this.config.testBalanceBits = this.satsToBits(newBalance);
        }
    }

    // Deep-merge utility (mutates target). Preserves nested siblings.
    static _deepMerge(target, source) {
        if (!source || typeof source !== 'object') return target;
        if (!target || typeof target !== 'object') return source;
        for (const k of Object.keys(source)) {
            const sv = source[k];
            const tv = target[k];
            if (Array.isArray(sv)) {
                target[k] = sv.slice();
            } else if (sv && typeof sv === 'object') {
                if (!tv || typeof tv !== 'object') target[k] = {};
                ConfigManager._deepMerge(target[k], sv);
            } else {
                target[k] = sv;
            }
        }
        return target;
    }

    update(newConfig) {
        // Replace shallow assign with deep-merge to avoid wiping nested objects on partial updates
        if (newConfig && typeof newConfig === 'object') {
            ConfigManager._deepMerge(this.config, newConfig);
        }
        if (this.config.debug) {
            console.log('🔧 Config updated:', newConfig);
        }
    }

    // ==========================================
    // 4. Getters (Standardized to Satoshi)
    // ==========================================

    // FIX: Updated to handle sub-keys (e.g. get('normal', 'targetBull'))
    get(key, subKey = null) {
        if (subKey && this.config[key]) {
            return this.config[key][subKey];
        }
        return this.config[key];
    }

    getRaw() {
        return this.config;
    }

    getRunMode() {
        return (this.config.runMode || 'test');
    }

    getBaseBetSat() {
        if (this.config?.normal?.baseBetBits !== undefined) {
            return this.bitsToSats(this.config.normal.baseBetBits);
        }
        return 0;
    }

    getTakeProfitSat() {
        const c = this.config;
        const bits = (c.takeProfitBits !== undefined)
            ? c.takeProfitBits
            : (c.recovery?.takeProfitBits !== undefined)
                ? c.recovery.takeProfitBits
                : (c.takeProfitLimit !== undefined ? c.takeProfitLimit : 0);

        return this.bitsToSats(bits);
    }

    getMinBalanceSat() {
        const bits = (this.config.minBalanceBits !== undefined)
            ? this.config.minBalanceBits
            : (this.config.stopLossLimit !== undefined ? this.config.stopLossLimit : 1);

        return this.bitsToSats(bits);
    }

    // Property Accessor Helpers
    get recovery() { return this.config?.recovery || null; }
    get normal() { return this.config?.normal || null; }

    // ==========================================
    // 5. Utilities / Converters
    // ==========================================

    bitsToSats(bits) { return Math.round((bits || 0) * 100); }
    satsToBits(sats) { return (sats || 0) / 100; }

    bitsRound(bits) {
        return Math.max(0, Math.round(bits || 0));
    }
}

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

class StatsTracker {
    constructor(config) {
        this.config = config;
        this.resetStats();
        this.crashHistory = [];
        this.logger = new Logger(this.config);
    }

    resetStats() {
        // canonical per-session counters (bits profits stored as floats)
        this.stats = {
            totalBets: 0,
            totalSkips: 0,
            totalRounds: 0,            // bets + skips
            totalWins: 0,
            totalLosses: 0,
            totalProfit: 0.0,         // float (bits)
            consecutiveWins: 0,
            consecutiveLosses: 0,
            maxConsecutiveWins: 0,
            maxConsecutiveLosses: 0,
            // per-mode counters (for panel)
            normalWin: 0,
            normalLoss: 0,
            recoveryWin: 0,
            recoveryLoss: 0,
            normalSkips: 0,
            recoverySkips: 0,
            // last bet info
            lastPLBits: null,
            lastMultiplier: 0,
            // recovery max trackers (kept here so restart can reset them)
            maxRecLevel: 0,
            maxRecStake: 0,
            maxRecTime: null,
            maxRecRuntimeSeconds: 0,
            // session start
            startTime: Date.now()
        };
        // crash history persists but limited by getRecentCrashes logic
        this.crashHistory = [];
    }

    addCrash(crashValue) {
        this.crashHistory.push({
            value: crashValue,
            timestamp: Date.now()
        });

        // Keep only last 50 crashes for analysis
        if (this.crashHistory.length > 50) {
            this.crashHistory.shift();
        }
    }

    /**
     * Record bet result.
     * meta: { mode: 'NORMAL'|'RECOVERY', betAmountBits: number, multiplier: number }
     */
    addBetResult(isWin, profit, meta = {}) {
        const mode = (meta.mode || 'NORMAL').toUpperCase();

        // 1) counts
        this.stats.totalBets++;
        this.stats.totalRounds++; // a processed bet is also a round

        // 2) profit (do NOT round here — keep fractional bits for accuracy)
        const profitFloat = Number(profit || 0);
        this.stats.totalProfit += profitFloat;

        // 3) global win/loss and consecutive bookkeeping
        if (isWin) {
            this.stats.totalWins++;
            this.stats.consecutiveWins++;
            this.stats.consecutiveLosses = 0;
            this.stats.maxConsecutiveWins = Math.max(this.stats.maxConsecutiveWins, this.stats.consecutiveWins);
        } else {
            this.stats.totalLosses++;
            this.stats.consecutiveLosses++;
            this.stats.consecutiveWins = 0;
            this.stats.maxConsecutiveLosses = Math.max(this.stats.maxConsecutiveLosses, this.stats.consecutiveLosses);
        }

        // 4) per-mode counters
        if (mode === 'RECOVERY') {
            if (isWin) this.stats.recoveryWin = (this.stats.recoveryWin || 0) + 1;
            else this.stats.recoveryLoss = (this.stats.recoveryLoss || 0) + 1;
            this.stats.recoveryWin = this.stats.recoveryWin || 0;
            this.stats.recoveryLoss = this.stats.recoveryLoss || 0;
            this.stats.recoverySkips = this.stats.recoverySkips || 0;
        } else {
            if (isWin) this.stats.normalWin = (this.stats.normalWin || 0) + 1;
            else this.stats.normalLoss = (this.stats.normalLoss || 0) + 1;
            this.stats.normalWin = this.stats.normalWin || 0;
            this.stats.normalLoss = this.stats.normalLoss || 0;
            this.stats.normalSkips = this.stats.normalSkips || 0;
        }

        // 5) last bet bookkeeping (used by panel)
        this.stats.lastPLBits = profitFloat;
        if (Number.isFinite(meta.multiplier)) this.stats.lastMultiplier = Number(meta.multiplier);

        // --- NEW: Build a result object for shadow pairing and forward it to the brain (if available)
        const resultObj = {
            win: !!isWin,
            profit: profitFloat,
            mode: mode,
            timestamp: Date.now()
        };
        // include multiplier if provided
        if (meta && Number.isFinite(meta.multiplier)) resultObj.multiplier = Number(meta.multiplier);
        // include bit stake or bet amount if provided
        if (meta && meta.betAmountBits !== undefined) resultObj.betAmountBits = meta.betAmountBits;
        // optionally include any other meta fields (keeps object minimal)
        if (meta && meta.roundId !== undefined) resultObj.roundId = meta.roundId;

        // Forward bet result to prediction engine for shadow pairing (guarded call)
        if (this.bot && this.bot.brain && typeof this.bot.brain.recordBetResult === 'function') {
            try {
                this.bot.brain.recordBetResult(resultObj);
            } catch (e) {
                // don't let brain failures break StatsTracker — log for debug
                if (this.bot && this.bot.config && this.bot.config.get && this.bot.config.get('debug')) {
                    console.warn('Error forwarding bet result to brain.recordBetResult:', e);
                }
            }
        }

        // 6) lightweight verification log
        logger.log(`📊 VERIFICATION: Total Bets: ${this.stats.totalBets} | Wins: ${this.stats.totalWins} | Losses: ${this.stats.totalLosses} | Rounds: ${this.stats.totalRounds} | Total P/L: ${this.stats.totalProfit.toFixed(2)} bits`);
    }

    /**
     * Record an intentional skip.
     * mode = 'NORMAL' or 'RECOVERY' (used to maintain per-mode skip counts)
     */
    addSkip(reason = 'ev', mode = 'NORMAL') {
        // Always count a skip as a round
        this.stats.totalSkips = (this.stats.totalSkips || 0) + 1;
        this.stats.totalRounds = (this.stats.totalRounds || 0) + 1;

        if ((mode || 'NORMAL').toUpperCase() === 'RECOVERY') {
            this.stats.recoverySkips = (this.stats.recoverySkips || 0) + 1;
        } else {
            this.stats.normalSkips = (this.stats.normalSkips || 0) + 1;
        }
    }

    getWinRate() {
        if (this.stats.totalBets === 0) return 0;

        // Double-check that wins + losses = total bets for data integrity
        const calculatedTotal = this.stats.totalWins + this.stats.totalLosses;
        if (calculatedTotal !== this.stats.totalBets) {
            console.warn(`⚠️ Stats mismatch! Wins(${this.stats.totalWins}) + Losses(${this.stats.totalLosses}) = ${calculatedTotal} ≠ Total Bets(${this.stats.totalBets})`);
        }

        return this.stats.totalWins / this.stats.totalBets;
    }

    // Robust getRecentCrashes: returns an array of numeric crash multipliers (most-recent last).
    // - Accepts optional `count` (default 10) and returns the last `count` crashes.
    // - Tries several common places that different script versions use to store crash history.
    // - Normalizes values to Number and filters non-finite entries.
    getRecentCrashes(count = 10) {
        // Try several possible history arrays used across script versions
        let arr;
        if (Array.isArray(this.crashHistory) && this.crashHistory.length) arr = this.crashHistory.slice();
        else if (Array.isArray(this.recentCrashes) && this.recentCrashes.length) arr = this.recentCrashes.slice();
        else if (this.marketHistory && Array.isArray(this.marketHistory.crashes)) arr = this.marketHistory.crashes.slice();
        else if (this.engine && Array.isArray(this.engine.recentCrashes)) arr = this.engine.recentCrashes.slice();
        else if (this.history && Array.isArray(this.history.crashes)) arr = this.history.crashes.slice();
        else if (Array.isArray(this.lastCrashes)) arr = this.lastCrashes.slice();
        else arr = [];

        // Map objects like { value: X } to their .value, otherwise take the item directly.
        arr = arr.map(item => {
            if (item && typeof item === 'object' && ('value' in item)) return Number(item.value);
            return Number(item);
        }).filter(v => Number.isFinite(v));

        if (count && Number.isFinite(count) && count > 0) {
            return arr.slice(-count);
        }
        return arr;
    }

    getAverageCrash(count = 10) {
        const recent = this.getRecentCrashes(count);
        return recent.length > 0 ? recent.reduce((sum, val) => sum + val, 0) / recent.length : 0;
    }

    getMedianCrash(count = 20) {
        const recent = this.getRecentCrashes(count);
        if (recent.length === 0) return 0;
        // Sort numeric copy
        const sorted = [...recent].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        if (sorted.length % 2 === 0) {
            return (sorted[mid - 1] + sorted[mid]) / 2;
        }
        return sorted[mid];
    }

    getSkewness(count = 50) {
        const recent = this.getRecentCrashes(count);
        if (recent.length < 3) return 0;

        const n = recent.length;
        const mean = recent.reduce((a, b) => a + b, 0) / n;

        // Calculate 2nd moment (Variance) and 3rd moment
        let m2 = 0;
        let m3 = 0;
        for (const x of recent) {
            const delta = x - mean;
            m2 += delta * delta;
            m3 += delta * delta * delta;
        }

        const variance = m2 / (n - 1);
        const stdDev = Math.sqrt(variance);

        if (stdDev === 0) return 0;

        // Fisher-Pearson coefficient of skewness
        const skew = (n * m3) / ((n - 1) * (n - 2) * Math.pow(stdDev, 3));
        return skew;
    }

    getStats() {
        const runtime = Math.floor((Date.now() - this.stats.startTime) / 1000);
        return {
            ...this.stats,
            winRate: this.getWinRate(),
            runtime: runtime,
            avgCrash: this.getAverageCrash()
        };
    }
}

class BettingEngine {
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
        this.activeBet = null;
        this.bot = null; // Injected by CrashBot
        this._placeLock = false;
        this._placeRetryPending = false;
    }

    placeBet(amount, targetMultiplier, modeOrMeta = undefined) {
        // Normalize amount (handle bits vs sats)
        let bits = (amount || 0) / 100;
        bits = this.config.bitsRound ? this.config.bitsRound(bits) : Math.round(bits);
        amount = (bits * 100);

        // 1. Validation
        if (!Number.isFinite(amount) || amount <= 0) {
            this.logger.log(`⚠️ Invalid Stake: ${amount}`, 'error');
            return false;
        }
        if (!Number.isFinite(targetMultiplier) || targetMultiplier <= 1.0) {
            this.logger.log(`⚠️ Invalid Target: ${targetMultiplier}`, 'error');
            return false;
        }

        // 2. Balance Check
        const balance = this.config.getCurrentBalance();
        // Hard Stop if insufficient balance
        if (balance < amount) {
            this.logger.log(`❌ CRITICAL: Insufficient Balance. Have: ${balance}, Need: ${amount}`, 'error');
            if (this.bot && typeof this.bot.triggerHalt === 'function') {
                this.bot.triggerHalt('stop loss', 'Insufficient Balance: Stake exceeds Current Balance');
            }
            return false;
        }

        const runMode = this.config.getRunMode ? this.config.getRunMode() : (this.config.get ? this.config.get('runMode') : 'test');

        // Normalize Mode
        let suppliedMode = (typeof modeOrMeta === 'string') ? modeOrMeta : (modeOrMeta?.modeAtPlace || 'NORMAL');
        let suppliedBatchId = (modeOrMeta && typeof modeOrMeta === 'object') ? modeOrMeta.batchId : null;

        // 3. Test Mode Logic (Simulate)
        if (runMode === 'test') {
            this.activeBet = {
                amount: amount,
                stakeBits: bits,
                targetMultiplier: targetMultiplier,
                timestamp: Date.now(),
                modeAtPlace: suppliedMode,
                batchId: suppliedBatchId,
                preBalanceSat: this.config.getCurrentBalance()
            };
            return true; // Logs handled by CrashBot
        }

        // 4. Live Mode Logic (with Locking & Retries)
        if (this._placeLock) {
            this.logger.log('⚠️ placeBet locked — preventing duplicate placement', 'warning');
            return false;
        }
        this._placeLock = true;
        this._placeRetryPending = false;

        // Internal helper to finalize state
        const reconcileAsPlaced = () => {
            this.activeBet = {
                amount: amount,
                stakeBits: bits,
                targetMultiplier: targetMultiplier,
                timestamp: Date.now(),
                reconciled: true,
                modeAtPlace: suppliedMode,
                batchId: suppliedBatchId,
                preBalanceSat: this.config.getCurrentBalance()
            };
            this._placeLock = false;
        };

        // Attempt Placement via Adapter
        if (this.bot && this.bot.adapter) {
            try {
                this.bot.adapter.placeBet(amount, targetMultiplier);
                reconcileAsPlaced();
                return true;
            } catch (e) {
                this.logger.log(`❌ Adapter Error: ${e.message}`, 'error');
                this._placeLock = false;
                return false;
            }
        } else {
            this.logger.log("❌ Adapter not linked", 'error');
            this._placeLock = false;
            return false;
        }
    }

    processGameCrash(crashValue) {
        if (!this.activeBet) return null;

        const bet = this.activeBet;
        const preBalanceSat = Number(bet.preBalanceSat) || Number(this.config.getCurrentBalance());

        // Win/Loss Logic
        let isWin = crashValue >= bet.targetMultiplier;
        let profit = 0;
        let newBalance = 0;

        if (isWin) {
            profit = bet.amount * (bet.targetMultiplier - 1);
            newBalance = preBalanceSat + profit;
        } else {
            profit = -bet.amount;
            newBalance = preBalanceSat + profit;
        }

        // Test Mode Balance Update
        const runMode = this.config.getRunMode ? this.config.getRunMode() : (this.config.get ? this.config.get('runMode') : 'test');
        if (runMode === 'test') {
            this.config.updateBalance(newBalance);
        } else {
            // Live Mode Balance Sync (Best Effort)
            try {
                if (this.bot && this.bot.adapter) {
                    const engineBal = this.bot.adapter.getBalance();
                    // Reconcile engine balance vs calculated profit
                    const actualProfit = engineBal - preBalanceSat;
                    if (Math.abs(actualProfit - profit) > 100) { // tolerance
                        profit = actualProfit; // Trust engine
                        isWin = profit > 0;
                        newBalance = engineBal;
                    }
                }
            } catch (e) {}
        }

        const result = {
            isWin: isWin,
            profitSat: Number(profit),
            profitBits: Number(profit) / 100,
            betAmountSat: Number(bet.amount),
            betAmountBits: Number(bet.amount) / 100,
            target: bet.targetMultiplier,
            mode: bet.modeAtPlace,
            batchId: bet.batchId,
            initialBalanceSat: this.config.initialBalance,
            currentBalanceSat: newBalance
        };

        this.activeBet = null; // Clear state
        return result;
    }

    hasActiveBet() { return this.activeBet !== null; }
    getActiveBet() { return this.activeBet; }
}

class StatsPanel {
    constructor(config) {
        this.config = config;
        this.bot = (typeof window !== 'undefined' && window.crashBot) ? window.crashBot : null;
        this.panel = null; // No HTML panel

        // Start the runtime ticker logic, but it won't update any HTML
        this.startRuntimeTicker(this.bot);
    }

    setBot(botInstance) {
        try {
            this.bot = botInstance;
        } catch (e) { /* ignore */ }
    }

    startRuntimeTicker(bot) {
        // Clear any existing interval to prevent duplicates
        this.stopRuntimeTicker();

        // Set an interval to run every 1000ms (1 second)
        this._runtimeInterval = setInterval(() => {
            if (bot) {
                // Determine if we are betting to keep that status accurate
                const isBetting = bot.betting && bot.betting.hasActiveBet();

                // Trigger the update
                // This will recalculate runtime, countdowns, and timers, then send to server
                this.updateStats(
                    bot.stats.getStats(),
                    bot.config.getCurrentBalance(),
                    bot.config.initialBalance,
                    bot.betting.getActiveBet(),
                    isBetting
                );
            }
        }, 1000);
    }

    stopRuntimeTicker() {

    }

    createPanel() {
        // This method is now empty.
        // The old API call `engine.getUsername()` is replaced by `userInfo.uname`.
        // We can access it in updateStats if needed, e.g.:
        // const username = (typeof userInfo !== 'undefined') ? userInfo.uname : 'guest';
    }
    addDragFunctionality() { }
    addIcons() { }
    showCloseConfirmModal() { }
    showConfigDialog() { }

    /**
     * This is your new "console-panel".
     * It gathers all stats and prints them to the Bustabit log.
     */
    updateStats(stats, currentBalance, initialBalance, activeBet = null, isBetting = false, skipReason = null, lastPLBits = null, force = false) {
        // Guard: We must have the bot and its logger to print
        if (!this.bot || !this.bot.logger || !this.config.get('showPanel')) return;

        // --- UI throttle guard ---
        try {
            const uiThrottleMs = (this.config && this.config.config && this.config.config.protection && Number.isFinite(this.config.config.protection.uiThrottleMs))
                ? Number(this.config.config.protection.uiThrottleMs)
                : 0;

            if (!this._lastUpdateTs) this._lastUpdateTs = 0;
            const nowTs = Date.now();
            if (!force && (nowTs - this._lastUpdateTs < uiThrottleMs)) {
                return; // Skip this update (Throttled)
            }
            this._lastUpdateTs = nowTs;
        } catch (e) { /* non-fatal */ }

        // --- 1. Gather all data points (Ported from original script) ---

        // Balances & P/L
        const initBits = (initialBalance || this.config.getCurrentBalance()) / 100;
        const curBits = (currentBalance || this.config.getCurrentBalance()) / 100;
        const plBits = curBits - initBits;
        const plStr = (plBits < 0) ? `${plBits.toFixed(2)}` : `+${plBits.toFixed(2)}`;
        const lastPlStr = lastPLBits ? (lastPLBits < 0 ? `${lastPLBits.toFixed(2)}` : `+${lastPLBits.toFixed(2)}`) : "0.00";

        // Mode & State
        const runType = (this.config.getRunMode ? (this.config.getRunMode() === 'test' ? 'TEST' : 'LIVE') : 'LIVE');
        const subMode = (this.bot && this.bot.mode) ? this.bot.mode : 'NORMAL';
        let stateLabel;
        // Check Sticky Reason FIRST to force HALTED state
        if (this.bot && this.bot.haltReason) {
            stateLabel = 'HALTED';
        } else if (subMode === 'WARMUP') {
            stateLabel = (this.bot && this.bot.isRunning) ? 'RUNNING' : 'HALTED';
        } else {
            if (!this.bot || this.bot.isRunning === false) {
                stateLabel = 'HALTED';
            } else if (isBetting) {
                stateLabel = 'BETTING';
            } else {
                stateLabel = 'PAUSED';
            }
        }
        const displaySub = (subMode === 'WARMUP') ? 'WARM UP' : subMode;
        const modeText = `[${runType}][${displaySub}][${stateLabel}]`;
        const bettingNowText = isBetting ? 'Yes' : 'No';

        // Take Profit Stats
        let tpBits = null;
        try {
            const cfgWarmup = (this.config.config && this.config.config.warmup) ? this.config.config.warmup : null;
            const todActive = cfgWarmup && cfgWarmup.timeOfDay && cfgWarmup.timeOfDay.enabled;
            const todTarget = (this.bot && typeof this.bot._nextScheduleTarget === 'function') ? this.bot._nextScheduleTarget(cfgWarmup) : null;

            let scheduleKey = null;
            if (this.bot && typeof this.bot.scheduledTargetScheduleKey !== 'undefined' && this.bot.scheduledTargetScheduleKey !== null) {
                scheduleKey = this.bot.scheduledTargetScheduleKey;
            } else if (this.bot && this.bot.runtime && typeof this.bot.runtime.currentScheduleKey !== 'undefined' && this.bot.runtime.currentScheduleKey !== null) {
                scheduleKey = this.bot.runtime.currentScheduleKey;
            } else if (todTarget && typeof todTarget.scheduleKey !== 'undefined' && todTarget.scheduleKey !== null) {
                scheduleKey = todTarget.scheduleKey;
            }

            const schedulesCfg = (this.config && (this.config.schedules || (this.config.config && this.config.config.schedules))) ? (this.config.schedules || this.config.config.schedules) : null;
            if (todActive && scheduleKey && schedulesCfg && schedulesCfg[scheduleKey] && Number.isFinite(Number(schedulesCfg[scheduleKey].takeProfitBits))) {
                tpBits = Number(schedulesCfg[scheduleKey].takeProfitBits);
            } else if (this.config && Number.isFinite(Number(this.config.takeProfitBits))) {
                tpBits = Number(this.config.takeProfitBits);
            } else if (this.config && typeof this.config.getTakeProfitSat === 'function') {
                tpBits = (this.config.getTakeProfitSat() / 100);
            } else {
                tpBits = null;
            }
        } catch (e) {
            tpBits = null;
        }

        const tpBitsNumeric = Number.isFinite(Number(tpBits)) ? Number(tpBits) : null;
        const pcov = (tpBitsNumeric && tpBitsNumeric > 0) ? Math.min(100, Math.max(0, (plBits / tpBitsNumeric) * 100)).toFixed(1) : '0.0';
        const rem = (tpBitsNumeric && tpBitsNumeric > 0) ? Math.max(0, (tpBitsNumeric - plBits)).toFixed(2) : '0.00';
        const tpDisplay = Number.isFinite(tpBitsNumeric) ? tpBitsNumeric.toFixed(2) : '--';

        // Warmup & Schedule
        let warmupText = '';
        let countdownText = '--:--:--';
        let targetText = '--:--:--';
        const warmCur = this.bot && this.bot.warmupCounter ? this.bot.warmupCounter : 0;
        const warmMax = (this.config.config && this.config.config.warmup && Number.isFinite(this.config.config.warmup.rounds)) ? Number(this.config.config.warmup.rounds) : 0;
        const cfgWarmup = (this.config.config && this.config.config.warmup) ? this.config.config.warmup : null;
        const todTarget = (this.bot && typeof this.bot._nextScheduleTarget === 'function') ? this.bot._nextScheduleTarget(cfgWarmup) : null;

        if (this.bot && this.bot.mode === 'WARMUP') {
            if (cfgWarmup && cfgWarmup.timeOfDay && cfgWarmup.timeOfDay.enabled && (todTarget || this.bot.scheduledTargetEpochMs)) {
                const now = Date.now();
                const storedSchedEpoch = (this.bot && this.bot.scheduledTargetEpochMs && Number.isFinite(Number(this.bot.scheduledTargetEpochMs))) ? Number(this.bot.scheduledTargetEpochMs) : null;
                const schedEpoch = (storedSchedEpoch !== null && storedSchedEpoch > now) ? storedSchedEpoch : (todTarget && Number.isFinite(Number(todTarget.targetEpochMs)) ? Number(todTarget.targetEpochMs) : null);
                const schedHHMMSS = (storedSchedEpoch !== null && storedSchedEpoch > now && this.bot && this.bot.scheduledTargetHHMMSS) ? this.bot.scheduledTargetHHMMSS : ((todTarget && todTarget.targetHHMMSS) ? todTarget.targetHHMMSS : '--:--:--');

                warmupText = `To exit at ${schedHHMMSS}`;
                targetText = schedHHMMSS;

                if (schedEpoch !== null) {
                    let diff = Math.max(0, schedEpoch - now);
                    const days = Math.floor(diff / (24 * 3600 * 1000));
                    diff %= (24 * 3600 * 1000);
                    const hours = Math.floor(diff / 3600000);
                    diff %= 3600000;
                    const mins = Math.floor(diff / 60000);
                    diff %= 60000;
                    const secs = Math.floor(diff / 1000);
                    const dPart = days > 0 ? `${String(days).padStart(2, '0')}:` : '';
                    countdownText = `${dPart}${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                }
            } else {
                warmupText = `${warmCur}/${warmMax}`;
            }
        } else {
            const todEnabled = cfgWarmup && cfgWarmup.timeOfDay && cfgWarmup.timeOfDay.enabled;
            if (todEnabled && this.bot && this.bot.betStartTimeMalaysia) {
                warmupText = `Betting started at ${this.bot.betStartTimeMalaysia}`;
            } else {
                warmupText = 'N/A'; // Or some other placeholder
            }
        }

        // Times
        const firstStartedAt = this.bot && this.bot.firstStartedAt ? this.bot.firstStartedAt : null;
        const startedAt = this.bot && this.bot.startedAt ? this.bot.startedAt : null;
        const pausedAccum = this.bot && this.bot.pausedRunSeconds ? this.bot.pausedRunSeconds : 0;
        const startTimeStr = firstStartedAt ? (this.bot._malaysiaTimeString(new Date(firstStartedAt))) : '--:--:--';

        const runningSeconds = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
        const totalSeconds = pausedAccum + runningSeconds;
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const sec = totalSeconds % 60;
        const runtimeText = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

        const bStartText = this.bot && this.bot.betStartTimeMalaysia ? this.bot.betStartTimeMalaysia : '--:--:--';
        const bEndText = this.bot && this.bot.betEndTimeMalaysia ? this.bot.betEndTimeMalaysia : '--:--:--';
        const scheduledText = this.bot && this.bot.scheduledTargetHHMMSS ? this.bot.scheduledTargetHHMMSS : '--:--:--';

        // Multipliers
        const lastMult = (stats && stats.lastMultiplier) ? stats.lastMultiplier : 0;
        // Safety check in case config is partial
        const cfgNorm = (this.bot && this.bot.config) ? this.bot.config.getRaw().normal : {};
        let nextMultValue = 0;

        // Check activeBet first to display the REAL target being used
        if (activeBet && activeBet.targetMultiplier) {
            nextMultValue = activeBet.targetMultiplier;
        }
        else if (this.bot && this.bot.mode === 'RECOVERY') {
            // Fallback to 0 if target is missing to prevent undefined.toFixed() crash
            nextMultValue = this.bot.config.get('recovery', 'target') || 0;
        }
        else if (this.bot && this.bot.brain && this.bot.brain.lastRegime) {
            const r = this.bot.brain.lastRegime;
            // Add safety fallbacks || 0
            if (r === 'GREEN') nextMultValue = cfgNorm.normalBullMult || 0;
            else if (r === 'RED') nextMultValue = cfgNorm.normalSurvivalMult || 0;
            else nextMultValue = cfgNorm.normalBearMult || 0;
        }
        else {
            nextMultValue = cfgNorm.normalBullMult || 0;
        }


        // Debt & Stake
        const debtText = (this.bot && this.bot.debtBits ? this.bot.debtBits.toFixed(2) : '0.00');
        let estimatedStake = 0;
        if (this.bot) {
            if (this.bot.mode === 'NORMAL') {
                estimatedStake = this.bot.config.get('normal', 'baseBetBits');
            } else {
                // Call existing method in simulation mode
                estimatedStake = (typeof this.bot.calculateRecoveryStake === 'function')
                    ? this.bot.calculateRecoveryStake(true)
                    : 0;
            }
        }
        const nextStake = activeBet ? Math.round(activeBet.amount / 100) : estimatedStake;

        // Skips
        const normalSkips = this.bot ? (this.bot.normalSkips || 0) : 0;
        const recSkips = this.bot ? (this.bot.recoverySkips || 0) : 0;

        // Recovery
        const recLevel = this.bot ? (this.bot.recoveryLevel || 0) : 0;
        const rounds = this.bot && this.bot.rounds ? this.bot.rounds : 0;
        const maxRecLevel = this.bot ? (this.bot.maxRecLevel || 0) : 0;
        const maxRecStake = this.bot ? (this.bot.maxRecStakeBitsEver ? this.bot.maxRecStakeBitsEver.toFixed(2) : '0.00') : '0.00';

        // Max Rec Time/Age
        let maxRecTimeText = '--:--:--';
        if (this.bot && this.bot.maxRecTime) {
            maxRecTimeText = (this.bot && this.bot._malaysiaTimeString) ? this.bot._malaysiaTimeString(new Date(this.bot.maxRecTime)) : new Date(this.bot.maxRecTime).toLocaleTimeString();
        }

        let maxRecAgeText = '00:00:00';
        const maxSecs = (this.bot && Number.isFinite(this.bot.maxRecRuntimeSeconds)) ? this.bot.maxRecRuntimeSeconds : 0;
        if (maxSecs > 0) {
            const rh = Math.floor(maxSecs / 3600);
            const rm = Math.floor((maxSecs % 3600) / 60);
            const rs = maxSecs % 60;
            maxRecAgeText = `${String(rh).padStart(2, '0')}:${String(rm).padStart(2, '0')}:${String(rs).padStart(2, '0')}`;
        }

        // ============================================================
        // +++ RICH LAST ACTION DISPLAY (TITAN UPDATE) +++
        // ============================================================
        // 1. Get Real-time Brain Metrics
        const skewVal = (this.bot.stats && typeof this.bot.stats.getSkewness === 'function')
            ? this.bot.stats.getSkewness(50).toFixed(2)
            : '0.00';

        let brainState = 'UNK';
        if (this.bot.brain && typeof this.bot.brain.getStats === 'function') {
            const bStats = this.bot.brain.getStats();

            // Handle new Adaptive Sniper stats
            if (bStats.frozen) {
                brainState = `❄️ FROZEN (${bStats.climate})`; // Cliff Guard Active
            } else if (bStats.pingPong) {
                brainState = `🏓 PING-PONG (${bStats.climate})`; // Smart Follow-Up Ready
            } else if (bStats.climate) {
                brainState = `✅ ACTIVE (${bStats.climate})`; // Normal Operation
            } else {
                brainState = 'INIT';
            }
        }

        // 2. Construct the Rich Status String
        let lastActionText = "";

        // PRIORITY ZERO: STICKY HALT REASON (Stop Loss / Take Profit)
        // This ensures the reason persists on the UI even after the bot stops
        if (this.bot && this.bot.haltReason) {
            lastActionText = this.bot.haltReason;
        }
        // PRIORITY A: EXPLICIT SKIP/WARNING (Fake Bull, Pattern Veto)
        else if (skipReason) {
            // If it's a specific "Brain" block, make it prominent
            if (skipReason.includes('FAKE_BULL')) {
                lastActionText = `⚠️ FAKE BULL DETECTED (Skew ${skewVal})`;
            } else if (skipReason.includes('Pattern')) {
                lastActionText = `🛑 PATTERN VETO (Memory Trigger)`;
            } else {
                lastActionText = `⛔ ${skipReason}`;
            }
        }
        // PRIORITY B: ACTIVE BETTING
        else if (isBetting) {
            lastActionText = `💰 BETTING [${brainState}] | Skew: ${skewVal}`;
        }
        // PRIORITY C: IDLE / WARMUP
        else {
            if (this.bot.mode === 'WARMUP') {
                lastActionText = `🔥 WARMUP | Skew: ${skewVal}`;
            } else {
                lastActionText = `💤 IDLE [${brainState}] | Skew: ${skewVal}`;
            }
        }

        // Overwrite if taking profit pause
        if (this.bot && this.bot.mode === 'WARMUP' && cfgWarmup && cfgWarmup.timeOfDay && cfgWarmup.timeOfDay.enabled && (todTarget || this.bot.scheduledTargetEpochMs)) {
            lastActionText = `⏳ PAUSED: Waiting for ${targetText}`;
        }

        // --- Send data to remote server ---
        try {
            const statsPayload = {
                botId: BOT_SCRIPT_ID,
                modeText, bettingNowText, tpDisplay, pcov, rem, warmupText,
                startTimeStr, runtimeText, scheduledText, bStartText, bEndText,
                countdownText, targetText, initBits, curBits, plStr, lastPlStr,
                lastMult, nextMultValue,
                normalWin: stats.normalWin || 0,
                normalLoss: stats.normalLoss || 0,
                recoveryWin: stats.recoveryWin || 0,
                recoveryLoss: stats.recoveryLoss || 0,
                debtText, nextStake,
                consecutiveWins: stats.consecutiveWins || 0,
                consecutiveLosses: stats.consecutiveLosses || 0,
                maxConsecutiveWins: stats.maxConsecutiveWins || 0,
                maxConsecutiveLosses: stats.maxConsecutiveLosses || 0,
                totalBets: stats.totalBets || 0,
                totalSkips: stats.totalSkips || 0,
                normalSkips, recSkips, recLevel, rounds, maxRecLevel, maxRecStake,
                maxRecTimeText, maxRecAgeText, lastActionText,
                gameStatus: this.bot.gameStatus,
                gameStartTime: this.bot.currentGameStartTime,
                projectedStartTime: this.bot.projectedStartTime,
                lastActualCrash: this.bot.lastActualCrash,
                // +++ FIELDS FOR VISUALS +++
                activeTarget: (activeBet) ? activeBet.targetMultiplier : 0,
                isBetting: isBetting
            };

            // Call the retry helper defined below
            this.sendStatsWithRetry(statsPayload);

        } catch (e) {
            // Fails silently so it doesn't break the bot
            // You could log this to the bot console if you want:
            // this.bot.logger.log(`Remote log failed: ${e.message}`, 'error');
        }
        // ---  Send data to remote server ---

        // --- 2. Format the output string ---
        // Added emojis to the start of each line
        const output = `
        ----------------- [ 🤖 BOT STATS ] -----------------
        | 🧭 Mode: ${modeText}
        | 🎯 Betting Now: ${bettingNowText}
        | 🎯 TP TGT: ${tpDisplay} | PCOV: ${pcov}% | REM: ${rem}
        | 🔥 Warm-up: ${warmupText}
        | ⏱️ Start Time: ${startTimeStr} | Time: ${runtimeText}
        | 📅 Scheduled: ${scheduledText}
        | 🚀 B.Start Time: ${bStartText} | 🏁 B.End Time: ${bEndText}
        | ⏳ Waiting: ${countdownText} until ${targetText}
        | 💰 Init Bal: ${initBits.toFixed(2)} | 💵 Bal: ${curBits.toFixed(2)}
        | 📈 P/L: ${plStr} | 🧾 Last P/L: ${lastPlStr}
        | 🔢 Last Mult: ${(lastMult || 0).toFixed(2)}× | 🔜 Next Mult: ${(nextMultValue || 0).toFixed(2)}×
        | ✅ Normal Win: ${stats.normalWin || 0} | ❌ Normal Loss: ${stats.normalLoss || 0}
        | 🔁 Recovery Win: ${stats.recoveryWin || 0} | 🔻 Recovery Loss: ${stats.recoveryLoss || 0}
        | 💸 Debts: ${debtText} | 💰 Stake: ${nextStake}
        | 🔥 Win Streaks: ${stats.consecutiveWins || 0} | 🌧 Loss Streaks: ${stats.consecutiveLosses || 0}
        | 🏆 H.Win Streak: ${stats.maxConsecutiveWins || 0} | ⚠️ H.Loss streak: ${stats.maxConsecutiveLosses || 0}
        | 🎲 Bets: ${stats.totalBets || 0} | ⏭️ Skipped: ${stats.totalSkips || 0}
        | 🔍 Normal Skips: ${normalSkips} | 🔁 Recovery Skips: ${recSkips}
        | ↕️ Recovery Level: ${recLevel} | 🔁 Rounds: ${rounds}
        | 📊 Max Rec Level: ${maxRecLevel} | 💹 MaxRecStake: ${maxRecStake}
        | ⏱️ Time: ${maxRecTimeText} | 🕒 Age: ${maxRecAgeText}
        | ✍️ Last Action: ${lastActionText}
        -------------------------------------------------
        `;

        // --- 3. Log the stats string ---
        this.bot.logger.log(output, 'stats');
    }

    // New helper method for robust stats sending (Retry Mechanism)
    async sendStatsWithRetry(payload, retries = 3) {
        const url = 'https://bot-stats-server.onrender.com/log-stats';

        for (let i = 0; i < retries; i++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

                await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                return; // Success
            } catch (e) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
                if (i === retries - 1) {
                    console.warn(`⚠️ Stats upload failed after ${retries} attempts:`, e.message);
                }
            }
        }
    }

    destroy() {
        // Clear intervals
        try {
            if (this._runtimeInterval) clearInterval(this._runtimeInterval);
            if (this._countdownInterval) clearInterval(this._countdownInterval);
            if (this._throttleTimeout) clearTimeout(this._throttleTimeout);
        } catch (e) { }
        this.panel = null; // Mark as destroyed
    }
}

class CrashBot {
    constructor(adapter) {
        // 1. Initialize Adapter FIRST so it exists for Config
        // If an adapter was passed in, use it; otherwise create a new one.
        this.adapter = adapter || new UnifiedEngineAdapter();

        // 2. Initialize Core Components (Fixing the 'this.adapte' typo)
        this.config = new ConfigManager(this.adapter);
        this.logger = new Logger(this.config);
        this.stats = new StatsTracker(this.config);

        // 3. Initialize The New Brain
        this.brain = new TitanPredictionEngine(this.config);
        this.brain.initialize(this.adapter);

        // 3. Initialize UI & Betting Wrapper
        this.betting = new BettingEngine(this.config, this.logger);
        this.betting.bot = this; // Link for adapter access

        this.panel = new StatsPanel(this.config);
        this.panel.setBot(this);

        // 4. State Management
        this.isRunning = false;

        // --- Warmup Initialization Logic ---
        const cfgWarmup = (this.config.config.warmup);
        this.warmupRounds = (cfgWarmup && cfgWarmup.rounds) || 0;
        this.warmupCounter = 0;

        // Check if we should start in WARMUP or NORMAL based on config and rounds > 0
        const startInWarmup = cfgWarmup && cfgWarmup.enabled && cfgWarmup.startInWarmup && this.warmupRounds > 0;
        this.mode = startInWarmup ? 'WARMUP' : 'NORMAL'; // 'NORMAL', 'RECOVERY', 'WARMUP'

        // Recovery State (New Titan Logic)
        this.debtBits = 0;              // Total current debt
        this.initialLossBits = 0;       // The loss that started the recovery cycle (for Cap)
        this.recoveryLevel = 0;         // Calculated level (visual only)
        this.maxRecLevel = 0;           // Stats
        this.maxRecStakeBitsEver = 0;   // Stats

        // Warmup & Scheduling State (Restored from Original)
        this.betStartTimeMalaysia = null;
        this.betEndTimeMalaysia = null;
        this.scheduledTargetHHMMSS = null;
        this.scheduledTargetEpochMs = null;

        // Runtime tracking for schedules
        this.runtime = {
            currentScheduleKey: null,
            resumesDone: 0,
            pausedBecauseTP: false,
            startedBySchedule: false
        };

        // Active Bet Tracking
        this.activeBet = null;
        this.activeBetResult = null;
        this.normalSkips = 0;
        this.recoverySkips = 0;

        // +++ Real-Time Tracking State +++
        this.gameStatus = 'IDLE'; // 'PREPARING', 'RUNNING', 'ENDED'
        this.currentGameStartTime = 0;
        this.projectedStartTime = 0;
        this.lastActualCrash = 0.00;

        // +++ NEW: Sticky Halt Reason +++
        this.haltReason = null;

        // Start timers
        this.firstStartedAt = Date.now();
    }

    initialize() {
        // Idempotent init: guard against multiple calls (constructor + start / duplicate starts)
        if (this._initialized) return;
        this._initialized = true;
        const meta = this.config.getRaw().meta || { name: 'Titan', version: '2.0' };
        this.logger.log(`🚀 ${meta.name} v${meta.version} (${meta.edition}) Initializing...`, 'info');
        this.config.setInitialBalance();
        this.setupEventListeners();

        // Start Schedule Watcher (Restored Feature)
        if (!this._scheduledResumeWatcher) {
            this._scheduledResumeWatcher = setInterval(() => {
                // Only check resumes if we are in WARMUP (waiting state)
                if (this.mode === 'WARMUP') {
                    const cfg = this.config.config.warmup;
                    if (cfg && cfg.timeOfDay && cfg.timeOfDay.enabled) {
                        // Check if we hit the scheduled time
                        const now = Date.now();
                        if (this.scheduledTargetEpochMs && now >= this.scheduledTargetEpochMs) {
                            this._onScheduledResume(this.scheduledTargetScheduleKey, this.scheduledTargetHHMMSS);
                        } else if (!this.scheduledTargetEpochMs) {
                            // Recalculate if lost
                            const target = this._nextScheduleTarget(cfg);
                            if (target) {
                                this.scheduledTargetEpochMs = target.targetEpochMs;
                                this.scheduledTargetHHMMSS = target.targetHHMMSS;
                                this.scheduledTargetScheduleKey = target.scheduleKey;
                            }
                        }
                    }
                }
            }, 1000);
        }

        this.isRunning = true;
        this.startedAt = Date.now();

        // Capture start time immediately if not in warmup (Restored behavior)
        if (this.mode === 'NORMAL' && !this.betStartTimeMalaysia) {
            this.betStartTimeMalaysia = this._malaysiaTimeString(new Date());
        }

        this.updatePanel(false, 'READY');
    }

    /**
     * Centralized method to handle SKIPS.
     * Updates: Total Rounds, Total Skips, Normal/Recovery Skip Counters
     */
    addSkip(reason, mode) {
        // 1. Increment Global Round Counter
        this.rounds = (this.rounds || 0) + 1;

        // 2. Increment Mode-Specific Skip Counters (for Panel)
        if (mode === 'RECOVERY') {
            this.recoverySkips = (this.recoverySkips || 0) + 1;
        } else {
            this.normalSkips = (this.normalSkips || 0) + 1;
        }

        // 3. Register in StatsTracker (Persisted History)
        this.stats.addSkip(reason, mode);
    }

    /**
     * Centralized method to handle BET RESULTS.
     * Updates: Total Rounds, Total Bets, Win/Loss Counters
     */
    addBetResult(isWin, profit, meta) {
        // 1. Increment Global Round Counter (A bet is also a round)
        this.rounds = (this.rounds || 0) + 1;

        // 2. Sync Mode-Specific Counters (Optional, but keeps 'this' in sync with stats)
        const mode = (meta && meta.mode) ? meta.mode : 'NORMAL';
        if (mode === 'RECOVERY') {
            if (isWin) this.recoveryWin = (this.recoveryWin || 0) + 1;
            else this.recoveryLoss = (this.recoveryLoss || 0) + 1;
        } else {
            if (isWin) this.normalWin = (this.normalWin || 0) + 1;
            else this.normalLoss = (this.normalLoss || 0) + 1;
        }

        // 3. Register in StatsTracker (Persisted History)
        this.stats.addBetResult(isWin, profit, meta);
    }

    getNormalMultiplier() {
        // This is now dynamic per round via this.brain.decide()
        // Returning the base "Green" target for UI display purposes only
        return this.config.get('normal', 'normalBullMult');
    }

    getCanonicalRecoveryMultiplier() {
        return this.config.get('recovery', 'target');
    }

    // ============================================================
    //  CORE LOGIC: Event Listeners (Brain Integration + Safety)
    // ============================================================
    setupEventListeners() {
        if (this._eventsBound) return; // Prevent duplicate binding
        this._eventsBound = true;

        // --- 1. GAME STARTING ---
        this.adapter.on('GAME_STARTING', (info) => {
            // Set status so panel shows "Waiting..."
            this.gameStatus = 'PREPARING';


            //  Use accurate time from adapter if available, or calc robust fallback
            let delayMs = 5000;
            if (info && info.time_till_start) {
                const t = Number(info.time_till_start);
                // Check if seconds or ms
                delayMs = (t < 1000) ? Math.round(t * 1000) : Math.round(t);
            }

            // If adapter sent a precise projected time (via our new fix), use it.
            // Otherwise, calculate relative to Now.
            // This ensures the HTML Countdown matches the Adapter's internal timer.
            this.projectedStartTime = (info && info.projectedStartTime)
                ? Number(info.projectedStartTime)
                : (Date.now() + delayMs);

            // Force send the new projection to the panel IMMEDIATELY
            // this.updatePanel(false, 'GAME_STARTING', null, true);

            if (!this.isRunning) return;

            // A. Safety Limits Check
            const limit = this.checkLimits(this.config.getCurrentBalance());
            if (limit.action === 'stop') { return this.triggerHalt('stop loss', limit.reason); }
            if (limit.action === 'tp') { return this.triggerHalt('take profit', limit.reason); }

            // B. Warmup Handling
            if (this.mode === 'WARMUP') {
                this.logger.log(`🔥 Warmup: Waiting for result...`, 'info'); // Log Last
                return;
            }

            // C. BRAIN DECISION
            // Pass the last active bet result (if any) to the brain for sequencing logic
            const decision = this.brain.decide(this.mode, this.activeBetResult);

            // Clear the result holder after using it, so next decision is fresh
            if (this.activeBetResult && this.mode === 'RECOVERY') {
                // Only clear if we actually used it.
                // (Logic handled implicitly by state flow, but good practice to allow brain to manage state)
            }
            if (!decision.allow) {
                // 1. Call the wrapper (Updates Rounds, Skips, & Stats all at once)
                this.addSkip(decision.reason, this.mode);

                // 2. UI Updates (Panel & Log)
                this.updatePanel(false, `SKIP: ${decision.reason}`);
                this.logger.logSkip(decision.reason)
                return;
            }

            // D. CALCULATE STAKE
            let stakeBits = 0;
            const target = decision.target;

            if (this.mode === 'NORMAL') {
                this.config.computeAndSetBaseBetFromPercent();
                stakeBits = Number(this.config.get('normal', 'baseBetBits'));
            }
            else if (this.mode === 'RECOVERY') {
                stakeBits = Number(this.calculateRecoveryStake());
            }

            // E. PLACE BET
            const stakeSats = this.config.bitsToSats(stakeBits);
            const placed = this.betting.placeBet(stakeSats, target, this.mode);

            if (placed) {
                this.activeBet = this.betting.getActiveBet();
                // +++ START WIN TIMER +++
                this.setupWinTimer(stakeBits, target);
                // Stats Panel FIRST
                this.updatePanel(true, `BETTING (${this.mode})`);
                // Text Log LAST
                this.logger.log(`🎲 BET: ${Number(stakeBits).toFixed(2)} bits @ ${Number(target).toFixed(2)}x (${this.mode})`, 'bet');
            }
        });

        // +++ GAME STARTED (Graph Moving) +++
        this.adapter.on('GAME_STARTED', () => {
            this.gameStatus = 'RUNNING';

            // Use the normalized start time from the adapter (Epoch MS)
            this.currentGameStartTime = (info && info.startTime) ? Number(info.startTime) : Date.now();

            // Force Update
            this.updatePanel(this.betting.hasActiveBet(), 'GAME_STARTED', null, true);
        });

        // --- 2. GAME ENDED ---
        this.adapter.on('GAME_ENDED', (data) => {
            // Update status and capture the final crash value
            this.gameStatus = 'ENDED';
            this.lastActualCrash = data.crash;
            const crash = data.crash;

            if (this.isRunning) { // Only update brain/stats if running
                // 1. Determine if we had a "Strategy Win" on this crash
                // We use the active bet target if available, otherwise it's a virtual update
                const wasWin = this.activeBet ? (crash >= this.activeBet.targetMultiplier) : false;

                // 2. Get current recovery level (default to 0 if undefined)
                const currentLevel = this.recoveryLevel || 0;

                // 3. Update Brain with all required arguments
                // record the raw crash into the predictor buffers (in-memory)
                // then perform the unified per-round update which computes
                // posteriors, ensemble, and decisions.
                this.brain.pushRound(crash);
                this.brain.update(crash, wasWin, currentLevel);
                this.stats.addCrash(crash);
            }

            // A. Safety Check
            const limit = this.checkLimits(this.config.getCurrentBalance());
            if (limit.action === 'stop') { return this.triggerHalt('stop loss', limit.reason); }
            if (limit.action === 'tp') { return this.triggerHalt('take profit', limit.reason); }

            // B. Warmup Logic
            if (this.mode === 'WARMUP') {
                this.handleWarmup(); // Handles its own ordering
                // Log crash only after warmup handled
                this.logger.log(`💥 Game crashed at ${crash}x`, 'crash');
                return;
            }

            // C. Process Result
            let profitBits = 0;
            let actionLabel = 'GAME_ENDED';
            let result = null;

            // Capture State BEFORE clearing activeBet +++
            const wasBetting = !!this.activeBet;
            const lastBetSnapshot = this.activeBet;

            if (this.activeBet) {
                // +++ CHECK IF ALREADY PROCESSED (Early Cashout) +++
                if (this.activeBet.processed) {
                    // Just log the crash, don't re-calculate P/L logic
                    this.logger.log(`💥 Game crashed at ${crash}x (Bet won @ ${this.activeBet.targetMultiplier}x)`, 'info');
                    this.activeBet = null;
                    actionLabel = 'WIN'; // Keep label correct
                } else {
                    // Normal processing (Loss or late win)
                    // Only process if we are running
                    if (this.isRunning) {
                        result = this.betting.processGameCrash(crash);
                        if (result) {
                            this.handleStrategyState(result, true);
                            profitBits = result.profitBits;
                            actionLabel = result.isWin ? 'WIN' : 'LOSS';
                        }
                    }
                    this.activeBet = null;
                }
            } else {
                // actionLabel = 'WAITING';
            }

            // --- ORDERING FIX: STATS FIRST, LOGS LAST ---

            // 1. Update Panel (Visuals)
            // Pass 'wasBetting' and 'lastBetSnapshot' to panel +++
            // This ensures the dashboard knows we had a bet on this crash frame
            this.updatePanel(wasBetting, actionLabel, profitBits, true, lastBetSnapshot);

            // 2. Log Crash (Text)
            this.logger.log(`💥 Game crashed at ${crash}x`, 'crash');

            // 3. Log Result (Text)
            if (result) {
                this.logger.logBetResult(result);
                // Log Mode Changes specifically here to keep order
                if (result.isWin && this.debtBits <= 0 && this.mode === 'NORMAL' && result.mode === 'RECOVERY') {
                    this.logger.log(`🎉 RECOVERY CLEARED. Switching to NORMAL.`, 'success');
                }
            }
        });
    }

    // +++ NEW: Early Win Processor +++
    setupWinTimer(stakeBits, target) {
        if (this._winTimer) clearTimeout(this._winTimer);
        // Formula: t = ln(target) / 0.00006
        // Convert to ms. This predicts exactly when the multiplier hits the target.
        const timeToWin = (Math.log(target) / 0.00006);

        this._winTimer = setTimeout(() => {
            // Only trigger if we are still running and the bet exists
            if (this.gameStatus === 'RUNNING' && this.activeBet) {
                this.processEarlyWin();
            }
        }, timeToWin);
    }

    processEarlyWin() {
        if (!this.activeBet) return;

        this.logger.log(`⚡ EARLY CASHOUT TRIGGERED @ ${this.activeBet.targetMultiplier}x`, 'success');

        // 1. Construct a "Virtual" Result
        const result = {
            isWin: true,
            multiplier: this.activeBet.targetMultiplier,
            crashValue: this.activeBet.targetMultiplier, // We reached it
            betAmountBits: this.activeBet.stakeBits,
            profitBits: this.activeBet.stakeBits * (this.activeBet.targetMultiplier - 1),
            mode: this.mode,
            target: this.activeBet.targetMultiplier // Ensure target is passed
        };

        // 2. Execute Strategy Logic (Clears Debt, Updates P/L, Switching Mode)
        this.handleStrategyState(result, false);

        // 3. Mark bet as processed so GAME_ENDED doesn't double-count
        this.activeBet.processed = true;

        // 4. Force Update Panel (Green Flash)
        this.updatePanel(false, 'CASHOUT_HIT', result.profitBits, true);
    }

    // ============================================================
    //  LOGIC: Staking & Recovery Math (The New Titan Logic)
    // ============================================================
    /**
     * Generates a "Map" of debt ranges based on the Initial Loss.
     * This simulates "What would the debt be at level X?" to create lookup thresholds.
     */
    generateRecoveryLadder(initialLoss, target, cap, settings) {
        const ladder = [];
        let simDebt = initialLoss;

        // Configurable Thresholds
        const t2 = settings.sliceTwo; // e.g. 4
        const t3 = settings.sliceThree; // e.g. 2
        const t4 = settings.sliceFour; // e.g. 2

        // We simulate up to 50 levels (or whatever the global sim threshold is)
        const maxLevels = this.config.get('recovery', 'recoveryLevelSimThreshold') || 50;

        for (let i = 0; i < maxLevels; i++) {
            const currentLossCount = i; // 0-based index corresponds to completed losses

            // Determine Slicing Divisor based on consecutive losses
            let divisor = 1;

            if (currentLossCount < t2) {
                divisor = 1;
            } else if (currentLossCount < (t2 + t3)) {
                divisor = 2;
            } else if (currentLossCount < (t2 + t3 + t4)) {
                divisor = 3;
            } else {
                divisor = 4; // Max slice (continues forever)
            }

            // Calculate Stake for this virtual level
            // Formula: ceil((Debt / Divisor) / (Target - 1))
            let rawStake = (simDebt / divisor) / (target - 1);
            let stake = Math.ceil(rawStake);

            // Apply Cap (Cap is based on Initial Loss * Configured Multiplier)
            if (stake > cap) stake = cap;
            stake = Math.max(1, stake);

            // Define the Range for this Level
            // If actual debt is between [simDebt] and [simDebt + stake], we are at this Level.
            const rangeStart = simDebt;
            const rangeEnd = simDebt + stake;

            ladder.push({
                level: i + 1,
                minDebt: rangeStart,
                maxDebt: rangeEnd,
                divisor: divisor,
                stake: stake
            });

            // Increment Debt for next loop iteration (Simulating a loss)
            simDebt += stake;
        }

        return ladder;
    }

    calculateRecoveryStake(simulate = false) {
        const recCfg = this.config.get('recovery');
        const sliceCfg = recCfg.debtSlicing;
        const target = recCfg.target;

        // 1. Check if Slicing is Enabled. If not, use legacy logic (simplified)
        if (!sliceCfg || !sliceCfg.enabled) {
            const baseBet = this.config.get('normal', 'baseBetBits');
            const required = this.debtBits;
            let stake = Math.ceil(required / (target - 1));
            const cap = (this.initialLossBits || baseBet) * recCfg.capMultiplier;
            if (stake > cap) stake = cap;
            stake = Math.max(1, stake);

            // Simple linear level calc for legacy mode
            if (!simulate) {
                this.recoveryLevel = Math.ceil(this.debtBits / (this.initialLossBits || 1));
                this.maxRecStakeBitsEver = Math.max(this.maxRecStakeBitsEver, stake);
                this.maxRecLevel = Math.max(this.maxRecLevel, this.recoveryLevel);
            }
            return stake;
        }

        // 2. DEBT SLICING LOGIC
        const initialLoss = this.initialLossBits || this.config.get('normal', 'baseBetBits');
        const cap = initialLoss * recCfg.capMultiplier;

        // A. Generate the Map (The Ladder)
        // We rebuild this every time to ensure it matches current initialLoss context.
        // (Performance is negligible for 50 iterations)
        const ladder = this.generateRecoveryLadder(initialLoss, target, cap, sliceCfg);

        // B. Find our place in the ladder
        // We look for the first rung where our current debt fits
        // If debt is lower than start (e.g. partial win), use Level 1.
        // If debt is higher than map (super deep), use last level logic.

        let match = ladder.find(r => this.debtBits >= r.minDebt && this.debtBits < r.maxDebt);

        // Fallbacks
        if (!match) {
            if (this.debtBits < ladder[0].minDebt) {
                // Debt is lower than initial (partial recovery) -> Level 1
                match = ladder[0];
            } else {
                // Debt is off the charts -> Use last known config (Divisor 4)
                const last = ladder[ladder.length - 1];
                match = {
                    level: last.level + 1,
                    divisor: 4,
                    // Calculate dynamically for off-chart debt
                    stake: Math.min(cap, Math.ceil((this.debtBits / 4) / (target - 1)))
                };
            }
        }

        // C. Calculate final stake based on the Matched Divisor
        // We recalculate here using exact current debt to be precise,
        // rather than using the cached ladder stake which is based on perfect loss streaks.
        let finalStake = Math.ceil((this.debtBits / match.divisor) / (target - 1));

        // Cap Check
        if (finalStake > cap) finalStake = cap;
        finalStake = Math.max(1, finalStake);

        // D. Update State (Visuals & Stats)
        if (!simulate) {
            this.recoveryLevel = match.level;
            this.maxRecStakeBitsEver = Math.max(this.maxRecStakeBitsEver, finalStake);
            this.maxRecLevel = Math.max(this.maxRecLevel, this.recoveryLevel);

            // Optional: Log the slice transition if debugging
            if (match.divisor > 1 && this.logger) {
                // You can add verbose logging here if desired
            }
        }

        return finalStake;
    }

    // Updates Bot Mode and Debt based on the result calculated by BettingEngine
    // Added 'silent' parameter to prevent out-of-order logging
    handleStrategyState(result, silent = false) {
        const profit = result.profitBits;
        const stake = result.betAmountBits;

        if (result.isWin) {
            // Only log if NOT silent (legacy support)
            if (!silent) this.logger.log(`✅ WIN! +${profit.toFixed(2)} bits`, 'success');

            if (this.mode === 'RECOVERY') {
                this.debtBits -= profit;
                if (this.debtBits <= 0.01) {
                    this.debtBits = 0;
                    this.mode = 'NORMAL';
                    this.recoveryLevel = 0;
                    this.initialLossBits = 0;
                    this.updatePanel(false, 'RECOVERY_CLEARED');
                    // Log handled in GAME_ENDED for ordering
                } else {
                    if (!silent) this.logger.log(`📉 Debt Reduced. Remaining: ${this.debtBits.toFixed(2)} bits`, 'info');
                }
            }
        } else {
            if (!silent) this.logger.log(`❌ LOSS. -${stake.toFixed(2)} bits`, 'error');

            if (this.mode === 'NORMAL') {
                this.mode = 'RECOVERY';
                this.initialLossBits = stake;
                this.debtBits = stake;
                this.recoveryLevel = 1;
                const cap = stake * this.config.get('recovery', 'capMultiplier');
                if (!silent) this.logger.log(`⚠️ Entering RECOVERY. Target: ${this.config.get('recovery', 'target')}x. Cap: ${cap} bits.`, 'warning');
            } else {
                this.debtBits += stake;
            }
        }

        this.addBetResult(result.isWin, result.profitBits, {
            mode: result.mode,
            betAmountBits: result.betAmountBits,
            multiplier: result.target
        });
        this.activeBetResult = result;
    }

    // ============================================================
    //  UTILITIES: Warmup, Scheduling, Time, UI (Restored from Original)
    // ============================================================
    handleWarmup() {
        this.warmupCounter++;

        // 1. Update Panel FIRST
        this.updatePanel(false, 'WARMUP');

        // 2. Log Message LAST
        this.logger.log(`🔥 Warmup ${this.warmupCounter}/${this.warmupRounds}`, 'info');

        const cfgWarmup = this.config.config.warmup;
        const todTarget = this._nextScheduleTarget(cfgWarmup);

        if (cfgWarmup.timeOfDay && cfgWarmup.timeOfDay.enabled && (todTarget || this.scheduledTargetEpochMs)) {
            this.updatePanel(false, 'WAITING');
            return;
        }

        if (this.warmupCounter >= this.warmupRounds) {
            this.mode = 'NORMAL';
            // Start of a new live session — set session start and clear any prior end time
            this.betStartTimeMalaysia = this._malaysiaTimeString(new Date());
            this.betEndTimeMalaysia = null;
            this.logger.log('✅ Warm-up complete — switching to NORMAL mode', 'success');
            // Update panel again to show NORMAL state immediately
            this.updatePanel(false, 'READY');
        }
    }

    // Helper used by triggerHalt
    _configuredSchedulesCount() {
        const s = this.config.get('schedules') || this.config.config.schedules;
        if (!s) return 0;
        return Object.keys(s).filter(k => s[k] && s[k].time).length;
    }

    _checkScheduledResume() {
        // Called by interval
        if (this.mode !== 'WARMUP') return;

        const now = Date.now();
        // Check if we hit the scheduled time
        if (this.scheduledTargetEpochMs && now >= this.scheduledTargetEpochMs) {
            this._onScheduledResume(this.scheduledTargetScheduleKey, this.scheduledTargetHHMMSS);
        } else {
            // Or calculate if we need to set one
            const cfg = this.config.config.warmup;
            const target = this._nextScheduleTarget(cfg);
            if (target) {
                this.scheduledTargetEpochMs = target.targetEpochMs;
                this.scheduledTargetHHMMSS = target.targetHHMMSS;
                this.scheduledTargetScheduleKey = target.scheduleKey;
            }
        }
    }

    _onScheduledResume(key, hhmmss) {
        // Enter active betting session for this scheduled resume
        this.mode = 'NORMAL';
        // +++ Clear debt when starting a fresh scheduled session +++
        this.debtBits = 0;
        this.recoveryLevel = 0;
        this.initialLossBits = 0;
        // New session started — set B.Start to exact now and clear B.End
        this.betStartTimeMalaysia = this._malaysiaTimeString(new Date());
        this.betEndTimeMalaysia = null;
        // Record which schedule is active
        this.runtime.currentScheduleKey = key;
        // ++ Important: increment the scheduled-resume counter so fallback rules can detect
        // how many scheduled resumes have occurred (used by triggerHalt fallback logic)
        this.runtime.resumesDone = (this.runtime.resumesDone || 0) + 1;
        this.scheduledTargetEpochMs = null;
        this.logger.log(`✅ Scheduled Start (${hhmmss}) Reached. GO!`, 'success');
        this.updatePanel(false, 'RESUMED');
    }

    _nextScheduleTarget(cfg) {
        if (!cfg || !cfg.timeOfDay || !cfg.timeOfDay.enabled) return null;

        const schedules = this.config.get('schedules') || this.config.config.schedules;
        if (!schedules) return null;

        const now = Date.now();
        let best = null;

        Object.keys(schedules).forEach(k => {
            const entry = schedules[k];
            if (!entry || !entry.time) return;
            const epoch = this._klEpochForDate(entry.time, now);
            if (!epoch) return;

            let next = epoch;
            if (next <= now) next += 86400000; // Move to tomorrow if passed

            if (!best || next < best.targetEpochMs) {
                best = { targetEpochMs: next, targetHHMMSS: entry.time, scheduleKey: k };
            }
        });
        return best;
    }

    _getNextImmediateSchedule() {
        const schedules = this.config.get('schedules') || this.config.config.schedules;
        if (!schedules) return null;
        const now = Date.now();
        let best = null;
        Object.keys(schedules).forEach(key => {
            const entry = schedules[key];
            if (!entry || !entry.time) return;
            let next = this._klEpochForDate(entry.time, now);
            if (next <= now) next += 86400000;
            if (!best || next < best.targetEpochMs) {
                best = { targetEpochMs: next, targetHHMMSS: entry.time, scheduleKey: key };
            }
        });
        return best;
    }

    _klEpochForDate(hhmmss, anchor) {
        try {
            const [h, m, s] = hhmmss.split(':').map(Number);
            const d = new Date(anchor);
            // Rough Malaysia conversion (UTC+8)
            const utc = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), h - 8, m, s);
            return utc;
        } catch(e) { return null; }
    }

    _malaysiaTimeString(date) {
        return new Date(date).toLocaleTimeString('en-GB', {timeZone: 'Asia/Kuala_Lumpur', hour12: false});
    }

    checkLimits(currentBalanceSat) {
        // Ported exactly from original, using new config getters where appropriate
        const result = {action: 'ok', reason: '', details: {}};
        currentBalanceSat = Number(currentBalanceSat) || 0;
        const initialBalance = Number(this.config.initialBalance) || 0;

        let takeProfitSat;
        try {
            // Prefer schedule-specific takeProfit if applicable
            let scheduleKey = (this.runtime && this.runtime.currentScheduleKey) ? this.runtime.currentScheduleKey : null;
            if (!scheduleKey && this.runtime && this.runtime.pausedBecauseTP && this.scheduledTargetScheduleKey) {
                scheduleKey = this.scheduledTargetScheduleKey;
            }
            const schedulesCfg = this.config.get('schedules') || (this.config.config && this.config.config.schedules);

            if (scheduleKey && schedulesCfg && schedulesCfg[scheduleKey] && schedulesCfg[scheduleKey].takeProfitBits > 0) {
                takeProfitSat = this.config.bitsToSats(schedulesCfg[scheduleKey].takeProfitBits);
            } else {
                takeProfitSat = this.config.getTakeProfitSat();
            }
        } catch (e) {
            takeProfitSat = this.config.getTakeProfitSat();
        }

        const minBalanceSat = this.config.getMinBalanceSat();
        const profitLoss = currentBalanceSat - initialBalance;

        if (takeProfitSat > 0 && profitLoss >= takeProfitSat) {
            return { action: 'tp', reason: `Target Reached (+${profitLoss/100} bits)` };
        }
        if (minBalanceSat > 0 && currentBalanceSat <= minBalanceSat) {
            return { action: 'stop', reason: `Balance Low (${currentBalanceSat/100} bits)` };
        }

        return { action: 'ok' };
    }

    // Restored exactly from original code
    triggerHalt(type = 'stop loss', reason = '') {
        try {
            this.logger.log(`⛔ ${type.toUpperCase()} triggered: ${reason}`, 'warning');
        } catch (e) {}

        // 1. Force state logic for the panel label
        // We do NOT set isRunning=false here manually; this.stop() will do it.
        // We DO ensure the mode is set so the panel reads [RECOVERY] etc.
        this.mode = (this.mode || 'RECOVERY');

        // Capture end time
        this.betEndTimeMalaysia = this._malaysiaTimeString(new Date());

        const normalizeTypeKey = (t) => {
            if (!t || typeof t !== 'string') return String(t || '').toLowerCase();
            const s = t.toLowerCase();
            if (s.indexOf('profit') !== -1) return 'takeprofit';
            if (s.indexOf('stop') !== -1) return 'stoploss';
            return s.replace(/\s+/g, '');
        };

        const typeKey = normalizeTypeKey(type);
        const message = `${type.toUpperCase()}: ${reason || (typeKey === 'takeprofit' ? 'target reached' : 'stop loss triggered')}`;

        this.showNonBlockingAlert(typeKey, message);

        // +++ SET STICKY REASON +++
        this.haltReason = `⛔ ${message}`; // Add icon for visibility

        // 2. Stop Loss logic
        if (typeKey === 'stoploss') {
            // FIX: Pass the specific message to stop()
            this.stop(message);
            return;
        }

        // 3. Take Profit Logic (Pause vs Stop)
        if (typeKey === 'takeprofit') {
            let wantStop = false;
            try {
                // Check if we should stop only on specific schedules
                const cfgBehavior = this.config.get('behavior') || {};
                const explicitStopKey = cfgBehavior.stopOnTakeProfitOnlyFrom || null;
                const scheduleKey = this.runtime.currentScheduleKey;
                const configuredCount = this._configuredSchedulesCount();

                if (explicitStopKey) {
                    if (scheduleKey === explicitStopKey) wantStop = true;
                } else {
                    // Robust fallback rules (deterministic)
                    // 1) If the operator explicitly set a schedule key to cause permanent halt on TP,
                    //    respect that exact key above. (explicitStopKey handled earlier)
                    //
                    // 2) Otherwise use a deterministic, chronological fallback:
                    //    if the number of scheduled resumes that have already occurred
                    //    (this.runtime.resumesDone) is >= the number of configured schedules,
                    //    we have effectively completed the last configured schedule and may stop.
                    //
                    //    This avoids brittle special-casing (e.g. 'betSchedule2') and derives the
                    //    decision from the actual number of configured schedules and real resume events.
                    const cfg = this.getConfig ? this.getConfig() : (this.config && this.config.config ? this.config.config : null);
                    const schedulesCfg = (cfg && cfg.schedules) ? cfg.schedules : (this.config.get('schedules') || {});
                    const scheduleKeys = ['betSchedule1','betSchedule2','betSchedule3'];
                    const configuredCountRobust = scheduleKeys.reduce((c,k) => {
                        try {
                            const e = schedulesCfg[k];
                            return (e && e.time) ? c + 1 : c;
                        } catch (ex) { return c; }
                    }, 0);

                    // If nothing is configured, behave conservatively and stop.
                    if (configuredCountRobust === 0) {
                        wantStop = true;
                    } else {
                        // If we've already performed as many scheduled resumes as configured schedules,
                        // that implies the last scheduled run has completed and we should stop.
                        if ((this.runtime && (this.runtime.resumesDone || 0)) >= configuredCountRobust) {
                            wantStop = true;
                        } else {
                            wantStop = false;
                        }
                    }
                }
            } catch (e) { wantStop = true; }

            if (wantStop) {
                // FIX: Pass the specific message to stop()
                this.stop(message);
                return;
            } else {
                // Pause logic
                this.pauseForTakeProfit(reason);
                return;
            }
        }

        // Default Fallback
        this.stop(message);
    }

    // Restored exactly
    pauseForTakeProfit(reason) {
        try {
            this.runtime.pausedBecauseTP = true;
            const next = this._getNextImmediateSchedule();

            if (next) {
                this.scheduledTargetHHMMSS = next.targetHHMMSS;
                this.scheduledTargetEpochMs = Number(next.targetEpochMs);
                this.scheduledTargetScheduleKey = next.scheduleKey;
                this.runtime.currentScheduleKey = this.scheduledTargetScheduleKey || null;

                this.logger.log(`pauseForTakeProfit: scheduled resume at ${this.scheduledTargetHHMMSS}`, 'info');
            } else {
                this.stop();
                return;
            }

            // Freeze the end time so the panel shows the exact stop time for the finished session.
            // Do NOT clear betStartTimeMalaysia — it must remain sticky until a new session starts.
            this.betEndTimeMalaysia = this._malaysiaTimeString(new Date());

            // Keep the start time (sticky) for the finished session. Only when a new scheduled
            // resume actually begins do we overwrite betStartTimeMalaysia.
            this.mode = 'WARMUP';

            this.updatePanel(false, 'HALTED-TP');
        } catch (e) {
            this.logger.log(`pauseForTakeProfit error: ${e.message}`, 'error');
        }
    }

    _clearScheduledTarget() {
        this.scheduledTargetEpochMs = null;
        this.scheduledTargetHHMMSS = null;
    }

    // Restored Alert Helper
    showNonBlockingAlert(type, message) {
        try {
            // 1. Log to console regardless of platform
            if (this.logger) this.logger.log(`[ALERT] ${type}: ${message}`, 'warning');

            // 2. DOM Alerts (Coinscrash only, will fail silently on Bustabit)
            if (typeof document === 'undefined') return;

            // Attempt to access document props (may throw SecurityError immediately)
            if (type.includes('profit')) document.title = `TP - Crash Bot`;
            else if (type.includes('stop')) document.title = `SL - Crash Bot`;

            let container = document.getElementById('crashBotAlertContainer');
            if (!container) {
                container = document.createElement('div');
                container.id = 'crashBotAlertContainer';
                container.style.cssText = 'position:fixed;top:16px;left:16px;z-index:20000;display:flex;flex-direction:column;gap:8px;';
                document.body.appendChild(container);
            }
            const alert = document.createElement('div');
            alert.style.cssText = 'padding:12px 16px;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.25);max-width:320px;font-family:monospace;color:#fff;background:rgba(0,0,0,0.8);margin-bottom:10px;';
            alert.textContent = message;

            if (type.includes('profit')) alert.style.background = 'linear-gradient(90deg,#2ecc71,#27ae60)';
            if (type.includes('stop')) alert.style.background = 'linear-gradient(90deg,#e74c3c,#c0392b)';

            container.appendChild(alert);
            setTimeout(() => alert.remove(), 10000);
        } catch (e) {
            // Completely ignore DOM/Security errors so the bot doesn't crash
        }
    }

    // Public API for Console/HTML
    start() { this.isRunning = true; this.initialize(); }
    stop(reason = 'STOPPED') {
        // 1. Set State to False (This ensures Panel generates [HALTED] tag)
        this.isRunning = false;

        // allow reinitialization on restart
        this._initialized = false;

        // 2. Log to Console
        this.logger.log(`🔴 ${reason}`, 'warning');

        // 3. Update Panel IMMEDIATELY (Before disconnecting)
        // This ensures the HTML panel gets [HALTED] and the "Last Action" message
        this.updatePanel(false, reason, null, true);
    }
    restart() { t
        his.stop();
        this.stats.resetStats();
        // +++ Reset Recovery State on Restart +++
        this.debtBits = 0;
        this.recoveryLevel = 0;
        this.initialLossBits = 0;
        this.maxRecLevel = 0;
        this.maxRecStakeBitsEver = 0;
        // +++ Clear Sticky Halt Reason +++
        this.haltReason = null;
        this.start();
    }
    getStats() { return this.stats.getStats(); }
    getConfig() { return this.config.config; }
    updateConfig(c) { this.config.update(c); this.updatePanel(false, 'CONFIG_UPDATED'); }
    destroy() { this.stop(); if (this.panel) this.panel.destroy(); }

    // UI Proxy
    updatePanel(isBetting = false, lastAction = null, lastPL = null, force = false, overrideBet = null) {
        if (this.panel) {
            this.panel.updateStats(
                this.stats.getStats(),
                this.config.getCurrentBalance(),
                this.config.initialBalance,
                overrideBet || this.activeBet, // Use snapshot if provided
                isBetting,
                lastAction,
                lastPL,
                force
            );
        }
    }
}

// ========================================================================
// KEEP-ALIVE ENGINE (Heartbeat & Raw Engine Ping) (Prevents Disconnects)
// ========================================================================
class KeepAliveManager {
    constructor(adapter) {
        this.adapter = adapter;
        this.interval = null;
        this.worker = null; // Store worker reference
    }

    start() {
        console.log('💓 KeepAlive: Starting Heartbeat...');

        // 1. STRATEGY A: Web Worker (Primary for Coinscrash)
        // Solves the "Background Tab Throttling" issue by running the timer on a separate thread.
        // Browsers cannot throttle Web Workers, ensuring the 'tick' fires exactly every 1000ms.
        if (this.adapter.platform === 'COINSCRASH' && typeof Worker !== 'undefined') {
            try {
                // Create an inline worker (Blob) so no external file is needed
                const workerCode = `
                    self.onmessage = function() {
                        // This timer runs in the background thread, immune to tab throttling
                        setInterval(() => {
                            self.postMessage('tick');
                        }, 1000); // 1 second precision heartbeat
                    };
                `;
                const blob = new Blob([workerCode], { type: 'application/javascript' });
                this.worker = new Worker(URL.createObjectURL(blob));

                this.worker.onmessage = () => {
                    // This receives the 'tick' on the main thread and forces it to wake up
                    this.ping();
                };

                // Initialize the worker
                this.worker.postMessage('start');
                console.log('💓 KeepAlive: Unthrottled Worker Strategy Activated (Background Safe).');
                return; // Exit, we don't need the fallback interval if worker succeeds
            } catch (e) {
                console.warn('💓 KeepAlive: Worker creation failed, falling back to standard interval.', e);
            }
        }

        // 2. STRATEGY B: Standard Interval (Fallback / Bustabit Sandbox)
        // Bustabit's sandbox blocks Workers, but does not suffer from DOM throttling.
        this.interval = setInterval(() => {
            this.ping();
        }, 1000);
        console.log('💓 KeepAlive: Standard Interval Strategy Activated.');
    }

    ping() {
        if (this.adapter) {
            // Accessing getBalance() forces data transmission over the socket.
            // This signals to the server that the client is still active.
            this.adapter.getBalance();
        }
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        console.log('💓 KeepAlive: Stopped.');
    }
}

// ========================================
// UNIFIED BOOTLOADER (Bustabit & Coinscrash)
// ========================================
// Create a simple wrapper for the global config variable
const bootConfig = {
    get: (key) => (config[key] && config[key].value)
};
const logger = new Logger(bootConfig); // Pass the wrapper

logger.log(`🤖 Booting ${config.meta.name} v${config.meta.version} ...`);

// 1. CLEANUP: Stop existing instance to prevent duplicate logs/bets
if (window.crashBot) {
    logger.log('♻️ Found existing bot instance. Stopping it to prevent duplication...');
    try {
        window.crashBot.stop();
        if (window.keepAlive) window.keepAlive.stop();
    } catch(e) { console.error("Cleanup error:", e); }
}

try {
    // 2. Initialize New Instance
    // Create Adapter FIRST
    const adapter = new UnifiedEngineAdapter();

    // Initialize Managers
    window.keepAlive = new KeepAliveManager(adapter);
    window.crashBot = new CrashBot(adapter);

    // 3. Start KeepAlive
    window.keepAlive.start();

    // 4. Platform Specific Startup
    if (window.crashBot.adapter.platform === 'BUSTABIT') {
        logger.log('✅ Bustabit Detected. Auto-starting...');
        window.crashBot.start();
    }
    else if (window.crashBot.adapter.platform === 'COINSCRASH') {
        logger.log('✅ Coinscrash Detected. Attaching Console Commands...');
        window.botStart = () => window.crashBot.start();
        window.botStop = () => window.crashBot.stop();
        window.botStats = () => window.crashBot.stats;

        // Auto-start for convenience
        window.crashBot.start();
    }

    logger.log(`🚀 ${config.meta.name} ${config.meta.edition} System is Operational.`);

} catch (e) {
    logger.log(`🔥 CRITICAL BOOT ERROR: ${e.message || e}`, 'error');
}
