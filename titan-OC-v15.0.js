var config =    {
    // ===================================
    // UNIFIED CONFIGURATION UI
    // ===================================
    // === Meta Information ===
    meta: {
        name: 'Titan',
        version: '15.0-OC',
        edition: 'Sentient AI',
        author: 'TGI',
        id: ""
    },
    // === Simulation Initial balance ====
    testBalanceBits: {value: 250, type: 'number', label: 'Initial test balance (bits)' },

    // === Normal Mode ===
    normalBaseBet: { value: 100, type: 'balance', label: 'Normal Base Bet (bits)' },
    normalBaseBetMax: { value: 300, type: 'number', label: 'Normal Base Bet (bits) max stake bit' },
    normalBaseBetPercentOfBal: { value: 0.0025, type: 'number', label: 'Normal Base Bet (bits) percent of balance to stake' },
    // Dynamic Multipliers (The Gearbox)
    normal_normalDefaultMult: { value: 2.09, type: 'multiplier', label: 'Normal Default Target (Sniper)' },
    normal_normalHighMult: { value: 2.63, type: 'multiplier', label: 'Normal High Target (Super Hot)' },

    // --- Normal mode: High-sniper confirmation & default consecutive shots ---
    normal_highHitsWindow:        { value: 5, type: 'number', label: 'Normal: High-sniper confirm window (rounds)' },
    normal_highMinHits:           { value: 4, type: 'number', label: 'Normal: High-sniper min hits in window' },
    normal_highCooldownRounds:    { value: 3, type: 'number', label: 'Normal: High-sniper cooldown (rounds)' },
    normal_maxConsecutiveWins:    { value: 5, type: 'number', label: 'Normal: Max Consecutive Wins (Hot Market)' },

    // Hot Market Detection Settings (No Hard-coding)
    normal_hotMarketLookback:     { value: 5, type: 'number', label: 'Normal: Hot Market Lookback Window' },
    normal_hotMarketMinConsec:    { value: 2, type: 'number', label: 'Normal: Hot Market Min Consecutive Highs' },

    // === Recovery Mode ===
    enableRecovery: { value: true, type: 'checkbox', label: 'Enable Recovery Mode' },
    recoveryMultiplier: { value: 2.07, type: 'multiplier', label: 'Recovery Fixed Target (x)' },
    recoveryStakeCap: { value: 50, type: 'number', label: 'Recovery Cap (x Initial Loss)' },

    // === Recovery Strategy (Complex) ===
    recovery_enabledFollowUp: { value: true, type: 'checkbox', label: 'Recovery: Enable Ungated Follow-ups' },
    recovery_maxRecoveryFollowUpThreshold: { value: 1, type: 'number', label: 'Recovery: Max Follow-up Bets' },
    recovery_enableSmartOverride: { value: false, type: 'checkbox', label: 'Recovery: Enable Smart Override (Partial Win)' },
    recovery_smartOverrideThreshold: { value: 1, type: 'number', label: 'Recovery: Smart Override Shots' },

    // Recovery: relaxation when recent window is high-biased
    recovery_relaxFactor: { value: 1.0, type: 'number', label: 'Recovery: Relax factor (accept weaker vote when highs dominant, 0-1)' },
    recovery_relaxVolWindow: { value: 8, type: 'number', label: 'Recovery: recent window for relaxation (rounds)' },
    recovery_relaxLowBias: { value: 0.40, type: 'number', label: 'Recovery: max low-bias allowed to relax (fraction 0-1)' },

    // Recovery system selection - recoveryMode options labouchere | hybrid
    recoveryMode: { value: 'labouchere', type: 'radio', options: ['labouchere', 'hybrid'], label: 'Recovery Mode' },
    hybridMartingaleAttempts: { value: 1, type: 'number', label: 'Hybrid: Martingale Attempts' },
    labouchereMinSlices: { value: 4, type: 'number', label: 'Labouchere: Min Slices' },
    // Recovery simulation parameters (used to compute recoveryLevel via simulation)
    recoverySimMaxAttempts: { value: 20, type: 'number', label: 'Recovery Simulation Max Attempts' },
    // Labouchere Aggressive Settings
    recovery_labouchereMult4Slice: { value: 2.00, type: 'number', label: 'Labouchere: Min Multiplier for 4 Slices' },
    recovery_labouchereMult6Slice: { value: 3.50, type: 'number', label: 'Labouchere: Min Multiplier for 6 Slices' },

    warmup_rounds: { value: 12, type: 'number', label: 'warmup: Warmup Rounds' },
    warmup_enabled: { value: true, type: 'boolean', label: 'warmup: enable or disable warmup' },
    warmup_startInWarmup: { value: true, type: 'boolean', label: 'warmup: start bot in warm up mode' },

    // === Stop Limits ===
    takeProfitBits: { value: 350, type: 'number', label: 'Take Profit (bits)' },
    sch1ProfitBits: { value: 350, type: 'number', label: 'Schedule 1 Profit (bits)' },
    sch2ProfitBits: { value: 350, type: 'number', label: 'Schedule 2 Profit (bits)' },
    sch3ProfitBits: { value: 350, type: 'number', label: 'Schedule 3 Profit (bits)' },
    minBalanceBits: { value: 1, type: 'number', label: 'Stop Loss (bits)' },

    // Schedule times: accept either an ISO timestamp string, epoch ms, or "HH:MM" (24h)
    // Examples:
    //   "2025-12-20T13:30:00Z"  -> exact UTC time
    //   1763650200000           -> epoch ms (UTC)
    //   "13:30"                 -> daily time (local / bot timezone) — implementation may parse as next occurrence
    sch1Time: { value: null, type: 'time', label: 'Schedule 1 Time (ISO / epoch ms / HH:MM)' },
    sch2Time: { value: null, type: 'time', label: 'Schedule 2 Time (ISO / epoch ms / HH:MM)' },
    sch3Time: { value: null, type: 'time', label: 'Schedule 3 Time (ISO / epoch ms / HH:MM)' },

    // === System ===
    debug: { value: true, type: 'checkbox', label: 'Enable Debug Logging' },
    env: { value: 'test', type: 'string', label: ' The environment can be "live" or "test"' }, // live or test

    // ===================================
    // PREDICTION PLUGINS
    // ===================================
    prediction_consensusRequired:   { value: 1,      type: 'number',      label: 'Consensus: Min Modules to Agree' },
    prediction_wmaEnabled:          { value: true,   type: 'checkbox',    label: 'Plugin: Enable WMA Module' },
    prediction_evEnabled:           { value: false,  type: 'checkbox',    label: 'Plugin: Enable EV Module (Future)' },
    prediction_patternEnabled:      { value: false,  type: 'checkbox',    label: 'Plugin: Enable Pattern Module (Future)' },

    // ===================================
    // WMA CLIMATE SENSOR CONFIGURATION
    // ===================================
    // 1. Math & Lookback
    wma_window:                { value: 8,     type: 'number',      label: 'WMA: History Lookback Window' },
    wma_linearWeightingWindow: { value: 3,     type: 'number',      label: 'WMA: Linear Weighting Window (Recent)' },
    wma_ewma_alpha:            { value: 0.50,   type: 'number',      label: 'WMA: EWMA Smoothing Factor (Alpha)' },
    wma_min_samples:           { value: 3,      type: 'number',      label: 'WMA: Minimum Samples to Activate' },

    // 2. Bayesian Calibration
    wma_prior_a:            { value: 1.0,    type: 'number',      label: 'WMA: Bayesian Prior Alpha (Wins)' },
    wma_prior_b:            { value: 1.0,    type: 'number',      label: 'WMA: Bayesian Prior Beta (Losses)' },
    wma_timeDecay_halfLife: { value: 10,     type: 'number',      label: 'WMA: Time Decay Half-Life (Rounds)' },
    wma_beta_blend:         { value: 0.3,    type: 'number',      label: 'WMA: Mix Ratio (0.7 = 70% WMA / 30% Bayes)' },

    // 3. Volatility Guard (The Brake)
    wma_vol_window:              { value: 6,     type: 'number',      label: 'WMA: Volatility Scan Window' },
    wma_vol_thresh:              { value: 0.26,   type: 'number',      label: 'WMA: Volatility Threshold (StdDev/Mean)' },
    wma_vol_penalty:             { value: 0.06,   type: 'number',      label: 'WMA: Volatility Penalty (Score Reduction)' }, // Disabled
    wma_instability_penalty_med: { value: 0.25,   type: 'number',      label: 'WMA: Instability Penalty (2 consecutive crashes)' },
    wma_instability_penalty_high:{ value: 0.45,   type: 'number',      label: 'WMA: Instability Penalty (3+ consecutive crashes)' },
    wma_trap_spike_mult:         { value: 6.0,    type: 'number',      label: 'WMA: Trap Spike Multiplier (vs Target)' },
    wma_trap_trend_thresh:       { value: 0.3,    type: 'number',      label: 'WMA: Trap Trend Threshold (Score)' },
    wma_trap_penalty:            { value: 0.18,    type: 'number',      label: 'WMA: Trap Detection Penalty (Multiplier)' },
    wma_trap_boost:              { value: 1.1,    type: 'number',      label: 'WMA: Trap Momentum Boost (Multiplier)' },

    // 4. Decision Thresholds (Dynamic Hysteresis)
    wma_threshold_on:       { value: 0.65,   type: 'number',      label: 'WMA: Threshold Ceiling (Start/Max)' },
    wma_threshold_floor:    { value: 0.45,   type: 'number',      label: 'WMA: Threshold Floor (Min)' },
    wma_threshold_step_win: { value: 0.06,   type: 'number',      label: 'WMA: Dyn Thresh Step (Base Win)' },
    wma_threshold_step_loss:{ value: 0.20,   type: 'number',      label: 'WMA: Dyn Thresh Step (Loss)' },
    wma_hysteresis_gap:     { value: 0.08,   type: 'number',      label: 'WMA: Gap between ON and OFF' },
    wma_cooldown_rounds:    { value: 1,      type: 'number',      label: 'WMA: Cooldown rounds between switches' },
    wma_score_floor_buffer: { value: 0.02, type: 'number', label: 'WMA: Score floor buffer (scoreFloor + buffer triggers safety reset)' },

    // --- LOGIC TUNING: Drop Fast, Rise Slow ---
    wma_penalty_single_loss:    { value: 0.20,   type: 'number',      label: 'WMA: Single Loss Penalty (Score Reduction)' },
    wma_rising_boost:           { value: 2.0,    type: 'number',      label: 'WMA: Rising Trend Boost (Multiplier)' },
    wma_rising_win_rate:        { value: 0.60,   type: 'number',      label: 'WMA: Rising Trend Win Rate (0.60 = 60%)' },
    wma_stable_vol_thresh:      { value: 0.15,   type: 'number',      label: 'WMA: Stable Regime Volatility Threshold' },
    wma_stable_loss_dampener:   { value: 0.50,   type: 'number',      label: 'WMA: Stable Regime Loss Dampener (0.5 = Half Penalty)' },

    // Smart Logic Parameters (No Hard-coding)
    wma_threshold_smart_cap:    { value: 2.0,    type: 'number',      label: 'WMA: Smart Drop Cap (Max Multiplier)' },
    wma_threshold_smart_scalar: { value: 8.0,   type: 'number',      label: 'WMA: Smart Drop Scalar (Log10 Sensitivity)' },

    // Crash clustering detection
    wma_lowCrashClusterThreshold: { value: 0.50, type: 'number', label: 'WMA: Low-crash cluster threshold (ratio 0-1)' },
    wma_clusterPenalty:             { value: 0.50, type: 'number', label: 'WMA: Cluster Penalty (multiplicative factor, 0-1)' },

    // 5. System
    wma_eps:                { value: 1e-6,   type: 'number',      label: 'WMA: Math Epsilon (Zero prevention)' },

    // 6. Advanced WMA tuning (new Phase 0 additions)
    wma_score_floor:               { value: 0.30,  type: 'number', label: 'WMA: Hard Score Floor' }, // score FLOOR
    wma_rewardMin:                 { value: -5.0,  type: 'number', label: 'WMA: Reward Min (log-space clamp)' }, // Less punishment for losses
    wma_rewardMax:                 { value: 1.5,   type: 'number', label: 'WMA: Reward Max (log-space clamp)' },
    wma_volWeight:                 { value: 0.2,   type: 'number', label: 'WMA: Volatility weight (amplitude)' },
    wma_skewWeight:                { value: 0.3,   type: 'number', label: 'WMA: Directional skew weight (downside)' }, // Ignore history of losses
    wma_minSlope:                  { value: 0.00,  type: 'number', label: 'WMA: Minimum positive slope to enter (delta)' },
    wma_exitSlope:                 { value: 0.02,  type: 'number', label: 'WMA: Exit slope threshold (negative delta)' },
    wma_adaptiveAlphaBoost:        { value: 1.20,  type: 'number', label: 'WMA: Adaptive Alpha Boost (Upside)' },

    // Regime multipliers (scale base score by regime; RECOVERY_FOLLOWUP remains ungated)
    wma_regime_normal:             { value: 1.0,   type: 'number', label: 'WMA: Regime multiplier - normal' },
    wma_regime_recovery:           { value: 1.0,   type: 'number', label: 'WMA: Regime multiplier - standard recovery' }, // No handicap
    wma_regime_followup:           { value: 1.0,   type: 'number', label: 'WMA: Regime multiplier - recovery followup' },
    wma_regime_smartOverride:      { value: 1.0,   type: 'number', label: 'WMA: Regime multiplier - smart override' },

    // Multi-timescale fusion
    wma_fastWindow:                { value: 4,     type: 'number', label: 'WMA: Fast window (rounds)' },
    wma_slowWindow:                { value: 18,    type: 'number', label: 'WMA: Slow window (rounds)' },
    wma_fastWeight:                { value: 0.60,   type: 'number', label: 'WMA: Fast weight in fusion' }, // Trust recent data more
    wma_slowWeight:                { value: 0.40,   type: 'number', label: 'WMA: Slow weight in fusion' },

    // Bayesian decay during recovery
    wma_recoveryBayesDecay:        { value: 0.0,   type: 'number', label: 'WMA: Recovery posterior decay factor' },
    // END OF WMA CLIMATE SENSOR CONFIGURATION

    // ------------------------------
    // Ensemble / EV Module configuration
    // ------------------------------
    ensemble_baseRef:            { value: 2.00,   type: 'multiplier', label: 'Ensemble: Base reference multiplier' },
    ensemble_window:             { value: 20,     type: 'number',     label: 'Ensemble: Lookback window (rounds)' },
    ensemble_evThreshold:        { value: 0.000,  type: 'number',     label: 'Ensemble: EV module acceptance threshold (EV units)' },

    ensemble_ewma_alpha:         { value: 0.18,   type: 'number',     label: 'Ensemble: EWMA alpha' },
    ensemble_ewma_maxBound:      { value: 200,    type: 'number',     label: 'Ensemble: EWMA max bound (rounds)' },

    ensemble_wma_window:         { value: 12,     type: 'number',     label: 'Ensemble: WMA window' },

    ensemble_timeDecay_halfLife: { value: 10,     type: 'number',     label: 'Ensemble: Time-decay half-life (rounds)' },

    ensemble_bayes_weight:       { value: 0.40,   type: 'number',     label: 'Ensemble: Bayes static weight' },
    ensemble_emp_weight:         { value: 0.40,   type: 'number',     label: 'Ensemble: Empirical static weight' },
    ensemble_trend_weight:       { value: 0.20,   type: 'number',     label: 'Ensemble: Trend static weight' },

    ensemble_ensemble_eta:       { value: 0.5,    type: 'number',     label: 'Ensemble: Reweight sensitivity (eta)' },
    ensemble_alpha_decay:        { value: 0.92,   type: 'number',     label: 'Ensemble: EWMA loss decay' },
    ensemble_volatility_penalty: { value: 0.07,   type: 'number',     label: 'Ensemble: Volatility penalty (fraction)' },

    ensemble_eps:                { value: 1e-6,   type: 'number',     label: 'Ensemble: Numeric eps clamp' },

    // Previously optional — now included
    ensemble_bayes_prior_a:      { value: 1.0,    type: 'number',     label: 'Ensemble: Bayesian prior alpha (wins)' },
    ensemble_bayes_prior_b:      { value: 1.0,    type: 'number',     label: 'Ensemble: Bayesian prior beta (losses)' },

    ensemble_volWindow:          { value: 12,     type: 'number',     label: 'Ensemble: Volatility scan window' },
    ensemble_vol_threshold:      { value: 0.25,   type: 'number',     label: 'Ensemble: Volatility threshold (std/mean)' },

    ensemble_trend_minWindow:    { value: 10,     type: 'number',     label: 'Ensemble: Trend min window' },
    ensemble_trend_maxWindow:    { value: 200,    type: 'number',     label: 'Ensemble: Trend max window' },
    // End of Ensemble / EV Module configuration

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

const BETTING_MODE =  config.env.value; // Set to 'test' or 'live'
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
        this.logger = new Logger(new ConfigManager(this));
        this.logger.log(`🔌 Unified Adapter attached to: ${this.platform}`);

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

class ConfigManager {
    // ==========================================
    // 1. Static Constants (Defaults)
    // ==========================================
    static DEFAULTS = {
        MAX_STAKE_BITS: 10000,
        TEST_BALANCE_BITS: config.testBalanceBits.value,
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

        // --- Read External Config ---
        const cfg = (typeof config !== 'undefined') ? config : {};
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
                baseBetBits: val('normalBaseBet', cfg.normalBaseBet?.value) / 100, // Convert Sat to Bits
                normalDefaultMult: val('normalDefaultMult', cfg.normal_normalDefaultMult?.value),
                normalHighMult: val('normalHighMult', cfg.normal_normalHighMult?.value),
                maxConsecutiveWins: val('normal_maxConsecutiveWins', cfg.normal_maxConsecutiveWins?.value),
                minWinRate: 0.50,
                lookback: 20,
                baseBetBitPercent: ConfigManager.DEFAULTS.NORMAL_BASE_BET_PERCENT,
                baseBetBitMax: ConfigManager.DEFAULTS.NORMAL_BASE_BET_MAX,

                highHitsWindow: val('normal_highHitsWindow', cfg.normal_highHitsWindow?.value),
                highMinHits: val('normal_highMinHits', cfg.normal_highMinHits?.value),
                highCooldownRounds: val('normal_highCooldownRounds', cfg.normal_highCooldownRounds?.value),
                // Mappings for Hot Market Logic
                hotMarketLookback:     val('normal_hotMarketLookback', cfg.normal_hotMarketLookback?.value),
                hotMarketMinConsec:    val('normal_hotMarketMinConsec', cfg.normal_hotMarketMinConsec?.value),
            },

            // Recovery Mode
            recovery: {
                enabled: val('enableRecovery', cfg.enableRecovery?.value),
                targetRecMult: val('recoveryMultiplier', cfg.recoveryMultiplier?.value),
                recStakeCap: val('recoveryStakeCap', cfg.recoveryStakeCap?.value),
                baseProfitMult: 0,
                // Fallback for legacy getters if needed
                takeProfitBits: val('takeProfitBits', ConfigManager.DEFAULTS.TAKE_PROFIT_BITS),

                enabledFollowUp: val('recovery_enabledFollowUp', cfg.recovery_enabledFollowUp?.value),
                maxFollowUp: val('recovery_maxRecoveryFollowUpThreshold', cfg.recovery_maxRecoveryFollowUpThreshold?.value),
                enableSmartOverride: val('recovery_enableSmartOverride', cfg.recovery_enableSmartOverride?.value),
                smartOverrideThreshold: val('recovery_smartOverrideThreshold', cfg.recovery_smartOverrideThreshold?.value),

                // Recovery: relaxation when recent window is high-biased
                relaxFactor: val('recovery_relaxFactor', cfg.recovery_relaxFactor?.value),
                relaxVolWindow: val('recovery_relaxVolWindow', cfg.recovery_relaxVolWindow?.value),
                relaxLowBias: val('recovery_relaxLowBias', cfg.recovery_relaxLowBias?.value),

                // Hybrid & Labouchere mapping (single source: global config)
                hybrid: { martingaleAttempts: cfg.hybridMartingaleAttempts?.value },
                labouchere: { minSlices: cfg.labouchereMinSlices?.value },
                // Recovery simulation params (mapped from the flat global config so runtime reads come from single source)
                sim: {
                    maxAttempts: cfg.recoverySimMaxAttempts ? cfg.recoverySimMaxAttempts?.value : undefined
                },
                // The recoveryMode string is stored in root so code can query this.config.get('recovery','recoveryMode')
                recoveryMode: cfg.recoveryMode?.value,
                // Map the new Labouchere thresholds
                labouchereMult4Slice: val('recovery_labouchereMult4Slice', cfg.recovery_labouchereMult4Slice?.value),
                labouchereMult6Slice: val('recovery_labouchereMult6Slice', cfg.recovery_labouchereMult6Slice?.value),
            },

            // UI & Protections
            protection: {
                uiThrottleMs: 0,
                betPlacementTimeoutMs: 350,
                placeBetRetries: 2
            },

            // Warmup
            warmup: {
                rounds: val('warmup_rounds', cfg.warmup_rounds?.value),
                enabled: val('warmup_enabled', cfg.warmup_enabled?.value),
                startInWarmup: val('warmup_startInWarmup', cfg.warmup_startInWarmup?.value),
                timeOfDay: { enabled: true }
            },

            // Schedules
            schedules: {
                betSchedule1: {
                    time: val('sch1Time', null),
                    takeProfitBits: val('sch1ProfitBits', null)
                },
                betSchedule2: {
                    time: val('sch2Time', null),
                    takeProfitBits: val('sch2ProfitBits', null)
                },
                betSchedule3: {
                    time: val('sch3Time', null),
                    takeProfitBits: val('sch3ProfitBits', null)
                }
            },
            behavior: {
                stopOnTakeProfitOnlyFrom: 'betSchedule3'
            },

            // Prediction Plugins
            prediction: {
                consensusRequired: val('prediction_consensusRequired', cfg.prediction_consensusRequired?.value),
                wmaEnabled:        val('prediction_wmaEnabled', cfg.prediction_wmaEnabled?.value),
                evEnabled:         val('prediction_evEnabled', cfg.prediction_evEnabled?.value),
                patternEnabled:    val('prediction_patternEnabled', cfg.prediction_patternEnabled?.value)
            },

            // WMA Module Configuration
            wma: {
                windowsSize:            val('wma_window', cfg.wma_window?.value),
                linearWeightingWindow:  val('wma_linearWeightingWindow', cfg.wma_linearWeightingWindow?.value),
                ewmaAlpha:              val('wma_ewma_alpha', cfg.wma_ewma_alpha?.value),
                minSamples:             val('wma_min_samples', cfg.wma_min_samples?.value),

                priorA:                 val('wma_prior_a', cfg.wma_prior_a?.value),
                priorB:                 val('wma_prior_b', cfg.wma_prior_b?.value),
                timeDecayHL:            val('wma_timeDecay_halfLife', cfg.wma_timeDecay_halfLife?.value),
                betaBlend:              val('wma_beta_blend', cfg.wma_beta_blend?.value),

                volWindow:              val('wma_vol_window', cfg.wma_vol_window?.value),
                volThresh:              val('wma_vol_thresh', cfg.wma_vol_thresh?.value),
                volPenalty:             val('wma_vol_penalty', cfg.wma_vol_penalty?.value),
                instabilityMed:         val('wma_instability_penalty_med', cfg.wma_instability_penalty_med?.value),
                instabilityHigh:        val('wma_instability_penalty_high', cfg.wma_instability_penalty_high?.value),
                trapSpikeMult:          val('wma_trap_spike_mult', cfg.wma_trap_spike_mult?.value),
                trapTrendThresh:        val('wma_trap_trend_thresh', cfg.wma_trap_trend_thresh?.value),
                trapPenalty:            val('wma_trap_penalty', cfg.wma_trap_penalty?.value),
                trapBoost:              val('wma_trap_boost', cfg.wma_trap_boost?.value),

                thrOn:                  val('wma_threshold_on', cfg.wma_threshold_on?.value),
                thrOff:                 val('wma_threshold_off', cfg.wma_threshold_off?.value),
                cooldown:               val('wma_cooldown_rounds', cfg.wma_cooldown_rounds?.value),
                scoreFloorBuffer:       val('wma_score_floor_buffer', cfg.wma_score_floor_buffer?.value),
                eps:                    val('wma_eps', cfg.wma_eps?.value),

                // === DYNAMIC THRESHOLD MAPPINGS ===
                thrFloor:               val('wma_threshold_floor', cfg.wma_threshold_floor?.value),
                stepWin:                val('wma_threshold_step_win', cfg.wma_threshold_step_win?.value),
                stepLoss:               val('wma_threshold_step_loss', cfg.wma_threshold_step_loss?.value),
                hysteresisGap:          val('wma_hysteresis_gap', cfg.wma_hysteresis_gap?.value),

                // === REGIME LOGIC ===
                singleLossPenalty:      val('wma_penalty_single_loss', cfg.wma_penalty_single_loss?.value),
                risingBoost:            val('wma_rising_boost', cfg.wma_rising_boost?.value),
                risingWinRate:          val('wma_rising_win_rate', cfg.wma_rising_win_rate?.value),
                stableVolThresh:        val('wma_stable_vol_thresh', cfg.wma_stable_vol_thresh?.value),
                stableLossDampener:     val('wma_stable_loss_dampener', cfg.wma_stable_loss_dampener?.value),

                // === SMART LOGIC MAPPINGS ===
                smartCap:               val('wma_threshold_smart_cap', cfg.wma_threshold_smart_cap?.value),
                smartScalar:            val('wma_threshold_smart_scalar', cfg.wma_threshold_smart_scalar?.value),

                // === SCORE FLOOR MAPPING ===
                scoreFloor:             val('wma_score_floor', cfg.wma_score_floor?.value),

                // --- Phase 0: newly added config mapping (no duplicates) ---
                rewardMin:              val('wma_rewardMin', cfg.wma_rewardMin?.value),
                rewardMax:              val('wma_rewardMax', cfg.wma_rewardMax?.value),
                volWeight:              val('wma_volWeight', cfg.wma_volWeight?.value),
                skewWeight:             val('wma_skewWeight', cfg.wma_skewWeight?.value),
                minSlope:               val('wma_minSlope', cfg.wma_minSlope?.value),
                exitSlope:              val('wma_exitSlope', cfg.wma_exitSlope?.value),
                adaptiveAlphaBoost:     val('wma_adaptiveAlphaBoost', cfg.wma_adaptiveAlphaBoost?.value),

                regime: {
                    normalRegime:       val('wma_regime_normal', cfg.wma_regime_normal?.value),
                    recoveryRegime:     val('wma_regime_recovery', cfg.wma_regime_recovery?.value),
                    followupRegime:     val('wma_regime_followup', cfg.wma_regime_followup?.value),
                    smartOverrideRegime:val('wma_regime_smartOverride', cfg.wma_regime_smartOverride?.value)
                },

                fastWindow:             val('wma_fastWindow', cfg.wma_fastWindow?.value),
                slowWindow:             val('wma_slowWindow', cfg.wma_slowWindow?.value),
                fastWeight:             val('wma_fastWeight', cfg.wma_fastWeight?.value),
                slowWeight:             val('wma_slowWeight', cfg.wma_slowWeight?.value),

                lowCrashClusterThreshold: val('wma_lowCrashClusterThreshold', cfg.wma_lowCrashClusterThreshold?.value),
                clusterPenalty:           val('wma_clusterPenalty', cfg.wma_clusterPenalty?.value),

                recoveryBayesDecay:     val('wma_recoveryBayesDecay', cfg.wma_recoveryBayesDecay?.value)
            },

            ensemble: {
                baseRef:       val('ensemble_baseRef', cfg.ensemble_baseRef?.value),
                window:        val('ensemble_window', cfg.ensemble_window?.value),
                evThreshold:   val('ensemble_evThreshold', cfg.ensemble_evThreshold?.value),

                ewmaAlpha:     val('ensemble_ewma_alpha', cfg.ensemble_ewma_alpha?.value),
                ewmaMaxBound:  val('ensemble_ewma_maxBound', cfg.ensemble_ewma_maxBound?.value),

                wmaWindow:     val('ensemble_wma_window', cfg.ensemble_wma_window?.value),

                timeDecayHL:   val('ensemble_timeDecay_halfLife', cfg.ensemble_timeDecay_halfLife?.value),

                bayesWeight:   val('ensemble_bayes_weight', cfg.ensemble_bayes_weight?.value),
                empWeight:     val('ensemble_emp_weight', cfg.ensemble_emp_weight?.value),
                trendWeight:   val('ensemble_trend_weight', cfg.ensemble_trend_weight?.value),

                ensembleEta:   val('ensemble_ensemble_eta', cfg.ensemble_ensemble_eta?.value),
                alphaDecay:    val('ensemble_alpha_decay', cfg.ensemble_alpha_decay?.value),
                volPenalty:    val('ensemble_volatility_penalty', cfg.ensemble_volatility_penalty?.value),

                eps:           val('ensemble_eps', cfg.ensemble_eps?.value),

                // previously optional
                bayesPriorA:   val('ensemble_bayes_prior_a', cfg.ensemble_bayes_prior_a?.value),
                bayesPriorB:   val('ensemble_bayes_prior_b', cfg.ensemble_bayes_prior_b?.value),
                volWindow:     val('ensemble_volWindow', cfg.ensemble_volWindow?.value),
                volThreshold:  val('ensemble_vol_threshold', cfg.ensemble_vol_threshold?.value),
                trendMin:      val('ensemble_trend_minWindow', cfg.ensemble_trend_minWindow?.value),
                trendMax:      val('ensemble_trend_maxWindow', cfg.ensemble_trend_maxWindow?.value)
            },
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

    update(newConfig) {
        Object.assign(this.config, newConfig);
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

/**
 * Module B: Weighted Moving Average Score (TitanRegimeSupervisor)
 * Tracks the "Health" of Green (High), Red (Default), and Blue (Recovery) lanes.
 * UPDATED: Supports Dynamic Thresholds & Smart Floors while preserving all v15 features.
 */
class WMAModule {
    constructor(configManager, logger) {
        this.config = configManager;
        this.logger = logger;

        // Initialize Lanes
        this.lanes = {
            green:    new WMALane(this.config, 'GREEN'),    // High Target
            red:      new WMALane(this.config, 'RED'),      // Default Target
            recovery: new WMALane(this.config, 'RECOVERY')  // Recovery Target
        };

        this.currentRegime = 'INIT';
        this.lastSwitchRound = 0;
        this.roundsProcessed = 0;
    }

    update(crash) {
        const targets = {
            green:    Number(this.config.get('normal', 'normalHighMult')),
            red:      Number(this.config.get('normal', 'normalDefaultMult')),
            recovery: Number(this.config.get('recovery', 'targetRecMult'))
        };

        this.lanes.green.update(crash, targets.green);
        this.lanes.red.update(crash, targets.red);
        this.lanes.recovery.update(crash, targets.recovery);

        this.roundsProcessed++;
    }

    getClimate() {
        // Collect scores AND dynamic thresholds from lanes
        const scores = {
            green:    this.lanes.green.getScore(),
            red:      this.lanes.red.getScore(),
            recovery: this.lanes.recovery.getScore()
        };

        const minSamples = Number(this.config.get('wma', 'minSamples'));
        if (this.roundsProcessed < minSamples) {
            return { regime: 'INIT', scores };
        }

        // DYNAMIC LOGIC: Compare FinalScore vs Lane-Specific Dynamic Threshold
        let newRegime = 'WAIT';

        // Check Green (Aggressive)
        if (scores.green.finalScore >= scores.green.threshold) newRegime = 'GREEN';
        // Check Red (Default)
        else if (scores.red.finalScore >= scores.red.threshold) newRegime = 'RED';

        if (newRegime !== this.currentRegime) {

            this.lastSwitchRound = this.roundsProcessed;

            this.currentRegime = newRegime;

            // RECOVERY SAFE-START: when we switch into RECOVERY regime,
            // ensure the recovery lane threshold starts at the configured ceiling
            if (newRegime === 'RECOVERY') {
                this.lanes.recovery.currentThreshold = Number(this.config.get('wma','thrOn'));
            }

        }

        return { regime: this.currentRegime, scores, locked: false };
    }
}

/**
 * Internal Helper: Tracks a single lane
 * Features: Dynamic Thresholds, Smart Floor, Anti-Drag Logic
 * Execution Order (baseScore defined before Trap logic)
 */
class WMALane {
    constructor(configManager, label) {
        this.config = configManager;
        this.label = label;
        this.logger = new Logger(this.config);

        this.history = [];
        this.ewmaState = null;
        this.wmaHistory = [];

        // Initialize Threshold at Ceiling (Safe Start)
        this.currentThreshold = Number(this.config.get('wma', 'thrOn'));

        // cooldown counter used by dynamic threshold logic
        this._dynCooldown = 0;
    }

    update(crash, target) {
        const winSize = Number(this.config.get('wma', 'windowsSize'));

        // 1. Add new observation
        this.history.push({
            crash: Number(crash),
            target: Number(target),
            isHit: (Number(crash) >= Number(target)) ? 1 : 0
        });

        if (this.history.length > winSize) this.history.shift();

        // 2. Adjust Dynamic Threshold (Smart Logic)
        this._adjustThreshold(crash, target);

        // 3. Compute Score
        this._calculate();
    }

    _adjustThreshold(crash, target) {
        // Safe Config Retrieval (all via config API)
        const ceil       = Number(this.config.get('wma', 'thrOn'));
        const floor      = Number(this.config.get('wma', 'thrFloor'));
        const stepWin    = Number(this.config.get('wma', 'stepWin'));
        const stepLoss   = Number(this.config.get('wma', 'stepLoss'));

        // New Smart Logic Keys
        const risingBoost   = Number(this.config.get('wma', 'risingBoost'));
        const risingWinRate = Number(this.config.get('wma', 'risingWinRate'));
        const volWindow     = Number(this.config.get('wma', 'volWindow')); // Use Reflex Window (6)

        // Hysteresis / cooldown controls
        const hysteresis = Number(this.config.get('wma', 'hysteresisGap'));

        if (crash >= target) {
            // WIN: Check Stability (Reflex Window)

            // 1. Calculate Reflex Win Rate (Last N rounds)
            const recent = this.history.slice(-volWindow);
            const wins = recent.filter(h => Number(h.isHit) === 1).length;
            const currentWinRate = (recent.length > 0) ? (wins / recent.length) : 0;

            // 2. Check Slope (Trend)
            const diag = this.getScore();
            const slope = diag.slope || 0;

            // 3. Determine Step Size
            let drop = stepWin;

            // "Smart Exception": If Stable Highs AND Rising -> Boost the drop
            if (currentWinRate >= risingWinRate && slope > 0) {
                drop = stepWin * risingBoost; // e.g. 0.06 * 2.0 = 0.12 (Fast Close)
            }

            // 4. Apply Drop
            const newThr = Math.max(floor, this.currentThreshold - drop);

            if (newThr !== this.currentThreshold) {
                this.currentThreshold = newThr;
                this._dynCooldown = 0;
            }
        } else {
            // LOSS: IMMEDIATE REPULSION (Open the Jaws)

            // 1. Calculate base rise amount
            // We apply the stepLoss immediately to force gap > 0.

            // Consecutive Loss Scaling (Optional aggression)
            let recentConsec = 0;
            for (let i = this.history.length - 1; i >= 0 && recentConsec < 5; i--) {
                if (Number(this.history[i].isHit) === 0) recentConsec++;
                else break;
            }
            const scale = (recentConsec > 1) ? 2.0 : 1.0;

            // 2. Apply Rise
            const raiseAmt = stepLoss * (1 + hysteresis) * scale;
            const newThr = Math.min(ceil, this.currentThreshold + raiseAmt);

            if (newThr !== this.currentThreshold) {
                this.currentThreshold = newThr;
                this._dynCooldown = 0;
            }
        }
    }

    _calculate() {
        const n = this.history.length;
        if (n === 0) return;

        // === 1) Read Configs ===
        const alpha = Number(this.config.get('wma', 'ewmaAlpha'));
        const rewardMin = Number(this.config.get('wma', 'rewardMin'));
        const rewardMax = Number(this.config.get('wma', 'rewardMax'));
        const scoreFloor = Number(this.config.get('wma', 'scoreFloor'));

        // Advanced Configs
        const volWindow = Number(this.config.get('wma', 'volWindow'));
        const volWeight = Number(this.config.get('wma', 'volWeight'));
        const skewWeight = Number(this.config.get('wma', 'skewWeight'));
        const lowClusterThresh = Number(this.config.get('wma', 'lowCrashClusterThreshold'));
        const clusterPenalty = Number(this.config.get('wma', 'clusterPenalty'));
        const fastWindow = Number(this.config.get('wma', 'fastWindow'));
        const linearWin = Number(this.config.get('wma', 'linearWeightingWindow'));
        const eps = Number(this.config.get('wma', 'eps'));
        const recoveryBayesDecay = Number(this.config.get('wma', 'recoveryBayesDecay'));
        const volPenalty = Number(this.config.get('wma', 'volPenalty'));
        const trapSpikeMult = Number(this.config.get('wma', 'trapSpikeMult'));
        const trapTrendThresh = Number(this.config.get('wma', 'trapTrendThresh'));
        const trapPenalty = Number(this.config.get('wma', 'trapPenalty'));
        const trapBoost = Number(this.config.get('wma', 'trapBoost'));

        // [LOGIC ADJUSTMENT]: Read the scalar used to differentiate signal strength
        // Defaults to 1.0 if not set in config, preserving original behavior
        const scoreScalar = Number(this.config.get('wma', 'smartScalar')) || 1.0;

        // === 2) Calculate Rewards ===
        const rewards = this.history.map(h => {
            const crash = Number(h.crash);
            const target = Number(h.target);

            // [LOGIC ADJUSTMENT]: Apply scalar to raw log before clamping.
            // This allows small wins (e.g., 1.01 ratio) to become meaningful scores if scalar is high.
            const raw = Math.log(crash / target) * scoreScalar;

            return Math.max(rewardMin, Math.min(rewardMax, raw));
        });

        // === 3) EWMA Calculation ===
        let ewma = 0;
        if (rewards.length > 0) {
            ewma = rewards[0];
            for (let i = 1; i < rewards.length; i++) {
                // standard EWMA using configured alpha
                ewma = alpha * rewards[i] + (1 - alpha) * ewma;
            }
        }

        // Map EWMA to baseScore [0, 1]
        // [CRITICAL FIX]: baseScore is defined HERE, making it available for later steps.
        const rewardRange = (rewardMax - rewardMin);
        const mapped = (rewardRange === 0) ? 0.5 : ((ewma - rewardMin) / rewardRange);
        let baseScore = Math.max(0, Math.min(1, mapped));

        // === IMMEDIATE CONSECUTIVE-LOSS CLUSTER PENALTY (config-driven) ===
        const instMedPenalty  = Number(this.config.get('wma', 'instabilityMed'));
        const instHighPenalty = Number(this.config.get('wma', 'instabilityHigh'));
        // New Key
        const singleLossPenalty = Number(this.config.get('wma', 'singleLossPenalty'));

        // Count consecutive misses
        let consecMiss = 0;
        for (let i = this.history.length - 1; i >= 0 && consecMiss < 3; i--) {
            if (Number(this.history[i].crash) < Number(this.history[i].target)) consecMiss++;
            else break;
        }

        // STRICT ENFORCEMENT: Penalize immediately on single loss
        if (consecMiss >= 3 && instHighPenalty > 0) {
            baseScore = Math.max(0, baseScore * (1 - instHighPenalty));
        } else if (consecMiss >= 2 && instMedPenalty > 0) {
            baseScore = Math.max(0, baseScore * (1 - instMedPenalty));
        } else if (consecMiss === 1) {
            // NEW: Apply Configurable Penalty immediately to ensure Score < Threshold
            if (singleLossPenalty > 0) {
                baseScore = Math.max(0, baseScore * (1 - singleLossPenalty));
            }
        }

        // === VOLATILITY GUARD (direction-aware) ===
        // Applies vol penalty ONLY when recent volatility (sd/mean) is high AND the window is biased toward lows.
        const volThresh = Number(this.config.get('wma', 'volThresh'));
        const lowBiasThreshold = Number(this.config.get('wma', 'lowCrashClusterThreshold'));

        if (volWindow > 1 && volPenalty > 0 && this.history.length >= volWindow) {
            const recent = this.history.slice(-volWindow);
            const vals = recent.map(h => Number(h.crash) || 0);

            const meanV = vals.reduce((s, v) => s + v, 0) / vals.length;
            const varianceV = vals.reduce((s, v) => s + Math.pow(v - meanV, 2), 0) / vals.length;
            const sdV = Math.sqrt(varianceV);
            const ratio = meanV > 0 ? sdV / meanV : Number.POSITIVE_INFINITY;

            // direction test: fraction of recent entries that are "low" (crash < their target)
            const lowCount = recent.filter(h => Number(h.crash) < Number(h.target)).length;
            const lowBias = lowCount / vals.length;

            // Apply penalty only when volatility is high AND the recent window is biased toward lows
            if (ratio >= volThresh && lowBias >= lowBiasThreshold) {
                baseScore = Math.max(0, baseScore * (1 - volPenalty));
            }
        }

        // === 4) Volatility & Skew ===
        const volN = Math.min(volWindow, this.history.length);
        let mean = 0, variance = 0;
        if (volN > 0) {
            for (let i = 0; i < volN; i++) mean += this.history[this.history.length - 1 - i].crash;
            mean /= volN;
            for (let i = 0; i < volN; i++) {
                const d = this.history[this.history.length - 1 - i].crash - mean;
                variance += d * d;
            }
            variance /= volN;
        }
        const stdDev = Math.sqrt(variance);
        const volScore = (mean > 0) ? (stdDev / mean) : 0;

        // Downside Skew
        const laneTarget = this.history.length ? Number(this.history[this.history.length - 1].target) : 1;
        let downsideCount = 0;
        const lookbackForSkew = Math.min(this.history.length, volWindow);
        for (let i = 0; i < lookbackForSkew; i++) {
            if (this.history[this.history.length - 1 - i].crash < laneTarget) downsideCount++;
        }
        const downsideSkew = lookbackForSkew > 0 ? (downsideCount / lookbackForSkew) : 0;

        const instabilityScore = (volScore * volWeight) + (downsideSkew * skewWeight);

        // === 5) Cluster Penalty ===
        const lowCrashRatio = lookbackForSkew > 0 ? (downsideCount / lookbackForSkew) : 0;
        let clusterFactor = 1.0;
        if (lowCrashRatio > lowClusterThresh) {
            clusterFactor = clusterPenalty;
        }

        // === 6) Bayesian Decay ===
        let bayesFactor = 1.0;
        if (this.label === 'RECOVERY' && recoveryBayesDecay > 0) {
            let consecMiss = 0;
            for (let i = this.history.length - 1; i >= 0 && i >= this.history.length - 10; i--) {
                if (this.history[i].crash < this.history[i].target) consecMiss++;
                else break;
            }
            if (consecMiss >= 2) {
                bayesFactor = Math.max(0, 1 - recoveryBayesDecay * (consecMiss / 10));
            }
        }

        // === 7) Final Score Assembly ===
        let finalScore = baseScore;
        const instabilityImpact = Math.max(0, 1 - (instabilityScore * volPenalty));
        // Apply penalties to baseScore
        finalScore = finalScore * instabilityImpact * clusterFactor * bayesFactor;

        // === 8) Trap Detection (Safe to use baseScore now) ===
        const latestEntry = this.history[this.history.length - 1];
        const lastCrashVal = Number(latestEntry.crash);
        const currentTarget = Number(latestEntry.target);

        const isHugeSpike = lastCrashVal > (currentTarget * trapSpikeMult);
        const isTrendDead = baseScore < trapTrendThresh; // ReferenceError Fixed

        if (isHugeSpike && isTrendDead) {
            finalScore = finalScore * trapPenalty;
        } else if (isHugeSpike && !isTrendDead) {
            finalScore = Math.min(0.99, finalScore * trapBoost);
        }

        // === 9) ANTI-DRAG & FLOOR ===
        if (this.lastScore !== undefined && latestEntry.isHit === 1) {
            finalScore = Math.max(this.lastScore, finalScore);
        }
        finalScore = Math.max(scoreFloor, finalScore);

        // === 10) SAFETY RESET (revised) ===
        // Only force-to-ceiling when the recent window shows a sustained low-crash cluster.
        // Otherwise: gently raise currentThreshold (so we don't repeatedly force ceiling on small dips).
        const scoreFloorBuffer = Number(this.config.get('wma', 'scoreFloorBuffer'));
        if (finalScore <= (scoreFloor + scoreFloorBuffer)) {
            const volWindowLocal = Math.max(1, Math.min(this.history.length, Number(this.config.get('wma', 'volWindow')) || 1));
            const recent = this.history.slice(-volWindowLocal);
            const lowCountLocal = recent.filter(h => Number(h.crash) < Number(h.target)).length;
            const lowBiasLocal = (volWindowLocal > 0) ? (lowCountLocal / volWindowLocal) : 0;
            const clusterThresh = Number(this.config.get('wma', 'lowCrashClusterThreshold'));

            if (lowBiasLocal >= clusterThresh) {
                // Sustained low-cluster: force to configured ceiling (original safety behaviour)
                this.currentThreshold = Number(this.config.get('wma', 'thrOn'));
            } else {
                // Small dip: gently raise existing threshold by a configured stepLoss * (1 + hysteresis)
                const stepLossLocal = Number(this.config.get('wma', 'stepLoss'));
                const hysteresisLocal = Number(this.config.get('wma', 'hysteresisGap'));
                const ceil = Number(this.config.get('wma', 'thrOn'));
                const raiseAmtLocal = stepLossLocal * (1 + hysteresisLocal);
                this.currentThreshold = Math.min(ceil, (this.currentThreshold || 0) + raiseAmtLocal);
            }
        }

        // === 11) Update State (Smart Catch-Up) ===
        if (this.ewmaState === null) {
            this.ewmaState = finalScore;
        } else {
            // [UPDATED] Use Configurable Boost instead of hard-coded 1.2
            const adaptiveBoost = Number(this.config.get('wma', 'adaptiveAlphaBoost'));

            // LOGIC ADJUSTMENT: If the new signal is strong (> state), react slightly faster (Adaptive Alpha).
            // This prevents "lag" during recovery when a good trend starts.
            let adaptiveAlpha = alpha;
            if (finalScore > this.ewmaState) {
                adaptiveAlpha = Math.min(1.0, alpha * adaptiveBoost); // Boost reaction speed on UPSIDE only
            }
            this.ewmaState = (adaptiveAlpha * finalScore) + ((1 - adaptiveAlpha) * this.ewmaState);
        }

        // Internal Floor (Allows fast rise on next good signal)
        this.ewmaState = Math.max(scoreFloor, this.ewmaState);
        this.lastScore = Math.max(eps, Math.min(1 - eps, this.ewmaState));

        this.wmaHistory.push(this.lastScore);
        if (this.wmaHistory.length > Math.max(fastWindow, linearWin)) this.wmaHistory.shift();

        // Compute Slope
        let slope = 0;
        if (this.wmaHistory.length >= 2) {
            slope = this.wmaHistory[this.wmaHistory.length - 1] - this.wmaHistory[this.wmaHistory.length - 2];
        }

        // Diagnostics
        const regimeCfg = this.config.get('wma', 'regime') || {};
        this._diagnostics = {
            rawFast: ewma,
            instability: instabilityScore,
            volScore: volScore,
            downsideSkew: downsideSkew,
            clusterFactor: clusterFactor,
            bayesFactor: bayesFactor,
            regimeNormal: regimeCfg.normalRegime,
            regimeRecovery: regimeCfg.recoveryRegime,
            slope: slope,
            samples: n
        };
    }

    getScore() {
        const diag = this._diagnostics || {};
        return {
            finalScore: this.lastScore,
            threshold: this.currentThreshold, // DYNAMIC
            rawWma: this.ewmaState,
            slope: diag.slope || 0,
            instability: Number(diag.instability || 0),
            samples: Number(diag.samples || this.history.length)
        };
    }
}

/**
 * EVModule
 *
 * Self-contained ensemble EV prediction module.
 * Reads configuration exclusively via this.config.get('ensemble', '<key>')
 * Exposes: update(crash), predictBaseProb(hist), EV_for_target(target,p_base), vote(target)
 */
class EVModule {
    constructor(configManager, logger = null) {
        this.config = configManager;
        this.logger = logger || { log: () => {} };

        // internal rolling history (oldest..newest)
        this.history = [];

        // persistent EWMA of losses for adaptive reweighting
        this.ewmaLoss = { bayes: 0, emp: 0, ewma: 0, wma: 0, trend: 0, static: 0 };

        // last diagnostics for UI
        this.lastEV = undefined;
        this.lastPBase = undefined;
        this.lastComponents = {};
        this.lastVol = {};
    }

    // Append new crash and keep window length
    update(crash) {
        const N = Number(this.config.get('ensemble', 'window'));
        // keep raw multipliers in history
        this.history.push(Number(crash));
        // trim oldest if we exceed window
        while (this.history.length > N) this.history.shift();
    }

    // main prediction routine; hist expected oldest..newest
    predictBaseProb(hist = null) {
        const cfgBase = this.config.get('ensemble');
        // read parameters via config interface (no hard-coded fallbacks)
        const eps = Number(this.config.get('ensemble', 'eps'));
        const baseRef = Number(this.config.get('ensemble', 'baseRef'));
        const Ncfg = Number(this.config.get('ensemble', 'window'));
        const alphaEWMA = Number(this.config.get('ensemble', 'ewmaAlpha'));
        const ewmaMaxBound = Number(this.config.get('ensemble', 'ewmaMaxBound'));
        const wmaWindow = Number(this.config.get('ensemble', 'wmaWindow'));
        const timeDecayHL = Number(this.config.get('ensemble', 'timeDecayHL'));
        const bayesPriorA = Number(this.config.get('ensemble', 'bayesPriorA'));
        const bayesPriorB = Number(this.config.get('ensemble', 'bayesPriorB'));
        const volWindow = Number(this.config.get('ensemble', 'volWindow'));
        const volThreshold = Number(this.config.get('ensemble', 'volThreshold'));
        const volPenaltyFrac = Number(this.config.get('ensemble', 'volPenalty'));
        const bayesW = Number(this.config.get('ensemble', 'bayesWeight'));
        const empW = Number(this.config.get('ensemble', 'empWeight'));
        const trendW = Number(this.config.get('ensemble', 'trendWeight'));
        const ensembleEta = Number(this.config.get('ensemble', 'ensembleEta'));
        const alphaDecay = Number(this.config.get('ensemble', 'alphaDecay'));
        const trendMin = Number(this.config.get('ensemble', 'trendMin'));
        const trendMax = Number(this.config.get('ensemble', 'trendMax'));

        // pick working history
        const histWork = Array.isArray(hist) ? hist.slice() : this.history.slice();
        const nTotal = histWork.length;
        if (nTotal === 0) {
            // no data -> neutral
            const neutral = 0.5;
            const comps = { p_bayes_decay: neutral, p_ewma: neutral, p_wma: neutral, p_trend: neutral, p_static: neutral, p_perf: neutral };
            const vol = { stdV: 0, vol_penalty_factor: 1.0 };
            return { p_base: neutral, n: 0, k: 0, components: comps, vol };
        }

        // take last Ncfg (but preserve orientation oldest..newest)
        const N = Math.min(Ncfg, nTotal);
        const tail = histWork.slice(nTotal - N);

        // 1) binary indicators vs baseRef: 1 = win (>= baseRef)
        const inds = tail.map(x => (Number(x) >= baseRef) ? 1 : 0);
        const n = inds.length;
        const k = inds.reduce((s, v) => s + v, 0);
        const p_emp = k / n;

        // 2) EWMA (recent-reactive) on binary indicators
        let p_ewma = p_emp;
        // compute start index to avoid scanning larger than ewmaMaxBound (if set)
        const startIdx = Math.max(0, n - Math.min(n, ewmaMaxBound));
        for (let i = startIdx; i < n; ++i) {
            p_ewma = alphaEWMA * inds[i] + (1 - alphaEWMA) * p_ewma;
        }

        // 3) WMA (short trend)
        const m = Math.min(wmaWindow, n);
        let wsum = 0, ssum = 0;
        for (let i = 0; i < m; ++i) {
            const w = i + 1;
            const v = inds[n - m + i];
            wsum += w * v;
            ssum += w;
        }
        const p_wma = ssum > 0 ? (wsum / ssum) : p_emp;

        // 4) Time-decayed Bayesian (weighted Beta)
        let alpha_eff = bayesPriorA;
        let beta_eff = bayesPriorB;
        // age = 0 for newest, age increases for older samples; we want older smaller weights
        for (let i = 0; i < n; ++i) {
            const age = (n - 1 - i);
            const wi = Math.pow(2, - age / timeDecayHL); // exponential decay per half-life
            alpha_eff += wi * inds[i];
            beta_eff += wi * (1 - inds[i]);
        }
        const p_bayes_decay = alpha_eff / (alpha_eff + beta_eff);

        // 5) Trend prob - compare a recent slice vs older slice
        const derivedShort = Math.max(trendMin, Math.floor(Math.min(trendMax, n / 10)));
        const recentSlice = inds.slice(Math.max(0, n - derivedShort));
        const recent_k = recentSlice.reduce((s, v) => s + v, 0);
        const recent_p = (recentSlice.length > 0) ? (recent_k / recentSlice.length) : p_emp;
        const olderSlice = inds.slice(0, Math.max(0, n - derivedShort));
        const older_k = olderSlice.reduce((s, v) => s + v, 0);
        const older_n = Math.max(1, olderSlice.length);
        const older_p = older_k / older_n;
        // Trend biased upward if recent > older
        const p_trend = Math.max(0, Math.min(1, recent_p + 0.5 * (recent_p - older_p)));

        // 6) Volatility penalty computed on raw multipliers (last volWindow)
        const vw = Math.min(volWindow, tail.length);
        const lastV = tail.slice(tail.length - vw);
        const meanV = lastV.reduce((s, x) => s + Number(x), 0) / vw;
        const stdV = Math.sqrt(lastV.reduce((s, x) => s + Math.pow(Number(x) - meanV, 2), 0) / vw);
        let vol_penalty_factor = 1.0;
        if (meanV > 0 && (stdV / meanV) > volThreshold) {
            vol_penalty_factor = Math.max(0, 1 - volPenaltyFrac);
        }

        // 7) static mix
        const p_static = (bayesW * p_bayes_decay) + (empW * p_ewma) + (trendW * p_trend);

        // 8) candidate set and adaptive reweighting based on last outcome log-loss
        const clip = (v) => Math.max(eps, Math.min(1 - eps, v));
        const candidates = {
            bayes: clip(p_bayes_decay),
            ewma: clip(p_ewma),
            wma: clip(p_wma),
            trend: clip(p_trend),
            static: clip(p_static)
        };

        // compute log-loss on last observed outcome
        const y_last = inds[n - 1];
        const losses = {};
        for (const nm in candidates) {
            const p = candidates[nm];
            losses[nm] = - (y_last * Math.log(p) + (1 - y_last) * Math.log(1 - p));
            // EWMA loss persistence update
            this.ewmaLoss[nm] = (alphaDecay * (this.ewmaLoss[nm] || losses[nm])) + ((1 - alphaDecay) * losses[nm]);
        }

        // weights from ewmaLoss
        const weights = {}; let wsum2 = 0;
        for (const nm in losses) { weights[nm] = Math.exp(- ensembleEta * this.ewmaLoss[nm]); wsum2 += weights[nm]; }
        let p_perf = 0;
        for (const nm in candidates) {
            p_perf += (weights[nm] / wsum2) * candidates[nm];
        }

        // 9) final mix & tail-awareness (bias if baseRef > high quantile)
        const q98 = this._quantile(tail, 0.98);
        let p_base;
        if (baseRef > q98) {
            p_base = (0.2 * p_static) + (0.6 * p_perf) + (0.2 * p_bayes_decay);
        } else {
            p_base = (0.5 * p_static) + (0.5 * p_perf);
        }

        // 10) apply vol penalty & clamp
        p_base = Math.max(eps, Math.min(1 - eps, p_base * vol_penalty_factor));

        const components = { p_bayes_decay, p_ewma, p_wma, p_trend, p_static, p_perf };
        const vol = { stdV, vol_penalty_factor };

        try { this.logger.log('[EVModule] p_base', p_base, components, vol); } catch (e) {}

        return { p_base, n, k, components, vol };
    }

    // unit-stake EV using base prob
    EV_for_target(target, p_base) {
        return (Number(target) * Number(p_base)) - 1;
    }

    // module-level vote: returns pass boolean and diagnostic payload
    vote(target) {
        const res = this.predictBaseProb(this.history);
        const p_base = res.p_base;
        const ev = this.EV_for_target(target, p_base);
        // threshold read from ensemble namespace
        const threshold = Number(this.config.get('ensemble', 'evThreshold'));
        const pass = ev >= threshold;
        // persist diagnostics for UI
        this.lastEV = ev;
        this.lastPBase = p_base;
        this.lastComponents = res.components;
        this.lastVol = res.vol;
        return { pass, ev, p_base, components: res.components, vol: res.vol };
    }

    // helper quantile (arr oldest..newest)
    _quantile(arr, q) {
        if (!arr || arr.length === 0) return 0;
        const a = arr.slice().sort((a, b) => a - b);
        const pos = (a.length - 1) * q;
        const lo = Math.floor(pos), hi = Math.ceil(pos);
        if (lo === hi) return a[lo];
        return (a[lo] * (hi - pos)) + (a[hi] * (pos - lo));
    }
}

class TitanPredictionEngine {
    constructor(configManager) {
        this.config = configManager;
        this.logger = new Logger(this.config);

        this.bot = null; // Injected via initialize

        // Module Container
        this.modules = {
            ev: null,
            wma: null,
            pattern: null
        };

        // --- State Management ---
        this.lastAction = '💡 System Initializing...';
        // Sniper State Container
        this.state = {
            forceRecalibrate: false
        };
        // Rich Display State
        this.richDecisionString = ''; // Persists across ticks
        this.decisionState = {
            target: 0,
            voteStr: '0/0',
            lane: 'red', // 'red' or 'green'
            betType: null,
            skipReason: null,
            isBetting: false
        };

        // Sniper / Normal State
        this.lastRegime = 'INIT';
        this.consecutiveWins = 0;
        this.lastBetType = null; // 'NORMAL', 'STANDARD_RECOVERY', 'RECOVERY_FOLLOWUP', 'SMART_OVERRIDE'
        this.lastTarget = 0;

        // Recovery State (Complex)
        this.followUpActive = false;
        this.followUpCount = 0;

        this.smartOverrideActive = false;
        this.smartOverrideCount = 0;
    }

    /**
     * Called by CrashBot during startup.
     * Hydrates modules with history so they don't start "cold".
     */
    initialize(adapter, botInstance) {
        this.adapter = adapter;
        this.bot = botInstance;

        // 1. Instantiate Modules
        // We instantiate them regardless of 'enabled' config so we can toggle them on/off at runtime
        this.modules.wma = new WMAModule(this.config, this.logger);
        this.modules.ev  = new EVModule(this.config, this.logger);
        // Future: this.modules.pattern = new PatternModule(...);

        // 2. Hydrate Modules (Train on History)
        // Use the configured window size.
        const windowSize = Number(this.config.get('wma', 'windowsSize'));
        const history = this.bot.stats.getRecentCrashes(windowSize);

        if (history && history.length > 0) {
            this.logger.log(`🧠 Brain: Hydrating with ${history.length} historical rounds...`, 'info');
            history.forEach(crash => {
                // Update all modules
                if (this.modules.wma) this.modules.wma.update(crash);
                if (this.modules.ev)  this.modules.ev.update(crash);
            });
        }

        this.logger.log('🧠 TitanPredictionEngine: Consensus System Online.');
    }

    /**
     * Phase 4: Updates the persistent decision state and regenerates the display string
     */
    updateState(target, voteStr, lane, betType, skipReason, isBetting) {
        this.decisionState = {
            target: target,
            voteStr: voteStr,
            lane: lane,
            betType: betType,
            skipReason: skipReason,
            isBetting: isBetting
        };
        this.formatRichDisplay();
    }

    /**
     * Generates the standardized Rich Display String with Icons
     * Format: "🎯 2.60x | Votes: 1/1 | WMA: 🟢 85% (40) | EV: 🟢 0.002 (Thr:0.001) | Type: SNIPER_SHOT"
     */
    formatRichDisplay() {
        const ds = this.decisionState;

        // 1. Target & Votes
        let out = `🎯 ${ds.target.toFixed(2)}x | Votes: ${ds.voteStr}`;

        // 2. WMA Module Display
        if (this.modules.wma && this.config.get('prediction', 'wmaEnabled')) {
            const climate = this.modules.wma.getClimate();

            // Determine which lane the decisionState is currently showing (default to red)
            const laneName = (ds && ds.lane) ? ds.lane.toLowerCase() : 'red';

            // Pick the lane data safely from the climate object
            let laneData = null;
            if (climate && climate.scores) {
                if (laneName === 'green') laneData = climate.scores.green;
                else if (laneName === 'recovery') laneData = climate.scores.recovery; // FIX: Select Recovery Lane
                else laneData = climate.scores.red;
            }

            const laneThr = laneData ? Math.round((laneData.threshold || Number(this.config.get('wma','thrOn')))*100) : Math.round(Number(this.config.get('wma','thrOn'))*100);
            const score   = laneData ? Math.round((laneData.finalScore || 0) * 100) : 0;
            const icon    = score >= laneThr ? '🟢' : '🔴';

            out += ` | WMA: ${icon} ${score}% (${laneThr})`;
        }

        // 3. EV Module Display
        if (this.modules.ev && this.config.get('prediction', 'evEnabled')) {
            // Fetch latest stats (Safe access in case module is initializing)
            const evVal = this.modules.ev.lastEV !== undefined ? this.modules.ev.lastEV : 0;
            const evThr = Number(this.config.get('prediction', 'evThreshold')) || 0;

            // Icon: Green if EV >= Threshold, Red if below
            const evIcon = evVal >= evThr ? '🟢' : '🔴';

            // Format: | EV: 🟢 0.002 (Thr:0.001)
            out += ` | EV: ${evIcon} ${evVal.toFixed(3)} (Thr:${evThr.toFixed(3)})`;
        }

        // 4. Pattern Module Display
        if (this.modules.pattern && this.config.get('prediction', 'patternEnabled')) {
            // Fetch match status
            const isMatch = this.modules.pattern.lastMatch || false;

            // Icon: Check if Match, Cross if No Match
            const patIcon = isMatch ? '✅' : '❌';

            // Format: | Pat: ✅
            out += ` | Pat: ${patIcon}`;
        }

        // 5. Action Suffix
        if (ds.isBetting) {
            out += ` | Type: ${ds.betType}`;
        } else {
            out += ` | SKIP: ${ds.skipReason}`;
        }

        // 6. Update Persistent Strings
        this.richDecisionString = out;
        this.lastAction = out; // Immediate update
    }

    /**
     * Main Decision Router
     * Delegates to specific logic handlers based on Mode
     * REFACTORED: Simulates NORMAL mode during WARMUP to generate Rich Display stats
     */
    decide(mode, lastResult) {
        // Reset rich text parts for this decision cycle
        this.decisionLog = [];

        // 1. DETERMINE LOGIC TO RUN
        // If WARMUP, we simulate NORMAL mode to generate the "Target" and "Votes" for the UI.
        const logicMode = (mode === 'WARMUP') ? 'NORMAL' : mode;

        let decision = { allow: false, reason: 'UNKNOWN_MODE' };

        // 2. RUN LOGIC
        if (logicMode === 'RECOVERY') {
            decision = this.decideRecoveryBet();
        } else if (logicMode === 'NORMAL') {
            decision = this.decideNormalBet();
        }

        // 3. WARMUP OVERRIDE (Intercept & Block)
        if (mode === 'WARMUP') {
            // Even if the logic said "allow: true", we force it to false
            decision.allow = false;
            decision.reason = 'WARMUP';

            // UPDATE RICH DISPLAY:
            // The logic above (decideNormalBet) already populated 'this.decisionState' with
            // the Target, WMA Score, and Icons. We just need to change the Action tag.

            this.decisionState.isBetting = false; // Force "Red" text for action
            this.decisionState.skipReason = 'WARM_UP'; // Change text to "SKIP: WARM_UP"

            // Regenerate the string with the new Skip Reason
            this.formatRichDisplay();
        }

        return decision;
    }

    /**
     * Logic for Normal "Sniper" Mode (UNSHACKLED + SAFE)
     * Philosophy: Trust the WMA. If Prediction says GO, we GO.
     * Removed: Rigid "Cluster" checks and forced recalibration loops (Red Lane).
     * Kept: Strict safety & cooldowns for High Multiplier (Green Lane).
     */
    decideNormalBet() {
        const defMult = Number(this.config.get('normal', 'normalDefaultMult'));

        // compute voting EARLY so UI gets correct voteStr even during recalibration/pause
        const voting = this.getVotingResult('NORMAL');
        const climate = this.modules.wma.getClimate();
        const greenThr = climate.scores.green.threshold;
        const redThr   = climate.scores.red.threshold;

        // 1. Forced Recalibration (Only if triggered externally, e.g. Stop Loss)
        if (this.state.forceRecalibrate) {
            this.state.forceRecalibrate = false;
            // use the real voting.voteStr
            this.updateState(defMult, voting.voteStr, 'red', null, 'RECALIBRATING', false);
            return { allow: false, reason: 'Recalibrating' };
        }

        // 2. High Opportunity (Green Lane) - "Sparingly"
        // We keep this strict to avoid the "High Multiplier Losses".
        const highMult = Number(this.config.get('normal', 'normalHighMult'));
        const greenScore = climate.scores.green ? climate.scores.green.finalScore : 0;

        if (greenScore >= greenThr && voting.pass) {
            // [RESTORED] Cooldown & Hit Verification Logic
            const hitsWindow = Number(this.config.get('normal', 'highHitsWindow'));
            const minHits = Number(this.config.get('normal', 'highMinHits'));
            const cooldownRounds = Number(this.config.get('normal', 'highCooldownRounds'));
            const wmRounds = (this.modules && this.modules.wma) ? this.modules.wma.roundsProcessed : 0;

            // Check history
            const gHist = this.modules.wma.lanes.green.history.slice(-hitsWindow);
            const hits = gHist.filter(h => Number(h.isHit) === 1).length;

            // Cooldown check
            const lastHighRound = Number(this.state.lastHighShotRound || 0);
            const sinceLastHigh = wmRounds - lastHighRound;

            if (hits >= minHits && sinceLastHigh >= cooldownRounds) {
                // Update tracker
                this.state.lastHighShotRound = wmRounds;
                this.updateState(highMult, voting.voteStr, 'green', 'NORMAL_SNIPER_SHOT', null, true);
                return { allow: true, target: highMult, type: 'NORMAL', reason: 'Sniper:High' };
            }
        }

        // 3. Default Sniper Logic (Red Lane) - "Flow Mode"
        const redScore = climate.scores.red ? climate.scores.red.finalScore : 0;

        // If WMA says Pass, we Bet. No "Cluster" check. No "Choppy" check.
        // The WMA Volatility Guard (in config) already handles the chop.
        if (redScore >= redThr && voting.pass) {
            // Update Persistent Display
            this.updateState(defMult, voting.voteStr, 'red', 'NORMAL_SNIPER_SHOT', null, true);
            return { allow: true, target: defMult, type: 'NORMAL', reason: 'Sniper:Default' };
        }

        // 4. Fallback (Skip)
        this.updateState(defMult, voting.voteStr, 'red', null, 'WAITING_SIGNAL', false);
        return { allow: false, reason: 'No Signal' };
    }

    /**
     * Logic for Recovery Mode (Phase 3 Implementation)
     * Priority: FollowUp (Ungated) -> Smart Override (Gated) -> Standard (Gated)
     */
    decideRecoveryBet() {
        // 1. Get Recovery Target
        const recTarget = Number(this.config.get('recovery', 'targetRecMult'));

        // 2. PRIORITY 1: FOLLOW-UP (Strictly Ungated)
        // Condition: Config Enabled AND State Active (Triggered by Standard Loss)
        const followUpEnabled = this.config.get('recovery', 'enabledFollowUp');

        if (followUpEnabled && this.followUpActive) {
            const maxFollowUp = Number(this.config.get('recovery', 'maxFollowUp'));

            if (this.followUpCount < maxFollowUp) {
                // UNGATED: We do NOT check voting/WMA here.
                const typeStr = `RECOVERY_FOLLOWUP (${this.followUpCount + 1}/${maxFollowUp})`;
                // show recovery lane (display must match voting lane)
                this.updateState(recTarget, '1/1', 'recovery', typeStr, null, true);
                return { allow: true, target: recTarget, type: 'RECOVERY_FOLLOWUP', reason: 'FollowUp Sequence' };
            } else {
                // Limit reached: Reset and fall through to lower priority
                this.followUpActive = false;
                this.followUpCount = 0;
            }
        }

        // 3. PRIORITY 2: SMART OVERRIDE (Gated)
        // Condition: Config Enabled AND State Active (Triggered by Partial Win)
        const overrideEnabled = this.config.get('recovery', 'enableSmartOverride');

        if (overrideEnabled && this.smartOverrideActive) {
            const maxOverride = Number(this.config.get('recovery', 'smartOverrideThreshold'));

            if (this.smartOverrideCount < maxOverride) {
                // GATED: Must pass consensus (Pass 'RECOVERY' mode)
                const voting = this.getVotingResult('RECOVERY');

                if (voting.pass) {
                    const typeStr = `SMART_OVERRIDE (${this.smartOverrideCount + 1}/${maxOverride})`;
                    // display recovery lane so UI shows recovery threshold/score
                    this.updateState(recTarget, voting.voteStr, 'recovery', typeStr, null, true);
                    return { allow: true, target: recTarget, type: 'SMART_OVERRIDE', reason: 'Partial Win Override' };
                } else {
                    // If Gated, we SKIP. We do NOT fall back to Standard.
                    // We wait for the override opportunity to be valid or the user to intervene.
                    this.updateState(recTarget, voting.voteStr, 'red', null, 'OVERRIDE GATED', false);
                    return { allow: false, reason: 'Smart Override Gated' };
                }
            } else {
                // Limit reached: Reset
                this.smartOverrideActive = false;
                this.smartOverrideCount = 0;
            }
        }

        // 4. PRIORITY 3: STANDARD RECOVERY (Gated)
        // Default entry point
        // Pass 'RECOVERY' mode to check the correct lane (2.04x)
        const voting = this.getVotingResult('RECOVERY');

        if (voting.pass) {
            const extra = voting.logs.join(' | ');
            this.lastAction = `🚑 STANDARD RECOVERY | Votes: ${voting.voteStr} | ${extra} | Type: RECOVERY_STANDARD`;
            this.updateState(recTarget, voting.voteStr, 'recovery', 'RECOVERY_STANDARD', null, true );
            return { allow: true, target: recTarget, type: 'STANDARD_RECOVERY', reason: 'Consensus Approved' };
        } else {
            // Direction-aware relaxation: if recent window is biased toward highs, allow a relaxed recovery bet
            const relaxFactor = Number(this.config.get('recovery', 'relaxFactor'));
            const relaxWindow = Number(this.config.get('recovery', 'relaxVolWindow'));
            const lowBiasMax = Number(this.config.get('recovery', 'relaxLowBias'));

            let allowRelax = false;
            if (relaxWindow > 0 && this.modules && this.modules.wma && this.modules.wma.history && this.modules.wma.history.length >= relaxWindow) {
                const recent = this.modules.wma.history.slice(-relaxWindow);
                const lowCount = recent.filter(h => Number(h.crash) < Number(h.target)).length;
                const lowBias = lowCount / recent.length;
                if (lowBias <= lowBiasMax) allowRelax = true;
            }

            // compute adjusted recovery score used in getVotingResult (info logged in voting.logs)
            const recLog = voting.logs.join(' | ');
            // If low-bias is small (highs dominant) AND the recovery score is within the configurable relaxFactor, allow one standard recovery bet
            // get reported recScore from climate directly (matching getVotingResult behavior)
            const climate = this.modules.wma.getClimate();
            const recThr = climate.scores.recovery.threshold;
            const recScore = climate.scores.recovery.finalScore;
            const recRegime = Number(this.config.get('wma', 'regime_recovery'));
            const recScoreAdj = Math.max(0, Math.min(1, (recScore || 0) * (isFinite(recRegime) ? recRegime : 1)));

            if (!voting.pass && allowRelax) {
                const relaxThresh = (isFinite(relaxFactor) && relaxFactor > 0) ? (recThr * relaxFactor) : recThr;
                if (recScoreAdj >= relaxThresh) {
                    this.lastAction = `🚑 RECOVERY_RELAX | Votes: ${voting.voteStr} | ${recLog}`;
                    this.updateState(recTarget, voting.voteStr, 'recovery', 'RECOVERY_STANDARD_RELAX', null, true );
                    return { allow: true, target: recTarget, type: 'STANDARD_RECOVERY', reason: 'RelaxedRecovery' };
                }
            }

            // default: still skip
            this.lastAction = `⏭️ SKIP: RECOVERY PAUSED | Votes: ${voting.voteStr} | ${recLog}`;
            this.updateState(recTarget, voting.voteStr, 'recovery', null, 'RECOVERY_PAUSED', false );
            return { allow: false, reason: 'Recovery Consensus Failed' };
        }
    }

    /**
     * Aggregates votes from all enabled modules
     * @param {string} mode - 'NORMAL' or 'RECOVERY'. Determines which WMA lane to check.
     */
    getVotingResult(mode = 'NORMAL') {
        let votes = 0;
        let activeModules = 0;
        let reasons = [];
        let targets = [];
        let logs = [];

        // Define eps locally by fetching from config to prevent ReferenceError
        const eps = Number(this.config.get('wma', 'eps'));

        if (this.modules.wma && this.config.get('prediction', 'wmaEnabled')) {
            activeModules++;
            const climate = this.modules.wma.getClimate();

            if (mode === 'RECOVERY') {
                // RECOVERY MODE: apply configurable regime multiplier before threshold comparison
                const recThr = climate.scores.recovery.threshold;
                const recScore = climate.scores.recovery.finalScore;
                // Read regime mapping object produced by ConfigManager
                const regimeCfg = this.config.get('wma', 'regime') || {};
                const recRegime = Number(regimeCfg.recoveryRegime);
                // adjusted score (clamped to [0,1])
                const recScoreAdj = Math.max(0, Math.min(1, (recScore || 0) * (isFinite(recRegime) ? recRegime : 1)));

                const eps = Number(this.config.get('wma', 'eps'));
                if ((recScoreAdj + eps) >= recThr) {
                    votes++;
                    reasons.push('WMA:Recovery');
                    logs.push(`WMA:🔵(${Math.round(recScoreAdj * 100)}% / ${Math.round(recThr*100)}% [Dyn xReg])`);
                } else {
                    logs.push(`WMA:🔵(${Math.round(recScoreAdj * 100)}% / ${Math.round(recThr*100)}% [Dyn xReg])`);
                }
            }
            else {
                // NORMAL MODE
                const greenThr = climate.scores.green.threshold;
                const redThr = climate.scores.red.threshold;

                if (climate.scores.green && (climate.scores.green.finalScore + eps) >= greenThr) {
                    votes++;
                    targets.push(Number(this.config.get('normal', 'normalHighMult')));
                    reasons.push('WMA:Green');
                    logs.push(`WMA:🟢(${Math.round(climate.scores.green.finalScore * 100)}%/${Math.round(greenThr*100)}%)`);
                }
                if (climate.scores.red && (climate.scores.red.finalScore + eps) >= redThr) {
                    votes++;
                    targets.push(Number(this.config.get('normal', 'normalDefaultMult')));
                    reasons.push('WMA:Red');
                    logs.push(`WMA:🔴(${Math.round(climate.scores.red.finalScore * 100)}%/${Math.round(redThr*100)}%)`);
                }

                if (reasons.length === 0) {
                    const score = climate.scores.red ? Math.round(climate.scores.red.finalScore * 100) : 0;
                    logs.push(`WMA:💤(${score}%)`);
                }
            }
        }

        if (activeModules === 0) return { pass: false, target: 0, reasons: ['No Modules'], voteStr: '0/0', logs: [] };

        // If only one module is active, treat multiple internal lane-votes
        // as a single vote (1/1). This prevents UI showing 2/1 when only WMA is used.
        if (activeModules === 1 && votes > 1) {
            votes = 1;
            if (reasons.length > 1) reasons = [reasons[0]];
            if (targets.length > 1) targets = [targets[0]];
            if (logs.length > 1) logs = [logs[0]];
        }

        let req = Number(this.config.get('prediction', 'consensusRequired'));
        if (activeModules === 1) req = 1;

        const pass = (votes >= req);

        let finalTarget = 0;
        if (targets.length > 0) finalTarget = Math.min(...targets);

        return {
            pass: pass,
            target: finalTarget,
            reasons: reasons,
            voteStr: `${votes}/${req}`,
            logs: logs
        };
    }

    /**
     * Updates internal state based on game result (Phase 3 State Machine)
     */
    update(lastCrash, wasWin, currentRecoveryLevel, wasBetting = false) {
        // 1. Update Modules
        if (this.modules.wma) this.modules.wma.update(lastCrash);
        if (this.modules.ev)  this.modules.ev.update(lastCrash);

        // 2. State Machine Updates
        if (wasBetting) {
            if (wasWin) {
                this.consecutiveWins++;

                // Maintain default-sniper consecutive counter: increment only for NORMAL bets
                if (this.lastBetType === 'NORMAL') {
                    if (this.state.normalConsecCount === undefined) this.state.normalConsecCount = 0;
                    this.state.normalConsecCount++;
                } else {
                    // non-NORMAL win resets default consecutive counter
                    this.state.normalConsecCount = 0;
                }

                // RULE: If RECOVERY_FOLLOWUP wins, Reset follow-up sequence immediately
                if (this.lastBetType === 'RECOVERY_FOLLOWUP') {
                    this.followUpActive = false;
                    this.followUpCount = 0;
                }

                // Calculate Profit & Partial Status
                const activeBet = this.bot ? this.bot.activeBet : null;
                let isPartial = true;

                if (activeBet && this.bot) {
                    // Profit = Stake * (Multiplier - 1)
                    const profit = activeBet.stakeBits * (activeBet.targetMultiplier - 1);
                    // It is ONLY partial if profit is LESS than current debt
                    isPartial = profit < (this.bot.debtBits || 0);
                }

                // ==========================================
                // 1. Handle STANDARD & FOLLOW-UP Wins
                // ==========================================
                if (this.lastBetType === 'STANDARD_RECOVERY' || this.lastBetType === 'RECOVERY_FOLLOWUP') {

                    if (!isPartial) {
                        // A. FULL CLEAR -> EXIT RECOVERY
                        // We do this regardless of whether Smart Override is enabled or not.
                        this.handleRecoveryExit();
                    }
                    else {
                        // B. PARTIAL WIN -> Check Config for Smart Override
                        const overrideEnabled = this.config.get('recovery', 'enableSmartOverride');
                        if (overrideEnabled) {
                            this.smartOverrideActive = true;
                            this.smartOverrideCount = 0;
                        }
                    }
                }

                // ==========================================
                // 2. Handle SMART OVERRIDE Wins
                // ==========================================
                if (this.lastBetType === 'SMART_OVERRIDE') {
                    this.smartOverrideCount++; // Ride the streak

                    if (!isPartial) {
                        // FULL CLEAR -> EXIT RECOVERY
                        this.handleRecoveryExit();
                    }
                }
            } else {
                // LOSS
                this.consecutiveWins = 0;

                // RULE: Follow-Up Trigger
                // Condition: ONLY triggers if STANDARD_RECOVERY lost.
                if (this.lastBetType === 'STANDARD_RECOVERY') {
                    const followUpEnabled = this.config.get('recovery', 'enabledFollowUp');
                    if (followUpEnabled) {
                        this.followUpActive = true;
                        this.followUpCount = 0;
                    }
                }
                else if (this.lastBetType === 'RECOVERY_FOLLOWUP') {
                    // If FollowUp lost, consume a slot
                    this.followUpCount++;
                }
                else if (this.lastBetType === 'SMART_OVERRIDE') {
                    // RULE: Smart Override Loss kills the sequence (Safety)
                    this.smartOverrideActive = false;
                    this.smartOverrideCount = 0;
                    // Ensure followUp is NOT activated by an Override loss
                    this.followUpActive = false;
                }
            }
        }
    }

    updateLastAction(voting, allow) {
        const tgtStr = allow ? `🎯 ${voting.target.toFixed(2)}x` : '💤 Scanning';
        const extra = voting.logs.join(' | ');
        const decisionParts = this.decisionLog.join(' '); // Heat info

        this.lastAction = `${tgtStr} | Votes: ${voting.voteStr} | ${extra} | ${decisionParts}`;

        // Store for next cycle state checks
        if (allow) {
            this.lastTarget = voting.target;
            // Note: lastBetType is set in decide() return
        }
    }

    /**
     * Handles the transition from Recovery -> Normal
     * Instant Re-entry. Do not stall growth.
     */
    handleRecoveryExit() {
        // 1. Reset all Recovery Flags
        this.followUpActive = false;
        this.followUpCount = 0;
        this.smartOverrideActive = false;
        this.smartOverrideCount = 0;
        this.recoveryLadderCache = null;

        if (this.bot) {
            this.bot.debtBits = 0;
        }

        this.logger.log(`🎉 Recovery Cleared. Re-entering Normal Mode IMMEDIATELY.`);

        // CRITICAL FIX: Never force recalibration on exit.
        // Let the WMA module decide next tick. If market is good, we bet instantly.
        this.state.forceRecalibrate = false;
    }
    // UI Stats accessor (used by StatsPanel)
    getStats() {
        return {
            climate: this.lastRegime || 'INIT',
            frozen: false,
            pingPong: false
        };
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
            this.logger.log(`⚠️ Stats mismatch! Wins(${this.stats.totalWins}) + Losses(${this.stats.totalLosses}) = ${calculatedTotal} ≠ Total Bets(${this.stats.totalBets})`);
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

            // If this is a recovery stake, update bot-level peak stake and the numeric epoch timestamp
            try {
                const modeUpper = (suppliedMode || '').toString().toUpperCase();
                // When a recovery stake is actually placed, update peak metrics
                if (this.bot && modeUpper === 'RECOVERY') {
                    const stakeBits = Number(bits) || 0;
                    if (!Number.isFinite(this.bot.maxRecStakeBitsEver) || stakeBits > Number(this.bot.maxRecStakeBitsEver)) {
                        this.bot.maxRecStakeBitsEver = stakeBits;
                        this.bot.maxRecTime = Date.now(); // epoch ms
                        // +++ CAPTURE SNAPSHOT OF RUNTIME (AGE) +++
                        this.bot.maxRecRuntimeSeconds = (this.bot.firstStartedAt)
                            ? (Date.now() - this.bot.firstStartedAt) / 1000
                            : 0;
                    }
                    // Keep peakStake as canonical record of highest stake ever placed (used by payload)
                    if (!Number.isFinite(this.bot.peakStake) || stakeBits > Number(this.bot.peakStake)) {
                        this.bot.peakStake = stakeBits;
                    }
                }
            } catch (e) {
                // non-fatal: stats update should not break betting
            }

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
        let profit;
        let newBalance;

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
        this.logger = new Logger(this.config);
        this.panel = null; // No HTML panel

        // Start the runtime ticker logic, but it won't update any HTML
        this.startRuntimeTicker(this.bot);
    }

    setBot(botInstance) {
        try {
            this.bot = botInstance;
            // Restart the ticker now that the bot exists!
            this.startRuntimeTicker(this.bot);
        } catch (e) { /* ignore */ }
    }

    startRuntimeTicker(bot) {
        // Stop any existing legacy timers
        this.stopRuntimeTicker();

        // Define what happens every second
        const onTick = () => {
            // Ensure we have a valid bot instance
            const activeBot = this.bot || bot;

            if (activeBot) {
                const isBetting = activeBot.betting && activeBot.betting.hasActiveBet();
                // Retrieve the persistent Rich Display string from the Brain
                const richAction = (activeBot.brain && activeBot.brain.lastAction) ? activeBot.brain.lastAction : null;

                // Send update to dashboard
                this.updateStats(
                    activeBot.stats.getStats(),
                    activeBot.config.getCurrentBalance(),
                    activeBot.config.initialBalance,
                    activeBot.betting.getActiveBet(),
                    isBetting,
                    richAction, // externalActionText
                    null, // lastPLBits
                    false, // force
                    true  // silent = TRUE (Stops the 1-second flood)
                );
            }
        };

        // Hook into the KeepAlive Manager (Worker or Interval)
        if (window.keepAlive) {
            if (typeof logger !== 'undefined') {
                logger.log('✅ StatsPanel connected to KeepAlive Heartbeat', 'info');
            }
            window.keepAlive.subscribe(onTick);
        } else {
            // Fallback safety if KeepAlive isn't ready
            this._runtimeInterval = setInterval(onTick, 1000);
        }
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
    updateStats(stats, currentBalance, initialBalance, activeBet = null, isBetting = false, externalActionText = null, lastPLBits = null, force = false, silent = false) {
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

        // Mode & State Label Logic
        const env = (this.config.getRunMode ? (this.config.getRunMode() === 'test' ? 'TEST' : 'LIVE') : 'LIVE');
        const mode = (this.bot && this.bot.mode) ? this.bot.mode : 'NORMAL'; // WARMUP, NORMAL, RECOVERY
        let status;

        if (this.bot && this.bot.haltReason) {
            status = 'HALTED';
        }
        else if (mode === 'WARMUP') {
            const now = Date.now();
            const hasFutureSchedule = (this.bot && this.bot.scheduledTargetEpochMs && this.bot.scheduledTargetEpochMs > now);
            // If waiting for time -> SCHEDULED. If counting rounds -> RUNNING.
            if (hasFutureSchedule) status = 'SCHEDULED';
            else status = 'RUNNING';
        }
        else {
            // Normal or Recovery
            if (!this.bot || this.bot.isRunning === false) status = 'HALTED';
            else if (isBetting) status = 'BETTING';
            else status = 'PAUSED';
        }

        const modeText = `[${env}][${mode}][${status}]`;
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
        // Check Brain's decision state to show what we are aiming for (even if skipping/warmup)
        else if (this.bot && this.bot.brain && this.bot.brain.decisionState && this.bot.brain.decisionState.target) {
            nextMultValue = this.bot.brain.decisionState.target;
        }
        else if (this.bot && this.bot.mode === 'RECOVERY') {
            nextMultValue = this.bot.config.get('recovery', 'targetRecMult');
        }
        else if (this.bot && this.bot.brain && this.bot.brain.lastRegime) {
            const r = this.bot.brain.lastRegime;
            // Updated to use new Phase 1 config keys
            // If Green (High), show High Mult. Otherwise default to Default Mult.
            if (r === 'GREEN') nextMultValue = cfgNorm.normalHighMult;
            else nextMultValue = cfgNorm.normalDefaultMult;
        }
        else {
            // Default fallback
            nextMultValue = cfgNorm.normalDefaultMult;
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
        const normalSkips = this.bot ? (this.bot.normalSkips) : 0;
        const recSkips = this.bot ? (this.bot.recoverySkips) : 0;

        // Recovery
        const recLevel = this.bot ? (this.bot.recoveryLevel) : 0;
        const rounds = this.bot && this.bot.rounds ? this.bot.rounds : 0;
        const maxRecLevel = this.bot ? (this.bot.maxRecLevel) : 0;
        const maxRecStake = this.bot ? (this.bot.maxRecStakeBitsEver ? this.bot.maxRecStakeBitsEver.toFixed(2) : '0.00') : '0.00';

        // +++ MAX REC TIME / AGE LOGIC +++
        let maxRecTimeText = '--:--:--';
        let maxRecAgeText = '00:00:00';

        if (this.bot && this.bot.maxRecTime) {
            // 1. Max Rec Time (Exact MYT Time)
            maxRecTimeText = (this.bot._malaysiaTimeString)
                ? this.bot._malaysiaTimeString(new Date(this.bot.maxRecTime))
                : new Date(this.bot.maxRecTime).toLocaleTimeString();

            // 2. Max Rec Age (Script Age WHEN the stake was placed)
            // Use the captured snapshot 'maxRecRuntimeSeconds'
            const s = (this.bot.maxRecRuntimeSeconds) ? Math.floor(this.bot.maxRecRuntimeSeconds) : 0;
            const h = Math.floor(s / 3600);
            const m = Math.floor((s % 3600) / 60);
            const sec = s % 60;
            maxRecAgeText = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
        }

        // +++ DURATION & RUIN +++
        const msToTime = (ms) => {
            const s = Math.floor(ms / 1000);
            const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); const sec = s % 60;
            return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
        };
        const recoveryDuration = (this.bot) ? msToTime(this.bot.maxRecoveryDuration) : '00:00:00';
        const ruinFlag = (this.bot) ? this.bot.ruinFlag : false;

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
        // PRIORITY A: EXTERNAL RICH TEXT (From Engine) OR EXPLICIT SKIP
        else if (externalActionText) {
            // Use the engine's rich text directly if provided
            // If it's a simple skip reason (legacy), prefix it. If it's rich (starts with [), keep as is.
            if (externalActionText.startsWith('[') || externalActionText.startsWith('🎯') || externalActionText.startsWith('⚔️') || externalActionText.startsWith('⛔') || externalActionText.startsWith('🚑') || externalActionText.startsWith('🛡️')) {
                lastActionText = externalActionText;
            } else {
                lastActionText = `⛔ ${externalActionText}`;
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
                // numeric epoch ms for when the largest recovery stake was placed (used by dashboard to compute age)
                maxRecTime: (this.bot && Number.isFinite(Number(this.bot.maxRecTime))) ? Number(this.bot.maxRecTime) : null,
                // keep the human readable text for backwards compatibility
                maxRecTimeText, maxRecAgeText, lastActionText,
                recoveryDuration, ruinFlag,
                gameStatus: this.bot.gameStatus,
                gameStartTime: this.bot.currentGameStartTime,
                projectedStartTime: this.bot.projectedStartTime,
                lastActualCrash: this.bot.lastActualCrash,
                recoveryMode: this.bot.recoveryPhase || this.bot.config.recoveryMode,
                labouchereList: this.bot.labouchereList ? this.bot.labouchereList.slice() : [],
                labouchereSlicesCount: this.bot.labouchereList ? this.bot.labouchereList.length : 0,
                peakDebt: this.bot.peakDebt || 0,
                peakStake: this.bot.peakStake || 0,
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
        if (!silent) {
            this.bot.logger.log(output, 'stats');
        }
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
                    this.logger.log(`⚠️ Stats upload failed after ${retries} attempts:`, e.message);
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

        this.brain.initialize(this.adapter, this);

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
        this.maxRecTime = null;         // Timestamp of max stake
        this.recoveryStartTime = null;  // Start of current recovery cycle
        this.maxRecoveryDuration = 0;   // Longest recovery duration (ms)
        this.ruinFlag = false;          // Did we hit Stop Loss?
        this.recoveryLadderCache = null; // Simulated recovery debt ladder

        // seconds used by the panel for age formatting (kept in some flows)
        this.maxRecRuntimeSeconds = this.maxRecRuntimeSeconds || 0;

        // Peak metrics (bits) observed during session
        this.peakDebt = this.peakDebt || 0;
        this.peakStake = this.peakStake || 0;

        // Recovery timeline
        this.recoveryDuration = this.recoveryDuration || 0; // ms or seconds depending on your use (panel expects ms)
        this.ruin = this.ruin || false;

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
        return this.config.get('normal', 'normalSurvivalMult');
    }

    getCanonicalRecoveryMultiplier() {
        return this.config.get('recovery', 'targetRecMult');
    }

    // OPTIMISTIC COUNTDOWN (Bridging the 8s Gap)
    // Immediately switch to 'PREPARING' to start the dashboard countdown.
    // We don't wait for the server's delayed GAME_STARTING event.
    _triggerOptimisticCountdown() {
        // 1. Set a "Visual Lock" for 3 seconds
        // This prevents the server's early GAME_STARTING event from clearing the crash screen
        this._crashDisplayUntil = Date.now() ;

        setTimeout(() => {
            // 2. The 3 seconds are up. Unlock.
            this._crashDisplayUntil = 0;

            // 3. Force the visual state to PREPARING
            // Even if the server already sent the signal, we force the UI to sync NOW.
            if (this.gameStatus === 'ENDED' || this.gameStatus === 'PREPARING') {
                this.gameStatus = 'PREPARING';

                // 4. Force a fresh 5-second countdown from THIS moment
                // This guarantees the "5, 4, 3..." behavior you want
                this.projectedStartTime = Date.now() + 5000;

                // Persist Rich Display during Preparing
                // Append the last decision string so the panel doesn't go blank
                const richContext = (this.brain && this.brain.richDecisionString) ? ` | ${this.brain.richDecisionString}` : '';
                // Note: The UI adds the '⛔' icon automatically for status text
                // this.updatePanel(false, `PREPARING${richContext}`, null, true, null, true);
            }
        }, 2800); // Wait exactly 3 seconds
    }

    // ============================================================
    //  CORE LOGIC: Event Listeners (Brain Integration + Safety)
    // ============================================================
    setupEventListeners() {
        if (this._eventsBound) return; // Prevent duplicate binding
        this._eventsBound = true;

        // --- 1. GAME STARTING ---
        // --- 1. GAME STARTING ---
        this.adapter.on('GAME_STARTING', (info) => {
            // Set status so panel shows "Waiting..."
            this.gameStatus = 'PREPARING';

            // Use accurate time from adapter if available, or calc robust fallback
            let delayMs = 5000;
            if (info && info.time_till_start) {
                const t = Number(info.time_till_start);
                // Check if seconds or ms
                delayMs = (t < 1000) ? Math.round(t * 1000) : Math.round(t);
            }

            // If adapter sent a precise projected time, use it. Otherwise calc relative to Now.
            this.projectedStartTime = (info && info.projectedStartTime)
                ? Number(info.projectedStartTime)
                : (Date.now() + delayMs);

            if (!this.isRunning) return;

            // A. Safety Limits Check
            const limit = this.checkLimits(this.config.getCurrentBalance());
            if (limit.action === 'stop') { return this.triggerHalt('stop loss', limit.reason); }
            if (limit.action === 'tp') { return this.triggerHalt('take profit', limit.reason); }

            // B. Warmup Handling
            /*if (this.mode === 'WARMUP') {
                this.logger.log(`🔥 Warmup: Waiting for result...`, 'info');
                return;
            }*/

            // ==========================================
            // C. BRAIN DECISION (Phase 3 Integration)
            // ==========================================
            // Pass current mode and last result to the Brain
            const decision = this.brain.decide(this.mode, this.activeBetResult);

            // 1. Handle DENIAL
            if (!decision.allow) {
                // FIX: Do NOT record stats if we are in Warmup
                if (decision.reason !== 'WARMUP') {
                    this.addSkip(decision.reason, this.mode);
                    this.logger.logSkip(decision.reason);
                } else {
                    // Just log info for Warmup, don't increment skip counters
                    this.logger.log(`🔥 Warmup: Simulated Skip (${decision.reason})`, 'info');
                }

                // Update UI: Pass null so it uses the Brain's Rich Display
                this.updatePanel(false, null);
                return;
            }

            // 2. Handle ALLOWANCE
            // Extract Target from Consensus
            const target = decision.target;
            let stakeBits = 0;

            // D. CALCULATE STAKE
            if (this.mode === 'NORMAL') {
                this.config.computeAndSetBaseBetFromPercent();
                stakeBits = Number(this.config.get('normal', 'baseBetBits'));
            }
            else if (this.mode === 'RECOVERY') {
                // Determine stake strategy (Labouchere vs Martingale)
                if (this.recoveryPhase === 'labouchere' && typeof this.labouchereNextStake === 'function') {
                    stakeBits = Number(this.labouchereNextStake(target));
                } else {
                    stakeBits = Number(this.calculateRecoveryStake());
                }
            }

            // E. PLACE BET
            const stakeSats = this.config.bitsToSats(stakeBits);

            // Check for engine existence
            if (!this.brain) {
                try { this.logger.log('[ERR] Brain missing — denying bet'); } catch (_) {}
                return;
            }

            // Execute Placement
            const placed = this.betting.placeBet(stakeSats, target, this.mode);

            if (placed) {
                // Retrieve the bet object created by BettingEngine
                this.activeBet = this.betting.getActiveBet();

                // +++ TAG BET METADATA +++
                // Attach the Decision Type (e.g. 'RECOVERY_FOLLOWUP') to the active bet
                // This ensures we know exactly what strategy placed this bet when it ends.
                if (this.activeBet) {
                    this.activeBet.decisionType = decision.type;
                    // Inform the brain what we actually placed so state machine updates
                    // (followups / smart override / normal streak rules) behave correctly.
                    try {
                        // keep brain state in sync with placed bet
                        if (this.brain) {
                            this.brain.lastBetType = decision.type || (this.mode === 'NORMAL' ? 'NORMAL' : 'STANDARD_RECOVERY');
                            this.brain.lastTarget = Number(target) || this.brain.lastTarget;
                        }
                    } catch (e) {
                        // Non-fatal: don't break bet flow if brain is missing for any reason
                        this.logger.log(`[WARN] failed to sync brain.lastBetType: ${e.message}`, 'warning');
                    }
                }

                this.setupWinTimer(stakeBits, target);
                this.updatePanel(true, `BETTING (${this.mode})`);

                // Log with Decision Type for clarity
                const typeTag = decision.type ? `[${decision.type}]` : '';
                this.logger.log(`🎲 BET: ${Number(stakeBits).toFixed(2)} bits @ ${Number(target).toFixed(2)}x ${typeTag}`, 'bet');
            }
        });

        // +++ GAME STARTED (Graph Moving) +++
        this.adapter.on('GAME_STARTED', (info) => {
            this.gameStatus = 'RUNNING';

            // Use the normalized start time from the adapter (Epoch MS)
            this.currentGameStartTime = (info && info.startTime) ? Number(info.startTime) : Date.now();

            // Force Update
            this.updatePanel(this.betting.hasActiveBet(), 'GAME_STARTED', null, true);
        });

        // --- 2. GAME ENDED ---
        this.adapter.on('GAME_ENDED', (data) => {
            this.gameStatus = 'ENDED';
            this.lastActualCrash = data.crash;
            const crash = data.crash;

            // 1. STATS INJECTION
            try {
                if (this.stats && typeof this.stats.addCrash === 'function') {
                    this.stats.addCrash(crash);
                }
            } catch (e) {}

            // ==========================================
            // 2. BRAIN UPDATE (Phase 3 Integration)
            // ==========================================
            if (this.isRunning) {
                // Determine Win/Loss
                const wasBetting = !!this.activeBet;
                const wasWin = wasBetting ? (crash >= this.activeBet.targetMultiplier) : false;

                // Get current Recovery Level (visual/stat tracking)
                const currentLevel = this.recoveryLevel || 0;

                // Trigger Brain Update
                // The Brain handles WMA training and State Machine transitions (FollowUps, Streaks)
                // Note: The Brain relies on its internal 'this.lastBetType', but 'wasWin' is critical.
                this.brain.update(crash, wasWin, currentLevel, wasBetting);
            }

            // Capture State BEFORE clearing activeBet
            const wasBetting = !!this.activeBet;
            const lastBetSnapshot = this.activeBet;

            // A. Safety Check
            const limit = this.checkLimits(this.config.getCurrentBalance());
            if (limit.action === 'stop') { return this.triggerHalt('stop loss', limit.reason); }
            if (limit.action === 'tp') { return this.triggerHalt('take profit', limit.reason); }

            // B. Warmup Logic
            if (this.mode === 'WARMUP') {
                this.handleWarmup();
                this.logger.log(`💥 Game crashed at ${crash}x`, 'crash');
                this.updatePanel(false, null, null, false, null, true);
                this._triggerOptimisticCountdown();
                return;
            }

            // C. Process Result
            let profitBits = 0;
            let actionLabel = 'GAME_ENDED';
            let result = null;

            if (this.activeBet) {
                if (this.activeBet.processed) {
                    // Early Cashout Case
                    this.logger.log(`💥 Game crashed at ${crash}x (Bet won @ ${this.activeBet.targetMultiplier}x)`, 'info');
                    this.activeBet = null;
                    actionLabel = 'WIN';
                } else {
                    // Normal Processing
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
            }

            // D. Logging
            this.logger.log(`💥 Game crashed at ${crash}x`, 'crash');
            if (result) {
                this.logger.logBetResult(result);
                // Log Recovery Clearance
                if (result.isWin && this.debtBits <= 0 && this.mode === 'NORMAL' && result.mode === 'RECOVERY') {
                    this.logger.log(`🎉 RECOVERY CLEARED. Switching to NORMAL.`, 'success');
                }
            }

            // E. UI Update
            // The panel will read this.brain.lastAction which was updated during deciding/updating
            this.updatePanel(wasBetting, actionLabel, profitBits, true, lastBetSnapshot);
            this._triggerOptimisticCountdown();
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
    // -------------------------
    // Recovery manager helpers
    // -------------------------
    /**
     * generateRecoveryLadder(initialLoss, target, cap, settings = {})
     *
     * Simulates a martingale-style debt ladder using the *given* target multiplier.
     * Returns: { level, ladder, totalDebt }
     *
     * - initialLoss: bits (number) - seed debt when entering recovery
     * - target: multiplier (number) - TARGET MULTIPLIER to recover to (use this, do NOT use separate sim payout)
     * - cap: maximum stake allowed in bits
     * - settings: optional { maxAttempts: number } - note: payout is ignored (we use `target`)
     *
     * Ladder entries: { level: i, lowerBound: prevDebt, upperBound: nextDebt, stake: executedStake }
     *
     * Important: this function is purely predictive and does NOT mutate `this.*`.
     */
    generateRecoveryLadder(initialLoss, target, cap, settings = {}) {
        // Defensive reads from settings
        const maxAttempts = Number(settings.maxAttempts) || Number(this.config.get('recovery', 'sim')?.maxAttempts);

        // Normalize inputs
        const initial = Math.max(1, Number(initialLoss));
        const payout = Number(target) || Number(this.config.get('recovery', 'targetRecMult'));
        const maxIter = Math.max(1, Math.floor(maxAttempts));

        const ladder = [];
        let cumulativeLoss = 0;

        // Start ranges: previous upper bound (0) to nextDebt after stake
        let prevDebt = 0;
        let currentDebt = initial;

        // Build ladder entries up to maxIter
        for (let i = 1; i <= maxIter; i++) {
            // compute stake using canonical rule: ceil(currentDebt / (payout - 1))
            const raw = (payout - 1) > 0 ? (currentDebt / (payout - 1)) : currentDebt;
            const stake = Math.max(1, Math.ceil(raw));

            // enforce cap
            const executedStake = Math.min(stake, Math.max(1, Math.floor(cap || Infinity)));

            // debt after a simulated loss
            const nextDebt = currentDebt + executedStake;

            // push range: (prevDebt, nextDebt] belongs to this level
            ladder.push({
                level: i,
                lowerBound: prevDebt,
                upperBound: nextDebt,
                stake: executedStake,
                rawStakeDecimal: raw
            });

            cumulativeLoss += executedStake;

            // Stop early if a win at this stake would cover prior losses + intended profit
            // Profit on win at this stake:
            const profitOnWin = executedStake * (payout - 1);
            // Needed to cover previously accumulated losses (cumulativeLoss - executedStake) plus
            // the profit target equal to initial * (target - 1)
            const needed = (cumulativeLoss - executedStake) + (initial * (payout - 1));
            if (profitOnWin >= needed) {
                // Found a ladder level that would resolve the debt if won here
                return {
                    level: i,
                    ladder,
                    totalDebt: cumulativeLoss  // cumulativeLoss is the true sum of stakes, no double-count
                };
            }

            // Prepare for next iteration
            prevDebt = nextDebt;
            currentDebt = nextDebt;

            // If cap prevented meaningful progress (executedStake == cap and next stake would also be > cap),
            // we still record this state but may break if further doubling is impossible.
            const nextRaw = (payout - 1) > 0 ? (currentDebt / (payout - 1)) : currentDebt;
            const nextStakeGuess = Math.ceil(nextRaw);
            if (nextStakeGuess > cap) {
                // Can't continue beyond cap - stop building ladder (we included this capped level)
                break;
            }
        }

        // Exhausted attempts without satisfying profit condition
        return {
            level: ladder.length,
            ladder,
            totalDebt: cumulativeLoss
        };
    }

    /**
     * calculateRecoveryStake(simulate = false)
     *
     * Always compute the *actual* stake for this recovery round from current debt using:
     * stake = ceil(currentDebt / (targetRecMult - 1))
     *
     * Uses the cached ladder (built by generateRecoveryLadder) to determine the recovery level
     * for the current debt range. The ladder is built once on entering recovery (cached in
     * this.recoveryLadderCache) and reused. If simulate === true, no this.* state is mutated.
     *
     * Returns executedStake (bits, integer).
     */
    calculateRecoveryStake(simulate = false) {
        // Strict reads from config (single-source)
        const recStakeCapMultiplier = Number(this.config.get('recovery', 'recStakeCap'));
        const targetRecMult = Number(this.config.get('recovery', 'targetRecMult'));

        // Defensive: must be in RECOVERY mode
        if (this.mode !== 'RECOVERY') return 0;

        // Compute cap in bits: cap = Math.max(1, Math.floor(initialLoss * recStakeCapMultiplier))
        const baseLoss = (this.initialLossBits > 0) ? Number(this.initialLossBits) : Math.max(1, Number(this.config.get('normal', 'baseBetBits')) || 1);
        const recStakeCap = Math.max(1, Math.floor(baseLoss * (isFinite(recStakeCapMultiplier) ? recStakeCapMultiplier : 1)));

        // ensure peakDebt updated only when not simulating
        if (!simulate) {
            this.peakDebt = Math.max(this.peakDebt || 0, Number(this.debtBits || 0));
        }

        // If in Labouchere phase, delegate to labouchereNextStake (preserve existing behavior)
        if (this.recoveryPhase === 'labouchere') {
            // compute theoretical stake from labouchere helper
            const theoretical = this.labouchereNextStake(targetRecMult);
            // labouchereNextStake already uses ceil and cap semantics; ensure integer & cap again defensively
            const executedStake = Math.min(recStakeCap, Math.max(1, Math.ceil(Number(theoretical))));

            if (!simulate) {
                // update telemetry
                this.lastRecoveryStakeBits = executedStake;
                this.peakStake = Math.max(this.peakStake || 0, executedStake);
                if (executedStake > (this.maxRecStakeBitsEver || 0)) {
                    this.maxRecStakeBitsEver = executedStake;
                    this.maxRecTime = Date.now();
                    this.maxRecRuntimeSeconds = (Date.now() - (this.firstStartedAt || Date.now())) / 1000;
                }
            }
            return executedStake;
        }

        // --- MARTINGALE / canonical recovery stake computation path ---

        // Ensure ladder: build if not present (and only cache when NOT simulating)
        const simCfg = this.config.get('recovery', 'sim') || {};
        const simMaxAttempts = Number(simCfg.maxAttempts) || 20;

        let ladderObj = null;
        if (!simulate) {
            // Build and cache ladder only once per recovery session
            if (!this.recoveryLadderCache || !Array.isArray(this.recoveryLadderCache.ladder)) {
                try {
                    const built = this.generateRecoveryLadder(Number(this.initialLossBits || 1), targetRecMult, recStakeCap, { maxAttempts: simMaxAttempts });
                    // Cache ladder structure (non-mutating elsewhere)
                    this.recoveryLadderCache = {
                        builtAt: Date.now(),
                        params: { initialLoss: Number(this.initialLossBits || 1), target: targetRecMult, cap: recStakeCap, maxAttempts: simMaxAttempts },
                        ladder: built.ladder
                    };
                } catch (e) {
                    // Defensive fallback: create a minimal ladder entry
                    this.recoveryLadderCache = {
                        builtAt: Date.now(),
                        params: { initialLoss: Number(this.initialLossBits || 1), target: targetRecMult, cap: recStakeCap, maxAttempts: simMaxAttempts },
                        ladder: [{ level: 1, lowerBound: 0, upperBound: Number(this.initialLossBits || 1), stake: Math.max(1, Math.ceil((Number(this.initialLossBits || 1) / (targetRecMult - 1)) || 1)) }]
                    };
                }
            }
            ladderObj = this.recoveryLadderCache;
        } else {
            // simulate: build a local ladder but do NOT write to this.*
            ladderObj = { ladder: this.generateRecoveryLadder(Number(this.initialLossBits || 1), targetRecMult, recStakeCap, { maxAttempts: simMaxAttempts }).ladder };
        }

        const ladder = ladderObj.ladder || [];

        // Live current debt
        const currentDebt = Number(this.debtBits || this.initialLossBits || 1);

        // Canonical stake computation: ceil(currentDebt / (targetRecMult - 1))
        const denom = (targetRecMult - 1) > 0 ? (targetRecMult - 1) : 1;
        const rawStake = currentDebt / denom;
        const stake = Math.max(1, Math.ceil(rawStake));
        const executedStake = Math.min(stake, recStakeCap);

        // Determine recovery level by looking up currentDebt in ladder ranges (lowerBound, upperBound]
        let foundLevel = 0;
        if (Array.isArray(ladder) && ladder.length > 0) {
            for (let i = 0; i < ladder.length; i++) {
                const e = ladder[i];
                const lower = Number(e.lowerBound || 0);
                const upper = Number(e.upperBound || 0);
                // Check membership in (lower, upper] as requested
                if ((currentDebt > lower) && (currentDebt <= upper)) {
                    foundLevel = Number(e.level) || (i + 1);
                    break;
                }
            }
            // If not found and currentDebt is above the last upperBound, mark level as last+1
            if (foundLevel === 0) {
                if (currentDebt > (ladder[ladder.length - 1].upperBound || 0)) {
                    foundLevel = ladder.length + 1;
                } else {
                    // If it's at or below the first range lower bound, treat as level 1
                    foundLevel = 1;
                }
            }
        } else {
            // No ladder: fallback to level = 1
            foundLevel = 1;
        }

        // Update live stats & telemetry only when not simulating
        if (!simulate) {
            // Assign level & update maxRecLevel
            this.recoveryLevel = foundLevel;
            this.maxRecLevel = Math.max(this.maxRecLevel || 0, this.recoveryLevel);

            // Update last stake and peak/record metrics
            this.lastRecoveryStakeBits = executedStake;
            this.peakStake = Math.max(this.peakStake || 0, executedStake);
            if (executedStake > (this.maxRecStakeBitsEver || 0)) {
                this.maxRecStakeBitsEver = executedStake;
                this.maxRecTime = Date.now();
                this.maxRecRuntimeSeconds = (Date.now() - (this.firstStartedAt || Date.now())) / 1000;
            }
        }

        return executedStake;
    }

    // -------------------------
    // Labouchère helper methods
    // -------------------------
    initLabouchereFromDebt(debtBits, minSlices, hybridStart = false) {
        // deterministic split rule:
        // if debtBits < minSlices => create minSlices of 1 and add remainder to last slice
        const m = Math.max(1, Math.floor(minSlices));
        const list = [];
        if (debtBits <= 0) {
            this.labouchereList = [];
            return;
        }
        if (debtBits < m) {
            for (let i = 0; i < m; i++) list.push(1);
            // add remainder to last slice
            list[list.length - 1] += Math.max(0, Math.floor(debtBits) - m);
        } else {
            const base = Math.floor(debtBits / m);
            let rem = Math.floor(debtBits) - base * m;
            for (let i = 0; i < m; i++) {
                const v = base + (rem > 0 ? 1 : 0);
                list.push(v);
                if (rem > 0) rem--;
            }
        }
        // If this was a hybridStart, following your rule we may prefer to start with
        // fewer slices for speed. The calling code can pass minSlices=2 in that case.
        this.labouchereList = list;
        // Track labouchere debt explicitly
        this.debtBits = Math.max(0, this.debtBits || 0);
    }

    /**
     * Calculates the required stake to recover specific slices
     * based on the specific Target Multiplier.
     * Logic:
     * - < 3.00x: 2 slices (1 front, 1 back)
     * - 3.00x to < 4.00x: 4 slices (2 front, 2 back)
     * - >= 4.00x: 6 slices (3 front, 3 back)
     */
    labouchereNextStake(targetMultiplier) {
        if (!Array.isArray(this.labouchereList) || this.labouchereList.length === 0) return 0;

        // Default to 2.04 if target is missing or invalid
        const target = (Number.isFinite(targetMultiplier) && targetMultiplier > 1.0) ? targetMultiplier : 2.04;

        // 1. Determine Aggression Level (Slices per side) based on Config
        const thr4 = Number(this.config.get('recovery', 'labouchereMult4Slice')) || 3.0;
        const thr6 = Number(this.config.get('recovery', 'labouchereMult6Slice')) || 4.0;

        let k = 1; // Default: 1 front + 1 back = 2 slices total
        if (target >= thr6) k = 3;      // 3 front + 3 back = 6 slices
        else if (target >= thr4) k = 2; // 2 front + 2 back = 4 slices

        // 2. Calculate Needed Profit (Sum of k front + k back)
        let neededProfit = 0;
        const len = this.labouchereList.length;

        // Safety: If list is shorter than the requested slices (2*k), sum the whole list
        if (len <= (k * 2)) {
            neededProfit = this.labouchereList.reduce((sum, val) => sum + val, 0);
        } else {
            // Sum k from front
            for (let i = 0; i < k; i++) neededProfit += this.labouchereList[i];
            // Sum k from back
            for (let i = 0; i < k; i++) neededProfit += this.labouchereList[len - 1 - i];
        }

        // 3. Calculate Theoretical Stake
        const theoreticalStake = Math.ceil(neededProfit / (target - 1));

        // 4. Calculate Cap (Initial Loss * Configured Cap Multiplier)
        const baseLoss = (this.initialLossBits > 0) ? this.initialLossBits : (Number(this.config.get('normal', 'baseBetBits')) || 1);
        const recStakeBitCap = Number(this.config.get('recovery', 'recStakeCap'));
        const cap = Math.max(1, Math.floor(baseLoss * recStakeBitCap));

        // 5. Return Capped Stake
        return Math.min(theoreticalStake, cap);
    }

    /**
     * Updates the Labouchère list based on the bet result.
     * Removes 2, 4, or 6 slices based on the configured multipliers.
     * Handles partial wins caused by Stake Caps.
     */
    processLabouchereResult(isWin, stakeBits) {
        // stakeBits in bits, assumes labouchereList exists
        if (!Array.isArray(this.labouchereList)) this.labouchereList = [Math.floor(this.debtBits) || 0];

        if (isWin) {
            // 1. Determine Slices intended to cover (Must match labouchereNextStake logic)
            const target = Number(this.config.get('recovery', 'targetRecMult')) || 2.04;
            const thr4 = Number(this.config.get('recovery', 'labouchereMult4Slice')) || 3.0;
            const thr6 = Number(this.config.get('recovery', 'labouchereMult6Slice')) || 4.0;

            let k = 1; // Default 1 per side
            if (target >= thr6) k = 3;
            else if (target >= thr4) k = 2;

            // 2. Calculate the Profit we *intended* to cover
            let neededProfit = 0;
            const len = this.labouchereList.length;

            if (len <= (k * 2)) {
                neededProfit = this.labouchereList.reduce((sum, val) => sum + val, 0);
            } else {
                for (let i = 0; i < k; i++) neededProfit += this.labouchereList[i];
                for (let i = 0; i < k; i++) neededProfit += this.labouchereList[len - 1 - i];
            }

            // 3. Remove Slices (Shift & Pop k times)
            if (len <= (k * 2)) {
                this.labouchereList = [];
            } else {
                // Remove k from front
                this.labouchereList.splice(0, k);
                // Remove k from back
                this.labouchereList.splice(-k);
            }

            // 4. Check for Capped/Partial Win
            const actualProfit = stakeBits * (target - 1);

            // If we won less than we needed (due to cap), add the remainder back to the end
            // (Use a small epsilon 0.01 to handle floating point variations)
            if (actualProfit < (neededProfit - 0.01)) {
                const remainder = neededProfit - actualProfit;
                this.labouchereList.push(Number(remainder.toFixed(2)));
                // Log the partial coverage for clarity
                this.logger.log(`⚠️ Labouchère Partial Win: Profit ${actualProfit.toFixed(2)} < Needed ${neededProfit.toFixed(2)}. Appending remainder ${remainder.toFixed(2)}`, 'info');
            }

        } else {
            // Loss: append stakeBits as new last item
            this.labouchereList.push(Math.max(1, Math.floor(stakeBits)));
        }

        // recompute debtBits as sum of list (defensive)
        this.debtBits = this.labouchereList.reduce((s, v) => s + v, 0);

        // --- Canonical sync: update peakDebt & peakStake for dashboard telemetry ---
        if (!Number.isFinite(this.peakDebt) || this.debtBits > Number(this.peakDebt)) {
            this.peakDebt = Number(this.debtBits || 0);
        }
        if (typeof stakeBits !== 'undefined' && (!Number.isFinite(this.peakStake) || stakeBits > Number(this.peakStake))) {
            this.peakStake = Number(stakeBits || 0);
        }

        // If cleared:
        if (this.debtBits <= 0.01 || this.labouchereList.length === 0) {
            this.debtBits = 0;
            this.mode = 'NORMAL';
            this.recoveryLevel = 0;
            this.initialLossBits = 0;
            this.recoveryPhase = null;
            this.recoveryLevelFrozen = false;
            this.logger.log('🎉 Labouchère cleared debt; switching to NORMAL', 'success');
            return true;
        }
        return false;
    }

    // Updates Bot Mode and Debt based on the result calculated by BettingEngine
    // Added 'silent' parameter to prevent out-of-order logging
    // Updates Bot Mode and Debt based on the result calculated by BettingEngine
    // Added 'silent' parameter to prevent out-of-order logging
    // Updates Bot Mode and Debt based on the result calculated by BettingEngine
    // Added 'silent' parameter to prevent out-of-order logging
    handleStrategyState(result, silent = false) {
        const profit = result.profitBits;
        const stake = result.betAmountBits;

        if (result.isWin) {
            // --- WIN HANDLING ---
            if (!silent) this.logger.log(`✅ WIN! +${profit.toFixed(2)} bits`, 'success');

            // If we're in labouchere phase, delegate to labouchere manager
            if (this.mode === 'RECOVERY' && this.recoveryPhase === 'labouchere') {
                const executedStake = Math.max(1, Math.floor(stake || 0));
                // processLabouchereResult manages the list and checks if cleared
                const cleared = (typeof this.processLabouchereResult === 'function')
                    ? this.processLabouchereResult(true, executedStake)
                    : false;

                if (cleared) {
                    // +++ CALC RECOVERY DURATION (Labouchère Exit) +++
                    if (this.recoveryStartTime) {
                        const currentDuration = Date.now() - this.recoveryStartTime;
                        this.recoveryDuration = currentDuration;
                        this.maxRecoveryDuration = Math.max(this.maxRecoveryDuration, currentDuration);
                        this.recoveryStartTime = null;
                    }

                    // processLabouchereResult already set mode back to NORMAL and logged.
                    // We update panel here to ensure UI reflects the clear immediately.
                    this.updatePanel(false, 'RECOVERY_CLEARED');
                } else {
                    if (!silent) this.logger.log(`📉 Labouchère: Remaining debt: ${this.debtBits.toFixed(2)} bits`, 'info');
                }
            } else {
                // Legacy (martingale) behavior: reduce debt by profit if in RECOVERY
                if (this.mode === 'RECOVERY') {
                    this.debtBits -= profit;
                    if (this.debtBits <= 0.01) {
                        this.debtBits = 0;

                        // +++ CALC RECOVERY DURATION (Martingale Exit) +++
                        if (this.recoveryStartTime) {
                            const currentDuration = Date.now() - this.recoveryStartTime;
                            this.recoveryDuration = currentDuration; // Track specific instance
                            this.maxRecoveryDuration = Math.max(this.maxRecoveryDuration, currentDuration); // Track Max Stats
                            this.recoveryStartTime = null;
                        } else {
                            this.recoveryDuration = 0;
                        }

                        this.mode = 'NORMAL';
                        this.recoveryLevel = 0;
                        this.initialLossBits = 0;

                        this.updatePanel(false, 'RECOVERY_CLEARED');
                    } else {
                        if (!silent) this.logger.log(`📉 Debt Reduced. Remaining: ${this.debtBits.toFixed(2)} bits`, 'info');
                    }
                }
            }
        } else {
            // --- LOSS HANDLING ---
            if (!silent) this.logger.log(`❌ LOSS. -${(stake).toFixed(2)} bits`, 'error');

            if (this.mode === 'NORMAL') {
                // Transition into recovery (initial loss)
                this.mode = 'RECOVERY';
                this.initialLossBits = stake;
                this.debtBits = stake;

                // +++ START RECOVERY TIMER +++
                if (!this.recoveryStartTime) {
                    this.recoveryStartTime = Date.now();        // epoch ms
                    this.recoveryDuration = 0;                  // reset accumulated duration
                }

                // Read configured recovery mode from the single-source ConfigManager mapping
                const configuredMode = this.config.get('recovery', 'recoveryMode');
                const recoveryStakebitCap = Number(this.config.get('recovery', 'recStakeCap'));
                const cap = (stake) * recoveryStakebitCap;

                if (configuredMode === 'labouchere') {
                    // Pure Labouchère: Do NOT increase level (Keep at 0)
                    this.recoveryLevel = 0;
                    this.recoveryLevelFrozen = true;
                    this.recoveryPhase = 'labouchere';

                    // Initial List: [Stake]
                    this.labouchereList = [Math.max(1, Math.floor(stake))];
                    this.debtBits = stake;

                    if (!silent) this.logger.log(`⚠️ Entering RECOVERY (Labouchère). Initial list: [${this.labouchereList.join('-')}] Cap: ${cap.toFixed(0)} bits.`, 'warning');
                } else {
                    // Hybrid: Start in martingale phase. Set Level to 1 (First Loss)
                    this.recoveryPhase = 'martingale';
                    this.recoveryLevelFrozen = false;
                    this.recoveryLevel = 1;

                    // Read hybrid.martingaleAttempts from mapped recovery config
                    const hybridCfg = this.config.get('recovery', 'hybrid');
                    this.hybridRemaining = Number(hybridCfg ? hybridCfg.martingaleAttempts : 0);
                    this.hybridRemaining = Math.max(0, Math.floor(this.hybridRemaining));

                    if (!silent) this.logger.log(`⚠️ Entering RECOVERY (Hybrid: martingale). Martingale attempts remaining: ${this.hybridRemaining}. Cap: ${cap.toFixed(0)} bits.`, 'warning');
                }
            } else {
                // Already in RECOVERY: record the loss into the recovery manager
                if (this.mode === 'RECOVERY' && this.recoveryPhase === 'labouchere') {
                    const executedStake = Math.max(1, Math.floor(stake || 0));
                    if (typeof this.processLabouchereResult === 'function') {
                        this.processLabouchereResult(false, executedStake);
                    } else {
                        // Fallback logic
                        this.debtBits += stake;
                        if (!Number.isFinite(this.peakDebt) || this.debtBits > Number(this.peakDebt)) {
                            this.peakDebt = Number(this.debtBits || 0);
                        }
                    }
                } else {
                    // Hybrid/martingale flow: accumulate debt and manage hybridRemaining
                    this.debtBits += stake;

                    // canonicalize and update peakDebt immediately
                    if (!Number.isFinite(this.peakDebt) || this.debtBits > Number(this.peakDebt)) {
                        this.peakDebt = Number(this.debtBits || 0);
                    }

                    if (this.recoveryPhase === 'martingale') {
                        // Decrement attempts
                        if (typeof this.hybridRemaining === 'number' && this.hybridRemaining > 0) {
                            this.hybridRemaining--;
                        }

                        // Switch to Labouchère if exhausted
                        if (typeof this.hybridRemaining === 'number' && this.hybridRemaining <= 0) {
                            const minSlices = 2;
                            this.initLabouchereFromDebt(this.debtBits, minSlices, /*hybridStart=*/true);
                            this.recoveryPhase = 'labouchere';
                            this.recoveryLevelFrozen = true; // FREEZE LEVEL HERE
                            this.logger.log(`🔁 Hybrid martingale exhausted. Switching to Labouchère list: [${this.labouchereList.join('-')}]`, 'info');
                        }
                    }

                    // Defensive: ensure labouchere list exists if we've switched to labouchere
                    if (this.recoveryPhase === 'labouchere' && (!Array.isArray(this.labouchereList) || this.labouchereList.length === 0)) {
                        const minSlices = this.config.get('recovery', 'labouchere').minSlices;
                        this.initLabouchereFromDebt(this.debtBits, minSlices);
                    }
                }
            }
        }

        // +++ ROBUST MAX STATS TRACKING +++
        // Check if this was a Recovery bet and if it broke the record
        if (result.mode === 'RECOVERY') {
            const stake = result.betAmountBits;
            // Ensure values are numbers
            const currentMax = Number(this.maxRecStakeBitsEver) || 0;

            if (stake > currentMax) {
                this.maxRecStakeBitsEver = stake;
                this.maxRecTime = Date.now();
                // Store the script runtime (age) at this specific moment
                this.maxRecRuntimeSeconds = (Date.now() - this.firstStartedAt) / 1000;
            }
        }

        // Persist the last result into stats (shared with original flow)
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

        // 1. Update Panel FIRST (Pass null to preserve the rich "SKIP: WARM_UP" string from Brain)
        this.updatePanel(false, null);

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
        this.logger.log(`▶️ Resuming Schedule: ${key}`, 'success');

        // Enter active betting session for this scheduled resume
        this.mode = 'NORMAL';

        // +++ PRESERVE: Clear debt when starting a fresh scheduled session +++
        this.debtBits = 0;
        this.recoveryLevel = 0;
        this.initialLossBits = 0;

        // +++ FIX: Reset Initial Balance for the new schedule +++
        // This ensures P/L is calculated from 0 for this specific session
        this.config.initialBalance = this.config.getCurrentBalance();

        // +++ FIX: Manage UI Timers +++
        // 1. Set B.Start Time to the exact current time (New session start)
        this.betStartTimeMalaysia = this._malaysiaTimeString(new Date());
        // 2. Clear B.End Time so it shows "--:--:--" until the next TP/Stop
        this.betEndTimeMalaysia = null;
        6
        // Clear any previous TP Pause flags
        this.runtime.pausedBecauseTP = false;

        // Record which schedule is active
        this.runtime.currentScheduleKey = key;

        // ++ Important: increment the scheduled-resume counter
        this.runtime.resumesDone = (this.runtime.resumesDone || 0) + 1;

        this.scheduledTargetEpochMs = null;

        // Use hhmmss if passed, otherwise default to current time string
        const timeStr = hhmmss || new Date().toLocaleTimeString();
        this.logger.log(`✅ Scheduled Start (${timeStr}) Reached. GO!`, 'success');

        // Force update panel to reflect mode change to [NORMAL]
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
        // FIX: Immediately return 'ok' if in WARMUP mode.
        // This prevents the previous schedule's profit from triggering a TP limit
        // while waiting for the next schedule to start.
        if (this.mode === 'WARMUP') {
            return { action: 'ok' };
        }

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

        // Capture end time IMMEDIATELY (Freeze)
        // Only set if not already set. This prevents overwriting the end time
        // if triggerHalt is called multiple times or during a pause transition.
        if (!this.betEndTimeMalaysia) {
            this.betEndTimeMalaysia = this._malaysiaTimeString(new Date());
        }

        const normalizeTypeKey = (t) => {
            if (!t || typeof t !== 'string') return String(t || '').toLowerCase();
            const s = t.toLowerCase();
            if (s.indexOf('profit') !== -1) return 'takeprofit';
            if (s.indexOf('stop') !== -1) return 'stoploss';
            return s.replace(/\s+/g, '');
        };

        const typeKey = normalizeTypeKey(type);
        const message = `${type.toUpperCase()}: ${reason || (typeKey === 'takeprofit' ? 'target reached' : 'stop loss triggered')}`;

        // +++ SET RUIN FLAG +++
        if (typeKey === 'stoploss') {
            this.ruinFlag = true;
        }

        this.showNonBlockingAlert(typeKey, message);

        // 2. Stop Loss logic (ALWAYS HALT)
        if (typeKey === 'stoploss') {
            // +++ SET STICKY REASON +++
            this.haltReason = `⛔ ${message}`;
            this.stop(message);
            return;
        }

        // 3. Take Profit Logic (Pause vs Stop)
        if (typeKey === 'takeprofit') {
            let wantStop = true; // Default to STOP

            try {
                const currentKey = this.runtime.currentScheduleKey;
                const cfgBehavior = this.config.get('behavior') || {};
                const stopFromKey = cfgBehavior.stopOnTakeProfitOnlyFrom || null;
                const schedules = this.config.get('schedules') || {};

                // 1. Identify Enabled Schedules and Sort them Chronologically
                let activeList = [];
                for (const [key, conf] of Object.entries(schedules)) {
                    if (conf && conf.time) {
                        activeList.push({ key: key, time: conf.time });
                    }
                }
                // Sort by time "00:00" to "23:59"
                activeList.sort((a, b) => a.time.localeCompare(b.time));

                // 2. Logic Check
                // IF NO SCHEDULES (Default Warmup Counter only) -> STOP
                if (activeList.length === 0) {
                    wantStop = true;
                    this.logger.log(`🛑 Stopping: TP hit (No Schedules set)`, 'info');
                }
                // IF RUNNING WITHOUT A SCHEDULE KEY (Manual or Default start) -> STOP
                else if (!currentKey) {
                    wantStop = true;
                    this.logger.log(`🛑 Stopping: TP hit (Not running inside a schedule)`, 'info');
                }
                else {
                    const currentIndex = activeList.findIndex(item => item.key === currentKey);

                    // If Current is 'stopOnTakeProfitOnlyFrom' -> STOP
                    if (stopFromKey && currentKey === stopFromKey) {
                        wantStop = true;
                        this.logger.log(`🛑 Stopping: Matched 'stopOnTakeProfitOnlyFrom' (${stopFromKey})`, 'info');
                    }
                    // If Current is the LAST schedule (Scenario 4 & 6) -> STOP
                    else if (currentIndex === activeList.length - 1) {
                        wantStop = true;
                        this.logger.log(`🛑 Stopping: Last schedule of the day completed (${currentKey})`, 'info');
                    }
                    // OTHERWISE -> PAUSE (Move to next)
                    else {
                        wantStop = false;
                        const nextSched = activeList[currentIndex + 1];

                        // Setup Next Target
                        this.scheduledNextKey = nextSched.key;
                        const now = new Date();
                        const [h, m] = nextSched.time.split(':').map(Number);
                        const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);

                        // Handle date wrap if next schedule is mathematically "earlier" (next day)
                        if (target.getTime() <= now.getTime()) {
                            target.setDate(target.getDate() + 1);
                        }
                        this.scheduledTargetEpochMs = target.getTime();

                        this.logger.log(`⏳ Sequence Continue: ${currentKey} finished. Waiting for ${nextSched.key} at ${nextSched.time}...`, 'info');
                    }
                }
            } catch (e) {
                this.logger.log("TP Logic Error:", e);
                wantStop = true;
            }

            if (wantStop) {
                this.haltReason = `⛔ ${message}`;
                this.stop(message);
                return;
            } else {
                // Pause and wait for next schedule (Do NOT set haltReason)
                this.pauseForTakeProfit(reason);
                return;
            }
        }

        // Default Fallback
        this.haltReason = `⛔ ${message}`;
        this.stop(message);
    }

    // Restored exactly
    pauseForTakeProfit(reason) {
        try {
            this.runtime.pausedBecauseTP = true;

            // +++ FIX: STRICT SEQUENCE HANDLING +++
            // The Next Key/Target was calculated in triggerHalt to ensure strict chronological order.
            // We verify they exist here to confirm the sequence is valid.
            if (this.scheduledNextKey && this.scheduledTargetEpochMs) {
                // Re-derive HH:MM:SS string from the epoch for display consistency (24h format)
                this.scheduledTargetHHMMSS = new Date(this.scheduledTargetEpochMs).toLocaleTimeString('en-GB', {hour12:false});

                this.scheduledTargetScheduleKey = this.scheduledNextKey;
                this.runtime.currentScheduleKey = this.scheduledTargetScheduleKey; // Sync runtime key to the waiting schedule

                this.logger.log(`pauseForTakeProfit: scheduled resume at ${this.scheduledTargetHHMMSS}`, 'info');
            } else {
                // Fallback: If triggerHalt failed to pass the key, we cannot safely resume sequence.
                this.stop('TP Sequence Error: Missing next schedule target');
                return;
            }

            // +++ FIX: FREEZE END TIME ONCE +++
            // Capture time exactly when we pause. Do not overwrite if already set.
            if (!this.betEndTimeMalaysia) {
                this.betEndTimeMalaysia = this._malaysiaTimeString(new Date());
            }

            // Switch to WARMUP to wait for the next schedule
            this.mode = 'WARMUP';

            // Clear any halt reason so UI shows 'SCHEDULED' instead of 'HALTED'
            this.haltReason = null;

            // Force update to refresh label to [ENV][WARMUP][SCHEDULED]
            this.updatePanel(false, 'WAITING_SCHEDULE');
        } catch (e) {
            this.logger.log(`pauseForTakeProfit error: ${e.message}`, 'error');
            this.stop('TP Pause Error');
        }
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

    _checkScheduleTrigger() {
        // If we have a target time set
        if (this.scheduledTargetEpochMs && Date.now() >= this.scheduledTargetEpochMs) {
            // Target reached!
            const nextKey = this.scheduledNextKey; // We stored this when we paused/scheduled
            if (nextKey) {
                this.logger.log(`⏰ Schedule Time Reached for ${nextKey}. Resuming immediately...`, 'success');
                this._onScheduledResume(nextKey);
                // Clear target so we don't trigger again instantly
                this.scheduledTargetEpochMs = null;
                this.scheduledNextKey = null;
            }
        }
    }

    // Public API for Console/HTML
    start() {
        this.isRunning = true;
        this.initialize();

        // +++ FIX: SCHEDULE TICKER (Immediate Transition) +++
        // Check schedules every 1 second independent of game socket
        if (this.scheduleTicker) clearInterval(this.scheduleTicker);
        this.scheduleTicker = setInterval(() => {
            // Check if we are in WARMUP and waiting for a schedule
            if (this.mode === 'WARMUP' && this.isRunning && !this.haltReason) {
                this._checkScheduleTrigger();
            }
        }, 1000);
    }
    stop(reason = 'STOPPED') {
        // STRICT FREEZE: Only set End Time if it is currently null.
        // Once set, it must remain frozen until a restart or new schedule clears it.
        if (!this.betEndTimeMalaysia) {
            this.betEndTimeMalaysia = this._malaysiaTimeString(new Date());
        }

        // 1. Set State to False (This ensures Panel generates [HALTED] tag)
        this.isRunning = false;

        // Clear the schedule ticker to prevent background checks while halted
        if (this.scheduleTicker) {
            clearInterval(this.scheduleTicker);
            this.scheduleTicker = null;
        }

        // allow reinitialization on restart
        this._initialized = false;

        // 2. Log to Console
        this.logger.log(`🔴 ${reason}`, 'warning');

        // 3. Update Panel IMMEDIATELY (Before disconnecting)
        // This ensures the HTML panel gets [HALTED] and the "Last Action" message
        this.updatePanel(false, reason, null, true);
    }

    restart() {
        this.stop();
        this.stats.resetStats();
        // +++ Reset Recovery State on Restart +++
        this.debtBits = 0;
        this.recoveryLevel = 0;
        this.initialLossBits = 0;
        this.maxRecLevel = 0;
        this.maxRecStakeBitsEver = 0;
        // +++ STATS RESET +++
        this.maxRecTime = null;
        this.recoveryStartTime = null;
        this.maxRecoveryDuration = 0;
        this.ruinFlag = false;
        // +++ Clear Sticky Halt Reason +++
        this.haltReason = null;
        this.start();
    }
    getStats() { return this.stats.getStats(); }
    getConfig() { return this.config.config; }
    updateConfig(c) { this.config.update(c); this.updatePanel(false, 'CONFIG_UPDATED'); }
    destroy() { this.stop(); if (this.panel) this.panel.destroy(); }

    // UI Proxy
    updatePanel(isBetting = false, lastAction = null, lastPL = null, force = false, overrideBet = null, silent = false) {
        if (this.panel) {
            // Use the engine's rich "lastAction" property if no specific ephemeral reason (like a Skip) is passed
            const engineAction = (this.brain && this.brain.lastAction) ? this.brain.lastAction : null;
            const finalActionText = lastAction || engineAction;

            this.panel.updateStats(
                this.stats.getStats(),
                this.config.getCurrentBalance(),
                this.config.initialBalance,
                overrideBet || this.activeBet, // Use snapshot if provided
                isBetting,
                finalActionText, // Pass resolved rich text
                lastPL,
                force,
                silent // Pass the silent flag here!
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
        this.worker = null;
        this.subscribers = []; // List of functions to call every second
    }

    // Allow StatsPanel to hook into the unthrottled worker
    subscribe(callback) {
        if (typeof callback === 'function') {
            this.subscribers.push(callback);
        }
    }

    start() {
        if (typeof logger !== 'undefined') logger.log('💓 KeepAlive: Starting Heartbeat...', 'info');

        // Strategy A: Web Worker (Anti-Throttle for Coinscrash/Browsers)
        // We try this first. If the sandbox blocks it (Bustabit), we catch the error and fallback.
        let workerStarted = false;

        if (typeof Worker !== 'undefined' && typeof Blob !== 'undefined' && typeof URL !== 'undefined') {
            try {
                const workerCode = `
                    self.onmessage = function() {
                        setInterval(() => {
                            self.postMessage('tick');
                        }, 1000);
                    };
                `;
                const blob = new Blob([workerCode], { type: 'application/javascript' });
                this.worker = new Worker(URL.createObjectURL(blob));

                this.worker.onmessage = () => {
                    this.tick();
                };

                this.worker.postMessage('start');
                workerStarted = true;

                if (typeof logger !== 'undefined') {
                    logger.log('✅ KeepAlive: Background Worker Active (High Precision)', 'success');
                }
            } catch (e) {
                // This block executes on Bustabit (SecurityError)
                if (typeof logger !== 'undefined') {
                    logger.log('⚠️ KeepAlive: Worker blocked (Sandbox Mode). Using Standard Timer.', 'warning');
                }
            }
        }

        // Strategy B: Standard Interval (Fallback)
        // Used if Worker failed or is not supported
        if (!workerStarted) {
            this.interval = setInterval(() => {
                this.tick();
            }, 1000);
        }
    }

    tick() {
        // 1. Ping the adapter to keep socket alive
        if (this.adapter) this.adapter.getBalance();

        // 2. Notify subscribers (The Panel) instantly
        this.subscribers.forEach(cb => cb());
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        if (typeof logger !== 'undefined') logger.log('💓 KeepAlive: Stopped.', 'info');
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
    } catch(e) { logger.log("Cleanup error:", e); }
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
