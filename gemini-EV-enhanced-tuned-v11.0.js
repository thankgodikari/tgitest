// ========================================
// CRASH GAME BETTING BOT - BALANCED VERSION
// Author: MiniMax Agent
// Version: 11.0 BALANCED - Strategic but Not Over-Conservative
// ========================================
// Quick runtime fingerprint to prove which script is loaded (remove after debugging)
try { console.info('⚙️ Crash bot script fingerprint: v11.0-BALANCED — loaded at ' + new Date().toISOString()); } catch(_) {}

const BETTING_MODE = "test"
const BOT_SCRIPT_ID = "Coinscrash-CGS-V11.0  - " + BETTING_MODE.toUpperCase() + " <OC> " + engine.getUsername();

class ConfigManager {
    constructor() {
        // --- base constants used for derived values (avoid referencing this.config while constructing it) ---
        const DEFAULT_TARGET_MULTIPLIER = 1.73;
        const DEFAULT_RECOVERY_MULTIPLIER = 1.63;
        const DEFAULT_TAKE_PROFIT_BITS = 300;
        const DEFAULT_MIN_BALANCE_BITS = 1;
        const DEFAULT_MAX_STAKE_BITS = 10000;
        const DEFAULT_TEST_BALANCE_BITS = 80;
        const DEFAULT_DEBT_SLICE_VALUE_TWO = 11;
        const DEFAULT_DEBT_SLICE_VALUE_THREE = 26;
        const DEFAULT_WARMUP_ROUNDS = 15;
        this.DEFAULT_SCHEDULE_ONE_TAKE_PROFIT = 300;
        this.DEFAULT_SCHEDULE_TWO_TAKE_PROFIT = 300;
        this.DEFAULT_SCHEDULE_THREE_TAKE_PROFIT = 300;

        // Consolidated, config-driven structure
        this.config = {
            // === Runtime / Global ===
            runMode: BETTING_MODE,             // 'test' or 'live'
            debug: true,                // debug prints
            showPanel: true,             // enable UI panel
            testBalanceBits: DEFAULT_TEST_BALANCE_BITS,   // test-mode starting balance (bits)

            // === Warm-up & misc ensemble behavior ===
            maxSkipStreak: 8,
            confidenceThreshold: 0.55,   // base confidence threshold used in various places

            // Top-level numeric recovery values (moved out of recovery root for easier cross-module access)
            baseBetBits: 1,                                    // base bet used in recovery (bits)
            targetMultiplier: DEFAULT_TARGET_MULTIPLIER,       // recovery target multiplier
            takeProfitBits: DEFAULT_TAKE_PROFIT_BITS,          //  take-profit (bits)
            takeProfitLimit: DEFAULT_TAKE_PROFIT_BITS,         // Take profit limits
            minBalanceBits: DEFAULT_MIN_BALANCE_BITS,          // minimum balance allowed (bits)
            maxStakeBits: DEFAULT_MAX_STAKE_BITS,              // safety cap (bits)

            // ADAPTIVE BUNKER MODE
            bunker: {
                enabled: true,
                toxicThreshold: 1.15,      // Trigger: Crash <= 1.12x
                safeThreshold: 2.0,       // Recovery: Crash > 1.30x
                requiredSafeRounds: 1      // Exit Rule: 1  Safe Rounds
            },

            // === Normal-mode betting (user-facing) ===
            normal: {
                // DYNAMIC SCALAR STRATEGY
                dynamic: true,                   // Enable dynamic normal targets
                baseMultiplier: 2.12,            // Default consistency target
                bullishMultiplier: 2.24,         // Target when trend is strong
                bearishMultiplier: 1.55,         // Target when trend is weak
                bullishThreshold: 2.50,          // Avg(5) > 2.50 -> Bullish
                bearishThreshold: 1.40,          // Avg(5) < 1.75 -> Bearish
                skipThreshold: 1.60,             // Avg(5) < 1.60 -> Skip entirely

                multiplier: DEFAULT_TARGET_MULTIPLIER,                // default normal payout multiplier
                baseBetBits: 1,                  // base stake (bits)
                useEV: true,                     // enable EV gating in normal mode
                evThreshold: 0.15,               // EV threshold to allow bets
                evPThreshold: 0.75,              // require empirical P >= this to trust EV
                aggressiveEV: true,              // allow more permissive EV behaviour
                aggressiveEvPScale: 0.80,        // scale for permissive P threshold
                aggressiveEvUnitScale: 0.70,     // scale for required evPerUnit when aggressive
                postRecoveryPauseRounds: 1,
                followUpPauseAfter: 1,          // Number of follow-ups that must occur to trigger a pause
                followUpPauseRounds: 1,         // How many rounds to deny EV scheduling once triggered
                // scale baseBetBits automatically as a percentage of the balance.
                // Default 0.006 (0.6%) — chosen to satisfy examples (100->1, 300->2, 400->3).
                baseBetBitPercent: 0.005,
                // maximum allowed baseBetBits (clamped). Default: 300 bits.
                baseBetBitMax: 300,
            },

            // === Recovery-mode betting (after losses) ===
            recovery: {
                enableRecovery: true,                           // toggle recovery mode
                // --- 3-PHASE CONFIGURATION (The Ruler) ---
                // Phase 1: Stabilization
                phase1Mult: 2.12,
                phase1Count: 4,        // Stay here for 2 losses (Levels 1,2)
                // Phase 2: Recovery
                phase2Mult: 2.14,
                phase2Count: 2,        // Stay here for 2 losses (Levels 3, 4)
                // Phase 3: Clearing
                phase3Mult: 2.23,      // Stay here for subsequent losses (Levels 5+)
                // Escape Valve
                escapeLevel: 8,        // At Level 7, trigger escape logic
                escapeMult: 2.10,      // Drop target to 2.01x

                // --- Shadow Betting ---
                shadowBetting: true,   // Enable virtual betting after losses

                // Debt Slicing Config (Mapped to Phases)
                enableDebtSlicing: true,
                debtSliceInitialParts: 2,
                debtSliceAmount: DEFAULT_DEBT_SLICE_VALUE_TWO,        // bits threshold -> 2 parts
                debtSliceThreeAmount: DEFAULT_DEBT_SLICE_VALUE_THREE, // bits threshold -> 3 parts
                debtSliceInitialParts: 2,                // default parts when slicing enabled
                debtSlicingMultiplier: 2.06,             // Multiplier to use for computing debt slicing

                multiplier: DEFAULT_RECOVERY_MULTIPLIER,        // recovery-stage multiplier
                baseBetBits: 1,                                 // base bet used in recovery (bits)
                highCrashMultiplier: 2.5,                       // "high crash" multiplier threshold
                requireHighCrashBeforePlacement: false,          // require high crash before placing recovery bet
                relaxRegimeProb: 0.75,                          // relaxed regime threshold for permissive recovery
                strictRegimeProb: 0.54,                         // strict regime threshold (do not bet)
                recoveryRequireJointEVAndEnsemble: false,       // don't force both EV+Ensemble agree to follow up
                regimeBoostScale: 1.05,                         // scale when regime is identified
                alternationWindow: 6,                           // lookback window for alternations
                alternationMinAlternations: 2,                  // minimal alternations to count
                projRelaxDelta: 0.035,                          // projection relax delta in recovery
                projStrongDelta: 0.10,                          // strong projection delta
                targetMultiplier: DEFAULT_TARGET_MULTIPLIER,    // recovery target multiplier
                takeProfitBits: DEFAULT_TAKE_PROFIT_BITS,       // recovery take-profit (bits)
                minBalanceBits: DEFAULT_MIN_BALANCE_BITS,       // minimum balance allowed (bits)
                maxStakeBits: DEFAULT_MAX_STAKE_BITS,           // safety cap (bits)
                proactiveFollowUpsEnabled: true,
                minEvSamples: 0.60,                              // require at least this many samples before trusting EV
                enableRecoveryPartialWindeny: true,              // If true, deny rounds after partial win. If false, immediate re-entry.
                partialRecoveryDenyRounds: 1,

                // --- DYNAMIC RECOVERY TARGET (Escape Velocity) ---
                dynamicTarget: {
                    enabled: true,
                    depth1: 3,      // At Recovery Level 3...
                    scale1: 1.06,   // ...lower target to 82% of base (e.g. 2.0 -> 2.07)
                    depth2: 6,      // At Recovery Level 6...
                    scale2: 1.07    // ...lower target to 70% of base (e.g. 2.0 -> 2.12)
                },

                // Regime detection sub-block (tuned windows & thresholds)
                regime: {
                    window: 12,
                    highCrashPct: 0.45,            // reduce required high-crash ratio to call "high-crash"
                    alternatingWindow: 6,
                    alternatingRatio: 0.60         // relax alternation ratio
                },

                // EV settings specific to recovery
                EVsettings: {
                    useEVInRecovery: true,
                    recoveryEvPThreshold: 0.90,            // empirical P threshold for recovery
                    recoveryEvThreshold: 0.25,             // EV value threshold in recovery
                    recoveryMinConfidenceForFollowup: 0.60,
                    recoveryMaxFollowupDepth: 1,
                    recoveryRequireJointEVAndEnsemble: true,
                    recoveryConsecutiveConfirm: 2,
                    recoveryConfirmWindow: 2,
                    recoveryCooldownRounds: 2,
                    recoveryEvDeltaReq: 0.05,
                },

                followUp: {
                    enabled: true,
                    maxCount: 1,
                    expireBufferRounds: 2,
                    allowForceBypass: true
                }
            },

            // === UI & Protections ===
            protection: {
                uiThrottleMs: 0,               // UI update throttle
                betPlacementTimeoutMs: 350,      // placeBet timeout (ms)
                placeBetRetries: 2               // retries for placeBet
            },

            // === Warmup / quick-start ===
            warmup: {
                enabled: true,           // start in warmup mode
                rounds: DEFAULT_WARMUP_ROUNDS,  // rounds to ignore before live betting
                startInWarmup: true,     // master warmup toggle
                timeOfDay: {enabled: true}  // optional time-of-day warmup control
            },

            // === Schedule-based betting (time-of-day schedules) ===
            schedules: {
                betSchedule1: {time: null, takeProfitBits: null}, // "05:55:00"
                betSchedule2: {time: null, takeProfitBits: null}, //  "05:50:41"
                betSchedule3: {time: null, takeProfitBits: null} // "17:05:41"
            },
            behavior: {
                stopOnTakeProfitOnlyFrom: 'betSchedule3' // which schedule triggers stop-on-TP
            },

            // === MARKET: core market/regime and pattern tuning ===
            MARKET: {
                // windows
                SHORT_WINDOW: 20,
                LONG_WINDOW: 50,

                // crash/momentum thresholds
                HIGH_CRASH_MULTIPLIER: 2.0,
                SHORT_VS_LONG_DELTA: 0.03,
                PLACE_PROB_THRESHOLD: 0.35,

                // momentum / high-rate influence
                MOMENTUM_WEIGHT: 0.60,
                HIGH_RATE_THRESHOLD: 0.40,

                // alternation / pattern boosts
                ALT_BOOST_SCALE: 0.85,
                PATTERN_BOOST_MAX: 0.20,
                PATTERN_HIGH_REWARD: 0.14,
                PATTERN_LOW_PENALTY: 0.12,
                PATTERN_RELAX_SCALE: 0.85,
                FOLLOWUP_PLACE_THRESHOLDS: [0.72, 0.68, 0.64, 0.60],

                MAX_WAIT_ROUNDS_AFTER_LOSS: 12,
                FORCE_RECOVERY_AFTER_ROUNDS: 6,
                FALLBACK_RISK_MULTIPLIER: 0.6,

                // AI nudge configuration
                AI_NUDGE_THRESHOLD: 0.70,                // AI probability threshold to nudge
                AI_NUDGE_PATTERN_CONFIDENCE: 0.48,      // pattern confidence below this allows AI nudge
                AI_NUDGE_SCALE: 0.55,                   // scale for AI nudge
                AI_NUDGE_BOOST_CAP: 0.16,               // cap for AI boost

                // pattern configuration
                PATTERN_BASE_CONF: 0.35,                // baseline pattern confidence
                PATTERN_HIGH_RATIO: 0.30,               // high-ratio threshold for "highs dominate"
                PATTERN_HIGH_BASE: 0.28,                // base offset for high-ratio math
                PATTERN_HIGH_BOOST_SCALE: 0.8,          // scaling when highs dominate
                PATTERN_HIGH_AI_SCALE: 0.45,            // ai boost scaling in high-ratio regions
                PATTERN_HIGH_BOOST_CAP: 0.20,           // cap for high-ratio pattern boost
                PATTERN_HIGH_AI_CAP: 0.12,              // cap for high-ratio ai boost
                PATTERN_ALTERNATION_THRESHOLD: 0.22,    // alternation threshold to trigger alt boost
                PATTERN_ALT_BOOST_SCALE: 0.7,
                PATTERN_ALT_BOOST_CAP: 0.20,
                PATTERN_NEG_CONF_THRESHOLD: 0.18,       // confidence below which we reduce boosts
                PATTERN_NEG_CONF_PENALTY: 0.06,         // penalty applied when below neg conf

                // EV (market) tuning (used by EVModule and boosting logic)
                EV_ALPHA: 0.65,                         // Laplace smoothing for EV estimate
                EV_WINDOW_DEFAULT: 90,                  // default EV window length
                EV_TANH_SCALE: 6,                       // tanh scale for mapping evPerUnit -> boost
                EV_BOOST_SCALE: 0.22,                   // scale applied to tanh(ev * EV_TANH_SCALE)
                EV_BOOST_CAP: 0.18,                     // cap for EV-based boost
                EV_SMALL_SAMPLE_WEIGHT: 0.7,            // fallback weight for small EV samples

                // Alternation / consecutive-low penalties (used by adaptive boost)
                ALTERNATION_RATIO_MIN: 0.20,
                CONSEC_LOW_PATTERN_PENALTY: 0.12,
                CONSEC_LOW_AI_PENALTY: 0.08,
                CONSEC_LOW_EV_PENALTY: 0.05,
                CONSEC_LOW_MINOR_PENALTY: 0.06
            },

            // --- SMART SKEW SETTINGS (No Hardcoding) ---
            skew: {
                skewCap: 4.0,              // Coinscrash allows higher skew (Jackpots)
                slopeThreshold: -0.05,     // Downtrend definition
                highSkewConfidence: 0.4,    // Confidence when Skew is high but trend is up
                minSkew: -2.0 // Configurable floor
            },

            // === ENSEMBLE: adaptive fusion & weighting ===
            ENSEMBLE: {
                // weight bounds and thresholds
                MIN_WEIGHT: 0.08,                                // min per-expert weight
                MAX_WEIGHT: 0.65,                                // max per-expert weight
                PLACE_SCORE_THRESHOLD: 0.24,                     // permissive place threshold
                VOTE_REQUIRED: 2,                                 // how many votes are required to pass a vote quorum: default 2 (out of 3 experts: pattern, ev, ai)

                MAD_WINDOW: 25,          // Window size for calibration (12-32)
                POSTERIOR_CONF: 0.90,    // Confidence level for Bayesian lower bound
                CALIBRATION_ALPHA: 0.7,  // Weight for Ensemble vs Posterior blending

                NEUTRAL_MIN_EV_CONF: 0.60,                      // "0.6" extracted: EV requirement for neutral markets

                // initialization & observation
                INIT_WEIGHTS: {pattern: 0.35, ev: 0.35, ai: 0.30}, // initial priors
                OBSERVATION_ROUNDS: 3,                           // number of rounds to observe before adapting
                RECENT_ACCURACY_WINDOW: 50,                      // window used for module accuracy

                // AI predictor tuning (moved from class hardcodes)
                AI_LEARNING_RATE: 0.02,                          // AIPredictor learning rate (was hardcoded)
                AI_INIT_WEIGHT_SCALE: 0.02,                      // random init scale for small weights
                AI_MAX_HISTORY: 100,                             // smoothing / max history for online training
                AI_PROB_CLAMP_MIN: 0.0001,                       // lower clamp for AI probabilities
                AI_PROB_CLAMP_MAX: 0.9999,                       // upper clamp for AI probabilities
                AI_REGULARIZATION: 0.999,                        // multiplicative regularization for weights

                // fusion & clamping
                CLAMP_MIN: 0.0,                                  // clamp lower bound for ensemble output
                CLAMP_MAX: 0.99,                                 // clamp upper bound for ensemble output
                SIGNAL_DEFAULT: 0.0,                             // default for missing pattern/ev/ai signals
                STORE_BREAKDOWN: true,                           // whether to save lastEnsembleBreakdown

                // reliability tuning (floors/ceil applied to module reliability)
                RELIABILITY_FLOOR: 0.25,
                RELIABILITY_CEIL: 1.25,

                // convenience initial module-stats (optional override)
                MODULE_STATS_INIT: {
                    pattern: {correct: 1, total: 2},
                    ev: {correct: 1, total: 2},
                    ai: {correct: 1, total: 2}
                },

                // (existing / optional keys that may be used elsewhere)
                HYSTERESIS: 0.03,
                MIN_OBSERVED_ACCURACY_FOR_WEIGHT_CHANGE: 0.52,

                EV_CONF_TANH_SCALE: 3,
                WEIGHTS_DEFAULT: { regime: 0.4, ev: 0.3, ai: 0.3 },
                WEIGHTS_BULLISH: { regime: 0.70, ev: 0.15, ai: 0.15 },
                WEIGHTS_VOLATILE: { regime: 0.3, ev: 0.4, ai: 0.3 },

                EV_STRONG_CONF_THRESHOLD: 0.75,
                EV_STRONG_CONF_BOOST: 0.1,
                AI_STRONG_CONF_THRESHOLD: 0.75,
                AI_STRONG_CONF_BOOST: 0.1,

                VOTE_THRESHOLD: 0.5,
                // VOTE_REQUIRED is already in ENSEMBLE block, line 230 - no need to re-add

                ANTI_SKIP_CONF_SCALE: 0.9,
                SUGGESTED_BET_SCALE: 3,
                SUGGESTED_BET_MAX_SCALE: 3,
            },

            // ==========================================================
            // +++ V10 HYDRA ENGINE CONFIGURATION +++
            // ==========================================================
            HYDRA_STRATEGY: {
                // --- 1. RALLY (Trend) - Dynamic Momentum ---
                RALLY_MOMENTUM_THRESHOLD: 2.5,   // Score required to enter Rally
                RALLY_HIGH_ADD: 1.0,             // Points for > 2.0x
                RALLY_MASSIVE_ADD: 2.0,          // Points for > 5.0x
                RALLY_NEAR_MISS_ADD: 0.5,        // Points for 1.80x - 1.99x
                RALLY_SLOPE_BONUS: 0.5,          // Bonus points if slope > 0.05

                // --- 2. PING_PONG (Alternation) ---
                PING_PONG_FLIPS: 4,              // Required flips (H-L-H-L = 3 flips, wait for 4th)

                // --- 3. OVERSOLD (Bounce) ---
                OVERSOLD_COUNT: 3,               // Consecutive lows to trigger bounce check
                OVERSOLD_MAX_MULT: 1.80,         // "Safe" low range upper bound

                // --- 4. TOXIC TRAIN (Defense) ---
                TOXIC_MULTIPLIER_THRESHOLD: 1.20, // Definition of a "Crash"
                TOXIC_CONSECUTIVE_COUNT: 3,       // Number of crashes to trigger BUNKER MODE

                // --- 5. WHALE WAKE (Volatility) ---
                WHALE_MULTIPLIER_THRESHOLD: 100.0,

                // --- 7. CRAB (Sideways) ---
                CRAB_UPPER_BOUND: 2.0,           // Market stays under this
                CRAB_LOWER_TARGET: 1.50,         // Auto-adjust target to this in Crab mode

                // --- 8. CHAOS (Pattern Recognition) ---
                CHAOS_PATTERN_ACCURACY: 0.80,    // 80% accuracy required to bet in Chaos

                // --- 9. RECOVERY SNIPE ---
                RECOVERY_SNIPE_CONFIDENCE: 0.80, // Minimum confidence to risk recovery stack

                // General Settings
                INSTANT_TREND_WINDOW: 5,
                MACRO_TREND_WINDOW: 12
            },
        };

        // --- normalize / ensure both legacy and normalized keys are available ---
        this.config.baseBetBits = this.config.baseBetBits ?? this.config.baseBet;
        this.config.takeProfitBits = this.config.takeProfitBits ?? this.config.takeProfitLimit;
        this.config.minBalanceBits = this.config.minBalanceBits ?? this.config.stopLossLimit;

        this.initialBalance = null;
        this.setInitialBalance();

        // --- compute numeric normal.baseBetBits from percent and populate schedule TPs once ---
        // computeAndSetBaseBetFromPercent is defined on ConfigManager (OOP) and WILL ONLY write
        // this.config.normal.baseBetBits (no other config keys are modified).
        if (typeof this.computeAndSetBaseBetFromPercent === 'function') {
            this.computeAndSetBaseBetFromPercent();
        }

        // Populate schedule takeProfitBits once using the computed numeric base bet
        if (this.config && this.config.schedules) {
            for (const sk of Object.keys(this.config.schedules)) {
                this.config.schedules[sk].takeProfitBits = this.computeTakeProfitAmount(this.config.normal.baseBetBits, sk);
            }
        }
    }

    /**
     * computeAndSetDebtSliceValues(initialDebtBits)
     * Simulates the loss streak using Phase Multipliers AND Escape Valve logic to generate:
     * 1. debtSliceAmount (Threshold for Phase 2 / Slice 2)
     * 2. debtSliceThreeAmount (Threshold for Phase 3 / Slice 3)
     * 3. levelLadder (Map of Debt -> Recovery Level)
     */
    computeAndSetDebtSliceValues(initialDebtBits) {
        try {
            if (!this.config || !this.config.recovery) return;
            const rec = this.config.recovery;

            // Ensure at least one phase1 iteration so we can produce "level 1" (first post-loss)
            const p1Count = Math.max(1, Number.isFinite(Number(rec.phase1Count)) ? Number(rec.phase1Count) : 2);
            const p2Count = Number.isFinite(Number(rec.phase2Count)) ? Number(rec.phase2Count) : 2;

            const p1Mult = Number.isFinite(Number(rec.phase1Mult)) ? Number(rec.phase1Mult) : 1.53;
            const p2Mult = Number.isFinite(Number(rec.phase2Mult)) ? Number(rec.phase2Mult) : 2.12;
            const p3Mult = Number.isFinite(Number(rec.phase3Mult)) ? Number(rec.phase3Mult) : 2.31;

            const escapeLvl = (rec.escapeLevel !== undefined) ? Number(rec.escapeLevel) : 6;
            const escapeMult = Number.isFinite(Number(rec.escapeMult)) ? Number(rec.escapeMult) : 1.73;

            // Baseline debt (debt BEFORE any recovery attempt). Keep integer >= 0 (but >=1 for safety)
            let baselineDebt = Math.max(1, Math.round(initialDebtBits || 1));

            // Initialize ladder so index 0 = baseline (0 recovery losses),
            // index 1 = debt AFTER first recovery loss (=> your desired "level 1").
            rec.levelLadder = [];
            rec.levelLadder[0] = baselineDebt;

            // Helper to select multiplier based on simulated level index
            const getSimMult = (lvl, defaultMult) => (lvl >= escapeLvl ? escapeMult : defaultMult);

            // We'll simulate forward starting from baselineDebt.
            let simDebt = baselineDebt;

            // --- FIRST recovery loss (explicit): produce level 1 ---
            {
                const currentSimLevel = rec.levelLadder.length - 1; // 0 (baseline)
                const activeMult = getSimMult(currentSimLevel, p1Mult);
                const profitPerBit = Math.max(0.01, activeMult - 1);
                const stake = Math.ceil(simDebt / profitPerBit);
                simDebt += stake;
                rec.levelLadder.push(simDebt); // index 1 -> debt after first recovery loss
            }

            // --- Remaining PHASE 1 iterations (if any) ---
            for (let i = 1; i < p1Count; i++) {
                const currentSimLevel = rec.levelLadder.length - 1;
                const activeMult = getSimMult(currentSimLevel, p1Mult);
                const profitPerBit = Math.max(0.01, activeMult - 1);
                const stake = Math.ceil(simDebt / profitPerBit);
                simDebt += stake;
                rec.levelLadder.push(simDebt);
            }

            // End of Phase 1 -> Threshold for Phase 2 (Slicing by 2)
            rec.debtSliceAmount = simDebt;

            // --- PHASE 2 (Recovery) ---
            for (let i = 0; i < p2Count; i++) {
                const currentSimLevel = rec.levelLadder.length - 1;
                const activeMult = getSimMult(currentSimLevel, p2Mult);

                const sliceSize = Math.ceil(simDebt / 2);
                const profitPerBit = Math.max(0.01, activeMult - 1);
                const stake = Math.ceil(sliceSize / profitPerBit);
                simDebt += stake;
                rec.levelLadder.push(simDebt);
            }

            // End of Phase 2 -> Threshold for Phase 3 (Slicing by 3)
            rec.debtSliceThreeAmount = simDebt;

            // --- PHASE 3 (Clearing/Survival) simulate remaining up to a cap (50 total levels approx) ---
            const startLevelIndex = rec.levelLadder.length - 1;
            const maxExtra = Math.max(0, 50 - startLevelIndex);
            for (let i = 0; i < maxExtra; i++) {
                const currentSimLevel = rec.levelLadder.length - 1;
                const activeMult = getSimMult(currentSimLevel, p3Mult);

                const sliceSize = Math.ceil(simDebt / 3);
                const profitPerBit = Math.max(0.01, activeMult - 1);
                const stake = Math.ceil(sliceSize / profitPerBit);
                simDebt += stake;
                rec.levelLadder.push(simDebt);
            }

            if (this.config.debug) {
                const msg = `🛠️ Ladder Rebuilt (Escape Lvl ${escapeLvl} @ ${escapeMult}x): ${JSON.stringify(rec.levelLadder.slice(0, 20))}`;
                if (typeof log === 'function') log(msg); else console.log(msg);
            }

        } catch (e) {
            const errMsg = `Config Sim Error: ${e && e.message ? e.message : String(e)}`;
            if (typeof log === 'function') log(errMsg); else console.error(errMsg);
        }
    }

    generateRecoveryLevelLadder(initialDebtBits, recConfig) {
        // Logic is now centralized in computeAndSetDebtSliceValues to ensure
        // thresholds and ladder are always perfectly synced.
        // This method is kept as a stub for compatibility.
        return;
    }

    computeTakeProfitAmount(normalBetBit, scheduleKey) {
        // map schedule keys to default multipliers
        const multipliers = {
            betSchedule1: this.DEFAULT_SCHEDULE_ONE_TAKE_PROFIT,
            betSchedule2: this.DEFAULT_SCHEDULE_TWO_TAKE_PROFIT,
            betSchedule3: this.DEFAULT_SCHEDULE_THREE_TAKE_PROFIT
        };

        // choose multiplier (fallback to schedule1 default if unknown key)
        const multiplier = Number(multipliers[scheduleKey] ?? this.DEFAULT_SCHEDULE_ONE_TAKE_PROFIT);

        // coerce base to number; if not provided, try reading from this.config (defensive)
        const base = Number(normalBetBit ?? (this.config && this.config.normal && this.config.normal.baseBetBits) ?? this.config.baseBetBits);

        // final computed take profit amount
        return multiplier * base;
    }

    /**
     * Compute numeric normal.baseBetBits from configured percent and set it.
     * - Reads balance via this.getCurrentBalance() (satoshi), converts to bits.
     * - Uses this.config.normal.baseBetBitPercent and this.config.normal.baseBetBitMax.
     * - Enforces minimum = this.config.baseBetBits (legacy top-level min).
     * - Writes result ONLY to this.config.normal.baseBetBits (per your instruction).
     */
    computeAndSetBaseBetFromPercent() {
        const pct = (this.config && this.config.normal && typeof this.config.normal.baseBetBitPercent === 'number')
            ? Number(this.config.normal.baseBetBitPercent)
            : 0.006;

        const maxBits = (this.config && this.config.normal && Number.isFinite(Number(this.config.normal.baseBetBitMax)))
            ? Number(this.config.normal.baseBetBitMax)
            : 300;

        const minBits = Number(this.config.baseBetBits) || 1; // minimum enforced (legacy top-level)

        // getCurrentBalance() returns satoshi -> convert to bits
        const sat = Number(this.getCurrentBalance && typeof this.getCurrentBalance === 'function' ? this.getCurrentBalance() : 0) || 0;
        const balanceBits = Math.floor(sat / 100);

        // compute numeric baseBetBits (use Math.floor to match the example mapping)
        let computed = Math.floor(balanceBits * pct);
        if (!Number.isFinite(computed)) computed = minBits;

        // clamp to [minBits, maxBits]
        const numeric = Math.max(minBits, Math.min(maxBits, Math.max(0, Math.floor(computed))));

        // WRITE ONLY to this.config.normal.baseBetBits (per your requirement)
        if (!this.config) this.config = {};
        if (!this.config.normal) this.config.normal = {};
        this.config.normal.baseBetBits = numeric;

        return numeric;
    }

    setInitialBalance() {
        if (this.initialBalance === null) {
            this.initialBalance = this.getCurrentBalance();
        }
    }

    getCurrentBalance() {
        // use the canonical runMode getter (backward-compatible)
        const isTest = (typeof this.getRunMode === 'function') ? (this.getRunMode() === 'test') : (this.config.runMode === 'test');
        if (isTest) {
            // config.testBalanceBits is in bits — convert to satoshi when returning
            return (this.config.testBalanceBits || 0) * 100;
        } else {
            try {
                // engine likely returns satoshi already
                return engine.getBalance();
            } catch (error) {
                console.log('⚠️ Error getting balance, using test balance');
                return (this.config.testBalanceBits || 0) * 100;
            }
        }
    }

    updateBalance(newBalance) {
        const isTest = (typeof this.getRunMode === 'function') ? (this.getRunMode() === 'test') : (this.config.runMode === 'test');
        if (isTest) {
            // incoming newBalance is in satoshi — store config values in bits
            this.config.testBalanceBits = this.satsToBits(newBalance);
        }
        // In live mode, balance is managed by the engine
    }

    get(key) {
        return this.config[key];
    }

    update(newConfig) {
        Object.assign(this.config, newConfig);
        if (this.config.debug) {
            console.log('🔧 Config updated:', newConfig);
        }
    }

    // ---------- helper conversions (moved to ConfigManager) ----------
    // convert bits (user-configured "bits") -> satoshis
    bitsToSats(bits) {
        return (bits || 0) * 100;
    }

    // convert satoshis -> bits (used when storing test balances)
    satsToBits(sats) {
        return (sats || 0) / 100; // preserve fractional bits
    }

    // canonical getters that always return satoshi values
    // they accept both legacy and new config key names for backward compatibility
    getBaseBetSat() {
        // Prefer an explicit normal-mode base bet if present (backwards-compatible)
        if (this.config && this.config.normal && typeof this.config.normal.baseBetBits !== 'undefined') {
            return this.bitsToSats(this.config.normal.baseBetBits);
        }
    }

    getTakeProfitSat() {
        const bits = (typeof this.config.takeProfitBits !== 'undefined')
            ? this.config.takeProfitBits
            : (this.config.recovery && typeof this.config.recovery.takeProfitBits !== 'undefined')
                ? this.config.recovery.takeProfitBits
                : (typeof this.config.takeProfitLimit !== 'undefined' ? this.config.takeProfitLimit : 0);

        return this.bitsToSats(bits);
    }

    getMinBalanceSat() {
        const bits = (typeof this.config.minBalanceBits !== 'undefined')
            ? this.config.minBalanceBits
            : (typeof this.config.stopLossLimit !== 'undefined' ? this.config.stopLossLimit : 1);
        return this.bitsToSats(bits);
    }

    // Round bits to nearest integer bit (user requirement: stakes must be integer bits)
    bitsRound(bits) {
        return Math.max(0, Math.round(bits || 0));
    }

    getRunMode() {
        return (this.config.runMode || 'test');
    }

    // Compatibility accessor helpers so callers can use `this.config.recovery` or `this.config.normal`
    // even when `this.config` is a ConfigManager instance (avoids IDE warnings).
    get recovery() {
        return (this && this.config && this.config.recovery) ? this.config.recovery : null;
    }

    get normal() {
        return (this && this.config && this.config.normal) ? this.config.normal : null;
    }
}

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

// ============================
// BettingGateController
// Small, focused controller: only opens/closes betting gate and enforces
// single-round deny rules (for partial recovery wins) and differences between
// EV-scheduled bets and Follow-up scheduled bets.
// ============================
class BettingGateController {
    constructor(bot) {
        this.bot = bot;
        // gate: true = open, false = closed
        this._open = false;
        // rounds to deny all betting requests (counts down each round)
        this._denyRounds = 0;
        // the last-close reason (string) useful for panel/log
        this.lastReason = null;
        // After a partial recovery win we want a short "only EV may open" lock:
        // when true only requests with source==='EV' will be allowed to open the gate.
        this._postPartialRecoveryLock = false;
        // normalize constructor arg: accept either (bot) or (config)
        this.bot = (bot && bot.config) ? bot : ((bot && typeof bot === 'object') ? {config: bot} : null);
    }

    // Force-close gate immediately (caller may pass optional reason)
    closeGate(reason = '') {
        this._open = false;
        this.lastReason = reason || null;
        try {
            if (this.bot && typeof this.bot.logger !== 'undefined') this.bot.logger.log(`Betting gate CLOSED: ${reason}`, 'skip');
        } catch (e) {
        }
    }

    // Open gate (no-op if denyRounds > 0)
    openGate(reason = '') {
        if (this._denyRounds > 0) {
            try {
                if (this.bot && typeof this.bot.logger !== 'undefined') this.bot.logger.log(`Betting gate OPEN request denied (denyRounds=${this._denyRounds}): ${reason}`, 'skip');
            } catch (e) {
            }
            return false;
        }
        this._open = true;
        this.lastReason = reason || null;
        try {
            if (this.bot && typeof this.bot.logger !== 'undefined') this.bot.logger.log(`Betting gate OPEN: ${reason}`, 'info');
        } catch (e) {
        }
        return true;
    }

    // Request the gate for a particular source. source: 'EV'|'FOLLOWUP'|'MANUAL'
    // isFollowUp: boolean — indicates whether this is a follow-up scheduled bet.
    // Returns true if the gate is open/was opened and the caller may proceed to place a bet.
    requestOpenFor({source = 'EV', isFollowUp = false, reason = ''} = {}) {
        // Always respect the denyRounds rule (one-round denial after partial recovery win)
        if (this._denyRounds > 0) {
            try {
                if (this.bot && typeof this.bot.logger !== 'undefined') this.bot.logger.log(`Bet request denied for ${source} (denyRounds=${this._denyRounds})`, 'skip');
            } catch (e) {
            }
            return false;
        }

        // If we're in the post-partial-recovery lock, only EV source may open the gate.
        // This enforces: after a partial recovery win, followups may NOT open the gate;
        // only an explicit EV request can re-open it.
        if (this._postPartialRecoveryLock) {
            if (String(source || '').toUpperCase() !== 'EV') {
                try {
                    if (this.bot && typeof this.bot.logger !== 'undefined') this.bot.logger.log(`Bet request denied for ${source} due to post-partial-recovery lock`, 'skip');
                } catch (e) {
                }
                return false;
            } else {
                // Allow EV to attempt open — if open succeeds, clear the lock so normal flow resumes.
                const opened = this.openGate(`${source}${isFollowUp ? ' (followup)' : ''} ${reason}`);
                if (opened) this._postPartialRecoveryLock = false;
                return opened;
            }
        }

        // Follow-ups are subject to config.recovery.followUp.enabled
        if (isFollowUp) {
            const cfgEnabled = !!(this.bot && this.bot.config && this.bot.config.recovery && this.bot.config.recovery.followUp && this.bot.config.recovery.followUp.enabled);
            if (!cfgEnabled) {
                try {
                    if (this.bot && typeof this.bot.logger !== 'undefined') this.bot.logger.log(`Follow-up bet denied: follow-ups disabled in config`, 'warning');
                } catch (e) {
                }
                return false;
            }
        }

        // If gate already open, allow
        if (this._open) return true;

        // Otherwise attempt to open now (this is the single place that toggles gate open)
        return this.openGate(`${source}${isFollowUp ? ' (followup)' : ''} ${reason}`);
    }

    onPartialRecoveryWin({remainingDebtBits} = {}) {
        try {
            // NEW: Check config to see if we should actually deny
            // Access config safely via this.bot.config
            const shouldDeny = (this.bot && this.bot.config && this.bot.config.recovery && this.bot.config.recovery.enableRecoveryPartialWindeny);

            if (shouldDeny) {
                // Default behavior: deny 1 round
                this._denyRounds = Math.max(this._denyRounds || 0, 1);
                this.closeGate('PARTIAL-RECOVERY-WIN');
            } else {
                // IMMEDIATE RE-ENTRY FIX: Do not deny. Allow catching the streak.
                this._denyRounds = 0;
                // Do NOT close gate. Leave it eligible for next tick.
                if(this.logger) this.logger.log('🔓 Partial Win: Immediate re-entry enabled (No Deny).', 'info');
            }

            // Prevent followups is handled by clearing the scheduler elsewhere,
            // but this lock ensures specific EV sources if needed.
            this._postPartialRecoveryLock = true;
        } catch (e) {
            try {
                if (this.logger) this.logger.log(`⚠️ onPartialRecoveryWin error: ${e && e.message}`, 'warning');
            } catch (_) {
            }
        }
    }

    // Called after a bet result is known so gate can react (partial recovery-close etc)
    onBetResult({mode = 'NORMAL', isWin = false, profitBits = 0, debtBits = 0} = {}) {
        // If in RECOVERY mode and win but profit < debt => partial recovery win => deny next immediate 1 round
        try {
            if (mode && this.bot.isInRecovery()) {
                if (isWin) {
                    if (Number.isFinite(Number(profitBits)) && Number.isFinite(Number(debtBits))) {
                        if (Number(profitBits) < Number(debtBits)) {
                            // enforce one round denial
                            this._denyRounds = (this.bot && this.bot.config && this.bot.config.recovery && this.bot.config.recovery.partialRecoveryDenyRounds) ? Number(this.bot.config.recovery.partialRecoveryDenyRounds) : 1;
                            this.closeGate('partial recovery win — denying next round');
                        } else {
                            // cleared the debt — reopen for normal operation
                            this._denyRounds = 0;
                            // clear any post-partial lock since debt is cleared
                            this._postPartialRecoveryLock = false;
                            try {
                                if (this.bot && typeof this.bot.logger !== 'undefined') this.bot.logger.log('Debt cleared — exiting recovery gate restrictions', 'info');
                            } catch (e) {
                            }

                            // enforce post-recovery evaluation rounds if configured under config.normal (blocks EV-driven placement for N rounds)
                            // NOTE: BettingGateController does NOT have this.config or this.bettingGate — use this.bot.config and this._denyRounds instead.
                            const postPause = (this.bot && this.bot.config && this.bot.config.normal && Number.isFinite(Number(this.bot.config.normal.postRecoveryPauseRounds)))
                                ? Number(this.bot.config.normal.postRecoveryPauseRounds)
                                : 0;

                            if (postPause > 0) {
                                // set controller's deny rounds and keep the gate closed so no normal/EV bets are placed until the pause expires.
                                this._denyRounds = Math.max(this._denyRounds || 0, postPause);
                                try {
                                    if (this.bot && this.bot.logger) this.bot.logger.log(`Post-recovery pause enabled: denying bets for ${postPause} rounds`, 'info');
                                } catch (e) {
                                }
                                // ensure gate state is closed while pause is active
                                if (typeof this.closeGate === 'function') this.closeGate('debt cleared - pausing for postRecoveryPauseRounds');
                            } else {
                                // no post-recovery pause configured — open gate immediately as before
                                this.openGate('debt cleared');
                            }
                        }
                    }
                } else {
                    // on loss in recovery, keep gate closed until follow-up scheduler or EV asks
                    this.closeGate('recovery loss — gate closed awaiting follow-up scheduling or EV');
                }
            }
        } catch (e) {
            try {
                if (this.bot && this.bot.logger) this.bot.logger.log(`BettingGateController.onBetResult error: ${e && e.message}`, 'error');
            } catch (e) {
            }
        }
    }

    // Call this on each new round (e.g. in game_starting) to decrement deny counters
    tickRound() {
        if (this._denyRounds > 0) {
            this._denyRounds = Math.max(0, this._denyRounds - 1);
            if (this._denyRounds === 0) {
                // allow gate to be re-opened by callers (do not auto-open)
                try {
                    if (this.bot && this.bot.logger) this.bot.logger.log('DenyRounds exhausted — gate can now be opened by EV/ensemble', 'info');
                } catch (e) {
                }
            }
        }
    }
}
// End of BettingGateController

// ============================
// RECOVERY MANAGER - ADAPTIVE NEURO-SNIPER (V8.7)
// ============================
class RecoveryManager {
    constructor(bot) {
        this.bot = bot;
        this.config = (bot && bot.config) ? bot.config : {};
        this.logger = (bot && bot.logger) ? bot.logger : console;
    }

    canPlaceRecoveryBet(ctx = {}, isFollowUp = false) {
        if (this.bot && this.bot.shadowBetActive) return false;

        // 1. Get Brain Opinion
        let regimeAnalysis = { state: 'CHAOS', confidence: 0.0 };
        if (this.bot && this.bot.prediction) {
            // Note: prediction.getPrediction calls analyze internally
            const prediction = this.bot.prediction.unifyEvEnsembleDecision('RECOVERY');
            if (prediction && prediction.details && prediction.details.regime) {
                regimeAnalysis = prediction.details.regime;
            }
        }

        const cfg = (this.config && this.config.config && this.config.config.HYDRA_STRATEGY) ? this.config.config.HYDRA_STRATEGY : {};

        // 2. IMMEDIATE SAFETY BLOCKS
        if (regimeAnalysis.state === 'TOXIC_TRAIN') return false;
        if (regimeAnalysis.state === 'WHALE_WAKE') return false;
        if (regimeAnalysis.state === 'PING_PONG_WAIT') return false; // Explicit wait signal

        // 3. FOLLOW-UP LOGIC (The "Second Bullet")
        if (isFollowUp) {
            // Block if we just had a "Weak Bounce" failure
            // (Check logic: if we bet RECOVERY last round, and result was 1.2x < result < 2.0x, it's a weak bounce)
            const lastCrash = (ctx.history && ctx.history.getRecentCrashes) ? ctx.history.getRecentCrashes(1)[0] : 0;

            // Safeguard: If last crash was toxic (<1.20), BLOCK follow-up.
            if (lastCrash < (cfg.TOXIC_MULTIPLIER_THRESHOLD || 1.20)) {
                if(this.logger) this.logger.log(`🛑 Follow-up Blocked: Last crash ${lastCrash}x was TOXIC.`, 'skip');
                return false;
            }

            return true; // Otherwise allow follow-up to clear debt
        }

        // 4. INITIAL RECOVERY ENTRY (RECOVERY_SNIPE)
        // We only enter on High Confidence Regimes
        const allowedRegimes = ['RALLY', 'PING_PONG', 'OVERSOLD', 'CHAOS_SCALP'];

        if (allowedRegimes.includes(regimeAnalysis.state)) {
            // Extra check for Oversold: Confirm trend isn't totally dead
            if (regimeAnalysis.state === 'OVERSOLD' && regimeAnalysis.confidence < 0.6) return false;
            return true;
        }

        // Block CRAB and CHAOS for initial recovery (Risk management)
        if (regimeAnalysis.state === 'CRAB' || regimeAnalysis.state === 'CHAOS') {
            return false;
        }

        return false;
    }
}
// End of RecoveryManager

class StatsTracker {
    constructor(config) {
        this.config = config;
        this.resetStats();
        this.crashHistory = [];
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

        // 6) lightweight verification log
        console.log(`📊 VERIFICATION: Total Bets: ${this.stats.totalBets} | Wins: ${this.stats.totalWins} | Losses: ${this.stats.totalLosses} | Rounds: ${this.stats.totalRounds} | Total P/L: ${this.stats.totalProfit.toFixed(2)} bits`);
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

// ---------- Ensemble prediction module (Pattern + EV + Online AI) ----------
class AIPredictor {
    // Lightweight online logistic regression that predicts P(crash >= target)
    constructor(config) {

        this.config = config;

        // defensive read from config: prefer ENSEMBLE.* if present
        try {
            const raw = (this.config && this.config.config) ? this.config.config : (this.config || {});
            const eCfg = (raw.ENSEMBLE || {});
            this.learningRate = Number.isFinite(Number(eCfg.AI_LEARNING_RATE)) ? Number(eCfg.AI_LEARNING_RATE) : 0.02;
            this.maxHistory = Number.isFinite(Number(eCfg.AI_MAX_HISTORY)) ? Number(eCfg.AI_MAX_HISTORY) : 100;
            this.initWeightScale = Number.isFinite(Number(eCfg.AI_INIT_WEIGHT_SCALE)) ? Number(eCfg.AI_INIT_WEIGHT_SCALE) : 0.02;
            this.probClampMin = (Number.isFinite(Number(eCfg.AI_PROB_CLAMP_MIN))) ? Number(eCfg.AI_PROB_CLAMP_MIN) : 0.0001;
            this.probClampMax = (Number.isFinite(Number(eCfg.AI_PROB_CLAMP_MAX))) ? Number(eCfg.AI_PROB_CLAMP_MAX) : 0.9999;
            this.regularization = (Number.isFinite(Number(eCfg.AI_REGULARIZATION))) ? Number(eCfg.AI_REGULARIZATION) : 0.999;
        } catch (e) {
            // safe fallback — same values as previously hardcoded
            this.learningRate = 0.02;
            this.maxHistory = 100;
            this.initWeightScale = 0.02;
            this.probClampMin = 0.0001;
            this.probClampMax = 0.9999;
            this.regularization = 0.999;
        }

        this.weights = null; // will be array sized to features
        // counter of how many training updates were applied (used with AI_MAX_HISTORY)
        this.trainCount = 0;

    }

    _features(stats, targetMultiplier) {
        // feature vector: [1 (bias), avg5, avg10, std5, recent_count_ge_target(20)/20, lastCrash, consecutiveLow]
        const recent10 = stats.getRecentCrashes(10);
        const recent5 = stats.getRecentCrashes(5);
        const lastCrash = recent10.length ? recent10[recent10.length - 1] : targetMultiplier;
        const avg = arr => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : targetMultiplier);
        const std = arr => {
            if (!arr.length) return 0;
            const m = avg(arr);
            return Math.sqrt(arr.reduce((s, v) => s + (v - m) * (v - m), 0) / arr.length);
        };
        const avg5 = avg(recent5);
        const avg10 = avg(recent10);
        const std5 = std(recent5);
        const recent20 = stats.getRecentCrashes(20);
        const count_ge_target = recent20.filter(c => c >= targetMultiplier).length;
        const recentConsecLow = (() => {
            let c = 0;
            const lastArr = stats.getRecentCrashes(10);
            for (let i = lastArr.length - 1; i >= 0; i--) {
                if (lastArr[i] < targetMultiplier) c++; else break;
            }
            return c;
        })();

        // normalize features to reasonable ranges
        return [
            1,                                 // bias
            Math.min(avg5 / targetMultiplier, 3), // normalized avg5 relative to target
            Math.min(avg10 / targetMultiplier, 3),
            Math.min(std5 / (targetMultiplier || 1), 3),
            count_ge_target / Math.max(1, recent20.length),
            Math.min(lastCrash / targetMultiplier, 5),
            Math.min(recentConsecLow / 10, 1)
        ];
    }

    _sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    predict(stats, targetMultiplier) {
        if (!this.weights) {
            // initialize small weights using configurable init weight scale
            const len = this._features(stats, targetMultiplier).length;
            this.weights = new Array(len).fill(0).map(() => (Math.random() - 0.5) * (this.initWeightScale || 0.02));
        }

        const x = this._features(stats, targetMultiplier);
        let z = 0;
        for (let i = 0; i < x.length; i++) z += x[i] * this.weights[i];
        const p = this._sigmoid(z);
        // configurable probability clamps (avoid exact 0 or 1)
        const clampMin = (this.probClampMin || 0.0001);
        const clampMax = (this.probClampMax || 0.9999);
        return Math.min(Math.max(p, clampMin), clampMax);
    }

    // Train online: label = 1 if crash >= targetMultiplier else 0
    train(stats, targetMultiplier, crashValue) {
        if (!this.weights) this.predict(stats, targetMultiplier); // initialize
        const x = this._features(stats, targetMultiplier);
        const p = this.predict(stats, targetMultiplier);
        const label = crashValue >= targetMultiplier ? 1 : 0;

        // gradient for logistic loss: (p - y) * x
        const gradScale = (p - label);

        // increment training counter
        this.trainCount = (this.trainCount || 0) + 1;

        // use maxHistory to damp learning rate growth: effectiveLR = learningRate / sqrt(min(trainCount, maxHistory))
        const mh = (Number.isFinite(Number(this.maxHistory)) ? Number(this.maxHistory) : 1);
        const effCount = Math.max(1, Math.min(this.trainCount, mh));
        const effectiveLR = (Number.isFinite(Number(this.learningRate)) ? Number(this.learningRate) : 0.02) / Math.sqrt(effCount);

        for (let i = 0; i < this.weights.length; i++) {
            this.weights[i] -= effectiveLR * gradScale * x[i];
        }

        // regularize using configured multiplicative factor (keeps weights bounded)
        const reg = (Number.isFinite(Number(this.regularization)) ? Number(this.regularization) : 0.999);
        for (let i = 0; i < this.weights.length; i++) {
            this.weights[i] *= reg;
        }
    }
}

class EVModule {
    // Computes empirical probability (smoothed) and expected value for a bet at targetMultiplier
    constructor(stats) {
        // stats is StatsTracker (which holds a reference to config) — use MARKET.SHORT_WINDOW if available
        this.stats = stats;
        // read EV alpha from config (supports both ConfigManager or plain config shapes)
        try {
            const raw = (this.stats && this.stats.config && this.stats.config.config) ? this.stats.config.config : ((this.stats && this.stats.config) ? this.stats.config : {});

            // Backwards-compatible: support EV.* and MARKET.* names.
            const evCfg = (raw.EV || {});
            const mc = (raw.MARKET || {});

            // alpha: prefer EV.EV_ALPHA else MARKET.EV_ALPHA, fallback 0.35
            this.alpha = Number.isFinite(Number(evCfg.EV_ALPHA || evCfg.ALPHA)) ? Number(evCfg.EV_ALPHA || evCfg.ALPHA)
                : (Number.isFinite(Number(mc.EV_ALPHA)) ? Number(mc.EV_ALPHA) : 0.35);

            // window: prefer EV.WINDOW else MARKET.EV_WINDOW_DEFAULT else default 20
            this.window = (Number.isFinite(Number(evCfg.WINDOW)) && Number(evCfg.WINDOW) > 0) ? Number(evCfg.WINDOW)
                : ((Number.isFinite(Number(mc.EV_WINDOW_DEFAULT)) && Number(mc.EV_WINDOW_DEFAULT) > 0) ? Number(mc.EV_WINDOW_DEFAULT) : 20);

        } catch (e) {
            this.alpha = 0.35;
            this.window = 20;
        }
    }


    empiricalProbability(targetMultiplier) {
        // Use both a short and a long window and blend them so recent big crashes update p quickly.
        // Config-aware: respects MARKET.SHORT_WINDOW, MARKET.LONG_WINDOW and MARKET.EV_SMALL_SAMPLE_WEIGHT
        try {
            const mc = (this.stats && this.stats.config && this.stats.config.config && this.stats.config.config.MARKET) ? this.stats.config.config.MARKET : null;
            // Prefer the EVModule.window (set during construction). Fall back to MARKET.SHORT_WINDOW then default.
            const shortW = (Number.isFinite(this.window) && this.window > 0) ? Number(this.window) : ((mc && Number.isFinite(Number(mc.SHORT_WINDOW))) ? Number(mc.SHORT_WINDOW) : 8);  // shorter sensitivity
            const longW = (mc && Number.isFinite(Number(mc.LONG_WINDOW))) ? Number(mc.LONG_WINDOW) : 100; // stable long term
            // prefer MARKET.EV_SMALL_SAMPLE_WEIGHT, fall back to 0.7
            const smallSampleWeight = (mc && Number.isFinite(Number(mc.EV_SMALL_SAMPLE_WEIGHT))) ? Number(mc.EV_SMALL_SAMPLE_WEIGHT) : 0.7;

            // get crash arrays (defensive)
            const recentShort = this.stats.getRecentCrashes ? this.stats.getRecentCrashes(shortW) : (this.stats.crashes || []).slice(-shortW);
            const recentLong = this.stats.getRecentCrashes ? this.stats.getRecentCrashes(longW) : (this.stats.crashes || []).slice(-longW);

            const successesShort = (Array.isArray(recentShort) ? recentShort.filter(c => c >= targetMultiplier).length : 0);
            const totalShort = Math.max(1, (Array.isArray(recentShort) ? recentShort.length : 0));

            const successesLong = (Array.isArray(recentLong) ? recentLong.filter(c => c >= targetMultiplier).length : 0);
            const totalLong = Math.max(1, (Array.isArray(recentLong) ? recentLong.length : 0));

            // Laplace smoothing individually
            const pShort = (successesShort + this.alpha) / (totalShort + 2 * this.alpha);
            const pLong = (successesLong + this.alpha) / (totalLong + 2 * this.alpha);

            // Blend: if short sample is small, give it more weight (smallSampleWeight closer to 1 favors short)
            // but if short has many observations use balanced weighting
            const shortEffectiveWeight = (totalShort < shortW) ? smallSampleWeight : Math.min(0.9, 0.5 + (shortW / (totalShort + shortW)) * 0.4);

            return (shortEffectiveWeight * pShort) + ((1 - shortEffectiveWeight) * pLong);


        } catch (e) {
            // safe fallback
            return (this.alpha) / (1 + 2 * this.alpha);
        }
    }

    expectedValue(targetMultiplier, betAmount) {
        // EV = P * (m - 1) - (1 - P) * 1  (profit in units of bet amount)
        const p = this.empiricalProbability(targetMultiplier);
        const gainIfWin = (targetMultiplier - 1);
        const evPerUnit = p * gainIfWin - (1 - p);
        // FIX: Return sampleSize so RecoveryManager validates the data correctly
        return {
            p,
            evPerUnit,
            evAbsolute: evPerUnit * betAmount,
            sampleSize: this.window
        };
    }
}

class PatternMatcher {
    constructor(historySize = 1000) {
        this.historySize = historySize;
        this.patterns = {}; // Map of "L-H-L" -> { nextH: 5, nextL: 10 }
        this.tokens = [];   // Stream of 'H' (High) and 'L' (Low)
    }

    // Convert multiplier to token
    _tokenize(crash) {
        return crash >= 2.0 ? 'H' : 'L';
    }

    feed(crash) {
        const token = this._tokenize(crash);
        this.tokens.push(token);
        if (this.tokens.length > this.historySize) this.tokens.shift();
    }

    // Look back 3 rounds and predict next
    getPrediction(crashes) {
        // Need at least 4 rounds to form a 3-gram + prediction
        if (crashes.length < 4) return null;

        // 1. Build current context from recent crashes
        const recent = crashes.slice(-3).map(c => this._tokenize(c)); // e.g. ['L', 'H', 'L']
        const key = recent.join('-'); // "L-H-L"

        // 2. Scan internal memory for this key
        // (We rebuild memory dynamically from the passed crash array to ensure sync)
        const memory = {};
        const tokens = crashes.map(c => this._tokenize(c));

        // Simple N-Gram scanner
        for (let i = 0; i < tokens.length - 3; i++) {
            const gram = tokens.slice(i, i+3).join('-');
            const next = tokens[i+3];

            if (!memory[gram]) memory[gram] = { H: 0, L: 0, total: 0 };
            memory[gram][next]++;
            memory[gram].total++;
        }

        const match = memory[key];
        if (!match || match.total < 3) return null; // Not enough data

        const probH = match.H / match.total;

        // Detect strong pattern (e.g. > 70% probability)
        if (probH > 0.7) return { direction: 'HIGH', confidence: probH, pattern: key };
        if (probH < 0.3) return { direction: 'LOW', confidence: 1 - probH, pattern: key };

        return { direction: 'NEUTRAL', confidence: 0.5, pattern: key };
    }
}

// ========================================
// Proactive Market Regime Detector
// This class implements the advanced state-based detection.
// ========================================
class MarketRegimeDetector {
    constructor(stats, logger, config) {
        this.stats = stats;
        this.logger = logger;
        const rawCfg = (config && config.config) ? config.config : (config || {});
        // Bind to the new HYDRA_STRATEGY block
        this.cfg = (rawCfg && rawCfg.HYDRA_STRATEGY) || {};
    }

    // V10 Hydra Analysis
    analyze(crashes, targetMultiplier, debtBits = 0, baseBetBits = 1, patternMatcher = null) {
        // 1. Data Safety
        if (!crashes || crashes.length < 12) return { state: 'WARMUP', confidence: 0.0, reason: "Collecting data" };

        const cfg = this.cfg || {}; // Maps to HYDRA_STRATEGY now
        const target = targetMultiplier || 2.0;
        const lastCrash = crashes[crashes.length - 1];

        // --- Helper: Calculate Slope ---
        const calcSlope = (data) => {
            let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
            const n = data.length;
            for (let i = 0; i < n; i++) {
                sumX += i;
                sumY += data[i];
                sumXY += i * data[i];
                sumXX += i * i;
            }
            return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        };

        // --- 1. TOXIC TRAIN DETECTION (Defense Priority #1) ---
        const toxicThresh = cfg.TOXIC_MULTIPLIER_THRESHOLD || 1.20;
        const toxicCount = cfg.TOXIC_CONSECUTIVE_COUNT || 3;
        const instantHistory = crashes.slice(-toxicCount);
        const isToxic = instantHistory.every(c => c < toxicThresh);

        if (isToxic) {
            return {
                state: 'TOXIC_TRAIN',
                confidence: 0.0,
                reason: `BUNKER: ${toxicCount} consecutive crashes < ${toxicThresh}x`
            };
        }

        // --- 2. WHALE WAKE (Volatility Safety) ---
        const whaleThresh = cfg.WHALE_MULTIPLIER_THRESHOLD || 100.0;
        if (lastCrash >= whaleThresh) {
            // Check context: If we were in a Rally (Green history), we ride it. If Bearish, we pause.
            const prev3 = crashes.slice(-4, -1);
            const wasBullish = prev3.every(c => c >= 2.0);
            if (!wasBullish) {
                return { state: 'WHALE_WAKE', confidence: 0.0, reason: `Volatility: ${lastCrash}x outlier detected.` };
            }
        }

        // --- 3. RALLY (Trend) - Dynamic Momentum Scoring ---
        const momentumWindow = crashes.slice(-5);
        let momentumScore = 0;

        momentumWindow.forEach(c => {
            if (c >= (cfg.WHALE_MULTIPLIER_THRESHOLD || 100)) momentumScore += (cfg.RALLY_MASSIVE_ADD || 2.0); // Cap whale influence
            else if (c >= 5.0) momentumScore += (cfg.RALLY_MASSIVE_ADD || 2.0);
            else if (c >= 2.0) momentumScore += (cfg.RALLY_HIGH_ADD || 1.0);
            else if (c >= 1.80) momentumScore += (cfg.RALLY_NEAR_MISS_ADD || 0.5);
        });

        const slope = calcSlope(momentumWindow);
        if (slope > 0.05) momentumScore += (cfg.RALLY_SLOPE_BONUS || 0.5);

        const rallyThresh = cfg.RALLY_MOMENTUM_THRESHOLD || 2.5;

        if (momentumScore >= rallyThresh) {
            return {
                state: 'RALLY',
                confidence: 0.85,
                reason: `High Momentum: Score ${momentumScore} (Thresh ${rallyThresh})`
            };
        }

        // --- 4. PING_PONG (Alternation) ---
        const history6 = crashes.slice(-6);
        let flips = 0;
        for(let i = 1; i < history6.length; i++) {
            const prevH = history6[i-1] >= 2.0;
            const currH = history6[i] >= 2.0;
            if (prevH !== currH) flips++;
        }
        if (flips >= (cfg.PING_PONG_FLIPS || 4)) {
            // Predict NEXT: If last was LOW, we expect HIGH.
            const lastIsLow = lastCrash < 2.0;
            if (lastIsLow) {
                return { state: 'PING_PONG', confidence: 0.90, reason: `Alternation: ${flips} flips. Last Low -> Bet High.` };
            } else {
                return { state: 'PING_PONG_WAIT', confidence: 0.0, reason: `Alternation: ${flips} flips. Last High -> Wait.` };
            }
        }

        // --- 5. OVERSOLD (Bounce) ---
        const oversoldHistory = crashes.slice(-(cfg.OVERSOLD_COUNT || 3));
        const isOversold = oversoldHistory.every(c => c < (cfg.OVERSOLD_MAX_MULT || 1.80) && c >= toxicThresh);
        if (isOversold) {
            return { state: 'OVERSOLD', confidence: 0.75, reason: 'Oversold: 3 consecutive safe lows.' };
        }

        // --- 6. CRAB (Sideways) Check ---
        // If volatility is low and average is < 2.0
        const shortAvg = crashes.slice(-10).reduce((a,b)=>a+b,0) / 10;
        if (shortAvg < (cfg.CRAB_UPPER_BOUND || 2.0) && shortAvg > 1.4) {
            const suggested = cfg.CRAB_LOWER_TARGET || 1.50;
            return {
                state: 'CRAB',
                confidence: 0.65,
                reason: `Sideways Market. Avg ${shortAvg.toFixed(2)}. Adjust Target -> ${suggested}x`,
                suggestedTarget: suggested
            };
        }

        // --- 7. CHAOS (Pattern Fallback) ---
        if (patternMatcher) {
            const prediction = patternMatcher.getPrediction(crashes);
            // If pattern confidence is high, we override Chaos
            if (prediction && prediction.direction === 'HIGH' && prediction.confidence >= (cfg.CHAOS_PATTERN_ACCURACY || 0.80)) {
                return {
                    state: 'CHAOS_SCALP',
                    confidence: prediction.confidence,
                    reason: `Chaos Pattern Match: ${prediction.pattern} -> HIGH (${(prediction.confidence*100).toFixed(0)}%)`
                };
            }
        }

        return { state: 'CHAOS', confidence: 0.10, reason: 'No clear regime detected.' };
    }
}

// ------------------------------
// NEW: InternalState + Bayesian + MAD helpers
// ------------------------------
class InternalStateManager {
    constructor(bot) {
        this.bot = bot;
        this.state = {
            regimeFlag: null,
            regimeScore: 0,
            consecutiveRecoveryLosses: 0,
            lastDecision: null,
            opportunisticUsed: false,
            immediateFollowup: false // NEW: The "Do It Now" flag
        };
    }

    incrConsecutiveRecoveryLosses() {
        this.state.consecutiveRecoveryLosses = (this.state.consecutiveRecoveryLosses || 0) + 1;
    }

    resetConsecutiveRecoveryLosses() {
        this.state.consecutiveRecoveryLosses = 0;
        this.state.opportunisticUsed = false;
    }

    // NEW: Set the flag to force a bet next round
    setImmediateFollowup(value) {
        this.state.immediateFollowup = !!value;
    }

    hasImmediateFollowup() {
        return !!this.state.immediateFollowup;
    }

    addDecision(decision) {
        this.state.lastDecision = decision;
    }

    // Helper for UI snapshot
    snapshot() {
        return this.state; // Return full state for UI inspection
    }
}

class BayesianPosterior {
    constructor(config) {
        this.config = config;
        this.map = {}; // key -> { a: wins, b: losses }
    }

    _key(mult) { return `m_${Number(mult).toFixed(2)}`; }

    addObservation(multiplier, isWin) {
        const key = this._key(multiplier);
        if (!this.map[key]) this.map[key] = { a: 1, b: 1 }; // Prior 1/1
        if (isWin) this.map[key].a++;
        else this.map[key].b++;
    }

    // Wilson Score Lower Bound (Conservative Probability)
    lowerBound(multiplier, conf = 0.95) {
        const key = this._key(multiplier);
        const r = this.map[key];
        if (!r) return 0.5;

        const n = r.a + r.b;
        const p = r.a / n;
        const z = 1.64; // Approx for 90-95%

        // Wilson Interval Lower Bound Formula
        const num = p + (z*z)/(2*n) - z * Math.sqrt((p*(1-p)/n) + (z*z)/(4*n*n));
        const den = 1 + (z*z)/n;
        return Math.max(0, num/den);
    }
}

class MADCalibrator {
    constructor(window = 25) {
        this.window = window;
        this.errors = [];
    }

    resize(newWindow) {
        this.window = Math.max(12, Math.min(48, newWindow));
    }

    addError(predictionConf, outcome) {
        // Error = Predicted_Prob - Actual_Outcome (1 or 0)
        this.errors.push(Math.abs(predictionConf - outcome));
        if (this.errors.length > this.window) this.errors.shift();
    }

    // Calculate Median Absolute Deviation
    getUncertainty() {
        if (this.errors.length < 5) return 0.1; // Default uncertainty during warmup

        const sorted = [...this.errors].sort((a,b) => a-b);
        const median = sorted[Math.floor(sorted.length/2)];

        // Robust Uncertainty = Median Error (Simple MAD proxy for this context)
        return median;
    }
}

class EnsemblePredictionEngine {
    constructor(config, stats, logger, botApi = {}) {
        this.config = config;
        this.stats = stats;
        this.logger = logger;
        // store small API injected by CrashBot (or other caller)
        this.botApi = botApi || {};
        this.regimeDetector = new MarketRegimeDetector(this.stats, this.logger, this.config);
        this.patternMatcher = new PatternMatcher();
        // convenience alias: allow older code to access this.bot (may be null)
        this.bot = (this.botApi && this.botApi._fullBotRef) ? this.botApi._fullBotRef : ((this.botApi && this.botApi.bot) || null);
        this.patternSkips = 0;
        // prefer injected AI / EV if provided via botApi, otherwise create defaults
        this.ai = (this.botApi && this.botApi.ai) ? this.botApi.ai : new AIPredictor(config);
        this.ev = (this.botApi && this.botApi.evModule) ? this.botApi.evModule : new EVModule(stats);
        // observationRounds now configurable
        try {
            const raw = (this.config && this.config.config) ? this.config.config : (this.config || {});
            const eCfg = (raw.ENSEMBLE || {});
            this.observationRounds = Number.isFinite(Number(eCfg.OBSERVATION_ROUNDS)) ? Number(eCfg.OBSERVATION_ROUNDS) : 3;
        } catch (e) {
            this.observationRounds = 3;
        }
        // adaptive module accuracy stats (simple online counters)
        try {
            const raw = (this.config && this.config.config) ? this.config.config : (this.config || {});
            const eCfg = (raw.ENSEMBLE || {});
            this.moduleStats = (eCfg.MODULE_STATS_INIT) ? eCfg.MODULE_STATS_INIT : {
                pattern: {correct: 1, total: 2},
                ev: {correct: 1, total: 2},
                ai: {correct: 1, total: 2}
            };
        } catch (e) {
            this.moduleStats = {
                pattern: {correct: 1, total: 2},
                ev: {correct: 1, total: 2},
                ai: {correct: 1, total: 2}
            };
        }
        this.lastDecisionSignals = null; // store last decision signals to update accuracy after crash

        // initial weights (defensive: supports ConfigManager or plain object shapes)
        try {
            const raw = (this.config && this.config.config) ? this.config.config : (this.config || {});
            const init = (raw.ENSEMBLE && raw.ENSEMBLE.INIT_WEIGHTS) ? raw.ENSEMBLE.INIT_WEIGHTS : (raw.ensemble && raw.ensemble.initWeights) || {};
            this.weights = {
                pattern: Number.isFinite(Number(init.pattern)) ? Number(init.pattern) : 0.35,
                ev: Number.isFinite(Number(init.ev)) ? Number(init.ev) : 0.35,
                ai: Number.isFinite(Number(init.ai)) ? Number(init.ai) : 0.30
            };
        } catch (e) {
            this.weights = {pattern: 0.35, ev: 0.35, ai: 0.30};
        }
    }

    reset() {
        this.patternSkips = 0;
        if (this.ai) this.ai.weights = null;
    }

    _ensureModuleStats() {
        this.moduleStats = this.moduleStats || {
            pattern: {correct: 1, total: 2},
            ev: {correct: 1, total: 2},
            ai: {correct: 1, total: 2}
        };
    }

    // Add inside class EnsemblePredictionEngine { ... }
    // A defensive, drop-in helper that uses this.weights (INIT_WEIGHTS) and moduleStats
    getWeightedEnsemble(signals = {}) {
        // defensive read of configured initial weights (works with ConfigManager or plain object)
        const raw = (this.config && this.config.config) ? this.config.config : (this.config || {});
        const init = (raw.ENSEMBLE && raw.ENSEMBLE.INIT_WEIGHTS) ? raw.ENSEMBLE.INIT_WEIGHTS : (raw.ensemble && raw.ensemble.initWeights) || {};
        // use this.weights if already set (more authoritative), else fall back to init or defaults
        const configured = (this.weights && (typeof this.weights.pattern === 'number')) ? this.weights : {
            pattern: Number.isFinite(Number(init.pattern)) ? Number(init.pattern) : 0.35,
            ev: Number.isFinite(Number(init.ev)) ? Number(init.ev) : 0.35,
            ai: Number.isFinite(Number(init.ai)) ? Number(init.ai) : 0.30
        };

        // normalize weights (so authors can set absolute values, not necessarily sum to 1)
        const rawSum = (Number(configured.pattern) || 0) + (Number(configured.ev) || 0) + (Number(configured.ai) || 0);
        const sum = (rawSum <= 0) ? 1 : rawSum;
        const w = {
            pattern: (Number(configured.pattern) || 0) / sum,
            ev: (Number(configured.ev) || 0) / sum,
            ai: (Number(configured.ai) || 0) / sum
        };

        // get signal values (assume signals are probabilities in 0..1)
        const pSig = (signals.pattern != null) ? Number(signals.pattern) : 0;
        const eSig = (signals.ev != null) ? Number(signals.ev) : 0;
        const aSig = (signals.ai != null) ? Number(signals.ai) : 0;

        // apply reliability derived from moduleStats (simple correct/total ratio)
        // floor reliability to avoid completely zeroing an expert
        const getRel = (k) => {
            try {
                // defensive read of ensemble config (support both shapes)
                const rawCfgLocal = (this.config && this.config.config) ? this.config.config : (this.config || {});
                const eCfgLocal = (rawCfgLocal.ENSEMBLE || rawCfgLocal.ensemble) || {};

                const relFloor = Number.isFinite(Number(eCfgLocal.RELIABILITY_FLOOR)) ? Number(eCfgLocal.RELIABILITY_FLOOR) : 0.25;
                const relCeil = Number.isFinite(Number(eCfgLocal.RELIABILITY_CEIL)) ? Number(eCfgLocal.RELIABILITY_CEIL) : 1.25;
                const hysteresis = Number.isFinite(Number(eCfgLocal.HYSTERESIS)) ? Number(eCfgLocal.HYSTERESIS) : 0.03;
                const minObsAcc = Number.isFinite(Number(eCfgLocal.MIN_OBSERVED_ACCURACY_FOR_WEIGHT_CHANGE)) ? Number(eCfgLocal.MIN_OBSERVED_ACCURACY_FOR_WEIGHT_CHANGE) : 0.52;

                const s = (this.moduleStats && this.moduleStats[k]) ? this.moduleStats[k] : {correct: 1, total: 2};
                const rawAcc = (Number(s.correct || 0) / Math.max(1, Number(s.total || 1)));

                // If observed accuracy is below the minimum observed accuracy threshold,
                // avoid flipping reliability — prefer previously-known reliability if present.
                if (rawAcc < minObsAcc && this._lastReliabilities && typeof this._lastReliabilities[k] !== 'undefined') {
                    return this._lastReliabilities[k];
                }

                // clamp into configured floor/ceil
                const unclamped = rawAcc;
                let newRel = Math.max(relFloor, Math.min(relCeil, unclamped));

                // apply small hysteresis to avoid oscillation
                this._lastReliabilities = this._lastReliabilities || {};
                const prev = (typeof this._lastReliabilities[k] !== 'undefined') ? this._lastReliabilities[k] : newRel;
                if (Math.abs(newRel - prev) < hysteresis) {
                    // change is insignificant — keep previous
                    newRel = prev;
                }

                this._lastReliabilities[k] = newRel;
                return newRel;
            } catch (e) {
                return 0.25;
            }
        };

        const rel = {pattern: getRel('pattern'), ev: getRel('ev'), ai: getRel('ai')};

        // Combine: weighted & reliability-adjusted average
        // use a normalization factor so result remains in [0,1] roughly consistent
        const weightedPattern = pSig * w.pattern * rel.pattern;
        const weightedEv = eSig * w.ev * rel.ev;
        const weightedAi = aSig * w.ai * rel.ai;

        const denom = (w.pattern * rel.pattern) + (w.ev * rel.ev) + (w.ai * rel.ai) || 1;

        const ensembleProb = (weightedPattern + weightedEv + weightedAi) / denom;

        return {
            ensembleProb: Math.max(0, Math.min(1, ensembleProb)), // clamp just in case
            breakdown: {
                weights: w,
                reliability: rel,
                contributions: {
                    pattern: weightedPattern,
                    ev: weightedEv,
                    ai: weightedAi
                },
                denom
            }
        };
    }

    // ===== Market-regime helpers & follow-up scheduler =====
    getCrashArray() {
        // Return numeric crash multipliers newest-last (wraps StatsTracker)
        const marketCfg = (typeof this.bot.getMarketCfg === 'function') ? (this.bot.getMarketCfg() || {}) : ((this.config && this.config.config && this.config.config.MARKET) ? this.config.config.MARKET : (this.config && this.config.MARKET) ? this.config.MARKET : {});
        const longWindow = Number.isFinite(Number(marketCfg.LONG_WINDOW)) ? Number(marketCfg.LONG_WINDOW) : 100;
        return (this.stats && typeof this.stats.getRecentCrashes === 'function') ? this.stats.getRecentCrashes(Math.max(longWindow, 100)) : [];
    }

    // Update module accuracy counters after a round (call at end of round)
    updateModuleAccuracy(crashValue, signals = {}) {
        if (!signals) return;
        this._ensureModuleStats();
        // defensive raw config accessor: works when `this.config` is ConfigManager or plain object
        const _raw = (this.config && this.config.config) ? this.config.config : (this.config || {});
        const _marketCfg = (_raw.MARKET || _raw.market) || {};
        const actualHigh = (Number(crashValue) >= (Number.isFinite(Number(_marketCfg.HIGH_CRASH_MULTIPLIER)) ? Number(_marketCfg.HIGH_CRASH_MULTIPLIER) : 1.7)) ? 1 : 0;
        ['pattern', 'ev', 'ai'].forEach(k => {
            const s = signals[k];
            if (typeof s === 'undefined') return;
            const pred = (s > 0.5) ? 1 : 0;
            this.moduleStats[k].total = (this.moduleStats[k].total || 0) + 1;
            if (pred === actualHigh) this.moduleStats[k].correct = (this.moduleStats[k].correct || 0) + 1;
            // decay totals to keep bounded
            // Defensive ensemble config read (works when this.config is ConfigManager or plain object)
            const _raw = (this.config && this.config.config) ? this.config.config : (this.config || {});
            const _ensembleCfg = _raw.ENSEMBLE || {};
            const window = Number.isFinite(Number(_ensembleCfg.RECENT_ACCURACY_WINDOW)) ? Number(_ensembleCfg.RECENT_ACCURACY_WINDOW) : 200;
            if (this.moduleStats[k].total > window) {
                this.moduleStats[k].correct *= 0.92;
                this.moduleStats[k].total *= 0.92;
            }
        });
    }

    // Mode-aware: allow passing the multiplier that defines "high crash".
    // If highCrashMultiplier is omitted, fall back to canonical MARKET.HIGH_CRASH_MULTIPLIER.
    computeHighCrashProb(crashes, windowSize, highCrashMultiplier) {
        if (!Array.isArray(crashes) || crashes.length === 0) return 0;
        const arr = crashes.slice(-Math.max(0, Math.floor(windowSize || 0)));
        if (arr.length === 0) return 0;

        // Use passed multiplier when provided, otherwise fall back to MARKET.HIGH_CRASH_MULTIPLIER
        // Prefer canonical market accessor when on the Bot instance
        const marketCfg = (typeof this.getMarketCfg === 'function') ? (this.getMarketCfg() || {}) : ((this.config && this.config.config && this.config.config.MARKET) ? this.config.config.MARKET : (this.config && this.config.MARKET) ? this.config.MARKET : {});
        const highMult = (typeof highCrashMultiplier === 'number' && Number.isFinite(highCrashMultiplier))
            ? Number(highCrashMultiplier)
            : (Number.isFinite(Number(marketCfg.HIGH_CRASH_MULTIPLIER)) ? Number(marketCfg.HIGH_CRASH_MULTIPLIER) : 2.09);

        const highCount = arr.reduce((s, c) => s + ((Number(c) || 0) >= highMult ? 1 : 0), 0);
        return highCount / arr.length;
    }

    estimateMarketRegime(highCrashMultiplier) {
        // Make regime estimation use the mode-specific multiplier when provided.
        const crashes = this.getCrashArray();
        // Prefer canonical MARKET accessor when available; fallback to raw config shape
        const marketCfg = (typeof this.getMarketCfg === 'function') ? (this.getMarketCfg() || {}) : ((this.config && this.config.config && this.config.config.MARKET) ? this.config.config.MARKET : (this.config && this.config.MARKET) ? this.config.MARKET : {});
        const shortW = Math.min((Number.isFinite(Number(marketCfg.SHORT_WINDOW)) ? Number(marketCfg.SHORT_WINDOW) : 20), crashes.length) || 0;
        const longW = Math.min((Number.isFinite(Number(marketCfg.LONG_WINDOW)) ? Number(marketCfg.LONG_WINDOW) : 100), crashes.length) || shortW;

        const shortProb = this.computeHighCrashProb(crashes, shortW || 1, highCrashMultiplier);
        const longProb = this.computeHighCrashProb(crashes, longW || Math.max(1, shortW), highCrashMultiplier);

        // Decide whether current short-term window looks like a "high-crash" regime.
        // Use MARKET.* thresholds from marketCfg defensively (fall back to defaults if missing).
        const shortVsLongDelta = Number.isFinite(Number(marketCfg.SHORT_VS_LONG_DELTA)) ? Number(marketCfg.SHORT_VS_LONG_DELTA) : 0.05;
        const placeProbThreshold = Number.isFinite(Number(marketCfg.PLACE_PROB_THRESHOLD)) ? Number(marketCfg.PLACE_PROB_THRESHOLD) : 0.45;
        const isHigh = (shortProb > longProb + shortVsLongDelta) || (shortProb >= placeProbThreshold);
        return {shortProb, longProb, isHigh};
    }

    projectedHighCrashProbability(nextK = 3, highCrashMultiplier) {
        // Projects probability that at least one "high crash" >= highCrashMultiplier will occur in next `nextK` rounds.
        // This version places more emphasis on very recent momentum and makes nextK=1 projections especially
        // sensitive so the ensemble can preempt imminent highs.
        try {
            nextK = Math.max(1, Math.floor(Number(nextK) || 1));

            // market config (with safe fallbacks)
            const marketCfg = (typeof this.getMarketCfg === 'function') ? (this.getMarketCfg() || {}) :
                ((this.config && this.config.config && this.config.config.MARKET) ? this.config.config.MARKET :
                    (this.config && this.config.MARKET ? this.config.MARKET : {}));

            const crashes = (typeof this.getCrashArray === 'function') ? this.getCrashArray() : (this.stats && typeof this.stats.getAllCrashes === 'function' ? this.stats.getAllCrashes() : []);
            const shortW = Math.max(1, Math.min((Number.isFinite(Number(marketCfg.SHORT_WINDOW)) ? Number(marketCfg.SHORT_WINDOW) : 20), crashes.length));

            // base short-term probability from regime estimate
            const regime = (typeof this.estimateMarketRegime === 'function') ? this.estimateMarketRegime(highCrashMultiplier) : {};
            const shortProb = (regime && Number.isFinite(Number(regime.shortProb))) ? Number(regime.shortProb) : 0;

            // compute momentum = proportion of recent rounds >= highMult
            const lastK = Math.min(shortW, Math.max(1, Math.min(nextK, 6))); // cap recent lookback for momentum
            const recent = crashes.slice(-lastK);
            let recentHighCount = 0;
            const highMult = (typeof highCrashMultiplier === 'number' && Number.isFinite(highCrashMultiplier))
                ? Number(highCrashMultiplier)
                : (Number.isFinite(Number(marketCfg.HIGH_CRASH_MULTIPLIER)) ? Number(marketCfg.HIGH_CRASH_MULTIPLIER) : 1.7);
            for (let i = 0; i < recent.length; i++) if (Number(recent[i] || 0) >= highMult) recentHighCount++;
            const momentum = (recent.length > 0) ? (recentHighCount / recent.length) : 0;

            // read momentumWeight from config, fallback to default 0.65 (more proactive)
            const baseMomentumWeight = Number.isFinite(Number(marketCfg.MOMENTUM_WEIGHT)) ? Number(marketCfg.MOMENTUM_WEIGHT) : 0.65;

            // give extra weight to momentum when nextK is small — especially nextK==1 (preempt)
            // compute dynamic weight: base + (1/nextK)*extra, clamp <= 0.95
            const extraForSmallK = 0.25; // extra boost for immediate projection
            const momentumWeight = Math.max(0, Math.min(0.95, baseMomentumWeight + ((1 / nextK) * extraForSmallK)));

            // combine shortProb and momentum using the dynamic weight
            const combinedP = Math.max(0, Math.min(1, (1 - momentumWeight) * Math.max(0, shortProb - 0.01) + momentumWeight * momentum));

            // probability at least one in nextK rounds
            const pAtLeastOne = 1 - Math.pow(1 - combinedP, nextK);
            return Math.max(0, Math.min(1, pAtLeastOne));
        } catch (e) {
            // defensive: log if logger exists
            try {
                if (this.logger) this.logger.log && this.logger.log(`projectedHighCrashProbability error: ${e && e.message}`, 'error');
            } catch (_) {
            }
            return 0;
        }
    }

    // getRecoveryRegimeProb: projected probability for at least one "high" crash at targetMult in nextK rounds
    // getRecoveryRegimeProb (config-driven; no hardcoded defaults)
    // Defensive wrapper: returns probability [0..1] that a high crash >= multiplier occurs in next `nextK` rounds.
    getRecoveryRegimeProb(targetMultiplier = null, nextK = 3) {
        try {
            const tm = (Number.isFinite(Number(targetMultiplier)) && Number(targetMultiplier) > 1) ? Number(targetMultiplier) : Number(this.getCanonicalRecoveryMultiplier());
            if (!Number.isFinite(tm) || tm <= 1) {
                if (this.logger) this.logger.log('getRecoveryRegimeProb: invalid targetMultiplier -> returning 0', 'warn');
                return 0;
            }
            if (typeof this.projectedHighCrashProbability === 'function') {
                const p = Number(this.projectedHighCrashProbability(Math.max(1, Math.floor(Number(nextK) || 3)), tm) || 0);
                return Math.max(0, Math.min(1, p));
            }
            // Fallback: try estimateMarketRegime if available
            if (typeof this.estimateMarketRegime === 'function') {
                const r = this.estimateMarketRegime(tm) || {};
                return Math.max(0, Math.min(1, Number(r.shortProb || 0)));
            }
            return 0;
        } catch (e) {
            if (this.logger) this.logger.log(`getRecoveryRegimeProb error: ${e && e.message}`, 'error');
            return 0;
        }
    }

    // Record and publish unified decision so the "lastUnifiedDecision" property is not unused.
    // This helper centralizes any side-effects (timestamping, UI updates on deny, debug logs).
    _recordUnifiedDecision(decision) {

        try {
            // store decision (so other modules / UI can read it later)
            this.lastUnifiedDecision = decision;
            this.lastUnifiedDecisionAt = Date.now();

            // Only show SKIP on the panel when the decision denies — avoid showing SKIP
            // prematurely before a downstream placement might succeed.
            if (decision && decision.allow === false) {
                try {
                    if (typeof this.bot.updatePanel === 'function') {
                        // include reason so UI shows a helpful message
                        this.bot.updatePanel(false, `SKIP: ${decision.reason || 'denied'}`);
                    }
                } catch (e) { /* intentionally swallow UI update errors */
                }
            }

            // Helpful debug log (non-fatal)
            try {

                if (this.logger && typeof this.logger.log === 'function') {

                    // READ the stored properties here so the assignments are "used" (avoids linter warning).

                    const stored = this.lastUnifiedDecision;

                    const storedAt = this.lastUnifiedDecisionAt;
                    const atStr = storedAt ? new Date(storedAt).toISOString() : 'n/a';

                    this.logger.log(`Recorded unified decision: allow=${!!(stored && stored.allow)} reason=${(stored && stored.reason) || 'n/a'} at=${atStr}`, 'info');

                }

            } catch (e) { /* ignore */
            }

            // --- if the unified decision ALLOWS a normal-mode placement, ensure an EV-request is scheduled ---
            // This ensures the BettingGateController sees a pendingEvRequest and can open the gate
            // (only schedule when none exists yet and only in NORMAL mode when EV gating is enabled).
            try {
                const dec = this.lastUnifiedDecision || {};
                // Auto-schedule behaviour:
                // - keep existing NORMAL auto-scheduling (if normal.useEV is enabled)
                // - add RECOVERY scheduling / proactive follow-ups that respect recovery config flags

                const isNormalMode = (this.bot.mode && String(this.bot.mode).toUpperCase() === 'NORMAL');
                const isRecoveryMode = (this.bot.mode  && String(this.bot.mode).toUpperCase() === 'RECOVERY');
                const cfgUseEV = !!(this.config && this.config.normal && this.config.normal.useEV);

                // --- NORMAL auto-schedule (unchanged behaviour) ---
                if (dec && dec.allow && isNormalMode && cfgUseEV && !this.pendingEvRequest) {
                    let normalBits;
                    try {
                        normalBits = (typeof this.bot.getNormalBaseBetBits === 'function') ? Number(this.bot.getNormalBaseBetBits()) : (this.config && this.config.normal && Number.isFinite(this.config.normal.baseBetBits) ? Number(this.config.normal.baseBetBits) : 0);
                    } catch (er) {
                        normalBits = 0;
                    }
                    const amountSat = Number(normalBits || 0) * 100;
                    // Use canonical normal multiplier ONLY via getNormalMultiplier()
                    let multiplier = Number(this.bot.getNormalMultiplier());
                    if (!Number.isFinite(multiplier)) multiplier = null;

                    const evReq = {
                        mode: 'NORMAL',
                        amountSat: amountSat,
                        multiplier: multiplier,
                        meta: {reason: dec.reason || 'unified-allow'}
                    };

                    try {
                        this.bot.requestEvBet && typeof this.bot.requestEvBet === 'function' ? this.bot.requestEvBet(evReq) : (this.pendingEvRequest = evReq);
                        try {
                            if (this.logger) this.logger.log(`Auto-scheduled EV request (NORMAL): amt=${Math.round(amountSat / 100)} bits mult=${multiplier}`, 'info');
                        } catch (e) {
                        }
                    } catch (e) {
                        try {
                            if (this.logger) this.logger.log(`⚠️ Auto schedule EV request failed: ${e && e.message}`, 'warning');
                        } catch (e) {
                        }
                    }
                }

                // --- RECOVERY: proactive follow-ups scheduling (config-aware) ---
                // If the system is in RECOVERY mode and the recovery followUp block is enabled,
                // schedule a recovery EV request or mark pending follow-ups.
                try {
                    const recRoot = (this.config && this.config.recovery) ? this.config.recovery : null;
                    const followCfg = (recRoot && recRoot.followUp) ? recRoot.followUp : null;

                    // Only attempt recovery followups when DECISION allowed and followups are enabled in config
                    const followEnabled = !!(followCfg && followCfg.enabled);
                    const proactive = !!(recRoot && typeof recRoot.proactiveFollowUpsEnabled !== 'undefined' ? recRoot.proactiveFollowUpsEnabled : true);

                    if (dec && dec.allow && isRecoveryMode && followEnabled && proactive) {
                        // Optionally require "joint EV & ensemble" approval before scheduling followups
                        const requireJoint = !!(recRoot && recRoot.recoveryRequireJointEVAndEnsemble);

                        // minimum confidence required for scheduling followup (fallback to 0.70)
                        const minConf = (recRoot && recRoot.EVsettings && Number.isFinite(Number(recRoot.EVsettings.recoveryMinConfidenceForFollowup)))
                            ? Number(recRoot.EVsettings.recoveryMinConfidenceForFollowup)
                            : 0.70;

                        // check lastUnifiedDecision to inspect ensemble confidence / evVote
                        const lastDec = this.lastUnifiedDecision || dec || {};
                        let evOk = !!(lastDec.evVote || dec.evVote); // Use 'let' so it can be modified
                        const confVal = Number(lastDec.confidence || dec.confidence || 0);

                        // CONFIG-DRIVEN: consult MARKET thresholds & fallback multipliers before scheduling recovery followups
                        try {
                            // defensive config access
                            const rawCfg = (this.config && this.config.config) ? this.config.config : (this.config || {});
                            const marketCfg = (rawCfg.MARKET || rawCfg.market) || {};
                            // follow thresholds is an array e.g. [0.58, 0.54, 0.49, 0.44]
                            const followThresholds = Array.isArray(marketCfg.FOLLOWUP_PLACE_THRESHOLDS) ? marketCfg.FOLLOWUP_PLACE_THRESHOLDS : [0.58, 0.54, 0.49, 0.44];

                            // track attempts so threshold becomes more permissive/lenient per attempt (persist locally in engine)
                            this.followUpAttempts = (this.followUpAttempts || 0);
                            const attemptIndex = Math.min(this.followUpAttempts, followThresholds.length - 1);
                            const requiredConf = Number.isFinite(Number(followThresholds[attemptIndex])) ? Number(followThresholds[attemptIndex]) : followThresholds[attemptIndex];

                            // read recovery config and EVsettings
                            const recRootLocal = (this.config && this.config.recovery) ? this.config.recovery : {};
                            const recEVsettingsLocal = (recRootLocal && recRootLocal.EVsettings) ? recRootLocal.EVsettings : {};

                            // respect recoveryMaxFollowupDepth when present (EVsettings override or fallback to followCfg.maxCount)
                            const maxFollowups = Number.isFinite(Number(recEVsettingsLocal.recoveryMaxFollowupDepth))
                                ? Number(recEVsettingsLocal.recoveryMaxFollowupDepth)
                                : ((followCfg && Number.isFinite(Number(followCfg.maxCount))) ? Number(followCfg.maxCount) : 1);

                            if (Number.isFinite(maxFollowups) && this.followUpAttempts >= maxFollowups) {
                                try {
                                    this.logger && this.logger.log && this.logger.log(`Recovery follow-up blocked: reached maxFollowups=${maxFollowups}`, 'info');
                                } catch (_) {
                                }
                            } else {

                                // projection relax / strong deltas to allow slightly looser thresholds on repeated attempts
                                const projRelax = Number.isFinite(Number(recRootLocal.projRelaxDelta)) ? Number(recRootLocal.projRelaxDelta) : 0.035;
                                const projStrong = Number.isFinite(Number(recRootLocal.projStrongDelta)) ? Number(recRootLocal.projStrongDelta) : 0.10;

                                // decrease requiredConf by projRelax on subsequent attempts (but keep >= 0)
                                const requiredConfAdjusted = (this.followUpAttempts > 0)
                                    ? Math.max(0, requiredConf - projRelax)
                                    : requiredConf;

                                // +++ USE projStrong +++
                                // If confidence is very strong, consider the EV vote passed
                                if (confVal > projStrong) {
                                    evOk = true;
                                }

                                // If requireJoint is set we still require both checks. If requireJoint is true but EV check failed we skip.
                                // If requireJoint is set we still require both checks. Proactive EV scheduling removed:
                                // follow-ups must be created via config.recovery.followUp authoritative path elsewhere.

                                // +++ USE requiredConfAdjusted +++
                                if (requireJoint && (!evOk || confVal < requiredConfAdjusted)) {

                                    try {
                                        // Log why we are *not* scheduling a proactive followup here.
                                        if (this.logger && typeof this.logger.log === 'function') {
                                            this.logger.log(`Recovery follow-up SKIPPED here: requireJointEVAndEnsemble=true but EV/ensemble checks failed (evVote=${evOk}, conf=${confVal} < ${requiredConfAdjusted}). Proactive scheduling disabled.`, 'info');
                                        }
                                    } catch (_) { /* swallow */ }

                                } else {
                                    try {
                                        // Proactive recovery EV scheduling was intentionally removed.
                                        // All follow-ups will be scheduled only by the authoritative
                                        // config.recovery.followUp path (handled later in this method).
                                        if (this.logger && typeof this.logger.log === 'function') {
                                            this.logger.log('Info: proactive recovery EV scheduling disabled — follow-ups are only created via config.recovery.followUp', 'debug');
                                        }
                                    } catch (_) { /* swallow */ }
                                }
                            }
                        } catch (e) {
                            // fallback to original unconditional scheduling if config logic fails
                            try {
                                const recBits = Number.isFinite(Number(this.config && this.config.baseBetBits)) ? Number(this.config.baseBetBits) : ((recRoot && recRoot.baseBetBits) ? recRoot.baseBetBits : 1);

                                // +++ USE fallbackMultiplier IN FALLBACK +++
                                const rawCfg = (this.config && this.config.config) ? this.config.config : (this.config || {});
                                const marketCfg = (rawCfg.MARKET || rawCfg.market) || {};
                                const fallbackMultiplier = Number.isFinite(Number(marketCfg.FALLBACK_RISK_MULTIPLIER)) ? Number(marketCfg.FALLBACK_RISK_MULTIPLIER) : 0.6;
                                const followThresholds = Array.isArray(marketCfg.FOLLOWUP_PLACE_THRESHOLDS) ? marketCfg.FOLLOWUP_PLACE_THRESHOLDS : [0.58, 0.54, 0.49, 0.44];
                                const attemptIndex = Math.min(this.followUpAttempts || 0, followThresholds.length - 1);
                                const requiredConf = Number.isFinite(Number(followThresholds[attemptIndex])) ? Number(followThresholds[attemptIndex]) : followThresholds[attemptIndex];

                                let amountSat = Math.max(1, Math.floor(recBits)) * 100;
                                // If confidence is low, apply the fallback risk multiplier to the stake
                                if (confVal < requiredConf) {
                                    amountSat = Math.floor(amountSat * fallbackMultiplier);
                                }
                                // +++ END FALLBACK USAGE +++

                                const multiplier = (Number.isFinite(Number(recRoot && recRoot.multiplier)) ? Number(recRoot.multiplier) : (Number.isFinite(Number(this.config && this.config.targetMultiplier)) ? Number(this.config.targetMultiplier) : 2.0));
                                const evReq = {
                                    mode: 'RECOVERY',
                                    amountSat, // Use the (potentially modified) amountSat
                                    multiplier,
                                    meta: {reason: 'recovery-proactive-followup'}
                                };
                                try {
                                    this.bot.requestEvBet && typeof this.bot.requestEvBet === 'function' ? this.bot.requestEvBet(evReq) : (this.pendingEvRequest = evReq);
                                } catch (e2) {
                                    try {
                                        this.logger && this.logger.log(`Failed to schedule RECOVERY EV request: ${e2 && e2.message}`, 'warn');
                                    } catch (_) {
                                    }
                                }
                                try {
                                    this.logger && this.logger.log && this.logger.log(`Scheduled RECOVERY EV request (proactive followup, fallback): amt=${Math.round(amountSat / 100)} bits mult=${multiplier}`, 'info');
                                } catch (_) {
                                }
                            } catch (e2) { /* swallow */
                            }
                        }
                    } // end recovery followup conditions
                } catch (err) { /* swallow recovery followup scheduling errors — do not break decision flow */
                }
            } catch (err) { /* swallow scheduling errors — do not break decision flow */
            }

        } catch (e) {
            // Keep function safe — even decision recording should not throw
            try {
                this.logger && this.logger.log && this.logger.log(`_recordUnifiedDecision error: ${e && e.message}`, 'warn');
            } catch (e2) {
            }
        }

        return decision;
    }

    // Robust AI probability extractor (merged & enhanced).
    // Accepts multiplier (number) and optional context. Returns 0..1 (never throws).
    getAiProbability(multiplier, ctx = {}) {
        try {
            // 1) prefer engine-local ai, else bot-level ai, else botApi.ai
            const aiObj = this.ai || (this.bot && this.bot.ai) || (this.botApi && this.botApi.ai) || null;
            if (!aiObj) return 0;

            // keep defensive helper to clamp numbers to [0,1]
            const clamp01 = (v) => {
                const n = Number(v);
                if (!Number.isFinite(n)) return 0;
                return Math.min(Math.max(n, 0), 1);
            };

            // 2) Preferred: ai.predict(stats, multiplier)
            if (typeof aiObj.predict === 'function') {
                // try predict(stats, multiplier)
                try {
                    const maybe = aiObj.predict(this.stats, Number(multiplier));
                    const val = clamp01(maybe);
                    if (val > 0 || val === 0) return val;
                } catch (e) { /* fallthrough to other forms */
                }

                // try predict(multiplier) if previous call failed or returned non-finite
                try {
                    const maybe2 = aiObj.predict(Number(multiplier));
                    const val2 = clamp01(maybe2);
                    if (val2 > 0 || val2 === 0) return val2;
                } catch (e) { /* fallthrough */
                }
            }

            // 3) legacy method names: predictProbability, predictProb, getProbability, probability
            const legacy = ['predictProbability', 'predictProb', 'getProbability', 'probability', 'predict_prob'];
            for (const name of legacy) {
                if (typeof aiObj[name] === 'function') {
                    try {
                        const out = aiObj[name](Number(multiplier));
                        const v = clamp01(out);
                        if (v > 0 || v === 0) return v;
                    } catch (e) {
                    }
                }
            }

            // 4) some AI implementations store lastPrediction or lastProb as numeric fields
            if (typeof aiObj.lastPrediction === 'number') return clamp01(aiObj.lastPrediction);
            if (typeof aiObj.lastProb === 'number') return clamp01(aiObj.lastProb);
            if (typeof aiObj.probability === 'number') return clamp01(aiObj.probability);

            // 5) if botApi supplies a predict function, try it
            if (this.botApi && typeof this.botApi.getAiProbability === 'function') {
                try {
                    const v = this.botApi.getAiProbability(Number(multiplier), this.stats);
                    return clamp01(v);
                } catch (e) {
                }
            }

            return 0;
        } catch (e) {
            try {
                this.logger && this.logger.log && this.logger.log(`getAiProbability error: ${e && e.message}`, 'warn');
            } catch (_) {
            }
            return 0;
        }
    }

    // Canonical EV info getter (merged). Signature: (multiplier, prediction)
    // Returns { p: <0..1>, evPerUnit: <number>, evAbsolute: <number>, source: '<where>' }
    getEvInfo(multiplier, prediction = {}) {
        try {
            multiplier = Number(multiplier || (prediction && prediction.targetMultiplier) || 0);
            // defensively initialize result
            const fallback = {p: 0, evPerUnit: 0, evAbsolute: 0, source: 'none'};

            // 1) If caller supplied a prediction/ev object, prefer it (explicit signal)
            if (prediction) {
                // Accept fields named evP, p, evPerUnit, ev_unit, ev, prob
                const pCandidates = [prediction.evP, prediction.p, prediction.prob, prediction.probability];
                const evCandidates = [prediction.evPerUnit, prediction.ev_unit, prediction.ev, prediction.evPerBet];
                const pVal = pCandidates.find(x => typeof x === 'number' && Number.isFinite(x));
                const evVal = evCandidates.find(x => typeof x === 'number' && Number.isFinite(x));
                if (typeof pVal === 'number' || typeof evVal === 'number') {
                    return {
                        p: typeof pVal === 'number' ? Math.min(Math.max(pVal, 0), 1) : 0,
                        evPerUnit: typeof evVal === 'number' ? evVal : 0,
                        evAbsolute: (typeof evVal === 'number' ? evVal * (this.config && this.config.baseBetBits ? (this.config.baseBetBits * 100) : 100) : 0),
                        source: 'prediction'
                    };
                }
            }

            // 2) Ask injected EV module on engine or bot (different projects expose different APIs)
            const evModule = this.ev || (this.bot && (this.bot.evModule || this.bot.ev)) || (this.botApi && this.botApi.evModule) || null;

            if (evModule) {
                // try a few common EV API shapes defensively
                try {
                    // a) evModule.expectedValue(multiplier, stake) -> { p, evPerUnit, evAbsolute } or number
                    if (typeof evModule.expectedValue === 'function') {
                        const baseSat = (typeof this.config.getBaseBetSat === 'function') ? Number(this.config.getBaseBetSat()) :
                            ((this.bot && typeof this.bot.getBaseBetSat === 'function') ? Number(this.bot.getBaseBetSat()) : ((this.config && this.config.baseBetBits) ? this.config.baseBetBits * 100 : 100));
                        const res = evModule.expectedValue(multiplier, baseSat);
                        if (res && typeof res === 'object') {
                            return {
                                p: (typeof res.p === 'number' ? Math.min(Math.max(res.p, 0), 1) : (typeof res.evP === 'number' ? Math.min(Math.max(res.evP, 0), 1) : 0)),
                                evPerUnit: (typeof res.evPerUnit === 'number' ? res.evPerUnit : (typeof res.ev === 'number' ? res.ev : 0)),
                                evAbsolute: (typeof res.evAbsolute === 'number' ? res.evAbsolute : ((typeof res.evPerUnit === 'number') ? (res.evPerUnit * ((baseSat) || 100)) : 0)),
                                source: 'ev.expectedValue'
                            };
                        } else if (typeof res === 'number' && Number.isFinite(res)) {
                            // treat numeric response as evPerUnit
                            const evPerUnit = Number(res);
                            return {
                                p: 0,
                                evPerUnit,
                                evAbsolute: evPerUnit * ((this.config && this.config.baseBetBits) ? (this.config.baseBetBits * 100) : 100),
                                source: 'ev.expectedValue:number'
                            };
                        }
                    }
                } catch (e) { /* ignore and try other shapes */
                }

                try {
                    // b) empiricalProbability(multiplier) -> p
                    if (typeof evModule.empiricalProbability === 'function') {
                        const p = Number(evModule.empiricalProbability(multiplier) || 0);

                        // Compute EV per-unit and absolute EV only if the expectedValue() helper exists
                        // and there is a defined stake amount to compute absolute EV from.
                        let evPerUnit = null;
                        let evAbsolute = null;

                        if (typeof evModule.expectedValue === 'function') {
                            // Only compute absolute EV if baseBetBits configuration is present in the script.
                            // Do not invent default stake values — if baseBetBits missing we leave EV fields null.
                            const baseBitsDefined = (this && this.config && typeof this.config.baseBetBits !== 'undefined');
                            if (baseBitsDefined) {
                                try {
                                    const stakeSat = Number(this.config.baseBetBits) * 100;
                                    const evEst = evModule.expectedValue(multiplier, stakeSat);
                                    // expectedValue may return { p, evPerUnit, evAbsolute } — normalize defensively
                                    if (evEst && Number.isFinite(Number(evEst.evPerUnit))) {
                                        evPerUnit = Number(evEst.evPerUnit);
                                    } else if (evEst && Number.isFinite(Number(evEst.evAbsolute)) && Number.isFinite(Number(stakeSat)) && stakeSat !== 0) {
                                        evPerUnit = Number(evEst.evAbsolute) / Number(stakeSat);
                                    } else {
                                        evPerUnit = null;
                                    }
                                    if (evEst && Number.isFinite(Number(evEst.evAbsolute))) {
                                        evAbsolute = Number(evEst.evAbsolute);
                                    } else if (evPerUnit !== null) {
                                        evAbsolute = evPerUnit * stakeSat;
                                    } else {
                                        evAbsolute = null;
                                    }
                                } catch (errEv) {
                                    // if expectedValue throws, keep evPerUnit/evAbsolute null instead of inventing values
                                    evPerUnit = null;
                                    evAbsolute = null;
                                }
                            }
                        }

                        return {p: Math.min(Math.max(p, 0), 1), evPerUnit, evAbsolute, source: 'ev.empirical'};
                    }
                } catch (e) { /* ignore */
                }

                try {
                    // c) older APIs: probabilityFor(multiplier) or getProbability
                    const legacyNames = ['probabilityFor', 'getProbability', 'probability'];
                    for (const n of legacyNames) {
                        if (typeof evModule[n] === 'function') {
                            const p = Number(evModule[n](multiplier) || 0);
                            if (Number.isFinite(p)) {
                                return {p: Math.min(Math.max(p, 0), 1), evPerUnit: 0, evAbsolute: 0, source: `ev.${n}`};
                            }
                        }
                    }
                } catch (e) {
                }
            }

            // 3) fallback: if config exposes a simple heuristic or MARKET estimates, use them
            try {
                if (this.config && this.config.MARKET && Number.isFinite(Number(this.config.MARKET.EST_P_FOR_MULTIPLIER))) {
                    const guessedP = Number(this.config.MARKET.EST_P_FOR_MULTIPLIER);
                    return {p: Math.min(Math.max(guessedP, 0), 1), evPerUnit: 0, evAbsolute: 0, source: 'config.guess'};
                }
            } catch (e) {
            }

            // 4) nothing found
            return fallback;
        } catch (e) {
            try {
                this.logger && this.logger.log && this.logger.log(`getEvInfo error: ${e && e.message}`, 'warn');
            } catch (_) {
            }
            return {p: 0, evPerUnit: 0, evAbsolute: 0, source: 'error'};
        }
    }

    // +++ Recovery followup strict gating helper +++
    // ----------Regime-aware recovery gating ----------
    // detectAlternatingPattern: returns true when recent crashes show alternating high/low
    // detectAlternatingPattern (config-driven; no hardcoded thresholds)
    detectAlternatingPattern(windowSize = null, highMult = null, minAlternations = null) {
        try {
            const crashes = (this.getCrashArray && Array.isArray(this.getCrashArray())) ? this.getCrashArray() : [];
            if (!Array.isArray(crashes) || crashes.length < 3) return false;

            // read config values (must exist in config.config.recovery)
            const recCfg = (typeof this.getRecCfg === 'function') ? this.getRecCfg() : ((this.config && this.config.recovery) ? this.config.recovery : null);
            const marketCfg = (this.config && this.config.config && this.config.config.MARKET) ? this.config.config.MARKET : null;
            if (!recCfg) {
                try {
                    if (this.logger) this.logger.log('detectAlternatingPattern: missing config.config.recovery — denying alternation', 'error');
                } catch (e) {
                }
                return false;
            }

            const w = Number(windowSize || recCfg.alternationWindow);
            const minAlt = Number(minAlternations || recCfg.alternationMinAlternations);
            const highThreshold = (typeof highMult === 'number' && Number.isFinite(highMult))
                ? Number(highMult)
                : (Number(recCfg.highCrashMultiplier) || (marketCfg ? Number(marketCfg.HIGH_CRASH_MULTIPLIER) : NaN));

            if (!Number.isFinite(highThreshold)) {
                try {
                    if (this.logger) this.logger.log('detectAlternatingPattern: missing highCrashMultiplier in config — denying alternation', 'error');
                } catch (e) {
                }
                return false;
            }

            const arr = crashes.slice(-Math.max(3, Math.floor(w || 3)));
            const seq = arr.map(v => (Number(v || 0) >= highThreshold ? 1 : 0));
            let alternations = 0;
            for (let i = 1; i < seq.length; i++) if (seq[i] !== seq[i - 1]) alternations++;
            return alternations >= Math.max(1, Math.floor(minAlt || 1));
        } catch (e) {
            try {
                if (this.logger) this.logger.log(`detectAlternatingPattern error: ${e && e.message}`, 'warn');
            } catch (e2) {
            }
            return false;
        }
    }

    // ===================================================================
    // NEW PROACTIVE DECISION ENGINE (Refactored)
    // ===================================================================
    unifyEvEnsembleDecision(modeOrMultiplier = 'NORMAL') {
        try {
            // --- Get config blocks ---
            const rawCfg = (this.config && this.config.config) ? this.config.config : (this.config || {});
            const regimeCfg = (rawCfg && rawCfg.REGIME_DETECTOR) || {};
            const ensembleCfg = (rawCfg && rawCfg.ENSEMBLE) || {};

            // 1) resolve targetMultiplier and mode
            // Accept either numeric multiplier or the mode string ('NORMAL'|'RECOVERY').
            let modeStr = (typeof modeOrMultiplier === 'string') ? modeOrMultiplier.toUpperCase() : 'NORMAL';
            let targetMultiplier;
            // If caller passed a numeric multiplier directly, use it outright.
            if (typeof modeOrMultiplier === 'number') {
                targetMultiplier = Number(modeOrMultiplier);
            } else if (modeStr === 'RECOVERY') {
                // Priority: single source-of-truth for recovery multiplier.
                targetMultiplier = Number(
                    (this.bot && typeof this.bot.getCanonicalRecoveryMultiplier === 'function')
                        ? this.bot.getCanonicalRecoveryMultiplier()
                        : (typeof this.getCanonicalRecoveryMultiplier === 'function' ? this.getCanonicalRecoveryMultiplier() : 2.0)
                );
            } else {
                // NORMAL path: **must** use the canonical normal multiplier as single source-of-truth.
                // No fallback to config.normal.multiplier should be used here.
                targetMultiplier = Number(
                    (this.bot && typeof this.bot.getNormalMultiplier === 'function')
                        ? this.bot.getNormalMultiplier()
                        : (typeof this.getNormalMultiplier === 'function' ? this.getNormalMultiplier() : 1.63)
                );
            }

            // 2) Warmup/observation gating
            const roundsSeen = (this.stats && this.stats.stats) ? (this.stats.stats.totalBets + this.stats.stats.totalSkips) : 0;
            if (roundsSeen < (this.observationRounds || 3)) {
                this.lastDecisionSignals = {pattern: 0.05, ev: 0.05, ai: 0.05}; // Use 'pattern' for compat
                const out = {
                    shouldBet: false, confidence: 0.05, reason: 'observation', evVote: false, suggestedBet: 0, details: {roundsSeen}
                };
                try { this._recordUnifiedDecision(out, {reason: 'observation', roundsSeen}); } catch (e) {}
                return out;
            }

            // 3) === THE NEW PROACTIVE BRAIN ===
            // Use HYDRA config if available, else fallback
            const hydraCfg = rawCfg.HYDRA_STRATEGY || {};

            const historySize = 50; // Standardize history size
            const allCrashes = this.stats.getRecentCrashes(historySize);
            const currentDebtBits = (this.bot && this.bot.debtBits) ? this.bot.debtBits : 0;
            const baseBetBits = (this.config && this.config.normal && this.config.normal.baseBetBits) ? this.config.normal.baseBetBits : 1;

            // *** CHANGE IS HERE: Pass this.patternMatcher to the analyzer ***
            // We pass 'this.patternMatcher' so the CHAOS regime can use it to find micro-patterns
            const regimeAnalysis = this.regimeDetector.analyze(allCrashes, targetMultiplier, currentDebtBits, baseBetBits, this.patternMatcher);

            // +++ CRAB MARKET TARGET ADJUSTMENT +++
            // If the Brain suggests a lower target (e.g. 1.50x) due to Crab regime, apply it in Normal Mode
            if (modeStr === 'NORMAL' && regimeAnalysis.suggestedTarget) {
                // Only lower the target, never raise it above user config for safety
                if (regimeAnalysis.suggestedTarget < targetMultiplier) {
                    targetMultiplier = regimeAnalysis.suggestedTarget;
                    // Log the adjustment once (5% sample rate to avoid spam)
                    if (Math.random() < 0.05) this.logger.log(`🦀 Hydra adjusted target to ${targetMultiplier}x (CRAB Regime)`, 'info');
                }
            }

            // 4) === THE REGIME GATE (THE FIX) ===
            if (regimeAnalysis.state === 'BEARISH' || regimeAnalysis.state === 'SPIKE_TRAP' || regimeAnalysis.state === 'WARMUP') {
                const reason = `Regime Block: ${regimeAnalysis.state} (${regimeAnalysis.reason})`;
                const out = {
                    shouldBet: false, confidence: regimeAnalysis.confidence, reason: reason, evVote: false, suggestedBet: 0,
                    details: { regime: regimeAnalysis }
                };
                try { this._recordUnifiedDecision(out, {reason: reason, roundsSeen}); } catch (e) {}
                this.logger.log(`ENSEMBLE: conf ${(regimeAnalysis.confidence * 100).toFixed(1)}% | 🔍 ${reason}`, 'info');
                return out;
            }

            // 5) === PROCEED: Regime is 'BULLISH' or 'VOLATILE' ===
            const aiProb = this.getAiProbability(targetMultiplier);
            const evInfo = this.getEvInfo(targetMultiplier);

            // Normalize EV into a 0-1 confidence score
            const evConf = (() => {
                const v = (evInfo && typeof evInfo.evPerUnit === 'number') ? evInfo.evPerUnit : -Infinity;
                if (v <= 0) return 0.05;
                const tanhScale = ensembleCfg.EV_CONF_TANH_SCALE || 3;
                return Math.min(Math.max(Math.tanh(v * tanhScale), 0.05), 0.99);
            })();

            this.lastDecisionSignals = { pattern: regimeAnalysis.confidence, ev: evConf, ai: aiProb };

            // 6) Adaptive Weighting (from config)
            let weights = { ...(ensembleCfg.WEIGHTS_DEFAULT || { regime: 0.2, ev: 0.6, ai: 0.2 }) };

            if (regimeAnalysis.state === 'BULLISH') {
                weights = { ...(ensembleCfg.WEIGHTS_BULLISH || { regime: 0.5, ev: 0.25, ai: 0.25 }) };
            } else if (regimeAnalysis.state === 'VOLATILE') {
                weights = { ...(ensembleCfg.WEIGHTS_VOLATILE || { regime: 0.3, ev: 0.4, ai: 0.3 }) };
            }

            // Give a boost to EV if it's strongly positive
            const evStrongThresh = ensembleCfg.EV_STRONG_CONF_THRESHOLD || 0.75;
            if (evConf > evStrongThresh) {
                weights.ev += (ensembleCfg.EV_STRONG_CONF_BOOST || 0.1);
            }
            // Give a boost to AI if it's strongly positive
            const aiStrongThresh = ensembleCfg.AI_STRONG_CONF_THRESHOLD || 0.75;
            if (aiProb > aiStrongThresh) {
                weights.ai += (ensembleCfg.AI_STRONG_CONF_BOOST || 0.1);
            }

            // Normalize weights to sum to 1
            const s = weights.regime + weights.ev + weights.ai || 1;
            weights.regime /= s;
            weights.ev /= s;
            weights.ai /= s;

            // 7) Calculate Final Ensemble Confidence
            const ensembleConfidence =
                (regimeAnalysis.confidence * weights.regime) +
                (evConf * weights.ev) +
                (aiProb * weights.ai);

            // 8) Voting Logic (from config)
            const threshold = (this.config && this.config.confidenceThreshold) ? this.config.confidenceThreshold : 0.55;
            const voteThresh = ensembleCfg.VOTE_THRESHOLD || 0.5;
            const regimeVote = regimeAnalysis.confidence >= voteThresh;
            const evVote = evConf >= voteThresh;
            const aiVote = aiProb >= voteThresh;

            const votes = [regimeVote, evVote, aiVote];
            const voteCount = votes.reduce((sum, v) => sum + (v ? 1 : 0), 0);

            // 9) Final Decision
            let shouldBet = false;
            let reason = "no strong signal";
            const voteRequired = ensembleCfg.VOTE_REQUIRED || 2;

            if (voteCount >= voteRequired) {
                shouldBet = true;
                reason = `votes ${voteCount}/3`;
            } else if (ensembleConfidence >= threshold) {
                shouldBet = true;
                reason = `ensemble ${(ensembleConfidence * 100).toFixed(1)}% >= ${(threshold * 100).toFixed(1)}%`;
            }

            // 10) Update anti-skip (from config)
            this.patternSkips = this.patternSkips || 0;
            const maxSkip = Number(this.config.maxSkipStreak || 8);
            if (!shouldBet && this.patternSkips >= maxSkip) {
                const antiSkipScale = ensembleCfg.ANTI_SKIP_CONF_SCALE || 0.9;
                if (ensembleConfidence >= (threshold * antiSkipScale)) {
                    shouldBet = true;
                    reason = 'anti-skip override';
                }
            }
            if (!shouldBet) this.patternSkips++; else this.patternSkips = 0;

            // 11) Prepare result
            const details = {
                targetMultiplier,
                pattern: { confidence: regimeAnalysis.confidence, reason: regimeAnalysis.reason }, // Use 'pattern' key
                regime: regimeAnalysis,
                alternation: { altRatio: 0, isAlternating: false }, // Stub for compatibility
                aiProb,
                evInfo,
                weights,
                boosts: {}, // Old boost system is removed
                ensembleConfidence,
                roundsSeen
            };

            // Get suggestedBet (from config)
            let baseSat = (typeof this.config.getBaseBetSat === 'function') ? Number(this.config.getBaseBetSat()) : ((this.config.baseBetBits) ? this.config.baseBetBits * 100 : 100);
            const betScale = ensembleCfg.SUGGESTED_BET_SCALE || 3;
            const maxBetScale = ensembleCfg.SUGGESTED_BET_MAX_SCALE || 3;
            let suggestedBet = Math.max(baseSat, Math.floor(baseSat * Math.min(maxBetScale, Math.max(1, ensembleConfidence * betScale))));

            const result = {
                shouldBet,
                confidence: ensembleConfidence,
                reason: reason,
                evVote,
                suggestedBet,
                details
            };

            try { this._recordUnifiedDecision(result, {roundsSeen}); } catch (e) {}
            this.logger.log(`ENSEMBLE: conf ${(ensembleConfidence * 100).toFixed(1)}% | votes ${voteCount} | 🔍 ${reason} (Regime: ${regimeAnalysis.state})`, 'info');

            return result;

        } catch (e) {
            try {
                this.logger && this.logger.log && this.logger.log(`unifyEvEnsembleDecision error: ${e.message}`, 'error');
            } catch (e) {}
            return {shouldBet: false, confidence: 0.05, reason: 'error', evVote: false, suggestedBet: 0, details: null};
        }
    }

    getPrediction(mode = 'NORMAL') {
        try {
            const evalMode = (mode || 'NORMAL').toString().toUpperCase();

            // --- 1. Gather Inputs (Unchanged) ---
            const crashes = this.getCrashArray();
            const targetMultiplier = (evalMode === 'NORMAL')
                ? (this.bot.getNormalMultiplier ? Number(this.bot.getNormalMultiplier()) : 1.73)
                : (this.bot.getCanonicalRecoveryMultiplier ? Number(this.bot.getCanonicalRecoveryMultiplier()) : 1.63);

            // Get Raw Signals
            const pat = this.patternMatcher ? this.patternMatcher.getPrediction(crashes) : null;
            const patternConf = (pat && pat.direction === 'HIGH') ? pat.confidence : 0.5;

            let evConf = 0;
            if (this.ev) {
                const evRes = this.ev.expectedValue(targetMultiplier, 100);
                evConf = evRes ? evRes.p : 0;
            }

            let aiConf = 0;
            if (this.ai) aiConf = this.ai.predict(this.stats, targetMultiplier);

            // Weighted Average (Raw Ensemble)
            const rawEnsemble = (patternConf * 0.35) + (evConf * 0.35) + (aiConf * 0.30);

            // --- 2. CALIBRATION (MAD) ---
            // Get dynamic uncertainty from MADCalibrator
            const uncertainty = (this.bot.madCalibrator) ? this.bot.madCalibrator.getUncertainty() : 0.15;
            // Calibrated Probability = Raw - Uncertainty (Conservative)
            const calibratedP = Math.max(0, rawEnsemble - uncertainty);

            // --- 3. OBSERVE MODE LOGIC (The Death Spiral Fix) ---
            const internal = this.bot.internalState ? this.bot.internalState.state : {};
            const lossStreak = internal.consecutiveRecoveryLosses || 0;

            let shouldBet = false;
            let reason = '';

            // NORMAL MODE
            if (evalMode === 'NORMAL') {
                // FIX: Use a flat base threshold of 0.40.
                // Since calibratedP = Raw - Uncertainty, effectively:
                // Required Raw = 0.40 + Uncertainty.
                // If Uncertainty = 0.10, Required Raw = 50%.
                const dynamicThreshold = 0.40;

                if (calibratedP > dynamicThreshold) {
                    shouldBet = true;
                    reason = `NORMAL_CALIBRATED (P ${calibratedP.toFixed(2)} > ${dynamicThreshold.toFixed(2)})`;
                } else {
                    reason = `WAIT (Uncertainty ${uncertainty.toFixed(2)})`;
                }
            }
            // RECOVERY MODE
            else {
                // RULE: If 2+ Losses -> OBSERVE MODE (Stop betting blindly)
                if (lossStreak >= 2) {
                    // OPPORTUNISTIC OVERRIDE (The Sniper)
                    const bayesLower = this.bot.bayesPosterior ? this.bot.bayesPosterior.lowerBound(targetMultiplier) : 0;
                    const conservativeEV = (bayesLower * (targetMultiplier - 1)) - (1 - bayesLower);

                    if (conservativeEV > 0 && calibratedP > 0.60) {
                        shouldBet = true;
                        reason = `SNIPER_OVERRIDE (Losses ${lossStreak} | BayesEV ${conservativeEV.toFixed(2)})`;
                    } else {
                        shouldBet = false;
                        reason = `OBSERVE_MODE (Losses ${lossStreak} | Waiting for EV+)`;
                    }
                } else {
                    // Standard Recovery (< 2 losses)
                    if (rawEnsemble > 0.50) {
                        shouldBet = true;
                        reason = 'RECOVERY_STANDARD';
                    } else {
                        shouldBet = false;
                        reason = 'RECOVERY_SKIP_LOW_CONF';
                    }
                }
            }

            // Store signals for next round calibration
            this.lastDecisionSignals = { ensembleProb: rawEnsemble };

            // Return Standard Prediction Object
            const suggestedBetSat = (this.bot && typeof this.bot.resolveCanonicalStakeSat === 'function')
                ? this.bot.resolveCanonicalStakeSat(null, { shouldBet, suggestedMultiplier: targetMultiplier }, evalMode)
                : 100;

            return {
                shouldBet,
                confidence: calibratedP,
                suggestedBet: suggestedBetSat,
                suggestedMultiplier: targetMultiplier,
                reason,
                details: { uncertainty, lossStreak, rawEnsemble }
            };

        } catch (e) {
            if(this.logger) this.logger.log('Prediction Error: ' + e.message, 'error');
            return { shouldBet: false, confidence: 0, reason: 'ERROR' };
        }
    }

    // call once per round to train internal AI and EV after crash known
    // call once per round to train internal AI and EV after crash known
    // modeOrMultiplier: optional; if string 'RECOVERY' uses recovery multiplier;
    // if numeric, uses that numeric multiplier directly.
    updateAfterCrash(crashValue, modeOrMultiplier = null) {
        // resolve the correct target multiplier to train on
        let targetMultiplier;
        if (typeof modeOrMultiplier === 'number') {
            targetMultiplier = Number(modeOrMultiplier);
        } else {
            const modeStr = (modeOrMultiplier || 'NORMAL').toString().toUpperCase();
            targetMultiplier = (modeStr === 'RECOVERY')
                ? Number(typeof this.bot.getCanonicalRecoveryMultiplier === 'function' ? this.bot.getCanonicalRecoveryMultiplier() : 1.63)
                : Number(typeof this.bot.getNormalMultiplier === 'function' ? this.bot.getNormalMultiplier() : 1.63);
        }

        try {
            // train AI online with the appropriate multiplier
            this.ai.train(this.stats, targetMultiplier, crashValue);
        } catch (e) {
            this.logger.log(`AI training error: ${e.message}`, 'error');
        }
        // Update module accuracy counters using the signals recorded at decision time (if any)
        try {
            if (this.lastDecisionSignals) {
                this.updateModuleAccuracy(crashValue, this.lastDecisionSignals);
                this.lastDecisionSignals = null;
            }
        } catch (e) { /* non-fatal */
        }
    }
}

class BettingEngine {
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
        this.activeBet = null;
    }

    // Add optional third arg modeAtPlace to force the mode recorded on the active bet
    // placeBet(amountSat, targetMultiplier, modeOrMeta)
    // modeOrMeta: optional string modeAtPlace OR object { modeAtPlace, batchId }
    placeBet(amount, targetMultiplier, modeOrMeta = undefined) {
        // --- normalize amount to integer bits (same as original) ---
        let bits = (amount || 0) / 100;
        bits = this.config.bitsRound ? this.config.bitsRound(bits) : Math.round(bits);
        amount = (bits * 100);

        // Defensive: reject zero or non-positive stakes before trying to place on the server.
        if (!Number.isFinite(amount) || Number(amount) <= 0) {
            try {
                this.logger.log(`⚠️ placeBet aborted: non-positive amount (${amount}) after normalization.`, 'warning');
            } catch (e) {
            }
            return false;
        }

        const balance = this.config.getCurrentBalance();
        if (balance < amount) {
            this.logger.log(`❌ Insufficient balance. Need: ${amount} sat (${amount / 100} bits), Have: ${balance} sat`, 'error');
            return false;
        }

        const runMode = this.config.getRunMode ? this.config.getRunMode() : (this.config.get ? this.config.get('runMode') : 'test');

        // Normalize modeOrMeta
        let suppliedMode = undefined;
        let suppliedBatchId = undefined;
        if (typeof modeOrMeta === 'string') suppliedMode = modeOrMeta;
        else if (modeOrMeta && typeof modeOrMeta === 'object') {
            suppliedMode = modeOrMeta.modeAtPlace;
            suppliedBatchId = modeOrMeta.batchId;
        }

        // Test mode -> simulate and return true (no debt effects)
        if (runMode === 'test') {
            const bits = Math.round((amount || 0) / 100);
            const computedMode = suppliedMode || (this.mode || (this.bot && this.bot.mode)) || 'NORMAL';
            const normalizedBatchId = (typeof suppliedBatchId !== 'undefined') ? suppliedBatchId : null;

            this.activeBet = {
                amount: amount,
                stakeBits: bits,
                targetMultiplier: targetMultiplier,
                timestamp: Date.now(),
                modeAtPlace: computedMode,
                batchId: normalizedBatchId,
                preBalanceSat: this.config.getCurrentBalance()
            };

            //  (test bets do not affect actual debt)
            this.logger.log(`🎯 TEST BET PLACED | Amount: ${amount} sat (${amount / 100} bits) | Target: ${targetMultiplier}x`, 'bet');
            return true;
        }

        // Live mode: anti-duplicateLock
        if (!this._placeLock) this._placeLock = false;
        if (this._placeLock) {
            this.logger.log('⚠️ placeBet locked — preventing duplicate placement', 'warning');
            return false;
        }

        // Acquire lock; will be released after confirmed placement or on giving up
        this._placeLock = true;
        this._placeRetryPending = false;

        // Helper: reconcile & mark bet as placed (this is the ONLY place we should call debt/follow-up logic)
        const reconcileAsPlaced = (placedAmount, placedTargetMultiplier, normalizedBatchId) => {
            const placedBits = Math.round((placedAmount || 0) / 100);
            const computedMode = suppliedMode || (this.mode || (this.bot && this.bot.mode)) || 'NORMAL';
            const nbid = (typeof normalizedBatchId !== 'undefined') ? normalizedBatchId : null;

            this.activeBet = {
                amount: placedAmount,
                stakeBits: placedBits,
                targetMultiplier: placedTargetMultiplier,
                timestamp: Date.now(),
                reconciled: true,
                modeAtPlace: computedMode,
                batchId: nbid,
                preBalanceSat: this.config.getCurrentBalance()
            };
        };

        // Helper: verify presence of a placed bet on platform using engine-provided introspection APIs (best-effort).
        // Returns a Promise that resolves true if verification succeeded (and optionally returns the platform's bet info).
        const verifyPlacedBetViaEngine = async (expectedAmount, expectedTarget) => {
            // Try several candidate engine methods in order of likely availability.
            // Each method must be non-blocking or return quickly.
            try {
                // If engine exposes a direct getActiveBets / getOpenBets API, use it
                if (typeof engine.getActiveBets === 'function') {
                    try {
                        const active = await Promise.resolve(engine.getActiveBets());
                        if (Array.isArray(active)) {
                            // Look for a bet matching amount (or stake) and/or target if available
                            for (const b of active) {
                                // try common fields: amount, stake, value, target, cashout, id, timestamp
                                const a = (b.amount || b.stake || b.value || 0);
                                const t = (b.target || b.auto_cashout || b.cashoutAt || null);
                                if (Number(a) === Number(expectedAmount) || (t && Number(t) === Number(expectedTarget))) {
                                    return true;
                                }
                            }
                        }
                    } catch (e) { /* ignore and try next */
                    }
                }

                if (typeof engine.getOpenBets === 'function') {
                    try {
                        const open = await Promise.resolve(engine.getOpenBets());
                        if (Array.isArray(open)) {
                            for (const b of open) {
                                const a = (b.amount || b.stake || b.value || 0);
                                const t = (b.target || b.auto_cashout || b.cashoutAt || null);
                                if (Number(a) === Number(expectedAmount) || (t && Number(t) === Number(expectedTarget))) {
                                    return true;
                                }
                            }
                        }
                    } catch (e) {
                    }
                }

                // Some engines provide getLastPlacedBet or getLastBet
                if (typeof engine.getLastPlacedBet === 'function') {
                    try {
                        const last = await Promise.resolve(engine.getLastPlacedBet());
                        if (last) {
                            const a = (last.amount || last.stake || last.value || 0);
                            const t = (last.target || last.auto_cashout || last.cashoutAt || null);
                            // last bet may match expected by timestamp closeness too
                            if (Number(a) === Number(expectedAmount) || (t && Number(t) === Number(expectedTarget))) return true;
                        }
                    } catch (e) {
                    }
                }

                if (typeof engine.getLastBet === 'function') {
                    try {
                        const last = await Promise.resolve(engine.getLastBet());
                        if (last) {
                            const a = (last.amount || last.stake || last.value || 0);
                            const t = (last.target || last.auto_cashout || last.cashoutAt || null);
                            if (Number(a) === Number(expectedAmount) || (t && Number(t) === Number(expectedTarget))) return true;
                        }
                    } catch (e) {
                    }
                }

                // No engine introspection available or verification failed
                return false;
            } catch (e) {
                return false;
            }
        };

        // The retry/verification strategy:
        // - Attempt an immediate synchronous placeBet() call first.
        // - On ALREADY_PLACED_BET / GAME_IN_PROGRESS, attempt immediate verification via engine methods.
        // - If verification fails immediately, schedule non-blocking verification attempts (polling up to maxVerifyAttempts).
        // - Only call reconcileAsPlaced() (which affects debt) once verification is successful.
        // - If verification ultimately fails, do not affect debt; release lock and return false.

        try {
            const autoCashOut = Math.floor(targetMultiplier * 100);

            // Quick check: is betting open now?
            if (typeof engine.isBettingOpen === 'function' && !engine.isBettingOpen()) {
                this.logger.log('⚠️ Betting closed — not placing live bet', 'warning');
                this._placeLock = false;
                return false;
            }

            // config-driven retry/timeout settings (defensive read supports ConfigManager or plain config)
            const rawCfg = (this.config && this.config.config) ? this.config.config : (this.config || {});

            const maxRetries = (rawCfg.protection && Number.isFinite(Number(rawCfg.protection.placeBetRetries)))
                ? Number(rawCfg.protection.placeBetRetries)
                : (this.config && this.config.protection && Number.isFinite(Number(this.config.protection.placeBetRetries)) ? Number(this.config.protection.placeBetRetries) : 2);

            const retryDelayMs = (rawCfg.protection && Number.isFinite(Number(rawCfg.protection.placeBetRetryDelayMs)))
                ? Number(rawCfg.protection.placeBetRetryDelayMs)
                : (this.config && this.config.protection && Number.isFinite(Number(this.config.protection.placeBetRetryDelayMs)) ? Number(this.config.protection.placeBetRetryDelayMs) : 150);

            // total placement verification timeout (ms) — use protection.betPlacementTimeoutMs if present, else 350ms
            const placeTimeout = (rawCfg.protection && Number.isFinite(Number(rawCfg.protection.betPlacementTimeoutMs)))
                ? Number(rawCfg.protection.betPlacementTimeoutMs)
                : (this.config && this.config.protection && Number.isFinite(Number(this.config.protection.betPlacementTimeoutMs)) ? Number(this.config.protection.betPlacementTimeoutMs) : 350);

            const placeDeadline = Date.now() + Math.max(0, Number(placeTimeout));

            // immediate attempt
            try {
                engine.placeBet(amount, autoCashOut);

                // success => confirm and reconcile immediately (safe to affect debt)
                reconcileAsPlaced(amount, targetMultiplier, suppliedBatchId);
                this.logger.log(`💰 LIVE BET PLACED | Amount: ${amount} sat (${amount / 100} bits) | Target: ${targetMultiplier}x`, 'bet');

                this._placeLock = false;
                return true;
            } catch (err) {
                const msg = err && err.message ? err.message : String(err || '');

                // If engine reports ALREADY_PLACED_BET or GAME_IN_PROGRESS, DO NOT assume a bet is placed yet.
                if (/ALREADY_PLACED_BET|GAME_IN_PROGRESS/i.test(msg)) {
                    this.logger.log(`⚠️ placeBet returned "${msg}". Attempting verification before marking as placed.`, 'warning');

                    // Try immediate verification (sync/fast)
                    (async () => {
                        try {
                            const verifiedNow = await verifyPlacedBetViaEngine(amount, Math.floor(targetMultiplier * 100));
                            if (verifiedNow) {
                                // Verified: reconcile and update trackers (affects debt)
                                reconcileAsPlaced(amount, targetMultiplier, suppliedBatchId);
                                this.logger.log(`✅ Verified existing live bet via engine introspection — reconciled.`, 'bet');
                                this._placeLock = false;
                                return;
                            }

                            // Schedule non-blocking verification attempts (polling)
                            this._placeRetryPending = true;
                            let attempt = 1;
                            const maxVerifyAttempts = Math.max(3, maxRetries); // conservative
                            const verifyLoop = () => {
                                // deadline check: if we've already waited longer than placeTimeout, give up
                                if (Date.now() > placeDeadline) {
                                    try {
                                        this.logger.log(`❌ Verification timed out after ${placeTimeout}ms. Will NOT reconcile; no debt change.`, 'error');
                                    } catch (_) {
                                    }
                                    this._placeRetryPending = false;
                                    this._placeLock = false;
                                    return;
                                }
                                setTimeout(async () => {
                                    try {
                                        const ok = await verifyPlacedBetViaEngine(amount, Math.floor(targetMultiplier * 100));
                                        if (ok) {
                                            reconcileAsPlaced(amount, targetMultiplier, suppliedBatchId);
                                            this.logger.log(`✅ Verification succeeded on retry #${attempt} — reconciled.`, 'bet');
                                            this._placeRetryPending = false;
                                            this._placeLock = false;
                                            return;
                                        } else {
                                            attempt++;
                                            if (attempt > maxVerifyAttempts) {
                                                this.logger.log(`❌ Verification failed after ${maxVerifyAttempts} attempts. Will NOT reconcile; no debt change.`, 'error');
                                                this._placeRetryPending = false;
                                                this._placeLock = false;
                                                return;
                                            } else {
                                                // continue polling (deadline will be re-checked at loop start)
                                                verifyLoop();
                                            }
                                        }
                                    } catch (e) {
                                        attempt++;
                                        if (attempt > maxVerifyAttempts) {
                                            this.logger.log(`❌ Verification failed after ${maxVerifyAttempts} attempts (error). Will NOT reconcile; no debt change.`, 'error');
                                            this._placeRetryPending = false;
                                            this._placeLock = false;
                                            return;
                                        } else {
                                            verifyLoop();
                                        }
                                    }

                                }, retryDelayMs);
                            };
                            // start polling
                            verifyLoop();
                        } catch (e) {
                            // If verification mechanism threw, give up safely (do NOT mark reconciled)
                            this.logger.log(`❌ Verification attempt errored: ${e && e.message ? e.message : String(e)} — not reconciling`, 'error');
                            this._placeRetryPending = false;
                            this._placeLock = false;
                        }
                    })();

                    // Return false for now: the method did not synchronously confirm placement.
                    // Background verification may still reconcile later; debt will only be affected after verification.
                    return false;
                }

                // Other non-idempotent errors -> attempt retries (non-blocking), similar to earlier patch
                // We'll schedule non-blocking retries; each retry will attempt engine.placeBet and on success reconcile.
                this.logger.log(`⚠️ Initial placeBet attempt failed: ${msg}. Scheduling non-blocking retries (max ${maxRetries}).`, 'warning');
                this._placeRetryPending = true;

                let retryAttempt = 1;
                const scheduleRetry = () => {
                    setTimeout(() => {
                        try {
                            // re-check betting window
                            if (typeof engine.isBettingOpen === 'function' && !engine.isBettingOpen()) {
                                this.logger.log(`⚠️ Retry #${retryAttempt} skipped because betting closed.`, 'warning');
                                retryAttempt++;
                                if (retryAttempt > maxRetries) {
                                    this.logger.log(`❌ Giving up placing bet after ${maxRetries} retries (betting closed).`, 'error');
                                    this._placeRetryPending = false;
                                    this._placeLock = false;
                                    return;
                                }
                                scheduleRetry();
                                return;
                            }

                            engine.placeBet(amount, autoCashOut);
                            // success path
                            reconcileAsPlaced(amount, targetMultiplier, suppliedBatchId);
                            this.logger.log(`💰 LIVE BET PLACED (retry #${retryAttempt}) | Amount: ${amount} sat | Target: ${targetMultiplier}x`, 'bet');
                            this._placeRetryPending = false;
                            this._placeLock = false;
                            return;
                        } catch (retryErr) {
                            const rmsg = retryErr && retryErr.message ? retryErr.message : String(retryErr || '');
                            if (/ALREADY_PLACED_BET|GAME_IN_PROGRESS/i.test(rmsg)) {
                                // Similar to above: verify before reconciling
                                (async () => {
                                    try {
                                        const ok = await verifyPlacedBetViaEngine(amount, Math.floor(targetMultiplier * 100));
                                        if (ok) {
                                            reconcileAsPlaced(amount, targetMultiplier, suppliedBatchId);
                                            this.logger.log(`✅ Verified existing live bet during retry — reconciled.`, 'bet');
                                            this._placeRetryPending = false;
                                            this._placeLock = false;
                                            return;
                                        } else {
                                            retryAttempt++;
                                            if (retryAttempt > maxRetries) {
                                                this.logger.log(`❌ Retry finished: verification failed; not reconciling`, 'error');
                                                this._placeRetryPending = false;
                                                this._placeLock = false;
                                                return;
                                            } else {
                                                scheduleRetry();
                                            }
                                        }
                                    } catch (e) {
                                        retryAttempt++;
                                        if (retryAttempt > maxRetries) {
                                            this.logger.log(`❌ Retry finished with error; not reconciling`, 'error');
                                            this._placeRetryPending = false;
                                            this._placeLock = false;
                                            return;
                                        } else {
                                            scheduleRetry();
                                        }
                                    }
                                })();
                                return;
                            }

                            retryAttempt++;
                            if (retryAttempt > maxRetries) {
                                this.logger.log(`❌ Failed to place live bet after ${retryAttempt - 1} retries: ${rmsg}`, 'error');
                                this._placeRetryPending = false;
                                this._placeLock = false;
                                return;
                            } else {
                                this.logger.log(`⚠️ placeBet retry #${retryAttempt - 1} failed: ${rmsg}. Retrying...`, 'warning');
                                scheduleRetry();
                            }
                        }
                    }, retryDelayMs);
                };

                // start first scheduled retry
                scheduleRetry();
                return false;
            }
        } catch (e) {
            this.logger.log(`❌ placeBet unexpected error: ${e && e.message ? e.message : String(e)}`, 'error');
            // ensure lock cleared
            try {
                this._placeLock = false;
            } catch (er) {
            }
            try {
                this._placeRetryPending = false;
            } catch (er) {
            }
            return false;
        }
    }

    processGameCrash(crashValue) {
        if (!this.activeBet) return null;

        const bet = this.activeBet;

        // Prefer the recorded pre-bet balance (sats) if available — this is authoritative for reconciliation.
        const preBalanceSat = (bet && typeof bet.preBalanceSat !== 'undefined') ? Number(bet.preBalanceSat) : Number(this.config.getCurrentBalance());

        // CRYSTAL CLEAR win/loss determination using targetMult
        let isWin = crashValue >= bet.targetMultiplier;

        let profit;

        // start with the pre-bet baseline; we'll update newBalance later (engine or test mode)
        let newBalance;

        console.log(`🎲 PROCESSING BET: Bet ${bet.amount} sat at ${bet.targetMultiplier}x | Crash: ${crashValue}x | initialIsWin: ${isWin}`);

        if (isWin) {
            // WIN: Profit = bet_amount * (multiplier - 1)
            profit = bet.amount * (bet.targetMultiplier - 1);
            newBalance = preBalanceSat + profit;

            console.log(`🎉 WIN CALCULATION (float-safe): Bet ${bet.amount} * (${bet.targetMultiplier} - 1) = ${profit} profit (sats float)`);
            console.log(`💰 WIN BALANCE (float-safe): ${preBalanceSat} + ${profit} = ${newBalance}`);
        } else {
            // LOSS: We lose the entire bet amount (profit is negative)
            profit = -bet.amount;
            newBalance = preBalanceSat + profit; // Adding negative number = subtraction

            console.log(`💸 LOSS CALCULATION: Lost entire bet of ${bet.amount} (profit = ${profit})`);
            console.log(`💰 LOSS BALANCE: ${preBalanceSat} + (${profit}) = ${newBalance}`);
        }

        // Update balance (test mode only). In LIVE mode we MUST re-check the engine balance
        // and compute *actual* profit from the authoritative engine balance to avoid
        // mismatches (engine may have auto-cashed out / rounded differently).
        const isTest = this.config.getRunMode ? this.config.getRunMode() === 'test' : (this.config.get ? this.config.get('runMode') === 'test' : false);

        if (isTest) {

            // In test mode we already computed `newBalance` above using the bet calculation;
            // update test-mode storage so bot UI/stats reflect simulated balance.
            this.config.updateBalance(newBalance);

            console.log(`🔧 TEST BALANCE UPDATED: ${newBalance}`);

        } else {

            try {
                const engineBalance = engine.getBalance();
                console.log(`🔧 LIVE BALANCE FROM ENGINE: ${engineBalance}`);

                // Recalculate actual profit using the engine-reported balance delta against the authoritative pre-bet balance.
                const actualProfit = engineBalance - preBalanceSat;

                // If actualProfit differs from the expected 'profit', prefer actualProfit — this keeps stats in sync with the wallet/exchange.
                if (actualProfit !== profit) {
                    console.log(`🔁 Reconciled profit: expected ${profit} sat -> actual ${actualProfit} sat (using engine balance - preBalanceSat)`);
                }
                profit = actualProfit;
                // Use the engine balance as the canonical new balance
                newBalance = engineBalance;
                // Determine canonical isWin from realized profit OR crash fallback
                const actualIsWin = profit > 0 || crashValue >= bet.targetMultiplier;
                if (actualIsWin !== isWin) {
                    console.log(`🔁 Reconciled win flag: expected ${isWin} -> actual ${actualIsWin}`);
                    isWin = actualIsWin;
                }
            } catch (error) {
                console.log('⚠️ Engine balance error, using calculated balance');
                // fallback: update stored balance to computed newBalance (best-effort)
                this.config.updateBalance(newBalance);
            }
        }

        // Provide both sats and bits in the result object:
        const profitSat = Number(profit); // profit in sats (can be negative)
        const profitBits = Number(profitSat) / 100; // canonical profit in bits (decimal)
        const betAmountSat = Number(bet.amount || 0);
        const betAmountBits = Number(betAmountSat) / 100;

        const result = {
            // keep sats for parts of the code that expect sats (engine, limits)
            initialBalanceSat: this.config.initialBalance,
            currentBalanceSat: newBalance,
            // user-facing / stats fields in bits
            betAmountBits: betAmountBits,
            multiplier: bet.targetMultiplier,
            crashValue: crashValue,
            isWin: isWin,
            profitBits: profitBits,
            // also include sats for backward compatibility if needed
            betAmountSat: betAmountSat,
            profitSat: profitSat,
            // BACKWARD-COMPAT: keep `profit` field (sats) in case other code expects it
            profit: profitSat,
            // BATCH TRACKING: allow consumers to know which scheduled batch (if any) this bet belonged to
            batchId: (bet && typeof bet.batchId !== 'undefined') ? bet.batchId : null
        };

        // Include the mode the bet was in when it was placed so result consumers can attribute properly.
        result.modeAtPlace = bet.modeAtPlace || (this.mode || (this.bot && this.bot.mode) || 'NORMAL');

        // Clear active bet
        this.activeBet = null;

        console.log(`📊 FINAL RESULT: ${isWin ? 'WIN' : 'LOSS'} | Profit(sat): ${profitSat} | Profit(bits): ${profitBits} | New Balance(sat): ${newBalance}`);

        return result;
    }

    hasActiveBet() {
        return this.activeBet !== null;
    }

    getActiveBet() {
        return this.activeBet;
    }
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

    // --- These methods are now empty as they related to HTML ---
    startRuntimeTicker(bot) {
        // We keep the interval logic for panel stats, but don't create one here
        // The updateStats throttle will handle timing.
    }
    stopRuntimeTicker() { }
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
    updateStats(stats, currentBalance, initialBalance, activeBet = null, isBetting = false, skipReason = null, lastPLBits = null) {
        // Guard: We must have the bot and its logger to print
        if (!this.bot || !this.bot.logger || !this.config.get('showPanel')) return;

        // --- UI throttle guard ---
        try {
            const uiThrottleMs = (this.config && this.config.config && this.config.config.protection && Number.isFinite(this.config.config.protection.uiThrottleMs))
                ? Number(this.config.config.protection.uiThrottleMs)
                : 0;

            if (!this._lastUpdateTs) this._lastUpdateTs = 0;
            const nowTs = Date.now();
            if (nowTs - this._lastUpdateTs < uiThrottleMs) {
                return; // Skip this update
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
        if (subMode === 'WARMUP') {
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
        const nextMultValue = (this.bot && String(this.bot.mode || '').toUpperCase() === 'RECOVERY')
            ? Number(typeof this.bot.getCanonicalRecoveryMultiplier === 'function' ? this.bot.getCanonicalRecoveryMultiplier() : 1.63)
            : Number(typeof this.bot.getNormalMultiplier === 'function' ? this.bot.getNormalMultiplier() : 1.63);


        // Debt & Stake
        const debtText = (this.bot && this.bot.debtBits ? this.bot.debtBits.toFixed(2) : '0.00');
        const recMultForUi = Number(this.bot && this.bot.getCanonicalRecoveryMultiplier ? this.bot.getCanonicalRecoveryMultiplier() : 2.08);
        const nextStake = activeBet
            ? Math.round(activeBet.amount / 100)
            : (this.bot && this.bot.awaitingRecovery && this.bot.computeRecoveryStakeBits ? this.bot.computeRecoveryStakeBits(this.bot.debtBits || 0, recMultForUi) : 0);

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
        // +++ RICH LAST ACTION DISPLAY +++
        // ============================================================
        // 1. Get Real-time Brain Metrics
        const skewVal = (this.bot.stats && typeof this.bot.stats.getSkewness === 'function')
            ? this.bot.stats.getSkewness(50).toFixed(2)
            : '0.00';

        const lastDec = (this.bot.prediction && this.bot.prediction.lastUnifiedDecision)
            ? this.bot.prediction.lastUnifiedDecision
            : null;

        const brainState = (lastDec && lastDec.details && lastDec.details.regime)
            ? lastDec.details.regime.state
            : 'UNK';

        // 2. Construct the Rich Status String
        let lastActionText = "";

        // PRIORITY A: BUNKER MODE (Most critical status)
        if (this.bot.isBunkerMode) {
            // Get required rounds safely
            const bunkerReq = (this.bot.config && this.bot.config.config && this.bot.config.config.bunker)
                ? this.bot.config.config.bunker.requiredSafeRounds
                : 2;

            lastActionText = `🛡️ BUNKER: Streak ${this.bot.bunkerSafeStreak}/${bunkerReq} | Skew: ${skewVal}`;
        }
        // PRIORITY B: EXPLICIT SKIP/WARNING (Fake Bull, Pattern Veto)
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
        // PRIORITY C: ACTIVE BETTING
        else if (isBetting) {
            lastActionText = `💰 BETTING [${brainState}] | Skew: ${skewVal}`;
        }
        // PRIORITY D: IDLE / WARMUP
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
                maxRecTimeText, maxRecAgeText, lastActionText
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
        | 🔢 Last Mult: ${lastMult.toFixed(2)}× | 🔜 Next Mult: ${nextMultValue.toFixed(2)}×
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
    constructor() {
        this.config = new ConfigManager();
        this.logger = new Logger(this.config);
        this.stats = new StatsTracker(this.config);
        this.ev = new EVModule(this.stats);

        // +++ Compatibility wrappers: expose addSkip/addBetResult on the bot instance +++
        this.addSkip = (reason = 'ev', mode = 'NORMAL') => {

            try {
                // If we're in warmup, DO NOT increment stats or bot counters.
                // Warmup rounds are for training only and must not affect totals.
                const inWarmup = (typeof window !== 'undefined' && window.crashBot)
                    ? (String(window.crashBot.mode || '').toUpperCase() === 'WARMUP' &&
                        Number(window.crashBot.warmupCounter || 0) < Number(window.crashBot.warmupRounds || 0))
                    : (String(this.mode || '').toUpperCase() === 'WARMUP' && Number(this.warmupCounter || 0) < Number(this.warmupRounds || 0));

                if (inWarmup) {
                    // Optionally log warmup skip but do not count it.
                    try {
                        if (this.logger && typeof this.logger.log === 'function') this.logger.log(`(warmup) skip ignored: ${reason}`, 'debug');
                    } catch (_) {
                    }
                    return;
                }

                // delegate to StatsTracker (increments stats.totalSkips, stats.totalRounds)
                if (this.stats && typeof this.stats.addSkip === 'function') {
                    this.stats.addSkip(reason, mode);
                }
            } catch (e) { /* defensive - do not throw */
            }

            // keep bot-level counters in sync (panel reads these)
            try {
                // rounds counts bets + skips at bot-level (panel uses bot.rounds)
                this.rounds = Number(this.rounds || 0) + 1;
                if ((mode || 'NORMAL').toString().toUpperCase() === 'RECOVERY') {
                    this.recoverySkips = Number(this.recoverySkips || 0) + 1;
                } else {
                    this.normalSkips = Number(this.normalSkips || 0) + 1;
                }
            } catch (e) {
            }

        }

        this.addBetResult = (isWin, profit, meta = {}) => {
            try {
                if (this.stats && typeof this.stats.addBetResult === 'function') {
                    this.stats.addBetResult(isWin, profit, meta);
                }
            } catch (e) { /* non-fatal */
            }

            try {
                // A processed bet is also a round (bot-level)
                this.rounds = Number(this.rounds || 0) + 1;

                // Ensure the bot-level counters exist (no-op for placement but keeps UI fields defined)
                const mode = (meta && meta.mode) ? String(meta.mode).toUpperCase() : 'NORMAL';
                if (mode === 'RECOVERY') {
                    this.recoverySkips = Number(this.recoverySkips || 0);
                } else {
                    this.normalSkips = Number(this.normalSkips || 0);
                }
            } catch (e) { /* swallow */
            }
        };

        this.evModule = null; // empirical EV module (optional); declared for IDE & runtime clarity

        // Option B: inject a small API surface the engine expects (defensive bindings)
        const botApi = {
            getRecentCrashes: this.stats.getRecentCrashes ? this.stats.getRecentCrashes.bind(this) : undefined,
            detectAlternatingPattern: this.detectAlternatingPattern ? this.detectAlternatingPattern.bind(this) : undefined,
            _recordUnifiedDecision: this._recordUnifiedDecision ? this._recordUnifiedDecision.bind(this) : undefined,
            ai: this.ai, // may be null for now — engine handles defensively
            evModule: this.evModule || this.ev,
            // optional: include full bot ref if you want engine to access more methods (use sparingly)
            _fullBotRef: this
        };
        this.prediction = new EnsemblePredictionEngine(this.config, this.stats, this.logger, botApi);
        this.betting = new BettingEngine(this.config, this.logger);
        // External gate & followup controllers (you added these classes)
        // If you already set these properties elsewhere, skip adding here.
        try {
            // create controllers with the full bot reference so internal code uses bot.config consistently
            this.bettingGate = this.bettingGate || new BettingGateController(this);
        } catch (e) { /* defensive: controller may be injected at runtime */
        }
        // Optional AI helper (may be injected at runtime). Declare for IDE & runtime clarity.
        this.ai = null;
        // let the betting engine refer to the bot so the engine can capture modeAtPlace when placing bets
        // (defensive — no harm if BettingEngine already sets this)
        try {
            this.betting.bot = this;
        } catch (e) { /* non-fatal */
        }
        // let the betting engine read the bot mode at placement time (so it can set modeAtPlace properly)
        // and let the engine refer back to the bot when needed
        this.betting.bot = this;
        this.panel = new StatsPanel(this.config);

        // --- Initialize Math & State Engines ---
        this.internalState = new InternalStateManager(this);
        this.bayesPosterior = new BayesianPosterior(this.config);
        this.madCalibrator = new MADCalibrator(
            (this.config.config && this.config.config.ENSEMBLE && this.config.config.ENSEMBLE.MAD_WINDOW) || 25
        );

        // Recovery / debt bookkeeping
        // Mode can be 'NORMAL' | 'RECOVERY' | 'WARMUP'
        // Start mode is decided from config.warmup.startInWarmup (if warmup enabled)
        const cfgWarmup = (this.config && this.config.config && this.config.config.warmup) ? this.config.config.warmup : null;
        this.warmupRounds = (cfgWarmup && Number.isFinite(cfgWarmup.rounds)) ? Number(cfgWarmup.rounds) : 0;
        this.warmupCounter = 0;
        const startInWarmup = cfgWarmup && cfgWarmup.enabled && cfgWarmup.startInWarmup && this.warmupRounds > 0;
        this.mode = startInWarmup ? 'WARMUP' : 'NORMAL';

        // Betting start/end timestamps (Malaysia time strings "HH:MM:SS")
        this.betStartTimeMalaysia = null;
        this.betEndTimeMalaysia = null;

        // +++ BUNKER MODE STATE +++
        this.isBunkerMode = false;
        this.bunkerSafeStreak = 0;

        // Scheduled target (the HH:MM:SS the script is waiting for) and its epoch (KL epoch ms).
        // These are set when the bot is in WARMUP and timeOfDay is enabled so the UI can show
        // the configured target separately from the actual start time.
        this.scheduledTargetHHMMSS = null;
        this.scheduledTargetEpochMs = null;

        this.initialNormalLossBits = 0; // Stores the specific loss that started recovery
        this.shadowBetActive = false;   // Flag for Shadow Betting

        // create the new small controllers (classes added below)
        try {
            this.bettingGate = new BettingGateController(this);
        } catch (e) {
            this.bettingGate = null;
        }
        // Defensive: ensure gate starts CLOSED so EV/ensemble must explicitly open it.
        try {
            if (this.bettingGate && typeof this.bettingGate.closeGate === 'function') this.bettingGate.closeGate('init - default closed');
        } catch (e) {
        }
        try {
            this.recoveryManager = new RecoveryManager(this);
        } catch (e) {
            this.recoveryManager = null;
        }

        this.debtBits = 0;              // total debt currently outstanding (bits, integer)
        this.recoveryLevel = 0;        // depth / number of recovery rounds attempted
        this.rounds = 0;              // total rounds = bets + skips (not counting warmup)
        this.maxRecStakeBitsEver = 0;  // track max computed stake (existing)
        // Centralized max-recovery trackers (used by panel)
        this.maxRecLevel = 0;
        this.maxRecTime = null;
        this.maxRecRuntimeSeconds = 0;
        this.awaitingRecovery = false;  // when true, next betting window will place recovery stake
        // Pending EV-scheduled bet request (set by EV+ensebmle module via requestEvBet)
        this.pendingEvRequest = null;

        // Skip counters split by mode (user requested)
        this.normalSkips = 0;
        this.recoverySkips = 0;
        this.isRunning = false;

        this.lastPrediction = null;
        // track the last round's multiplier (initialized to 0)
        this.lastMultiplier = 0;

        this.initialize();
    }

    // Request that the bot place an EV-scheduled bet on next game_starting.
    // evRequest object shape (recommended):
    // { mode: 'NORMAL'|'RECOVERY', amountSat: <number>, multiplier: <number>, meta: {...} }
    // +++ patched requestEvBet: validates RECOVERY-mode requests and tags meta.source='EV' +++
    requestEvBet(evRequest = {}) {
        try {
            if (!evRequest || typeof evRequest !== 'object') return false;

            // Defensive normalization
            const req = Object.assign({}, evRequest);
            req.mode = (req.mode || 'NORMAL').toString().toUpperCase();

            // Ensure meta exists and tag as EV (so engine results retain this marker)
            req.meta = req.meta || {};
            req.meta.source = (req.meta.source || 'EV').toString().toUpperCase();
            req.meta.createdAt = req.meta.createdAt || Date.now();

            // RECOVERY-specific validation: only accept if recovery regime prob is acceptable
            if (req.mode === 'RECOVERY') {
                const recCfg = (this.config && this.config.recovery) ? this.config.recovery : {};
                // If user requires high-crash before placement, check probability
                if (recCfg.requireHighCrashBeforePlacement) {
                    // target multiplier to evaluate
                    const targetMult = Number(req.multiplier || this.getCanonicalRecoveryMultiplier());
                    const nextK = 3;
                    const prob = (typeof this.prediction.getRecoveryRegimeProb === 'function') ? Number(this.prediction.getRecoveryRegimeProb(targetMult, nextK) || 0) : 0;
                    const threshold = Number(recCfg.relaxRegimeProb || recCfg.relaxRegimeProb === 0 ? recCfg.relaxRegimeProb : 0.55);

                    if (!Number.isFinite(prob) || prob < threshold) {
                        try {
                            if (this.logger) this.logger.log(`RECOVERY EV request REJECTED: regime prob ${prob.toFixed(3)} < threshold ${threshold} (target=${targetMult})`, 'info');
                        } catch (e) {
                        }
                        return false;
                    }
                    try {
                        if (this.logger) this.logger.log(`RECOVERY EV request ACCEPTED: regime prob ${prob.toFixed(3)} >= ${threshold} (target=${targetMult})`, 'info');
                    } catch (e) {
                    }
                } else {
                    try {
                        if (this.logger) this.logger.log('RECOVERY EV request accepted (requireHighCrashBeforePlacement disabled)', 'info');
                    } catch (e) {
                    }
                }
            }

            // Persist pending EV request (normalized)
            this.pendingEvRequest = req;

            if (this.logger && typeof this.logger.log === 'function') {
                this.logger.log(`EV scheduled a bet request: mode=${String(req.mode)} amountSat=${Number(req.amountSat || 0)} target=${req.multiplier || ''}`, 'info');
            }

            return true;
        } catch (e) {
            try {
                if (this.logger) this.logger.log(`⚠️ requestEvBet error: ${e && e.message}`, 'warning');
            } catch (e) {
            }
            return false;
        }
    }

    // Resolve canonical stake amountSat (satoshis) with consistent fallbacks.
    // IMPORTANT: When mode === 'NORMAL' this function returns ONLY the value derived from
    // this.config.normal.baseBetBits (bits -> sats). No other fallback or helper is used.
    // For non-NORMAL modes, it falls back to evReq / pred / config.getBaseBetSat / bot helper / config.normal.baseBetBits.
    resolveCanonicalStakeSat(evReq = null, pred = null, mode = '') {
        try {
            const m = (mode || '').toString().toUpperCase();
            // If caller explicitly requests NORMAL mode staking, enforce config.normal.baseBetBits strictly.
            if (m === 'NORMAL') {
                try {
                    if (this.config && this.config.normal && Number.isFinite(Number(this.config.normal.baseBetBits)) && Number(this.config.normal.baseBetBits) > 0) {
                        return Math.round(Number(this.config.normal.baseBetBits) * 100);
                    }
                } catch (_) {
                }
                // If config missing or invalid, return 0 (explicitly do not use other fallbacks for NORMAL)
                return 0;
            }

            // Non-NORMAL mode: use normal precedence (evReq -> pred -> config.getBaseBetSat -> bot helper -> config.normal.baseBetBits)
            if (evReq && Number.isFinite(Number(evReq.amountSat)) && Number(evReq.amountSat) > 0) {
                return Math.round(Number(evReq.amountSat));
            }
            if (pred && Number.isFinite(Number(pred.suggestedBet)) && Number(pred.suggestedBet) > 0) {
                return Math.round(Number(pred.suggestedBet));
            }
            try {
                if (this.config && typeof this.config.getBaseBetSat === 'function') {
                    const sat = Number(this.config.getBaseBetSat() || 0);
                    if (Number.isFinite(sat) && sat > 0) return Math.round(sat);
                }
            } catch (_) {
            }
            try {
                if (this.bot && typeof this.bot.getNormalBaseBetBits === 'function') {
                    const bits = Number(this.bot.getNormalBaseBetBits() || 0);
                    if (Number.isFinite(bits) && bits > 0) return Math.round(bits * 100);
                }
            } catch (_) {
            }
            try {
                if (this.config && this.config.normal && Number.isFinite(Number(this.config.normal.baseBetBits))) {
                    return Math.round(Number(this.config.normal.baseBetBits) * 100);
                }
            } catch (_) {
            }
        } catch (_) {
        }
        return 0;
    }

    // Helper: validated & instrumented placeBet wrapper
    safePlaceBet(amountSat, multiplier, opts = {}, evReq = null) {
        try {
            // Build a diagnostic snapshot for logs (useful to trace occasional 0-sat issues)
            const cfgBaseSat = (this.config && typeof this.config.getBaseBetSat === 'function') ? Number(this.config.getBaseBetSat() || 0) : (this.config && this.config.normal ? Number((this.config.normal.baseBetBits || 0) * 100) : 0);
            const pending = (this.pendingEvRequest !== undefined) ? this.pendingEvRequest : null;
            const snapshot = {
                ts: (new Date()).toISOString(),
                amountSat: Number(amountSat || 0),
                multiplier: Number(multiplier || 0),
                opts: opts || {},
                pendingEvRequest: pending,
                cfgBaseSat: Number(cfgBaseSat || 0)
            };
            // Log diagnostic snapshot at debug level (will appear if logger supports 'debug')
            try {
                if (this.logger && this.logger.log) this.logger.log(`safePlaceBet snapshot: ${JSON.stringify(snapshot)}`, 'debug');
            } catch (e) {
            }
            // Validate stake
            if (!Number.isFinite(snapshot.amountSat) || snapshot.amountSat <= 0) {
                try {
                    if (this.logger && this.logger.log) this.logger.log(`ERROR safePlaceBet: invalid amountSat=${snapshot.amountSat}. Aborting placeBet.`, 'error');
                } catch (e) {
                }
                // Optionally clear pending request to avoid stuck UI if stake invalid
                try {
                    if (typeof this.clearPendingEvRequest === 'function') this.clearPendingEvRequest(); else this.pendingEvRequest = null;
                } catch (e) {
                }
                return false;
            }
            // Validate multiplier
            if (!Number.isFinite(snapshot.multiplier) || snapshot.multiplier <= 1) {
                try {
                    if (this.logger && this.logger.log) this.logger.log(`ERROR safePlaceBet: invalid multiplier=${snapshot.multiplier}. Aborting placeBet.`, 'error');
                } catch (e) {
                }
                try {
                    if (typeof this.clearPendingEvRequest === 'function') this.clearPendingEvRequest(); else this.pendingEvRequest = null;
                } catch (e) {
                }
                return false;
            }
            // Call the real engine and catch any throw
            try {
                // +++ Update Max Recovery Stats immediately upon placement +++
                // This ensures we capture the exact stake and level associated with this bet.
                if (opts && opts.modeAtPlace === 'RECOVERY') {
                    // Convert sat to bits for stats
                    const bits = Math.round(snapshot.amountSat / 100);
                    this._updateMaxRecoveryStats(bits);
                }

                const res = this.betting.placeBet(Math.round(snapshot.amountSat), snapshot.multiplier, opts || {});
                try {
                    if (this.logger && this.logger.log) this.logger.log(`safePlaceBet result: placed=${!!res} amountSat=${snapshot.amountSat} mult=${snapshot.multiplier}`, 'debug');
                } catch (e) {
                }
                return res;
            } catch (err) {
                try {
                    if (this.logger && this.logger.log) this.logger.log(`ERROR safePlaceBet: placeBet threw: ${err && (err.message || err)}`, 'error');
                } catch (e) {
                }
                return false;
            }
        } catch (fatal) {
            try {
                if (this.logger && this.logger.log) this.logger.log(`ERROR safePlaceBet fatal: ${fatal && (fatal.message || fatal)}`, 'error');
            } catch (e) {
            }
            return false;
        }
    }

    // Clear any pending EV request (call after placing or when discarding)
    clearPendingEvRequest() {
        try {
            this.pendingEvRequest = null;
        } catch (e) {
            try {
                if (this.logger) this.logger.log(`⚠️ clearPendingEvRequest error: ${e && e.message}`, 'warning');
            } catch (e) {
            }
        }
    }

    // +++ Centralized halt helper (use only from game_starting/game_crash) +++
    // type: 'stop loss' | 'take profit'
    triggerHalt(type = 'stop loss', reason = '') {
        try {
            this.logger.log(`⛔ ${type.toUpperCase()} triggered: ${reason}`, 'warning');
        } catch (e) {
        }

        // defensive flags
        this.isRunning = false;
        this.mode = (this.mode || 'RECOVERY');

        // === FIX: Always capture End Time when halting (TP/SL) ===
        this.betEndTimeMalaysia = this._malaysiaTimeString(new Date());

        // Build normalized type key expected by showNonBlockingAlert
        // showNonBlockingAlert uses 'takeprofit' and 'stoploss' keys; map common labels.
        const normalizeTypeKey = (t) => {
            if (!t || typeof t !== 'string') return String(t || '').toLowerCase();
            const s = t.toLowerCase();
            if (s.indexOf('profit') !== -1) return 'takeprofit';
            if (s.indexOf('stop') !== -1) return 'stoploss';
            // fallback: remove spaces
            return s.replace(/\s+/g, '');
        };

        const typeKey = normalizeTypeKey(type);
        const message = `${type.toUpperCase()}: ${reason || (typeKey === 'takeprofit' ? 'target reached' : 'stop loss triggered')}`;

        // Prefer the CrashBot-local showNonBlockingAlert helper (non-blocking toast).
        try {
            if (typeof this.showNonBlockingAlert === 'function') {
                try {
                    this.showNonBlockingAlert(typeKey, message);
                } catch (inner) { /* swallow UI errors */
                }
            } else if (typeof showNonBlockingAlert === 'function') {
                try {
                    showNonBlockingAlert(typeKey, message);
                } catch (inner) { /* swallow UI errors */
                }
            } else {
                try {
                    if (typeof document !== 'undefined') {
                        document.title = (typeKey === 'takeprofit') ? 'Take Profit - Crash Bot' : ((typeKey === 'stoploss') ? 'Stop Loss - Crash Bot' : `Crash Bot - ${type}`);
                    }
                } catch (docErr) {
                }
            }
        } catch (uiErr) { /* ignore UI errors */
        }

        // If this is a STOP LOSS, always stop the engine (existing behavior)
        if (typeKey === 'stoploss') {
            try {
                if (typeof engine !== 'undefined' && typeof engine.stop === 'function') engine.stop();
            } catch (e) { /* ignore */
            } finally {
                try {
                    this.scheduledTargetEpochMs = null;
                    this.scheduledTargetScheduleKey = null;
                    this.scheduledTargetHHMMSS = null;
                } catch (e) {
                }
            }
            try {
                if (typeof window !== 'undefined' && typeof window.botStop === 'function') window.botStop();
            } catch (e) { /* ignore */
            } finally {
                try {
                    this.scheduledTargetEpochMs = null;
                    this.scheduledTargetScheduleKey = null;
                    this.scheduledTargetHHMMSS = null;
                } catch (e) {
                }
            }
            try {
                this.updatePanel(false, message);
            } catch (e) {
            }
            return;
        }

        // For TAKE PROFIT, decide whether to actually stop or to pause & schedule next occurrence.
        if (typeKey === 'takeprofit') {

            // Decide which schedule TP should actually stop the engine.
            let wantStop = false;
            try {
                const cfgBehavior = (this.config && (this.config.behavior || (this.config.config && this.config.config.behavior))) ? (this.config.behavior || this.config.config.behavior) : null;
                const explicitStopKey = (cfgBehavior && cfgBehavior.stopOnTakeProfitOnlyFrom) ? cfgBehavior.stopOnTakeProfitOnlyFrom : null;
                const scheduleKey = (this.runtime && this.runtime.currentScheduleKey) ? this.runtime.currentScheduleKey : null;

                const configuredCount = (typeof this._configuredSchedulesCount === 'function') ? Number(this._configuredSchedulesCount() || 0) : 0;

                // Validate explicitStopKey: only consider it authoritative if that schedule is actually configured (has a time).
                let explicitStopKeyValid = false;
                try {
                    const schedulesCfg = (this.config && (this.config.schedules || (this.config.config && this.config.config.schedules))) ? (this.config.schedules || this.config.config.schedules) : null;
                    if (explicitStopKey && typeof explicitStopKey === 'string' && schedulesCfg && schedulesCfg[explicitStopKey] && schedulesCfg[explicitStopKey].time) {
                        explicitStopKeyValid = true;
                    }
                } catch (e) {
                    explicitStopKeyValid = false;
                }

                if (explicitStopKeyValid) {
                    // If explicitStopKey points to a configured schedule, only TP from that schedule stops.
                    if (scheduleKey === explicitStopKey) wantStop = true;
                } else {
                    // Fallback rules (when explicitStopKey === null)
                    if (configuredCount === 0) {
                        // No schedule configured -> behave as current (stop)
                        wantStop = true;
                    } else if (configuredCount === 1) {
                        // Only one schedule configured -> it's the stopper
                        wantStop = true;
                    } else if (configuredCount === 2) {
                        // Two schedules configured -> only stop after we've resumed from both schedules once.
                        const resumes = Number(this.runtime && this.runtime.resumesDone ? this.runtime.resumesDone : 0);
                        if (resumes >= configuredCount) wantStop = true;
                    } else {
                        // Three or more (we only support 3): default to 'betSchedule2' as stopper (original default)
                        if (scheduleKey === 'betSchedule2') wantStop = true;
                    }
                }
            } catch (e) {
                // On error, fallback to stopping (safer)
                wantStop = true;
            }

            if (wantStop) {
                // preserve existing stop behavior
                try {
                    if (typeof engine !== 'undefined' && typeof engine.stop === 'function') engine.stop();
                } catch (e) { /* ignore */
                } finally {
                    try {
                        this.scheduledTargetEpochMs = null;
                        this.scheduledTargetScheduleKey = null;
                        this.scheduledTargetHHMMSS = null;
                    } catch (e) {
                    }
                }
                try {
                    if (typeof window !== 'undefined' && typeof window.botStop === 'function') window.botStop();
                } catch (e) { /* ignore */
                } finally {
                    try {
                        this.scheduledTargetEpochMs = null;
                        this.scheduledTargetScheduleKey = null;
                        this.scheduledTargetHHMMSS = null;
                    } catch (e) {
                    }
                }
                try {
                    this.updatePanel(false, message);
                } catch (e) {
                }
                return;
            } else {
                // Pause rather than stop: schedule next immediate schedule & update state/UI.
                try {
                    this.pauseForTakeProfit && this.pauseForTakeProfit(reason);
                } catch (e) {
                    // If pause fails for any reason, fallback to stopping the engine (safe).
                    try {
                        if (typeof engine !== 'undefined' && typeof engine.stop === 'function') engine.stop();
                    } catch (_e) {
                    } finally {
                        try {
                            this.scheduledTargetEpochMs = null;
                            this.scheduledTargetScheduleKey = null;
                            this.scheduledTargetHHMMSS = null;
                        } catch (e) {
                        }
                    }
                }
                return;
            }
        }

        // Default fallback: stop engine
        try {
            if (typeof engine !== 'undefined' && typeof engine.stop === 'function') engine.stop();
        } catch (e) { /* ignore */
        } finally {
            try {
                this.scheduledTargetEpochMs = null;
                this.scheduledTargetScheduleKey = null;
                this.scheduledTargetHHMMSS = null;
            } catch (e) {
            }
        }
        try {
            if (typeof window !== 'undefined' && typeof window.botStop === 'function') window.botStop();
        } catch (e) { /* ignore */
        } finally {
            try {
                this.scheduledTargetEpochMs = null;
                this.scheduledTargetScheduleKey = null;
                this.scheduledTargetHHMMSS = null;
            } catch (e) {
            }
        }
        try {
            this.updatePanel(false, message);
        } catch (e) {
        }
    }

    // Compute the next immediate schedule occurrence (based on now) and return { targetEpochMs, targetHHMMSS, scheduleKey } or null.
    _getNextImmediateSchedule() {
        try {
            const schedules = (this.config && (this.config.schedules || (this.config.config && this.config.config.schedules))) ? (this.config.schedules || this.config.config.schedules) : null;
            if (!schedules) return null;

            const now = Date.now();
            // compute next occurrence for each schedule (use today's KL date, or next day if time already passed)
            let best = null;
            for (const key of Object.keys(schedules || {})) {
                const entry = schedules[key];
                if (!entry || !entry.time) continue;
                // compute epoch for the KL date relative to anchor: use Date.now as anchor so it's relative to now
                const epochForToday = this._klEpochForDate(entry.time, Date.now());
                if (epochForToday === null) continue;
                let next = Number(epochForToday);
                if (next <= now) next += 24 * 3600 * 1000;
                if (!best || next < best.targetEpochMs) {
                    best = {targetEpochMs: next, targetHHMMSS: entry.time, scheduleKey: key};
                }
            }
            return best;
        } catch (e) {
            return null;
        }
    }

    // Pause because of take profit: schedule the next immediate schedule and set UI/state accordingly
    pauseForTakeProfit(reason) {
        try {
            // Ensure runtime object exists and mark pausedBecauseTP early and reliably.
            this.runtime = this.runtime || {};
            this.runtime.pausedBecauseTP = true;

            // compute next schedule
            const next = this._getNextImmediateSchedule();

            if (next) {

                this.scheduledTargetHHMMSS = next.targetHHMMSS;

                // store canonical numeric epoch (ms) — keep numeric type
                this.scheduledTargetEpochMs = Number(next.targetEpochMs);

                // set schedule key BEFORE logging so other components reading the key are consistent
                this.scheduledTargetScheduleKey = (typeof next.scheduleKey !== 'undefined') ? next.scheduleKey : null;
                this.runtime.currentScheduleKey = this.scheduledTargetScheduleKey || null;

                this.logger && this.logger.log && this.logger.log(
                    `pauseForTakeProfit: scheduled resume at ${new Date(this.scheduledTargetEpochMs).toLocaleString('en-GB', {timeZone: 'Asia/Kuala_Lumpur'})} (key=${this.scheduledTargetScheduleKey})`,
                    'info'
                );

            } else {
                // if no schedules configured, fallback to stopping (safer)
                try {
                    if (typeof engine !== 'undefined' && typeof engine.stop === 'function') engine.stop();
                } catch (e) {
                } finally {
                    try {
                        this.scheduledTargetEpochMs = null;
                        this.scheduledTargetScheduleKey = null;
                        this.scheduledTargetHHMMSS = null;
                    } catch (e) {
                    }
                }
                return;
            }

            // Clear the betting times so UI knows next scheduled start will update them
            try {
                this.betStartTimeMalaysia = null;
            } catch (e) {
            }
            try {
                this.betEndTimeMalaysia = null;
            } catch (e) {
            }

            // Close the betting gate so no new bets are placed during paused period
            try {
                if (this.bettingGate && typeof this.bettingGate.closeGate === 'function') this.bettingGate.closeGate('TAKE_PROFIT_PAUSE');
            } catch (e) {
            }

            // set mode to WARMUP so panel shows waiting state (the UI code uses WARMUP + _nextScheduleTarget to show the waiting countdown)
            try {
                this.mode = 'WARMUP';
            } catch (e) {
            }

            // Update panel and document title to show waiting text
            try {
                const waitingText = `Waiting to start betting at ${this.scheduledTargetHHMMSS}`;
                try {
                    if (typeof document !== 'undefined') document.title = waitingText;
                } catch (e) {
                }
                try {
                    this.updatePanel(false, 'HALTED-TP');
                } catch (e) {
                }
            } catch (e) {
            }

            // mark that we are paused (do not clear runtime.currentScheduleKey here; preserve knowledge for possible further decisions)
        } catch (e) {
            try {
                this.logger && this.logger.log && this.logger.log(`pauseForTakeProfit error: ${e && e.message}`, 'error');
            } catch (_) {
            }
        }
    }

    // Clear any stored scheduled target used for TP-pause/resume flow
    _clearScheduledTarget() {
        try {
            this.scheduledTargetEpochMs = null;
            this.scheduledTargetScheduleKey = null;
            this.scheduledTargetHHMMSS = null;
            if (this._scheduledResumeWatcher) {
                clearInterval(this._scheduledResumeWatcher);
                this._scheduledResumeWatcher = null;
            }
        } catch (e) { /* ignore */
        }
    }

    // Add to CrashBot prototype (inside class CrashBot)
    getCurrentBalance() {
        try {
            // delegate to the ConfigManager canonical getter (returns satoshi)
            if (this.config && typeof this.config.getCurrentBalance === 'function') {
                return Number(this.config.getCurrentBalance()) || 0;
            }
            // defensive fallback: use test balance in bits -> sats
            return (this.config && this.config.testBalanceBits ? (Number(this.config.testBalanceBits) || 0) * 100 : 0);
        } catch (e) {
            try {
                if (this.logger) this.logger.log(`getCurrentBalance proxy error: ${e && e.message}`, 'warning');
            } catch (e2) {
            }
            return (this.config && this.config.testBalanceBits ? (Number(this.config.testBalanceBits) || 0) * 100 : 0);
        }
    }

    initialize() {
        // --- SILENCE CONSOLE WHEN debug IS FALSE ---
        // Place this at the top of initialize() so any direct console.log/info/debug calls are silenced
        try {
            const _shouldDebug = (this.config && typeof this.config.get === 'function') ? !!this.config.get('debug') : false;
            if (!_shouldDebug) {
                // Save originals once and replace with no-ops
                ['log', 'info', 'debug'].forEach(fnName => {
                    if (!console['__' + fnName]) {
                        console['__' + fnName] = console[fnName];
                    }
                    console[fnName] = function () { /* suppressed because debug=false */
                    };
                });
            } else {
                // If debug true (or re-enabled), restore originals if present
                ['log', 'info', 'debug'].forEach(fnName => {
                    if (console['__' + fnName]) console[fnName] = console['__' + fnName];
                });
            }
        } catch (e) {
            // Defensive: never throw during initialization due to logging toggles
        }
        // --- end silence block ---

        this.logger.log('🚀 Crash Bot v6.0 BALANCED Initializing...', 'info');

        // --- Runtime scheduling bookkeeping for multi-schedule behavior ---
        // Tracks which schedule caused the current betting session (if any)
        this.runtime = this.runtime || {};
        this.runtime.currentScheduleKey = null;     // 'betSchedule1' | 'betSchedule2' | 'betSchedule3' | null
        this.runtime.resumesDone = Number(this.runtime.resumesDone || 0); // number of resume-from-schedule events this run
        this.runtime.pausedBecauseTP = false;       // true when TP caused a pause (not engine.stop)
        this.runtime.startedBySchedule = false;     // true if the current betting run started because of schedule

        // Helper to count configured schedules (non-null times)
        this._configuredSchedulesCount = () => {
            const s = (this.config && (this.config.schedules || (this.config.config && this.config.config.schedules))) ? (this.config.schedules || this.config.config.schedules) : null;
            if (!s) return 0;
            return Object.keys(s).filter(k => s[k] && s[k].time).length;
        };

        // Ensure the runtime ticker runs every second (lightweight) to avoid throttling
        try {
            if (this.panel && typeof this.panel.startRuntimeTicker === 'function') this.panel.startRuntimeTicker(this);
        } catch (e) {
        }


        // Log initial config
        if (this.config.get('debug')) {
            console.log('⚙️ Initial Config:', this.config.config);
        }

        const balance = this.config.getCurrentBalance();
        const isTest = this.config.getRunMode ? this.config.getRunMode() === 'test' : (this.config.get ? this.config.get('runMode') === 'test' : false);
        this.logger.log(`💰 ${isTest ? 'Test' : 'Live'} mode: Using ${isTest ? 'test ' : ''}balance of ${(balance / 100).toFixed(2)} bits`, 'info');

        this.setupEventListeners();

        // --- Add scheduled-resume watcher so we don't rely only on game events ---
        if (!this._scheduledResumeWatcher) {
            this._scheduledResumeWatcher = setInterval(() => {
                try {
                    if (this.mode !== 'WARMUP') return;

                    const cfgWarmup = (this.config && (this.config.config && this.config.config.warmup))
                        ? this.config.config.warmup
                        : ((this.config && this.config.warmup) ? this.config.warmup : null);
                    if (!cfgWarmup || !cfgWarmup.timeOfDay || !cfgWarmup.timeOfDay.enabled) return;

                    const todTarget = (typeof this._nextScheduleTarget === 'function') ? this._nextScheduleTarget(cfgWarmup) : null;

                    // Determine effectiveEpoch (same precedence used in crash handler)
                    let effectiveEpoch = null;
                    let effectiveScheduleKey = null;
                    if (this.runtime && this.runtime.pausedBecauseTP && Number.isFinite(Number(this.scheduledTargetEpochMs)) && Number(this.scheduledTargetEpochMs) > 0) {
                        effectiveEpoch = Number(this.scheduledTargetEpochMs);
                        effectiveScheduleKey = this.scheduledTargetScheduleKey || (todTarget ? todTarget.scheduleKey : null);
                    } else if (todTarget && Number.isFinite(Number(todTarget.targetEpochMs))) {
                        effectiveEpoch = Number(todTarget.targetEpochMs);
                        effectiveScheduleKey = todTarget.scheduleKey;
                    }

                    const now = Date.now();
                    if (effectiveEpoch !== null && now >= effectiveEpoch) {
                        // Delegate the resume flow to a single helper to stay DRY and avoid divergence bugs.
                        // Pass the schedule key (effectiveScheduleKey). No effectiveHHMMSS available in this watcher context.
                        try {
                            this._onScheduledResume(effectiveScheduleKey, null);
                        } catch (e) { /* swallow to avoid breaking watcher */
                        }
                    }
                } catch (e) { /* ignore */
                }
            }, 1000);
        }

        // runtime bookkeeping
        // firstStartedAt: the absolute first time the bot was started (used for Start Time display).
        // startedAt: the current running interval (null when bot is stopped/paused)
        // pausedRunSeconds: accumulated run seconds from previous start/stop cycles (frozen when bot is stopped)
        this.firstStartedAt = this.firstStartedAt || Date.now();
        this.startedAt = this.firstStartedAt;
        this.pausedRunSeconds = this.pausedRunSeconds || 0;
        this.isRunning = true;

        const runModeLabel = (typeof this.config.getRunMode === 'function') ? this.config.getRunMode().toUpperCase() : ((this.config.runMode || 'test').toUpperCase());
        this.logger.log(`🟢 Bot started in ${runModeLabel} mode with BALANCED STRATEGIC BETTING`, 'success');

        // Update initial panel
        // expose global handle for prediction module to read warmupCounter for observation accounting
        try {
            if (typeof window !== 'undefined') window.crashBot = this;
        } catch (e) {
        }

        // Let the StatsPanel know about this bot instance so the panel can access bot state via this.bot
        try {
            if (this.panel) {
                if (typeof this.panel.setBot === 'function') {
                    this.panel.setBot(this);
                } else {
                    this.panel.bot = this;
                }
            }
        } catch (e) { /* ignore */
        }
        this.updatePanel();

        return this;
    }

    // --- Malaysia / KL time helpers (Asia/Kuala_Lumpur, UTC+8) ---
    _malaysiaTimeString(date = new Date()) {
        // returns "HH:MM:SS" in Malaysia time (24h)
        try {
            return new Date(date).toLocaleTimeString('en-GB', {timeZone: 'Asia/Kuala_Lumpur', hour12: false});
        } catch (e) {
            // Fallback: compute using UTC + 8 offset
            const d = new Date(date);
            const kl = new Date(d.getTime() + 8 * 3600 * 1000);
            return `${String(kl.getUTCHours()).padStart(2, '0')}:${String(kl.getUTCMinutes()).padStart(2, '0')}:${String(kl.getUTCSeconds()).padStart(2, '0')}`;
        }
    }

    // returns epoch ms for the KL date corresponding to anchorEpoch (ms) at HH:MM:SS
    // anchorEpoch should normally be this.firstStartedAt (script start) or Date.now() fallback.
    _klEpochForDate(hhmmss, anchorEpochMs) {
        if (!hhmmss || typeof hhmmss !== 'string') return null;
        const parts = hhmmss.split(':').map(p => Number(p));
        if (parts.length < 2 || parts.some(p => Number.isNaN(p))) return null;
        const HH = parts[0] || 0, MM = parts[1] || 0, SS = parts[2] || 0;

        // Determine the KL local date for the anchor epoch
        const klAnchorStr = new Date(Number(anchorEpochMs)).toLocaleString('en-GB', {timeZone: 'Asia/Kuala_Lumpur'}); // "dd/mm/yyyy, hh:mm:ss"
        const datePart = klAnchorStr.split(',')[0].trim();
        const [dd, mm, yyyy] = datePart.split('/').map(n => Number(n));
        if (![dd, mm, yyyy].every(Number.isFinite)) {
            // Fallback: use anchor's local date
            const d = new Date(Number(anchorEpochMs));
            return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), HH, MM, SS) - (8 * 3600 * 1000);
        }

        // Convert KL local components to UTC epoch ms for that KL instant
        const epochUtcForKL = Date.UTC(yyyy, mm - 1, dd, HH, MM, SS) - (8 * 3600 * 1000);
        return epochUtcForKL;
    }

    // Choose the next target epoch (ms) and the target HH:MM:SS string based on the configured morning/evening.
    // Returns { targetEpochMs, targetHHMMSS } or null if no valid target configured.
    // Choose the next target epoch (ms) and the target HH:MM:SS string based on configured schedules.
    // Returns { targetEpochMs, targetHHMMSS, scheduleKey } or null if no valid target configured.
    _nextScheduleTarget(configWarmup) {

        try {
            if (!configWarmup || !configWarmup.timeOfDay || !configWarmup.timeOfDay.enabled) return null;

            // Pull schedules from config. Support both ConfigManager instance and plain config shapes.
            let schedules = null;
            if (this.config && typeof this.config.get === 'function' && this.config.get('schedules')) {
                schedules = this.config.get('schedules');
            } else {
                schedules = (this.config && this.config.schedules) ? this.config.schedules : (this.config && this.config.config && this.config.config.schedules ? this.config.config.schedules : null);
            }

            if (!schedules) return null;

            // Build list of schedule entries where time is provided
            const scheduleEntries = Object.keys(schedules || {}).map(k => {
                const v = schedules[k];
                if (!v || !v.time) return null;
                return {key: k, time: v.time, takeProfitBits: v.takeProfitBits || 0};
            }).filter(Boolean);

            if (scheduleEntries.length === 0) return null;

            // Anchor selection:
            // Implementation:
            //  - If pausedBecauseTP -> anchor = Date.now() (we want the "next immediate schedule" relative to now)
            //  - Else -> anchor = firstStartedAt || Date.now() (preserve classic warmup semantics anchored to initial run)

            const anchorEpoch = (this.runtime && this.runtime.pausedBecauseTP)
                ? Date.now()
                : (Number(this.firstStartedAt) || Date.now());
            // compute epoch for schedule.time based on anchor's KL date and return next occurrence

            // compute epoch for schedule.time based on anchor's KL date and return next occurrence
            const computeNextFor = (hhmmss) => {
                const t = this._klEpochForDate(hhmmss, anchorEpoch);
                if (t === null) return null;
                // if anchor >= t, schedule next day
                if (anchorEpoch >= t) return t + 24 * 3600 * 1000;
                return t;
            };

            // For each schedule compute next occurrence epoch relative to anchor; pick the earliest
            let best = null;
            for (const entry of scheduleEntries) {
                const nextEpoch = computeNextFor(entry.time);
                if (nextEpoch === null) continue;
                if (!best || nextEpoch < best.targetEpochMs) {
                    best = {
                        targetEpochMs: Number(nextEpoch),
                        targetHHMMSS: entry.time,
                        scheduleKey: entry.key
                    };
                }
            }

            return best;

        } catch (e) {
            return null;
        }
    }

    setupEventListeners() {
        try {
            // Game starting event
            // Implements:
            //  - warmup closes gate & discards any schedules (EV still trains)
            //  - only EV-scheduled requests or scheduled FOLLOWUP slots may place bets
            //  - BettingGateController is the single authority to allow/deny placement
            engine.on('game_starting', (info) => {

                if (!this.isRunning) return;

                // Take profit and stop loss checker
                const limitCheck = this.checkLimits(this.getCurrentBalance());
                if (limitCheck && limitCheck.action && limitCheck.action !== 'ok') {
                    if (limitCheck.action === 'stop') {
                        this.triggerHalt('stop loss', limitCheck.reason);
                        return;
                    } else if (limitCheck.action === 'tp') {
                        this.triggerHalt('take profit', limitCheck.reason);
                        return;
                    }
                }

                this.logger.log(`🎯 Game starting in ${info.time_till_start}ms`, 'info');

                // WARMUP: close gate, clear follow-ups & pending EV requests, update panel and count warmup rounds.
                if (String(this.mode || '').toUpperCase() === 'WARMUP') {
                    try {
                        if (typeof this.addSkip === 'function') this.addSkip('warmup', 'WARMUP');
                    } catch (e) {
                    }
                    try {
                        if (this.bettingGate) this.bettingGate.closeGate('WARMUP');
                    } catch (e) {
                    }
                    try {
                        this.clearPendingEvRequest();
                    } catch (e) {
                    }
                    try {
                        if (typeof this.updatePanel === 'function') this.updatePanel(false, 'WARMUP-SKIP');
                    } catch (e) {
                    }
                    // Note: DO NOT pause/unpause the bot here — gate controls skipping.
                    return;
                }

                // +++ CHECK BUNKER STATUS (BLOCK BETS) +++
                if (this.isBunkerMode) {
                    // Access config safely
                    const bunkerCfg = (this.config && this.config.config && this.config.config.bunker) ? this.config.config.bunker : { requiredSafeRounds: 2 };

                    this.logger.log(`[🛡️ BUNKER ACTIVE] Waiting for market to heal. Streak: ${this.bunkerSafeStreak}/${bunkerCfg.requiredSafeRounds}`, 'skip');

                    // Update panel to show user why we are skipping
                    try {
                        if (typeof this.updatePanel === 'function') this.updatePanel(false, 'BUNKER-WAIT');
                    } catch (e) {}

                    return; // STOP HERE: Do not proceed to EV or Follow-up logic
                }

                // ----- Evaluate Ensemble/EV and possibly schedule an EV request -----
                // If we do not already have a pending EV request and there is no immediate follow-up scheduled,
                // ask the EnsemblePredictionEngine for a prediction (NORMAL or RECOVERY) and auto-schedule.
                try {
                    if (!this.pendingEvRequest) {
                        const evalMode = (this.mode || 'NORMAL').toString().toUpperCase();
                        if (this.prediction && typeof this.prediction.getPrediction === 'function') {
                            // Accept either synchronous or Promise-returning getPrediction
                            try {
                                const maybePred = this.prediction.getPrediction(evalMode);

                                const handlePred = (pred) => {
                                    try {
                                        if (!pred) return;

                                        try {
                                            this.logger.log(
                                                `🔍 Ensemble eval (${evalMode}): shouldBet=${pred.shouldBet} | conf=${(pred.confidence * 100).toFixed(1)}% | reason=${pred.reason}`,
                                                'info'
                                            );
                                        } catch (e) {
                                        }

                                        // avoid overwriting a pending EV request that might have been set
                                        // by a concurrent sync/async prediction
                                        if (pred && pred.shouldBet && !this.pendingEvRequest) {
                                            const multiplier = (evalMode === 'NORMAL')
                                                ? Number(this.getNormalMultiplier())
                                                : Number(this.getCanonicalRecoveryMultiplier());
                                            // normalize pending EV request: include canonical amountSat (satoshis)
                                            // For NORMAL evalMode enforce config.normal.baseBetBits via resolver.
                                            const canonicalAmountSat = (String(evalMode || '').toUpperCase() === 'NORMAL')
                                                ? this.resolveCanonicalStakeSat(null, pred, 'NORMAL')
                                                : this.resolveCanonicalStakeSat(null, pred, '');
                                            this.pendingEvRequest = {
                                                mode: evalMode,
                                                multiplier: multiplier,
                                                amountSat: canonicalAmountSat,
                                                suggestedBetSat: Number(pred.suggestedBet || 0),
                                                details: pred.details || null,
                                                createdAt: Date.now(),
                                                expireAt: Date.now() + 8000 // adjust if your environment needs more time
                                            };

                                            try {
                                                this.logger.log(
                                                    `🗳️ Auto-scheduled EV request [${this.pendingEvRequest.mode}] multiplier=${this.pendingEvRequest.multiplier} suggestedBet=${Math.round(this.pendingEvRequest.suggestedBetSat)}sat`,
                                                    'info'
                                                );
                                            } catch (e) {
                                            }

                                            try {
                                                this.updatePanel(false, this.pendingEvRequest.mode);
                                            } catch (e) {
                                            }
                                        }
                                    } catch (e) {
                                        try {
                                            this.logger.log(`⚠️ Ensemble scheduling error (handler): ${e && e.message}`, 'warning');
                                        } catch (_) {
                                        }
                                    }
                                };

                                if (maybePred && typeof maybePred.then === 'function') {
                                    maybePred.then(handlePred).catch(err => {
                                        try {
                                            this.logger.log(`⚠️ Ensemble scheduling promise failed: ${err && err.message}`, 'warning');
                                        } catch (_) {
                                        }
                                    });
                                } else {
                                    handlePred(maybePred);
                                }
                            } catch (e) {
                                try {
                                    this.logger.log(`⚠️ Ensemble scheduling top-level error: ${e && e.message}`, 'warning');
                                } catch (_) {
                                }
                            }
                        }
                    }
                } catch (e) {
                    try {
                        this.logger.log(`⚠️ Ensemble scheduling error: ${e && e.message}`, 'warning');
                    } catch (_) {
                    }
                }

                // 1) IMMEDIATE FOLLOW-UP (Highest Priority)
                try {
                    // Check atomic state flag for immediate execution
                    if (this.internalState && this.internalState.hasImmediateFollowup() && !this.betting.hasActiveBet()) {

                        // A. Prepare Stake & Target using canonical recovery settings
                        const amountSat = Number(this.getRecoveryBetAmountSat());
                        const recMult = Number(this.getCanonicalRecoveryMultiplier());

                        if (amountSat > 0) {
                            // B. Place Bet IMMEDIATELY (Bypass Gates)
                            // We pass 'RECOVERY' as mode and 'FOLLOWUP' as source meta for the UI tracking
                            const placed = this.safePlaceBet(amountSat, recMult, {
                                modeAtPlace: 'RECOVERY',
                                meta: { source: 'FOLLOWUP' }
                            });

                            if (placed) {
                                this.logger.log(`🔁 Immediate Follow-up Placed: ${Math.round(amountSat/100)} bits @ ${recMult}x`, 'bet');

                                // C. Sync Engine & Update Panel
                                // This explicitly sets the panel status to RECOVERY-FOLLOWUP
                                this._syncActiveBetFromEngine();
                                this.updatePanel(true, 'RECOVERY-FOLLOWUP');

                                // D. Consume the flag (One shot only)
                                this.internalState.setImmediateFollowup(false);

                                // STOP PROCESSING: Priority 1 met, do not proceed to EV or other logic
                                return;
                            } else {
                                // If placement failed (e.g. latency/closed), we ABORT. We do not retry/schedule.
                                this.logger.log(`❌ Failed to place immediate follow-up. Aborting to prevent sync loss.`, 'error');
                                this.internalState.setImmediateFollowup(false);
                            }
                        } else {
                            // Invalid stake calculation (e.g. cap reached or error)
                            this.logger.log(`⚠️ Follow-up stake invalid (0). Aborting follow-up.`, 'warning');
                            this.internalState.setImmediateFollowup(false);
                        }
                    }
                } catch (e) {
                    this.logger.log(`Immediate follow-up error: ${e && e.message}`, 'error');
                    // Safety: ensure flag is cleared on error to prevent stuck state
                    if (this.internalState) this.internalState.setImmediateFollowup(false);
                }

                // 2) EV-scheduled immediate bets (NORMAL or RECOVERY)
                try {
                    const evReq = this.pendingEvRequest || null;
                    if (evReq && !this.betting.hasActiveBet()) {
                        // Distinguish NORMAL vs RECOVERY — BettingGateController must be asked with correct source metadata
                        const modeUpper = String(evReq.mode || '').toUpperCase();

                        // === FINAL SNIPER CHECK ===
                        if (modeUpper === 'RECOVERY') {
                            // FIX: Generate proper context so RecoveryManager can see EV sampleSize
                            const snCheckMult = Number(evReq.multiplier || this.getCanonicalRecoveryMultiplier());
                            const snCheckStake = Number(evReq.amountSat || this.getRecoveryBetAmountSat());

                            const snEvData = (this.ev && typeof this.ev.expectedValue === 'function')
                                ? this.ev.expectedValue(snCheckMult, snCheckStake)
                                : null;

                            const sniperCtx = {
                                EV: snEvData,
                                history: this.stats,
                                balanceSat: this.getCurrentBalance()
                            };

                            // Double-check Sniper Gate before physical placement.
                            // false = this is NOT a follow-up (it is an initial recovery bet)
                            if (this.recoveryManager && !this.recoveryManager.canPlaceRecoveryBet(sniperCtx, false)) {
                                this.logger.log(`🛑 Final Sniper Block: Market unsafe for recovery. Cancelling EV request.`, 'skip');
                                this.clearPendingEvRequest(); // Kill the dangerous request
                                return;
                            }
                        }

                        if (modeUpper === 'NORMAL') {
                            // Only place NORMAL if BettingGateController grants EV-scheduled NORMAL
                            const gateAllowed = this.bettingGate ? this.bettingGate.requestOpenFor({
                                source: 'EV',
                                isFollowUp: false,
                                reason: 'EV-scheduled NORMAL'
                            }) : false;
                            if (!gateAllowed) {
                                try {
                                    if (typeof this.addSkip === 'function') this.addSkip('gate-deny', 'NORMAL');
                                } catch (e) {
                                }
                                try {
                                    this.updatePanel(this.betting.hasActiveBet(), 'NORMAL-GATE-DENIED');
                                } catch (e) {
                                }
                                return;
                            }

                            // Resolve canonical stake for NORMAL placement (use central resolver with NORMAL enforcement).
                            const normalBetSat = this.resolveCanonicalStakeSat(evReq, null, 'NORMAL');

                            const normalMult = Number(evReq && Number.isFinite(Number(evReq.multiplier)) ? Number(evReq.multiplier) : (this.config && this.config.normal && Number(this.config.normal.multiplier) ? Number(this.config.normal.multiplier) : 0));
                            const placedNormal = this.safePlaceBet(normalBetSat, normalMult, {
                                modeAtPlace: 'NORMAL',
                                meta: {source: 'EV'}
                            }, evReq);
                            if (placedNormal) {
                                this._syncActiveBetFromEngine && this._syncActiveBetFromEngine();
                                try {
                                    if (typeof this.updatePanel === 'function') this.updatePanel(true, 'NORMAL-EV');
                                } catch (e) {
                                }
                                try {
                                    this.logger.log(`⚪ Normal bet placed: ${Math.round(normalBetSat / 100)} bits x${normalMult}`, 'bet');
                                } catch (_) {
                                }
                                // consume the pending EV request
                                this.clearPendingEvRequest();
                            } else {
                                try {
                                    this.logger.log('❌ Failed to place normal bet (engine failure).', 'error');
                                } catch (_) {
                                }
                                // ensure we do not leave a stale pending EV request and keep UI stuck
                                try {
                                    this.clearPendingEvRequest();
                                } catch (_) {
                                }
                                try {
                                    if (typeof this.updatePanel === 'function') this.updatePanel(false, null);
                                } catch (_) {
                                }
                            }
                            return;
                        } else if (modeUpper === 'RECOVERY') {
                            // RECOVERY EV-scheduled immediate bet — ask gate to open, place only if gate allows
                            const gateAllowed = this.bettingGate ? this.bettingGate.requestOpenFor({
                                source: 'EV',
                                isFollowUp: false,
                                reason: 'EV-scheduled RECOVERY'
                            }) : false;
                            if (!gateAllowed) {
                                try {
                                    if (typeof this.addSkip === 'function') this.addSkip('gate-deny', 'RECOVERY');
                                } catch (e) {
                                }
                                try {
                                    this.updatePanel(this.betting.hasActiveBet(), 'RECOVERY-GATE-DENIED');
                                } catch (e) {
                                }
                                return;
                            }

                            const amountSat = Number(this.getRecoveryBetAmountSat());
                            const recMultFinal = Number(evReq.multiplier || this.getCanonicalRecoveryMultiplier());

                            // mark this EV-scheduled RECOVERY with a batch id so result-handling can detect it reliably
                            const evBatchId = `ev-recovery-${Date.now()}`;

                            // include batchId in meta so engines that preserve meta keep the marker; keep 'source' for backward compat
                            // EV-scheduled RECOVERY: use safePlaceBet and pass evReq as the evReq arg so helper can log / clear if needed.
                            const placed = this.safePlaceBet(Number(amountSat || 0), Number(recMultFinal || 0), {
                                modeAtPlace: 'RECOVERY',
                                meta: {source: 'EV', batchId: evBatchId}
                            }, evReq);

                            if (placed) {

                                // record local flags in case engine strips meta from result object
                                try {
                                    this._lastPlacedWasEvRecovery = true;
                                } catch (_) {
                                }
                                try {
                                    this._lastEvRecoveryBatch = evBatchId;
                                } catch (_) {
                                }
                                try {
                                    // Defensive: compute recorded EV value without relying on `evEstimate` (may be out-of-scope here)
                                    // --- Record last EV placed value (safe) ---
                                    try {
                                        if (this.ev && typeof this.ev.expectedValue === 'function') {
                                            // compute EV for the exact multiplier/stake we are about to place
                                            const evForPlaced = this.ev.expectedValue(Number(recMultFinal || (evReq && evReq.multiplier) || (this.config && this.config.recovery && this.config.recovery.multiplier) || 2.0), Math.max(1, Number(amountSat || 100)));
                                            // expectedValue returns { p, evPerUnit, evAbsolute } — use evPerUnit
                                            this._lastEvPlacedValue = (evForPlaced && Number.isFinite(Number(evForPlaced.evPerUnit))) ? Number(evForPlaced.evPerUnit) : null;
                                        } else {
                                            // no ev module available — clear marker (do not invent methods)
                                            this._lastEvPlacedValue = null;
                                        }
                                    } catch (e) {
                                        // defensive: do not throw — clear marker
                                        this._lastEvPlacedValue = null;
                                    }
                                    // --- end record ---
                                } catch (_) {
                                }

                                this._syncActiveBetFromEngine && this._syncActiveBetFromEngine();
                                try {
                                    if (typeof this.updatePanel === 'function') this.updatePanel(true, 'RECOVERY-EV');
                                } catch (e) {
                                }
                                try {
                                    this.logger.log(`🔁 EV RECOVERY bet placed (scheduled): ${Math.round(amountSat / 100)} bits x${recMultFinal} (batch=${evBatchId})`, 'bet');
                                } catch (_) {
                                }

                                // consume the pending EV request
                                this.clearPendingEvRequest();

                            } else {

                                try {
                                    this.logger.log('❌ Failed to place EV RECOVERY bet (engine failure).', 'error');
                                } catch (_) {
                                }
                                // clear pending EV request on engine failure so panel/UI doesn't remain stuck

                                try {
                                    this.clearPendingEvRequest();
                                } catch (_) {
                                }
                                try {
                                    if (typeof this.updatePanel === 'function') this.updatePanel(false, null);
                                } catch (_) {
                                }

                            }
                            return;
                        } else {
                            // Unknown mode — ignore and clear to avoid repeated attempts
                            try {
                                this.logger.log(`⚠️ Ignoring pendingEvRequest with unknown mode: ${evReq.mode}`, 'warning');
                            } catch (_) {
                            }
                            this.clearPendingEvRequest();
                            return;
                        }
                    }
                } catch (e) {
                    try {
                        this.logger.log(`⚠️ EV scheduled handling error: ${e && e.message}`, 'warning');
                    } catch (_) {
                    }
                    // Avoid leaving a stale pending EV request (prevents UI/panel from being stuck)
                    try {
                        this.clearPendingEvRequest();
                    } catch (_) {
                    }
                    try {
                        if (typeof this.updatePanel === 'function') this.updatePanel(false, null);
                    } catch (_) {
                    }
                }

                // 3) Nothing to place this round — keep UI in sync and keep betting gate closed (BettingGateController holds state)
                try {
                    // If there is a pending EV request, show it explicitly as MODE-EV,
                    // otherwise display the last unified decision reason (so user sees
                    // the EV+ensemble decision flow instead of Idle).
                    let panelMode = null;

                    // 1) If in partial-recovery deny / pause (betting gate enforced), show RECOVERY-PAUSE
                    try {
                        if (this.bettingGate && (this.bettingGate._denyRounds > 0 || this.bettingGate._postPartialRecoveryLock)) {
                            panelMode = 'RECOVERY-PAUSE';
                        }
                    } catch (e) { /* ignore */
                    }

                    // 2) If follow-ups are scheduled, show that explicitly (higher priority than unified decision)
                    if (!panelMode && this.pendingFollowUpsSchedule && this.pendingFollowUpsSchedule.batchId) {
                        panelMode = 'RECOVERY-FOLLOWUPS-SCHEDULED';
                    }

                    // 3) Show explicit pending EV request mode (NORMAL-EV or RECOVERY-EV)
                    if (!panelMode && this.pendingEvRequest && this.pendingEvRequest.mode) {
                        panelMode = `${String(this.pendingEvRequest.mode).toUpperCase()}-EV`;
                    }

                    // 4) Fallback to last unified decision reason (helps visibility of decision flow)
                    if (!panelMode && this.prediction.lastUnifiedDecision && this.prediction.lastUnifiedDecision.reason) {
                        panelMode = `DECISION:${this.prediction.lastUnifiedDecision.reason}`;
                    }

                    // 5) else leave null (the updatePanel implementation will show Idle when null)

                    // Advance BettingGate deny counters / aging **after** we evaluated/placed bets for this round.
                    // Doing this *after* placement ensures a deny set during the prior round (e.g. partial recovery)
                    // is effective for the next immediate round (it gets decremented after that round).

                    this.updatePanel(this.betting.hasActiveBet(), panelMode);

                } catch (e) {
                }
            });

            // Game started event
            engine.on('game_started', () => {
                if (!this.isRunning) return;
                this.logger.log('🎮 Game started', 'info');
            });

            // Game crash event
            // Implements:
            //  - always record crash for training
            //  - warmup completion transitions only (no pausing)
            //  - authoritative bet result processing
            //  - Normal loss -> enter RECOVERY and close gate
            //  - Recovery lose -> schedule follow-ups ONLY if the lost bet was an EV-scheduled RECOVERY bet
            //  - Partial recovery win -> reduce debt and DENY next immediate one round (via bettingGate.onPartialRecoveryWin)
            engine.on('game_crash', (data) => {

                if (!this.isRunning) return;

                // +++ ADAPTIVE BUNKER LOGIC (With Trend Continuity) +++
                const crashValForBunker = data.game_crash / 100;
                const bunkerConfig = (this.config && this.config.config && this.config.config.bunker) ? this.config.config.bunker : { requiredSafeRounds: 2 };

                if (bunkerConfig && bunkerConfig.enabled) {
                    if (this.isBunkerMode) {
                        if (crashValForBunker > bunkerConfig.safeThreshold) {
                            this.bunkerSafeStreak++;
                            this.logger.log(`[🛡️ BUNKER] Market healing (${crashValForBunker}x). Streak: ${this.bunkerSafeStreak}/${bunkerConfig.requiredSafeRounds}`, 'info');
                            if (this.bunkerSafeStreak >= bunkerConfig.requiredSafeRounds) {
                                this.isBunkerMode = false;
                                this.bunkerSafeStreak = 0;
                                this.logger.log(`[✅ BUNKER] Market stabilized.`, 'success');
                            }
                        } else {
                            this.bunkerSafeStreak = 0;
                        }
                    } else {
                        // Check for Toxic Crash
                        if (crashValForBunker <= bunkerConfig.toxicThreshold) {
                            // TREND CONTINUITY CHECK
                            // If recent trend is positive (uptrend), ignore isolated 1.0x crashes
                            const history = this.stats.getRecentCrashes(10);
                            let trendSlope = 0;
                            if (history.length >= 5) {
                                // Simple slope calculation
                                let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
                                const n = history.length;
                                for (let i = 0; i < n; i++) {
                                    sumX += i;
                                    sumY += history[i];
                                    sumXY += i * history[i];
                                    sumXX += i * i;
                                }
                                trendSlope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
                            }

                            if (trendSlope > 0.05) {
                                this.logger.log(`⚠️ Ignored Toxic Crash ${crashValForBunker}x due to Positive Trend (Slope: ${trendSlope.toFixed(3)}). Keeping bets active.`, 'info');
                            } else {
                                this.isBunkerMode = true;
                                this.bunkerSafeStreak = 0;
                                this.clearPendingEvRequest();
                                this.logger.log(`[🛑 BUNKER] Toxic Crash ${crashValForBunker}x detected (Slope: ${trendSlope.toFixed(3)})! Entering Bunker Mode.`, 'error');
                            }
                        }
                    }
                }

                // Re-check TP/SL immediately at crash time (keep this behavior; gating remains separate)
                try {
                    const limitCheck = this.checkLimits(this.getCurrentBalance());
                    if (limitCheck && limitCheck.action && limitCheck.action !== 'ok') {
                        if (limitCheck.action === 'stop') {
                            this.triggerHalt('stop loss', limitCheck.reason);
                            return;
                        }
                        if (limitCheck.action === 'tp') {
                            this.triggerHalt('take profit', limitCheck.reason);
                            return;
                        }
                    }
                } catch (e) {
                }

                // --- Age per-round deny counters early in crash handler so it always runs once per round.
                // This must be executed BEFORE we process the current crash (so a deny set by this crash is not immediately decremented).
                try {
                    if (this.bettingGate && typeof this.bettingGate.tickRound === 'function') {
                        this.bettingGate.tickRound();
                    }
                } catch (e) { /* defensive — do not let tick errors break crash processing */
                }

                const crashValue = data.game_crash / 100;
                this.logger.log(`💥 Game crashed at ${crashValue}x`, 'crash');

                // Always record crash so EV / AI train during warmup and beyond (prediction updates)
                try {
                    this.stats.addCrash(crashValue);
                } catch (e) {
                }
                if (this.prediction && typeof this.prediction.updateAfterCrash === 'function') {
                    try {
                        this.prediction.updateAfterCrash(crashValue, this.mode);

                        // --- Atomic State & Math Updates ---
                        try {
                            const isRec = (this.mode === 'RECOVERY');
                            // 1. Update State Counters
                            if (isRec) {
                                if (!betResult || !betResult.isWin) this.internalState.incrConsecutiveRecoveryLosses();
                                else this.internalState.resetConsecutiveRecoveryLosses();
                            } else {
                                this.internalState.resetConsecutiveRecoveryLosses();
                            }

                            // 2. Update Math Models (Bayesian + MAD)
                            // Determine what we *would* have bet on (Canonical Multiplier)
                            const trackMult = isRec ? this.getCanonicalRecoveryMultiplier() : this.getNormalMultiplier();
                            const didWin = (crashValue >= trackMult);

                            this.bayesPosterior.addObservation(trackMult, didWin);

                            // Update MAD if we had a prediction last round
                            if (this.prediction.lastDecisionSignals && typeof this.prediction.lastDecisionSignals.ensembleProb !== 'undefined') {
                                // Prediction Error = |Confidence - Outcome|
                                this.madCalibrator.addError(this.prediction.lastDecisionSignals.ensembleProb, didWin ? 1 : 0);
                            }
                        } catch (e) { console.log('Hook error:', e.message); }
                    } catch (e) {
                        this.logger.log(`Prediction update error: ${e && e.message}`, 'error');
                    }
                }

                // Warmup handling: count rounds and switch to NORMAL when complete.
                if (this.mode === 'WARMUP') {

                    this.warmupCounter = (this.warmupCounter || 0) + 1;

                    this.logger.log(`🔥 Warm-up round ${this.warmupCounter}/${this.warmupRounds}`, 'info');

                    // Time-of-day override: if configured, ignore the warmup counter and wait
                    // for the next time-of-day target (Malaysia time). Otherwise fall back
                    // to the classic counter-based exit.
                    const cfgWarmup = (this.config && (this.config.config && this.config.config.warmup)) ? this.config.config.warmup : ((this.config && this.config.warmup) ? this.config.warmup : null);

                    const todTarget = (typeof this._nextScheduleTarget === 'function') ? this._nextScheduleTarget(cfgWarmup) : null;
                    if (cfgWarmup && cfgWarmup.timeOfDay && cfgWarmup.timeOfDay.enabled && (todTarget || this.scheduledTargetEpochMs)) {

                        const now = Date.now();

                        // Compute a single canonical "effective target" (epoch + scheduleKey + HH:MM:SS)
                        // Preference order:
                        //  1) If we are pausedBecauseTP and we have a persisted scheduledTargetEpochMs -> use it.
                        //  2) Otherwise use the recomputed todTarget (if any).
                        let effectiveEpoch = null;
                        let effectiveHHMMSS = null;
                        let effectiveScheduleKey = null;

                        if (this.runtime && this.runtime.pausedBecauseTP && Number.isFinite(Number(this.scheduledTargetEpochMs))) {
                            effectiveEpoch = Number(this.scheduledTargetEpochMs);
                            effectiveHHMMSS = this.scheduledTargetHHMMSS || (todTarget ? todTarget.targetHHMMSS : null);
                            effectiveScheduleKey = this.scheduledTargetScheduleKey || (todTarget ? todTarget.scheduleKey : null);
                        } else if (todTarget && Number.isFinite(Number(todTarget.targetEpochMs))) {
                            effectiveEpoch = Number(todTarget.targetEpochMs);
                            effectiveHHMMSS = todTarget.targetHHMMSS;
                            effectiveScheduleKey = todTarget.scheduleKey;
                        }

                        if (effectiveEpoch !== null && now >= effectiveEpoch) {
                            // Use the centralized resume handler, pass effectiveScheduleKey and the effectiveHHMMSS
                            // (the second block has effectiveHHMMSS available; safe to pass it).
                            try {
                                this._onScheduledResume(effectiveScheduleKey, effectiveHHMMSS);
                            } catch (e) { /* swallow to avoid breaking crash handler */
                            }
                        } else if (effectiveEpoch !== null) {
                            // Not yet reached — persist the effective values so panel and resume logic agree.
                            this.scheduledTargetEpochMs = Number(effectiveEpoch);
                            this.scheduledTargetScheduleKey = effectiveScheduleKey || null;
                            this.scheduledTargetHHMMSS = this.scheduledTargetHHMMSS || effectiveHHMMSS;
                            // keep runtime.pausedBecauseTP as-is (if it was true it remains true; if false keep false)
                            // UI will reflect the waiting countdown using the persisted epoch above.
                        }
                    } else {
                        // Classic counter-based behavior (unchanged)
                        if (this.warmupCounter >= this.warmupRounds) {
                            this.mode = 'NORMAL';
                            this.betStartTimeMalaysia = this._malaysiaTimeString(new Date());
                            this.logger.log('✅ Warm-up complete — switching to NORMAL mode', 'success');
                            try {
                                if (typeof document !== 'undefined') document.title = `Betting started at ${this.betStartTimeMalaysia}`;
                            } catch (e) {
                            }
                        }
                    }

                    try {
                        this.updatePanel();
                    } catch (e) {
                    }

                    return; // No betting/result handling during warmup

                }

                // Add crash to history for predictor (again, defensive)
                try {
                    this.stats.addCrash(crashValue);
                } catch (e) {
                }

                // +++ SHADOW BETTING LOGIC (SIMULATION) +++
                // If we are in Shadow Mode, we simulate results to decide when to resume real betting.
                if (this.mode === 'RECOVERY' && this.shadowBetActive) {
                    // What would we have bet?
                    const virtualTarget = this.getCanonicalRecoveryMultiplier();

                    if (crashValue >= virtualTarget) {
                        // Virtual Win!
                        this.shadowBetActive = false;
                        this.logger.log(`✅ 👻 Shadow Bet WON at ${virtualTarget}x. Resuming REAL bets next round.`, 'success');
                        // Open gate for next round
                        if(this.bettingGate) this.bettingGate.openGate('SHADOW-WIN-RESUME');
                    } else {
                        // Virtual Loss
                        this.logger.log(`⏭️ 👻 Shadow Bet LOST at ${virtualTarget}x. Staying in Shadow Mode.`, 'skip');
                        // Do NOT increment debt. We just saved money.
                    }
                }

                // Ensure an active bet exists; if not, nothing to process
                if (!this.betting.hasActiveBet()) {

                    this.logger.logSkip('No active bet', crashValue);
                    // Make sure the stats/counts reflect the skip (previously only logged)
                    try {
                        if (typeof this.addSkip === 'function') this.addSkip('no-active-bet', (this.mode || 'NORMAL'));
                    } catch (e) {
                    }

                    this.logCurrentStats();

                    return;

                }

                // Get authoritative result from betting engine
                const betResult = this.betting.processGameCrash(crashValue);
                if (!betResult) {
                    this.logCurrentStats();
                    return;
                }

                // Normalise important fields (same shape as before)
                this.lastMultiplier = (typeof betResult.multiplier !== 'undefined' && betResult.multiplier !== null) ? Number(betResult.multiplier)
                    : ((this.activeBet && this.activeBet.targetMultiplier) ? Number(this.activeBet.targetMultiplier) : (this.lastMultiplier || 0));

                const profitBitsFloat = Number(
                    (typeof betResult.profitBits !== 'undefined' && Number.isFinite(Number(betResult.profitBits))) ? Number(betResult.profitBits)
                        : ((typeof betResult.profitSat !== 'undefined' && Number.isFinite(Number(betResult.profitSat))) ? Number(betResult.profitSat) / 100
                            : ((typeof betResult.profit !== 'undefined' && Number.isFinite(Number(betResult.profit))) ? Number(betResult.profit) / 100 : 0))
                );

                const betAmountBits = (typeof betResult.betAmountBits !== 'undefined') ? Number(betResult.betAmountBits) : ((betResult.betAmountSat || 0) / 100);
                const modeAtPlace = (betResult && betResult.modeAtPlace) ? String(betResult.modeAtPlace).toUpperCase() : (String(this.mode || 'NORMAL').toUpperCase());

                // Record authoritative result into stats
                try {
                    this.stats.addBetResult(!!betResult.isWin, profitBitsFloat, {
                        mode: modeAtPlace,
                        betAmountBits: betAmountBits,
                        multiplier: this.lastMultiplier
                    });
                } catch (e) {
                }

                // Sync basic counters
                try {
                    this.normalWin = this.stats.stats.normalWin || 0;
                    this.normalLoss = this.stats.stats.normalLoss || 0;
                    this.recoveryWin = this.stats.stats.recoveryWin || 0;
                    this.recoveryLoss = this.stats.stats.recoveryLoss || 0;
                    this.rounds = this.stats.stats.totalRounds || this.rounds;
                } catch (e) {
                }

                // Log the result
                try {
                    this.logger.logBetResult(betResult);
                } catch (e) {
                }

                // +++ SHADOW BETTING TRIGGER (ON REAL LOSS) +++
                // If we just lost a REAL recovery bet, activate Shadow Mode for next round
                if (modeAtPlace === 'RECOVERY' && !betResult.isWin) {
                    const rec = this.config.recovery;
                    if (rec && rec.shadowBetting) {
                        this.shadowBetActive = true;
                        this.logger.log(`🛡️ Recovery Loss Detected. Activating SHADOW BETTING for next round.`, 'warning');
                    }
                }

                // --- If a winning bet was EV-scheduled, cancel any pending immediate follow-ups.
                try {
                    // Ensure meta is an object (defensive). Some engines may return non-object meta.
                    const _meta = (betResult && betResult.meta && typeof betResult.meta === 'object' && betResult.meta !== null) ? betResult.meta : {};

                    // Safe source normalization: prefer meta.source, then meta.scheduledBy, then betResult.source.
                    const _source = String(((_meta && (_meta.source || _meta.scheduledBy)) || betResult.source || '')).toUpperCase();

                    // Robustly detect if the winning bet was EV-sourced
                    let isEvWin = (_source === 'EV');
                    // Fallback: check local flag if meta was stripped by engine
                    if (!isEvWin && this._lastPlacedWasEvRecovery) isEvWin = true;

                    if (!!betResult.isWin && isEvWin) {
                        // EV wins satisfy the recovery condition -> Clear immediate follow-up flag.
                        if (this.internalState) {
                            this.internalState.setImmediateFollowup(false);
                        }

                        // Clear legacy/helper flags to prevent ghost triggers
                        this._lastPlacedWasEvRecovery = false;
                        this._lastEvRecoveryBatch = null;

                        try {
                            this.logger.log('ℹ️ EV win detected — cleared immediate follow-up flag.', 'info');
                        } catch (e4) {
                        }
                    }
                } catch (e) { /* defensive — do not block the rest of processing */
                }

                // Inform BettingGateController of the result so it can enforce open/close/deny rules (partial recovery deny)
                try {
                    if (this.bettingGate && typeof this.bettingGate.onBetResult === 'function') {
                        this.bettingGate.onBetResult({
                            mode: modeAtPlace,
                            isWin: !!betResult.isWin,
                            profitBits: Number(profitBitsFloat || 0),
                            debtBits: Number(this.debtBits || 0)
                        });
                    }
                } catch (e) {
                    if (this.logger) this.logger.log && this.logger.log(`⚠️ bettingGate.onBetResult error: ${e && e.message}`, 'warning');
                }

                // === DEBT / RECOVERY handling ===
                try {
                    // NORMAL bets: loss -> enter RECOVERY (and ensure gate closed)
                    if (modeAtPlace === 'NORMAL') {
                        if (!betResult.isWin) {
                            const lossBits = betAmountBits;
                            const recCfg = this.config.recovery;
                            if (recCfg && recCfg.enableRecovery === false) {
                                this.logger.log(`ℹ️ Recovery disabled by config.recovery.enableRecovery=false — recording normal loss ${lossBits} bits but not entering RECOVERY.`, 'info');
                            } else {
                                // enterRecovery MUST set debtBits and set mode to RECOVERY
                                if (typeof this.enterRecovery === 'function') {
                                    this.enterRecovery(lossBits);
                                    // Defensive: ensure no stale EV request remains that would cause an immediate placement.
                                    // Recovery must wait for EV/ensemble approval; clearing pendingEvRequest prevents auto immediate bets.
                                    try {
                                        this.clearPendingEvRequest();
                                    } catch (_) {
                                    }

                                    // Cleanup: Ensure no immediate follow-up is pending when entering recovery from Normal
                                    try {
                                        if (this.internalState) this.internalState.setImmediateFollowup(false);
                                    } catch (e) { }

                                } else {
                                    // fallback behaviour (preserve previous shape but still config driven)
                                    this.debtBits = Number(this.debtBits || 0) + Number(lossBits);
                                    this.mode = 'RECOVERY';
                                    this.recoveryLevel = 0;
                                    this.logger.log(`⚠️ Entering RECOVERY (fallback): initial debt ${lossBits} bits -> debtBits=${this.debtBits}`, 'warning');
                                }
                                // Close gate on entering recovery (per requirements)
                                try {
                                    if (this.bettingGate && typeof this.bettingGate.closeGate === 'function') this.bettingGate.closeGate('ENTER-RECOVERY');
                                } catch (e) {
                                }
                            }
                        }
                    }

                    // RECOVERY bets
                    else if (modeAtPlace === 'RECOVERY') {
                        if (!betResult.isWin) {
                            // Loss in recovery increases debt
                            if (Number(betAmountBits) > 0) {
                                this.debtBits = Number(this.debtBits || 0) + Number(betAmountBits);
                            } else {
                                this.logger.log(`⚠️ Loss reported but no confirmed stake to add to debt. Debt unchanged (${this.debtBits} bits).`, 'warning');
                            }
                            // +++ Sync level instead of manual increment +++
                            this.syncRecoveryLevel();

                            // --- 3. IMMEDIATE FOLLOW-UP TRIGGER ---
                            // If this was an EV-scheduled bet that lost, we must retry IMMEDIATELY.
                            // We rip out the scheduler. We just set the flag.

                            // Robustly detect if the lost bet was EV-sourced
                            const meta = (betResult && betResult.meta) ? betResult.meta : {};
                            const source = String(meta.source || betResult.source || '').toUpperCase();

                            let isEvLoss = (source === 'EV');
                            // Fallback checks for engines that strip meta
                            if (!isEvLoss && this._lastPlacedWasEvRecovery) isEvLoss = true;
                            if (!isEvLoss && meta.batchId && this._lastEvRecoveryBatch && String(meta.batchId) === String(this._lastEvRecoveryBatch)) isEvLoss = true;

                            // CONFIG CHECK: Are follow-ups enabled?
                            const followCfg = (this.config.recovery && this.config.recovery.followUp) ? this.config.recovery.followUp : {};
                            const followEnabled = followCfg.enabled !== false; // Default true

                            if (isEvLoss && followEnabled) {
                                this.logger.log(`⚡ EV Recovery Loss detected. Triggering IMMEDIATE follow-up next round.`, 'info');

                                // SET THE FLAG IN INTERNAL STATE
                                if (this.internalState) {
                                    this.internalState.setImmediateFollowup(true);
                                }

                                // Clean up flags
                                this._lastPlacedWasEvRecovery = false;
                                this._lastEvRecoveryBatch = null;
                            }
                            else {
                                // Not an EV loss or disabled -> No follow-up.
                                // Ensure flag is OFF so we don't accidentally bet.
                                if (this.internalState) this.internalState.setImmediateFollowup(false);
                            }

                            this.recoveryLoss = this.stats.stats.recoveryLoss || this.recoveryLoss || 0;

                        } else {
                            // Recovery win: check if full or partial recovery
                            const confirmedStakeBits = ((typeof betResult.betAmountBits !== 'undefined' && Number(betResult.betAmountBits) > 0) ? Number(betResult.betAmountBits)
                                : ((typeof betResult.betAmountSat !== 'undefined' && Number(betResult.betAmountSat) > 0) ? Math.round(Number(betResult.betAmountSat) / 100) : 0));
                            const pBitsRounded = Math.round(Number(profitBitsFloat || 0));
                            const currentDebt = Number(this.debtBits || 0);

                            if (pBitsRounded >= currentDebt) {
                                // full recovery -> exit RECOVERY and clear debt
                                this.logger.log(`✅ Recovery successful. Profit ${pBitsRounded} bits covers debt ${currentDebt} bits. Exiting RECOVERY.`, 'success');
                                this.debtBits = 0;
                                this.mode = 'NORMAL';
                                this.recoveryLevel = 0;

                                // Clear any pending EV request
                                try {
                                    if (typeof this.clearPendingEvRequest === 'function') this.clearPendingEvRequest(); else this.pendingEvRequest = null;
                                } catch (e) {
                                }

                                // Reset helper flags
                                try {
                                    this._lastPlacedWasEvRecovery = false;
                                } catch (e) {
                                }

                                // Clear Immediate Followup Flag
                                try {
                                    if (this.internalState) this.internalState.setImmediateFollowup(false);
                                } catch (e) {}

                            } else if (confirmedStakeBits > 0) {
                                // Partial recovery win: reduce debt
                                const oldDebt = currentDebt;
                                this.debtBits = Math.max(0, currentDebt - pBitsRounded);

                                // +++ Sync level based on remaining debt (The Ruler) +++
                                this.syncRecoveryLevel();

                                this.logger.log(`⚠️ Partial recovery: profit ${pBitsRounded} bits. Remaining debt: ${this.debtBits} bits. Recovery is now paused until EV+Ensemble approves next attempt.`, 'warning');
                                // BettingGateController must deny the next immediate one round after a partial recovery win
                                try {
                                    if (this.bettingGate && typeof this.bettingGate.onPartialRecoveryWin === 'function') this.bettingGate.onPartialRecoveryWin({remainingDebtBits: this.debtBits});
                                } catch (e) {
                                }
                                // --- CRITICAL: Partial recovery MUST cancel ALL remaining follow-ups.
                                try {
                                    if (this.internalState) this.internalState.setImmediateFollowup(false);
                                    // Defensive: ensure gate is closed (partial recovery pause)
                                    try { if (this.bettingGate && typeof this.bettingGate.closeGate === 'function') this.bettingGate.closeGate('PARTIAL-RECOVERY-CANCEL-FOLLOWUPS'); } catch(_) {}
                                } catch (_) { /* swallow non-fatal */ }
                            } else {
                                // No confirmed stake but win reported: keep conservative behaviour
                                try {
                                    if (this.internalState) this.internalState.setImmediateFollowup(false);
                                } catch (e) { }
                            }
                        }
                    }
                } catch (e) {
                    if (this.logger) this.logger.log && this.logger.log(`⚠️ post-result recovery handling error: ${e && e.message}`, 'warning');
                }

                // Final UI update with last P/L and debt
                try {
                    this.updatePanel(false, null, profitBitsFloat);
                } catch (e) {
                }
                try {
                    this.logCurrentStats();
                } catch (e) {
                }
            });

        } catch (error) {
            this.logger.log(`❌ Error setting up event listeners: ${error.message}`, 'error');
        }
    }

    /**
     * Handle scheduled resume (DRY single place for both watcher + crash-handler resume paths)
     * - Sets mode to NORMAL
     * - records start time and runtime keys
     * - opens the betting gate (SCHEDULE-RESUME) so EV can request bets again (does NOT force a bet)
     * - clears persisted scheduled target
     * - updates document.title and refreshes the panel
     *
     * @param {string|null} scheduleKey - the schedule key (e.g., 'betSchedule2') that triggered resume, or null
     * @param {string|null} effectiveHHMMSS - optional HH:MM:SS string for display (unused but passed if available)
     */
    _onScheduledResume(scheduleKey, effectiveHHMMSS) {
        try {
            // 1) Mode + runtime bookkeeping (make runtime.currentScheduleKey authoritative immediately)
            this.mode = 'NORMAL';
            this.betStartTimeMalaysia = (typeof this._malaysiaTimeString === 'function') ? this._malaysiaTimeString(new Date()) : new Date().toLocaleTimeString('en-GB', {timeZone: 'Asia/Kuala_Lumpur'});
            this.runtime.currentScheduleKey = scheduleKey || null;
            this.runtime.resumesDone = Number(this.runtime.resumesDone || 0) + 1;
            this.runtime.startedBySchedule = !!this.runtime.currentScheduleKey;
            this.runtime.pausedBecauseTP = false;

            // 1b) Clear the persisted scheduled target IMMEDIATELY so no other logic reads the old paused TP.
            // This prevents immediate TP evaluation from seeing the previous schedule's TP target.
            try {
                this.scheduledTargetEpochMs = null;
                this.scheduledTargetScheduleKey = null;
                this.scheduledTargetHHMMSS = null;
            } catch (e) { /* ignore */
            }

            // 1c) Mark that we just resumed (short window where TP checks should be deferred).
            this._justResumed = Date.now();
            try {
                if (typeof window !== 'undefined') {
                    setTimeout(() => {
                        this._justResumed = null;
                    }, 1000);
                } else {
                    setTimeout(() => {
                        this._justResumed = null;
                    }, 1000);
                }
            } catch (e) {
                this._justResumed = null;
            }

            // 1d) Ensure the bot is running again. Use start() if available for consistent bookkeeping.
            try {
                if (typeof this.start === 'function') {
                    this.start(); // sets this.isRunning = true and normal start bookkeeping
                } else {
                    this.isRunning = true;
                    if (!this.startedAt) this.startedAt = Date.now();
                }
            } catch (e) {
                try {
                    this.logger && this.logger.log && this.logger.log(`⚠️ Failed to start bot on scheduled resume: ${e && e.message}`, 'warning');
                } catch (_) {
                }
            }

            // 1e) Reset profit baseline so previous session P/L does NOT immediately retrigger TP checks.
            // We set the canonical initialBalance used by checkLimits/logging to the current balance (satoshi).
            try {
                if (this.config && typeof this.config.getCurrentBalance === 'function') {
                    const curr = Number(this.config.getCurrentBalance()) || 0;
                    // store canonical initialBalance on config so checkLimits uses it
                    try {
                        this.config.initialBalance = curr;
                    } catch (e) { /* ignore if config shape is immutable */
                    }
                }
            } catch (e) {
                try {
                    this.logger && this.logger.log && this.logger.log(`⚠️ Could not reset profit baseline on resume: ${e && e.message}`, 'warning');
                } catch (_) {
                }
            }

            // 2) Open the betting gate so EV/ensemble can request bets again. Do NOT force bets.
            try {
                if (this.bettingGate && typeof this.bettingGate.openGate === 'function') {
                    this.bettingGate.openGate('SCHEDULE-RESUME');
                }
            } catch (e) {
                try {
                    this.logger && this.logger.log && this.logger.log(`⚠️ Failed to open gate on schedule resume: ${e && e.message}`, 'warning');
                } catch (_) {
                }
            }

            // 3) Logging and UI update (runtime.currentScheduleKey is already set and persisted cleared)
            try {
                this.logger && this.logger.log && this.logger.log(`✅ Scheduled resume reached (${this.betStartTimeMalaysia}) — switching to NORMAL mode (started by ${this.runtime.currentScheduleKey})`, 'success');
            } catch (e) {
            }
            try {
                if (typeof document !== 'undefined') document.title = `Betting started at ${this.betStartTimeMalaysia}`;
            } catch (e) {
            }
            try {
                if (typeof this.updatePanel === 'function') this.updatePanel(this.betting.hasActiveBet(), null);
            } catch (e) {
            }
        } catch (e) {
            try {
                this.logger && this.logger.log && this.logger.log(`⚠️ _onScheduledResume error: ${e && e.message}`, 'error');
            } catch (_) {
            }
        }
    }

    checkLimits(currentBalance) {
        // currentBalance is in satoshi, initialBalance is stored in satoshi
        // This function only *evaluates* conditions and returns a decision object:
        //   { action: 'ok'|'stop'|'tp', reason: string, details: {...} }
        // It must NOT call engine.stop() / this.stop() / update the UI directly.
        try {
            const result = {action: 'ok', reason: '', details: {}};

            // defensive numeric coercion
            currentBalance = Number(currentBalance) || 0;
            const initialBalance = Number(this.config && this.config.initialBalance) || 0;

            // use canonical getters that always return satoshi
            // Prefer schedule-specific takeProfit when session started by schedule.
            let takeProfitSat ;
            try {
                // Prefer schedule-specific takeProfit when session started by schedule.
                // Also, if we are paused for a scheduled resume (TP pause), prefer the upcoming schedule key
                // so the UI shows the correct per-schedule TP even before actual resume.
                let scheduleKey = (this.runtime && this.runtime.currentScheduleKey) ? this.runtime.currentScheduleKey : null;
                if (!scheduleKey && this.runtime && this.runtime.pausedBecauseTP && this.scheduledTargetScheduleKey) {
                    // Use the upcoming schedule's key while paused so the UI shows the per-schedule TP
                    scheduleKey = this.scheduledTargetScheduleKey;
                }
                const schedulesCfg = (this.config && (this.config.schedules || (this.config.config && this.config.config.schedules))) ? (this.config.schedules || this.config.config.schedules) : null;
                if (scheduleKey && schedulesCfg && schedulesCfg[scheduleKey] && Number.isFinite(Number(schedulesCfg[scheduleKey].takeProfitBits)) && Number(schedulesCfg[scheduleKey].takeProfitBits) > 0) {
                    takeProfitSat = Number(this.config.bitsToSats(Number(schedulesCfg[scheduleKey].takeProfitBits)));
                } else {
                    takeProfitSat = typeof this.config.getTakeProfitSat === 'function' ? Number(this.config.getTakeProfitSat()) || 0 : (Number(this.config.takeProfitSat) || 0);
                }
            } catch (e) {
                takeProfitSat = typeof this.config.getTakeProfitSat === 'function' ? Number(this.config.getTakeProfitSat()) || 0 : (Number(this.config.takeProfitSat) || 0);
            }

            const minBalanceSat = typeof this.config.getMinBalanceSat === 'function' ? Number(this.config.getMinBalanceSat()) || 0 : (Number(this.config.minBalanceSat) || 0);

            // compute profit / loss in satoshi
            const profitLoss = currentBalance - initialBalance;
            result.details.profitLoss = profitLoss;
            result.details.takeProfitSat = takeProfitSat;
            result.details.minBalanceSat = minBalanceSat;
            result.details.currentBalance = currentBalance;
            result.details.initialBalance = initialBalance;

            // 1) TAKE PROFIT: when cumulative P/L reaches or exceeds configured takeProfitSat (>0)
            if (takeProfitSat > 0 && profitLoss >= takeProfitSat) {
                result.action = 'tp';
                result.reason = `take profit reached (P/L ${profitLoss} sat >= ${takeProfitSat} sat)`;
                return result;
            }

            // 2) STOP LOSS: when current balance falls below configured minimum balance
            if (minBalanceSat > 0 && currentBalance < minBalanceSat) {
                result.action = 'stop';
                result.reason = `stop loss: balance below minimum (balance ${currentBalance} sat < required ${minBalanceSat} sat)`;
                return result;
            }

            // 3) Computed/planned stake larger than available balance (optional check)
            // If the code elsewhere stores the last computed stake on the bot instance (e.g. this._lastComputedStakeSat),
            // we will detect it here and request a stop. This is non-breaking if that property doesn't exist.
            try {
                const computedStakeSat = (typeof this._lastComputedStakeSat !== 'undefined') ? Number(this._lastComputedStakeSat) : null;
                if (computedStakeSat !== null && !Number.isNaN(computedStakeSat)) {
                    result.details.computedStakeSat = computedStakeSat;
                    if (computedStakeSat > currentBalance) {
                        result.action = 'stop';
                        result.reason = `computed stake (${computedStakeSat} sat) > available balance (${currentBalance} sat)`;
                        return result;
                    }
                }
            } catch (eComputed) {
                // don't fail the entire check if computed stake access throws — just ignore this optional check
                try {
                    this.logger.log(`checkLimits: computedStake check failed: ${eComputed && eComputed.message}`, 'warn');
                } catch (e2) {
                }
            }

            // nothing triggered
            return result;
        } catch (e) {
            try {
                this.logger.log(`checkLimits error: ${e && e.message ? e.message : String(e)}`, 'error');
            } catch (e2) {
            }
            // On error, return 'ok' to avoid accidental halts — handlers can choose to be conservative.
            return {action: 'ok', reason: 'error evaluating limits', details: {}};
        }
    }

    // Helper: return true if the bot is currently considered in recovery
    isInRecovery() {
        // adapt to your code if you use constants or enums
        return String(this.mode || '').toUpperCase() === 'RECOVERY';
    }

    // +++ Sync Recovery Level with Debt "Ruler" +++
    syncRecoveryLevel() {
        try {
            // Only compute when in RECOVERY and have an outstanding debt (>0)
            if (String(this.mode).toUpperCase() !== 'RECOVERY' || (Number(this.debtBits) || 0) <= 0) return;

            const recCfg = (this.config && this.config.recovery) ? this.config.recovery : {};
            const ladder = recCfg.levelLadder;

            if (!ladder || !Array.isArray(ladder) || ladder.length === 0) return;

            const currentDebt = Number(this.debtBits);
            // Default to baseline (0 = before any recovery loss)
            let newLevel = 0;

            // Scan ladder from 0 upward: ladder[i] represents cumulative debt AFTER i losses.
            // If currentDebt <= ladder[i], we are AT level i (where i=0 is baseline).
            for (let i = 0; i < ladder.length; i++) {
                const val = Number(ladder[i]);
                if (!Number.isFinite(val)) continue;
                if (currentDebt <= val) {
                    newLevel = i;
                    break;
                }
                // otherwise move to next; if we exhaust ladder, newLevel will be lastIndex+1
                newLevel = i + 1;
            }

            if (this.recoveryLevel !== newLevel) {
                this.recoveryLevel = newLevel;
            }
        } catch (e) {
            try { if (this.logger && typeof this.logger.log === 'function') this.logger.log(`syncRecoveryLevel error: ${e && e.message}`, 'error'); } catch(_) {}
        }
    }

    getCanonicalRecoveryMultiplier() {
        try {
            this.syncRecoveryLevel();
            const rec = (this.config && this.config.recovery) ? this.config.recovery : {};

            // 1. ESCAPE VALVE (Deep Survival) - Level 6+ (Configurable)
            const level = this.recoveryLevel || 1;
            const escapeLvl = (rec.escapeLevel !== undefined) ? rec.escapeLevel : 6;

            if (level >= escapeLvl) {
                return rec.escapeMult || 1.63;
            }

            // 2. PHASE DETERMINATION (Based on Debt Thresholds)
            const currentDebt = this.debtBits || 0;
            const sliceTwo = rec.debtSliceAmount || Infinity;
            const sliceThree = rec.debtSliceThreeAmount || Infinity;

            if (currentDebt >= sliceThree) {
                return rec.phase3Mult || 2.31; // Phase 3
            } else if (currentDebt >= sliceTwo) {
                return rec.phase2Mult || 2.12; // Phase 2
            } else {
                return rec.phase1Mult || 1.53; // Phase 1
            }
        } catch (e) {
            return 1.53;
        }
    }

    // --- START: CrashBot-level normalized config access helpers (add once) ---
    // These helpers let CrashBot work whether `this.config` is a ConfigManager instance
    // or a plain config object (the script sometimes used both shapes).
    _getRawCfg() {
        // If this.config is ConfigManager with `.config`, return that, otherwise try to return object itself
        if (this.config && typeof this.config === 'object' && this.config.config && typeof this.config.config === 'object') {
            return this.config.config;
        }
        if (this.config && typeof this.config === 'object') {
            return this.config;
        }
        return {};
    }

    getRecCfg() {
        const raw = this._getRawCfg();
        return (raw.recovery || null);
    }

    getMarketCfg() {
        const raw = this._getRawCfg();
        return (raw.MARKET || raw.market || null);
    }

    getNormalMultiplier() {
        try {
            const cfg = (this.config && this.config.normal) ? this.config.normal : {};

            if (cfg.dynamic) {
                const recent = this.stats.getRecentCrashes(5);
                if (recent.length >= 3) {
                    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;

                    // 1. Skip Threshold (Avoid blind betting in toxic dumps)
                    if (avg < (cfg.skipThreshold || 1.20)) {
                        // Return bearish target, rely on RegimeDetector to block if needed
                        return cfg.bearishMultiplier || 1.53;
                    }
                    // 2. Bullish Trigger
                    if (avg >= (cfg.bullishThreshold || 2.50)) {
                        return cfg.bullishMultiplier || 1.93;
                    }
                    // 3. Bearish Trigger
                    if (avg <= (cfg.bearishThreshold || 1.50)) {
                        return cfg.bearishMultiplier || 1.53;
                    }
                }
                // Default
                return cfg.baseMultiplier || 1.63;
            }
        } catch (e) { }

        // Fallback logic
        const raw = this._getRawCfg();
        if (raw && raw.normal && Number.isFinite(Number(raw.normal.multiplier))) return Number(raw.normal.multiplier);
        return 1.63;
    }

    // Canonical getter on the ConfigManager object.
    // Returns the configured normal.baseBetBits if present and numeric, otherwise returns undefined.
    // Callers should decide whether to fall back to other sources or default.
    // Canonical getter on the ConfigManager object.
    // Returns the configured normal.baseBetBits if present and numeric, otherwise returns undefined.
    // Support multiple config shapes used across the codebase.
    getNormalBaseBetBits() {
        try {
            // Support these shapes (in order):
            //  - this.normal (possible plain object usage)
            //  - this.config.normal (C onfigManager normal object)
            //  - this.config.config.normal (some modules store raw config at .config)
            const cfgNormal =
                (this.normal && typeof this.normal === 'object') ? this.normal
                    : (this.config && this.config.normal && typeof this.config.normal === 'object') ? this.config.normal
                        : (this.config && this.config.config && this.config.config.normal && typeof this.config.config.normal === 'object') ? this.config.config.normal
                            : undefined;

            if (cfgNormal && typeof cfgNormal.baseBetBits !== 'undefined' && Number.isFinite(Number(cfgNormal.baseBetBits))) {
                return Number(cfgNormal.baseBetBits);
            }
        } catch (e) {
            // swallow; caller will perform fallback
        }
        // Return undefined to indicate the canonical value is absent/invalid.
        return undefined;
    }

    // Helper: return the *sats* to place for a recovery bet (always integer sats) OR 0 when placement should be disallowed.
    // Uses computeRecoveryStakeBits (returns integer bits or 0 on error).
    getRecoveryBetAmountSat() {
        const debtBits = Number(this.debtBits || 0);
        const recMult = Number(this.getCanonicalRecoveryMultiplier() || 2.0);
        const recStakeBits = Number(this.computeRecoveryStakeBits(debtBits, recMult) || 0);
        // If compute returned 0, we explicitly indicate "no valid stake" by returning 0 sats.
        if (!recStakeBits || recStakeBits <= 0) {
            // computeRecoveryStakeInfo sets this._lastComputedStakeSat when it detects stake>balance etc.
            return 0;
        }
        // apply optional rounding hook, but do not force 1 bit here (caller should treat 0 as invalid).
        const finalBits = (this.config && typeof this.config.bitsRound === 'function') ? Math.max(1, this.config.bitsRound(recStakeBits)) : Math.max(1, Math.round(recStakeBits));
        return Math.round(finalBits * 100);
    }

    // New helper: returns detailed stake info (does NOT break existing callers).
    computeRecoveryStakeInfo(debtBits, m) {
        const db = (Number.isFinite(Number(debtBits)) && Number(debtBits) >= 0) ? Number(debtBits) : Number(this.debtBits || 0);
        const mult = (Number.isFinite(Number(m)) && Number(m) > 1) ? Number(m) : Number(this.getCanonicalRecoveryMultiplier() || 2.0);

        if (!mult || (mult - 1) <= 0) return {stakeBits: 0, sliceInfo: null, error: 'invalid-multiplier'};

        const recCfg = (this.config && this.config.recovery) ? this.config.recovery : {};
        const enableDebtSlicing = !!recCfg.enableDebtSlicing;
        const debtSliceInitialParts = Math.max(1, parseInt(recCfg.debtSliceInitialParts || 2, 10));

        // Balance Check
        const availableBits = Math.floor(
            (this.config && typeof this.config.getCurrentBalance === 'function')
                ? this.config.getCurrentBalance() / 100
                : (this.config && this.config.currentBalanceBits ? this.config.currentBalanceBits : 0)
        );

        if (availableBits <= 0) {
            try { this._lastComputedStakeSat = 0; } catch (e) {}
            return {stakeBits: 0, sliceInfo: null, error: 'zero-balance'};
        }

        const profitPerBit = (mult - 1.0);
        let stakeBits = 0;
        let sliceInfo = null;

        // --- PHASE-BASED SLICING LOGIC (Thresholds) ---
        let parts = 1;
        if (enableDebtSlicing) {
            const sliceTwoThreshold = recCfg.debtSliceAmount || Infinity;
            const sliceThreeThreshold = recCfg.debtSliceThreeAmount || Infinity;

            if (db >= sliceThreeThreshold) {
                parts = 3; // Phase 3
            } else if (db >= sliceTwoThreshold) {
                parts = 2; // Phase 2
            } else {
                parts = 1; // Phase 1
            }
        }

        // Calculate Stake
        if (parts > 1) {
            const base = Math.floor(db / parts);
            const sliceBits = Array(parts).fill(base);
            sliceBits[0] += db - (base * parts);
            const sliceSize = sliceBits[0];
            stakeBits = Math.ceil(sliceSize / Math.max(0.0001, profitPerBit));
            sliceInfo = {parts: parts, partSize: sliceSize, totalDebt: db, attemptingPart: 1, sliceBits};
        } else {
            stakeBits = Math.ceil(db / Math.max(0.0001, profitPerBit));
        }

        // === APPLY CAPS (15 * Initial Loss) ===
        const level = this.recoveryLevel || 1;
        const escapeLvl = (recCfg.escapeLevel !== undefined) ? recCfg.escapeLevel : 6;
        const isPhase1 = (parts === 1);
        const isEscape = (level >= escapeLvl);

        if (isPhase1 || isEscape) {
            const capBase = Math.max(1, Number(this.initialNormalLossBits || 1));
            const maxAllowed = capBase * 15;

            if (stakeBits > maxAllowed) {
                stakeBits = maxAllowed;
            }
        }

        // Rounding & Safety
        stakeBits = (this.config && typeof this.config.bitsRound === 'function') ? this.config.bitsRound(stakeBits) : Math.round(stakeBits);
        try { this._lastComputedStakeSat = Math.round((Number(stakeBits) || 0) * 100); } catch (e) { this._lastComputedStakeSat = 0; }

        if (Math.floor(availableBits) < (this.config.minBalanceBits || 1)) return {stakeBits, sliceInfo, error: 'min-balance-reached'};
        if (!sliceInfo && stakeBits > availableBits) return {stakeBits, sliceInfo, error: 'stake>balance'};
        if (sliceInfo && stakeBits > availableBits) return {stakeBits, sliceInfo, error: 'sliceStake>balance'};

        return {stakeBits, sliceInfo, error: null};
    }


    // Compute the integer-bit stake that yields profit >= debt using multiplier m.
    // IMPORTANT: return 0 when invalid (caller decides to halt or fallback).
    computeRecoveryStakeBits(debtBits, m) {
        const info = this.computeRecoveryStakeInfo(debtBits, m);
        if (!info || info.error) {
            return 0;
        }
        return Number.isFinite(info.stakeBits) ? Math.ceil(info.stakeBits) : 0;
    }


    // Enter recovery: set debt and schedule recovery stake placement next betting window
    // +++ patched enterRecovery: set debt, close gate, clear pending EV/followups, await regime approval +++
    enterRecovery(initialDebtBits) {
        this.mode = 'RECOVERY';

        // 1. Capture the initial loss amount for Cap calculations
        const lossVal = (this.config.bitsRound ? this.config.bitsRound(initialDebtBits) : Math.round(initialDebtBits));
        this.initialNormalLossBits = Math.max(1, lossVal); // Ensure at least 1

        this.debtBits = this.debtBits + lossVal;
        this.recoveryLevel = 0;

        // 2. Enable Shadow Betting immediately (don't double-tap immediately)
        if (this.config.recovery && this.config.recovery.shadowBetting) {
            this.shadowBetActive = true;
            this.logger.log(`👻 Shadow Betting Active: Simulating first recovery bet...`, 'info');
        }

        // --- compute and set debt-slice thresholds ONCE for this recovery session ---
        try {
            if (this.config && typeof this.config.computeAndSetDebtSliceValues === 'function') {
                this.config.computeAndSetDebtSliceValues(this.debtBits);
            }
            this.syncRecoveryLevel();
        } catch (e) { /* swallow silently */ }

        // Important: close gate immediately
        try {
            if (this.bettingGate && typeof this.bettingGate.closeGate === 'function') {
                this.bettingGate.closeGate('ENTER-RECOVERY');
            }
        } catch (e) { }

        // Clear any stale pending EV requests so RECOVERY starts clean.
        try {
            this.clearPendingEvRequest();
        } catch (e) { }

        // CLEANUP: Clear any immediate follow-up flag if we are just entering recovery fresh
        try {
            if (this.internalState) this.internalState.setImmediateFollowup(false);
        } catch (e) { }

        // set marker to indicate we're awaiting explicit EV/regime approval
        this.awaitingRecovery = true;

        try {
            this.logger.log(`🔻 Entered RECOVERY. Debt: ${this.debtBits} bits — gate closed, pending EV cleared.`, 'warning');
        } catch (e) { }
    }

    /**
     * Centralized updater for max recovery statistics.
     * currentStakeBits - integer number of bits used for the recovery attempt (0 if none)
     * This method updates:
     *  - this.maxRecLevel
     *  - this.maxRecStake (largest stake seen when depth increased)
     *  - this.maxRecTime (timestamp when max was observed)
     *  - this.maxRecRuntimeSeconds (runtime seconds when max reached)
     *
     * Keep this method small and side-effect free beyond updating these trackers.
     */
    // +++ canonical, unit-safe _updateMaxRecoveryStats helper +++
    // +++ canonical, unit-safe _updateMaxRecoveryStats helper +++
    _updateMaxRecoveryStats(currentStakeBits = 0) {
        try {
            // 1. Sanitize Input
            currentStakeBits = Number(currentStakeBits) || 0;
            currentStakeBits = Math.max(0, Math.round(currentStakeBits));

            // 2. Initialize trackers if missing
            this.maxRecStakeBitsEver = this.maxRecStakeBitsEver || 0;
            this.maxRecLevel = this.maxRecLevel || 0;
            const currentLevel = this.recoveryLevel || 0;

            // 3. Config Cap Check (Safety)
            const cfgMax = (this.config && Number.isFinite(Number(this.config.maxStakeBits))) ? Number(this.config.maxStakeBits)
                : ((this.config && this.config.recovery && Number.isFinite(Number(this.config.recovery.maxStakeBits))) ? Number(this.config.recovery.maxStakeBits) : Infinity);

            if (cfgMax !== null && currentStakeBits > cfgMax) return;

            // 4. COMPARE AND UPDATE: STAKE
            // Only update if the CURRENT stake being placed is higher than the record
            if (currentStakeBits > this.maxRecStakeBitsEver) {
                this.maxRecStakeBitsEver = currentStakeBits;
            }

            // 5. COMPARE AND UPDATE: LEVEL
            // Only update if the CURRENT level is higher than the record
            if (currentLevel > this.maxRecLevel) {
                this.maxRecLevel = currentLevel;

                // Update timestamps only when we break a new Level record
                this.maxRecTime = Date.now();
                const startTs = this.startedAt || this.firstStartedAt || Date.now();
                this.maxRecRuntimeSeconds = Math.floor((this.maxRecTime - startTs) / 1000);
            }

        } catch (e) {
            // silent catch
        }
    }

    // Display a small non-blocking alert and set document.title accordingly.
    showNonBlockingAlert(type, message) {
        try {
            // set document title to indicate state
            if (type === 'takeprofit') {
                document.title = `Take Profit - Crash Bot`;
            } else if (type === 'stoploss') {
                document.title = `Stop Loss - Crash Bot`;
            } else {
                document.title = `Crash Bot - ${type}`;
            }

            // create or reuse alert container
            let container = document.getElementById('crashBotAlertContainer');
            if (!container) {
                container = document.createElement('div');
                container.id = 'crashBotAlertContainer';
                container.style.position = 'fixed';
                container.style.top = '16px';
                container.style.left = '16px';
                container.style.zIndex = 20000;
                container.style.display = 'flex';
                container.style.flexDirection = 'column';
                container.style.gap = '8px';
                document.body.appendChild(container);
            }

            // create alert
            const alert = document.createElement('div');
            alert.className = 'crashBotAlert';
            alert.style.padding = '12px 16px';
            alert.style.borderRadius = '8px';
            alert.style.boxShadow = '0 6px 18px rgba(0,0,0,0.25)';
            alert.style.maxWidth = '320px';
            alert.style.fontFamily = 'Courier New, monospace';
            alert.style.fontSize = '13px';
            alert.style.color = '#fff';
            alert.style.opacity = '0.0';
            alert.style.transition = 'opacity 240ms ease, transform 240ms ease';
            if (type === 'takeprofit') {
                alert.style.background = 'linear-gradient(90deg,#2ecc71,#27ae60)';
            } else if (type === 'stoploss') {
                alert.style.background = 'linear-gradient(90deg,#e74c3c,#c0392b)';
            } else {
                alert.style.background = 'rgba(0,0,0,0.8)';
            }

            // message content
            const msgSpan = document.createElement('div');
            msgSpan.style.marginRight = '8px';
            msgSpan.textContent = message;
            // close button
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '✖';
            closeBtn.title = 'Close';
            closeBtn.style.border = 'none';
            closeBtn.style.background = 'transparent';
            closeBtn.style.color = '#fff';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.fontSize = '16px';
            closeBtn.style.marginLeft = '8px';
            // container for alert content
            const inner = document.createElement('div');
            inner.style.display = 'flex';
            inner.style.alignItems = 'center';
            inner.style.justifyContent = 'space-between';
            inner.appendChild(msgSpan);
            inner.appendChild(closeBtn);

            alert.appendChild(inner);
            container.appendChild(alert);

            closeBtn.addEventListener('click', (ev) => {
                ev.stopPropagation();
                // just hide the alert (do not change bot state unless it was already halted)
                alert.style.opacity = '0';
                alert.style.transform = 'translateY(-6px)';
                setTimeout(() => alert.remove(), 260);
            });

            // show
            requestAnimationFrame(() => {
                alert.style.opacity = '1';
                alert.style.transform = 'translateY(0px)';
            });

            // auto remove after 10s (non-blocking)
            setTimeout(() => {
                alert.style.opacity = '0';
                alert.style.transform = 'translateY(-6px)';
                setTimeout(() => {
                    alert.remove();
                }, 260);
            }, 86400000);
        } catch (e) {
            // fallback: just set title and log
            document.title = type === 'takeprofit' ? 'Take Profit - Crash Bot' : 'Stop Loss - Crash Bot';
            console.warn('Alert display failed:', e);
        }
    }

    logCurrentStats() {
        const stats = this.stats.getStats();
        const currentBalance = this.config.getCurrentBalance();
        const profitLoss = currentBalance - this.config.initialBalance;

        this.logger.log(`📊 Current Stats - Bets: ${stats.totalBets} | Wins: ${stats.totalWins} | Losses: ${stats.totalLosses} | WR: ${(stats.winRate * 100).toFixed(1)}% | P/L: ${(profitLoss / 100).toFixed(2)} bits`, 'stats');
    }

    updatePanel(isBetting = false, reason = null, lastPLBits = null) {
        // Normalize snapshot of stats used by the panel
        const stats = this.stats.getStats();
        const currentBalance = this.config.getCurrentBalance();
        const activeBet = this.betting.getActiveBet ? this.betting.getActiveBet() : null;

        // Decide how to present the "Last Action" footer:
        // - If `reason` indicates an actual SKIP (starts with "SKIP:" or contains "GATE-DENIED" etc),
        //   present it as a skipReason so panel displays "Skip: <reason>".
        // - Otherwise, if `reason` is a normal mode/action label (e.g. 'NORMAL', 'RECOVERY', 'RECOVERY-FOLLOWUP'),
        //   prefer to set stats.lastAction so the panel shows that label (not as a Skip).
        //
        // This ensures betting actions show as their source (EV or FOLLOWUP) while real SKIP reasons
        // render as Skip: <reason>.

        let skipReason = null;
        // Defensive: ensure reason is a string when we check
        if (typeof reason === 'string' && reason.length > 0) {
            // If caller purposely passed an explicit SKIP prefix, respect it
            if (/^\s*SKIP\s*:/i.test(reason) || /GATE-DENIED|DENIED|SKIP|gate-deny/i.test(reason)) {
                // Normalize by removing any leading SKIP: when attaching to skipReason
                skipReason = reason.replace(/^\s*SKIP\s*:\s*/i, '').trim();
            } else {
                // Reason looks like a normal action/mode label: set stats.lastAction so panel shows it
                try {
                    stats.lastAction = String(reason);
                } catch (e) { /* tolerant */
                }
            }
        }

        // Call panel.updateStats with skipReason only when we detected an actual deny/skip
        this.panel.updateStats(stats, currentBalance, this.config.initialBalance, activeBet, Boolean(isBetting), skipReason, lastPLBits);
    }

    // Public methods for control
    start() {
        // Resume or start fresh. If we already have a firstStartedAt keep it, otherwise start now.
        this.isRunning = true;
        if (!this.firstStartedAt) this.firstStartedAt = Date.now();
        // If currently paused (no startedAt) resume by setting startedAt to now
        if (!this.startedAt) this.startedAt = Date.now();

        // === FIX: Capture betting start time immediately if starting in NORMAL mode ===
        // (This handles cases where warmup is disabled or skipped manually)
        if (this.mode === 'NORMAL' && !this.betStartTimeMalaysia) {
            this.betStartTimeMalaysia = this._malaysiaTimeString(new Date());
        }

        this.logger.log('🟢 Bot started', 'success');
        // update UI immediately
        try {
            this.updatePanel();
        } catch (e) { /* non-fatal */
        }
        return this;
    }

    stop() {
        // Pause runtime: accumulate the currently running interval (if any)
        if (this.startedAt) {
            const elapsed = Math.floor((Date.now() - this.startedAt) / 1000);
            this.pausedRunSeconds = (this.pausedRunSeconds || 0) + elapsed;
            this.startedAt = null;
        }
        this.isRunning = false;
        this.logger.log('🔴 Bot stopped', 'warning');
        // Record betting end time (Malaysia time) on every stop path
        try {
            this.betEndTimeMalaysia = this._malaysiaTimeString(new Date());
        } catch (e) {
            this.betEndTimeMalaysia = null;
        }
        // update UI so duration freezes immediately
        try {
            this.updatePanel();
        } catch (e) { /* non-fatal */
        }
        // Clear scheduled target on stop so UI resets
        try {
            this.scheduledTargetHHMMSS = null;
            this.scheduledTargetEpochMs = null;
        } catch (e) {
        }

        try {
            if (this.panel && typeof this.panel.stopRuntimeTicker === 'function') this.panel.stopRuntimeTicker();
        } catch (e) {
        }

        return this;
    }

    getStats() {
        return this.stats.getStats();
    }

    getConfig() {
        return this.config.config;
    }

    updateConfig(newConfig) {
        this.config.update(newConfig);
        this.updatePanel();
        return this;
    }

    restart() {
        // full restart: clear runtime bookkeeping so Start Time resets
        this.stop();
        this.stats.resetStats();
        // --- clear bot-scoped runtime trackers so no stale max/recovery values remain ---
        // These mirror the constructor defaults and the StatsTracker fields we also reset.
        this.rounds = 0;
        this.maxRecStakeBitsEver = 0;
        this.maxRecLevel = 0;
        this.maxRecTime = null;
        this.maxRecRuntimeSeconds = 0;
        this.awaitingRecovery = false;
        this.normalSkips = 0;
        this.recoverySkips = 0;
        this.recoveryLevel = 0;
        this.debtBits = 0;
        this.lastMultiplier = 0;
        this.isRunning = false;

        // FIX: Clear betting times on restart so new session is fresh
        this.betStartTimeMalaysia = null;
        this.betEndTimeMalaysia = null;

        this.config.setInitialBalance();
        if (this.prediction) {
            if (typeof this.prediction.patternSkips !== 'undefined') this.prediction.reset();
            if (this.prediction.ai && typeof this.prediction.ai.weights !== 'undefined') {
                this.prediction.ai.weights = null;
            }
        }
        // reset start time bookkeeping to reflect a fresh session
        this.firstStartedAt = Date.now();
        this.startedAt = this.firstStartedAt;
        this.pausedRunSeconds = 0;
        this.start();
        this.logger.log('🔄 Bot restarted', 'info');
        return this;
    }

    destroy() {
        this.stop();
        this.panel.destroy();
        this.logger.log('💥 Bot destroyed', 'warning');
        try {
            if (this.panel && typeof this.panel.stopRuntimeTicker === 'function') this.panel.stopRuntimeTicker();
        } catch (e) {
        }
    }

    /**
     * Ensure CrashBot has an up-to-date reference to the BettingEngine's active bet.
     * This centralises the logic that used to be duplicated in multiple places.
     */
    _syncActiveBetFromEngine() {
        try {
            this.activeBet = (this.betting && typeof this.betting.getActiveBet === 'function')
                ? this.betting.getActiveBet()
                : (this.betting && this.betting.activeBet) ? this.betting.activeBet : null;
            // ensure there is a modeAtPlace (defensive; BettingEngine will set this if betting.bot was set)
            if (this.activeBet && !this.activeBet.modeAtPlace) {
                this.activeBet.modeAtPlace = this.mode || 'NORMAL';
                if (this.betting && this.betting.activeBet) this.betting.activeBet.modeAtPlace = this.activeBet.modeAtPlace;
            }
        } catch (e) {
            // defensive — keep the bot running even if sync fails
            // (do not rethrow)
        }
    }
}

// ========================================
// KEEP-ALIVE ENGINE (Prevents Disconnects)
// ========================================
// ========================================
// KEEP-ALIVE ENGINE (Heartbeat & Raw Engine Ping)
// ========================================
class KeepAliveManager {
    constructor() {
        // 1. Silent Audio (Keeps Browser Tab Awake)
        this.silentAudio = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        this.audio = new Audio(this.silentAudio);
        this.audio.loop = true;
        this.audio.volume = 0.01;
        this.started = false;
    }

    start() {
        if (this.started) return;

        // --- A. Start Audio (Anti-Sleep) ---
        this.audio.play().then(() => {
            this.started = true;
            console.log('🔊 Keep-Alive Audio Started');
        }).catch(() => {
            // If blocked, wait for a click
            document.body.addEventListener('click', () => {
                if (!this.started) {
                    this.audio.play();
                    this.started = true;
                    console.log('🔊 Keep-Alive Audio Started (After Click)');
                }
            }, { once: true });
        });

        // --- B. Start Data Heartbeat (Anti-Disconnect) ---
        this.startHeartbeat();
    }

    startHeartbeat() {
        console.log('💓 Connection Heartbeat: Active (10s interval)');

        setInterval(() => {
            try {
                // STRATEGY: Send data upstream to prevent "Idle Timeout" disconnects.

                // 1. PING BALANCE (Proven to work in your logs)
                // This forces a request to the server. Even if balance hasn't changed,
                // the request keeps the socket open.
                if (typeof engine.getBalance === 'function') {
                    const bal = engine.getBalance();
                }

                // 2. PING RAW ENGINE (Found in your API docs)
                // Accessing the raw engine keeps the underlying socket object active.
                if (typeof engine.getEngine === 'function') {
                    const raw = engine.getEngine();
                }

            } catch (e) {
                // Ignore errors (e.g. if game is crashing and engine is busy)
                // We do NOT want to stop the loop.
            }
        }, 10000); // Ping every 10 seconds
    }
}

// ========================================
// INITIALIZATION AND GLOBAL ACCESS
// ========================================

// Auto-start the bot
console.log('🤖 Initializing Crash Bot v11.0 BALANCED...');
window.keepAlive = new KeepAliveManager();
window.keepAlive.start(); // <--- STARTS THE ANTI-SLEEP ENGINE
window.crashBot = new CrashBot();

// Global helper functions
window.botStart = () => window.crashBot.start();
window.botStop = () => window.crashBot.stop();
window.botRestart = () => window.crashBot.restart();
window.botStats = () => window.crashBot.getStats();
window.botConfig = (config) => config ? window.crashBot.updateConfig(config) : window.crashBot.getConfig();
window.botDestroy = () => window.crashBot.destroy();

console.log('✅ Crash Bot v11.0 BALANCED loaded successfully!');
console.log('📋 Commands: botSart(), botStop(), botRestart(), botStats(), botConfig(), botDestroy()');
console.log('🎯 Features: Balanced Strategic Betting (55% threshold) + Fixed Loss Calculation + Quick Start (5 rounds)');