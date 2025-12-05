var config = {
    // ===================================
    // UNIFIED CONFIGURATION UI
    // ===================================
    // === Meta Information ===
    meta: {
        name: 'Titan',
        version: '2.0',
        edition: 'Strategic Ensemble',
        author: 'Thankgod Ikari',
        id: ""
    },
    // === Normal Mode ===
    normalBaseBet: { value: 100, type: 'balance', label: 'Normal Base Bet (bits)' },
    // Dynamic Multipliers (The Gearbox)
    normalBullMult: { value: 1.87, type: 'multiplier', label: 'Green Lane Target (Bull)' },
    normalBearMult: { value: 1.55, type: 'multiplier', label: 'Yellow Lane Target (Bear)' },
    normalSurvivalMult: { value: 1.33, type: 'multiplier', label: 'Red Lane Target (Survival)' },

    // === Recovery Mode ===
    enableRecovery: { value: true, type: 'checkbox', label: 'Enable Recovery Mode' },
    recoveryMultiplier: { value: 1.77, type: 'multiplier', label: 'Recovery Fixed Target (x)' },
    recoveryCapMult: { value: 15, type: 'number', label: 'Recovery Cap (x Initial Loss)' },

    // === Titan Brain Strategy ===
    // Tri-Scope Windows
    scopeMicro: { value: 6, type: 'number', label: 'Micro Scope (Weather)' },
    scopeMid: { value: 12, type: 'number', label: 'Mid Scope (Season)' },
    scopeMacro: { value: 20, type: 'number', label: 'Macro Scope (Climate)' },
    // Thresholds & Safeguards
    flashCrashThreshold: { value: 1.20, type: 'multiplier', label: 'Flash Crash Halt (<)' },
    toxicityThreshold: { value: 7.00, type: 'number', label: 'Toxicity Sum (Last 5)' },
    recoveryFollowUpLimit: { value: 2, type: 'number', label: 'Max Recovery Follow-Ups' },
    regimeSensitivity: { value: 5, type: 'number', label: 'Regime Sensitivity' },

    // === Stop Limits ===
    takeProfitBits: { value: 200, type: 'number', label: 'Take Profit (bits)' },
    minBalanceBits: { value: 1, type: 'number', label: 'Stop Loss (bits)' },

    // === System ===
    debug: { value: true, type: 'checkbox', label: 'Enable Debug Logging' },

    // ===== Runtime & Watchdog (no-hardcode, user-configurable) =====
    // How often the panel/bot should refresh authoritative stats (ms)
    panelPollIntervalMs: { value: 1000, type: 'number', label: 'Panel Poll Interval (ms)' },
    // If rolling multiplier grows beyond this value it's treated as unreasonable and forces resync
    maxReasonableMultiplier: { value: 100, type: 'number', label: 'Max Reasonable Multiplier' },
    // How long to wait (ms) for server confirmation before fallback rollback (tunable)
    provisionalTimeoutMs: { value: 3500, type: 'number', label: 'Provisional Confirm Timeout (ms)' }
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

class ConfigManager {
    // ==========================================
    // 1. Static Constants (Defaults)
    // ==========================================
    static DEFAULTS = {
        MAX_STAKE_BITS: 10000,
        TEST_BALANCE_BITS: 80,
        WARMUP_ROUNDS: 15,
        SCHEDULE_TP_1: 200,
        SCHEDULE_TP_2: 200,
        SCHEDULE_TP_3: 200,
        MIN_BALANCE_BITS: 1,
        TAKE_PROFIT_BITS: 300,
        NORMAL_BASE_BET_PERCENT: 0.0025,
        NORMAL_BASE_BET_MAX: 300
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
                baseBetBits: val('normalBaseBet', 100) / 100, // Convert Sat to Bits
                normalBullMult: val('normalBullMult', 1.87),
                normalBearMult: val('normalBearMult', 1.55),
                normalSurvivalMult: val('normalSurvivalMult', 1.33),
                minWinRate: 0.50,
                lookback: 20,
                baseBetBitPercent: ConfigManager.DEFAULTS.NORMAL_BASE_BET_PERCENT,
                baseBetBitMax: ConfigManager.DEFAULTS.NORMAL_BASE_BET_MAX
            },

            // Recovery Mode
            recovery: {
                enabled: val('enableRecovery', true),
                target: val('recoveryMultiplier', 1.77),
                capMultiplier: val('recoveryCapMult', 15),
                recoveryLevelSimThreshold: val('recoveryLevelSimThresh', 50),
                baseProfitMult: 0,
                // Fallback for legacy getters if needed
                takeProfitBits: val('takeProfitBits', ConfigManager.DEFAULTS.TAKE_PROFIT_BITS)
            },

            // Strategy Parameters
            titan: {
                smaPeriod: val('titanSma', 5),
                toxicThreshold: val('titanToxic', 1.40),
                safeThreshold: val('titanSafe', 1.60)
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
                betSchedule1: { time: null, takeProfitBits: null },
                betSchedule2: { time: null, takeProfitBits: null },
                betSchedule3: { time: null, takeProfitBits: null }
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

class TitanPredictionEngine {
    constructor(config) {
        this.config = config;
        this.history = [];
        // Track consecutive follow-ups for the Opportunity Engine
        this.recoveryFollowUps = 0;
        this.lastRegime = 'YELLOW';
    }

    update(crashValue) {
        this.history.push(crashValue);
        // Keep enough history for the largest scope (Macro = 20)
        const maxScope = this.config.get('titanBrain', 'scopeMacro') || 20;
        if (this.history.length > maxScope + 5) this.history.shift();
    }

    // 3. Restore Initialization (CRITICAL for Instant Start)
    initialize(adapter) {
        const logger = new Logger(this.config);
        const meta = config.meta;
        // Grab existing history from the adapter immediately so we don't wait 20 rounds
        if (adapter && typeof adapter.getHistory === 'function') {
            const existing = adapter.getHistory(); // Usually returns last 50-100 games
            if (existing && existing.length > 0) {
                // Map objects {crash: 1.00} to numbers if necessary, or just take values
                // The adapter usually returns raw float values or objects.
                // We ensure they are numbers.
                this.history = existing.map(x => (typeof x === 'object' ? x.value : x));

                // Trim to max scope to keep memory clean
                const maxScope = this.config.get('titanBrain', 'scopeMacro') || 20;
                if (this.history.length > maxScope + 20) {
                    this.history = this.history.slice(-(maxScope + 20));
                }
                logger.log(`🧠 ${meta.name} v${meta.version} Brain pre-loaded with ${this.history.length} rounds.`);
            }
        }
    }

    // Main Decision Brain
    decide(botMode, activeBetResult = null) {
        // 1. Get Configured Windows
        const wMicro = this.config.get('titanBrain', 'scopeMicro') || 6;
        const wMid = this.config.get('titanBrain', 'scopeMid') || 12;
        const wMacro = this.config.get('titanBrain', 'scopeMacro') || 20;

        // 2. Calculate Indicators (Tri-Scope)
        const medMicro = this._getMedian(wMicro);
        const medMid = this._getMedian(wMid);
        const medMacro = this._getMedian(wMacro);
        const sma8 = this._getSMA(8);
        const sma20 = this._getSMA(20);
        const lastCrash = this.history[this.history.length - 1] || 0;

        // 3. Determine Regime (Traffic Light)
        let regime = 'YELLOW'; // Default

        // Green Lane: Strong Bull (Rising Medians) OR Golden Cross
        if ((medMicro > medMid && medMid > medMacro && medMicro > 1.50) || (sma8 > sma20)) {
            regime = 'GREEN';
        }
        // Red Lane: Strong Bear (Crashing Medians) OR Death Cross
        else if ((medMicro < medMacro) || (sma8 < sma20)) {
            regime = 'RED';
        }

        this.lastRegime = regime;

        // 4. Defensive Shield (Smart Filters)
        const defense = this._checkDefenses(lastCrash, medMicro, regime);
        if (defense.action === 'SKIP') {
            return { allow: false, reason: defense.reason, regime: regime };
        }

        // 5. Normal Mode Logic (Dynamic Gearbox)
        if (botMode === 'NORMAL') {
            let target = 1.55; // Default Yellow

            if (regime === 'GREEN') target = this.config.get('normal', 'normalBullMult') || 1.87;
            else if (regime === 'RED') target = this.config.get('normal', 'normalSurvivalMult') || 1.33;
            else target = this.config.get('normal', 'normalBearMult') || 1.55;

            return { allow: true, target: target, regime: regime, reason: 'NORMAL_ENTRY' };
        }

        // 6. Recovery Mode Logic (Opportunity Engine)
        if (botMode === 'RECOVERY') {
            const recTarget = this.config.get('recovery', 'recoveryMultiplier') || 1.77;
            const maxFollowUps = this.config.get('titanBrain', 'recoveryFollowUpLimit') || 2;
            const lastWasWin = activeBetResult ? activeBetResult.isWin : false;

            // A. Handle "Green Confirmation" Rule (Red Lane)
            if (regime === 'RED') {
                // If we are in deep red, we MUST wait for a Green Breaker > 2.00x
                if (lastCrash < 2.00) {
                    this.recoveryFollowUps = 0; // Reset count
                    return { allow: false, reason: 'WAIT_FOR_GREEN_CONFIRM (Red Lane)', regime: regime };
                }
            }

            // B. Smart Sequencing (Follow-Up Logic)
            if (activeBetResult) { // We just finished a bet
                if (!lastWasWin) {
                    // LOSS Scenario
                    if (regime === 'GREEN' || regime === 'YELLOW') {
                        // Rebound Strike: Bet immediately if within limit
                        if (this.recoveryFollowUps < maxFollowUps) {
                            this.recoveryFollowUps++;
                            return { allow: true, target: recTarget, regime: regime, reason: `REBOUND_STRIKE (${this.recoveryFollowUps}/${maxFollowUps})` };
                        }
                    }
                    // If Red Lane or Limit Reached -> Pause
                    this.recoveryFollowUps = 0;
                    return { allow: false, reason: 'RECOVERY_PAUSE (Risk Control)', regime: regime };
                } else {
                    // WIN Scenario
                    this.recoveryFollowUps = 0; // Reset on win
                    if (regime === 'GREEN') {
                        // Double Time: Bet immediately
                        return { allow: true, target: recTarget, regime: regime, reason: 'MOMENTUM_RIDE' };
                    }
                    // Yellow/Red: Hit and Run (Pause after win)
                    return { allow: false, reason: 'HIT_AND_RUN_PAUSE', regime: regime };
                }
            }

            // Standard Entry (First bet or after pause)
            return { allow: true, target: recTarget, regime: regime, reason: 'RECOVERY_ENTRY' };
        }

        return { allow: false, reason: 'UNKNOWN_STATE', regime: regime };
    }

    // --- Internal Helpers ---

    _checkDefenses(lastCrash, medMicro, regime) {
        const flashCrashLimit = this.config.get('titanBrain', 'flashCrashThreshold') || 1.20;
        const toxicThreshold = this.config.get('titanBrain', 'toxicityThreshold') || 7.00;

        // 1. Flash Crash Halt
        if (medMicro < flashCrashLimit) {
            return { action: 'SKIP', reason: `FLASH_CRASH_HALT (Micro ${medMicro.toFixed(2)} < ${flashCrashLimit})` };
        }

        // 2. Toxicity Density (Sum of last 5)
        const last5 = this.history.slice(-5);
        const sum5 = last5.reduce((a, b) => a + b, 0);
        if (last5.length === 5 && sum5 < toxicThreshold) {
            return { action: 'SKIP', reason: `TOXICITY_HALT (Sum ${sum5.toFixed(2)} < ${toxicThreshold})` };
        }

        // 3. Double Dip Void (< 1.10x) - Context Aware
        if (lastCrash < 1.10) {
            // Only skip in Red Lane. In Green/Yellow, treat as anomaly/opportunity.
            if (regime === 'RED') {
                return { action: 'SKIP', reason: 'DOUBLE_DIP_AVOID (Red Lane)' };
            }
        }

        return { action: 'ALLOW' };
    }

    _getMedian(windowSize) {
        if (this.history.length < windowSize) return 0;
        const slice = this.history.slice(-windowSize).sort((a, b) => a - b);
        const mid = Math.floor(slice.length / 2);
        return slice.length % 2 !== 0 ? slice[mid] : (slice[mid - 1] + slice[mid]) / 2;
    }

    _getSMA(windowSize) {
        if (this.history.length < windowSize) return 0;
        const slice = this.history.slice(-windowSize);
        return slice.reduce((a, b) => a + b, 0) / slice.length;
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
        if (balance < amount) {
            this.logger.log(`❌ Insufficient Balance. Have: ${balance}, Need: ${amount}`, 'error');
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
        let nextMultValue = 0;
        if (this.bot && this.bot.mode === 'RECOVERY') {
            nextMultValue = this.bot.config.get('recovery', 'recoveryMultiplier') || 1.77;
        } else if (this.bot && this.bot.brain && this.bot.brain.lastRegime) {
            const r = this.bot.brain.lastRegime;
            const cfgNorm = this.bot.config.getRaw().normal;
            if (r === 'GREEN') nextMultValue = cfgNorm.normalBullMult;
            else if (r === 'RED') nextMultValue = cfgNorm.normalSurvivalMult;
            else nextMultValue = cfgNorm.normalBearMult;
        } else {
            nextMultValue = 1.87;
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
            const bStats = this.bot.brain.getStats(); // { sma, winRate, lastCrash }
            if (bStats) {
                // Simple translation of SMA to text state
                const safe = this.config.get('titan', 'safeThreshold') || 1.60;
                const toxic = this.config.get('titan', 'toxicThreshold') || 1.40;

                if (bStats.sma >= safe) brainState = `BULL (${bStats.sma.toFixed(2)})`;
                else if (bStats.sma < toxic) brainState = `TOXIC (${bStats.sma.toFixed(2)})`;
                else brainState = `CAUTION (${bStats.sma.toFixed(2)})`;
            }
        }

        // 2. Construct the Rich Status String
        let lastActionText = "";

        // PRIORITY ZERO: STICKY HALT REASON (Stop Loss / Take Profit)
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
                isBetting: isBetting,
                // Visual hints for the external HTML panel (no DOM manipulation here)
                visualHints: {
                    provisionalActive: !!(this.bot && this.bot._provisionalActive),
                    // rollingColor: 'default' (running + not-betting) | 'green' | 'red'
                    rollingColor: (() => {
                        if (!isBetting) return 'default'; // running but not betting -> keep default (white/grey)
                        if (this.bot && this.bot._provisionalActive) return 'green';
                        // If lastActualCrash exists and reached target then green, otherwise default while running
                        if (this.bot && this.bot.lastActualCrash && activeBet && this.bot.lastActualCrash >= activeBet.targetMultiplier) return 'green';
                        return 'default';
                    })(),
                    // targetColor — target (the planned cashout) should be green if we provisionally/actually reached it
                    targetColor: ((this.bot && this.bot._provisionalActive) || (this.bot && this.bot.lastActualCrash && activeBet && this.bot.lastActualCrash >= activeBet.targetMultiplier)) ? 'green' : 'default',
                    // lastCrashColor — upon crash the last crash color should be red when NOT betting (platform default)
                    lastCrashColor: (() => {
                        if (this.bot && this.bot.lastActualCrash > 0) {
                            if (!isBetting) return 'red'; // per your final clarif: when not betting, always red on crash
                            if (activeBet && this.bot.lastActualCrash >= activeBet.targetMultiplier) return 'green';
                            return 'red';
                        }
                        return 'default';
                    })()
                }
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

        // +++ Provisional (Early Cashout) snapshot state +++
        // When we trigger an instant/early cashout we store a full snapshot
        // of every important value so we can restore it if the server later
        // reports a loss (near-miss).
        this._provisionalActive = false;      // boolean flag
        this._provisionalSnapshot = null;     // deep snapshot object
        this._provisionalTimeoutId = null;    // timeout handle (ms fallback)

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
            this.updatePanel(false, 'GAME_STARTING', null, true);

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
                this.brain.update(crash);
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

            if (this.activeBet) {
                // +++ CHECK IF ALREADY PROCESSED (Early Cashout) +++
                if (this.activeBet.processed) {
                    // +++ NEW: SAFETY CHECK FOR "NEAR MISS" +++
                    if (crash < this.activeBet.targetMultiplier) {
                        // We thought we won, but we actually lost.
                        this.rollbackEarlyWin(crash);
                        actionLabel = 'LOSS';
                        result = { isWin: false, profitBits: -this.activeBet.stakeBits }; // For logging
                    } else {
                        // Confirmed Win
                        this.logger.log(`💥 Game crashed at ${crash}x (Win Confirmed)`, 'info');
                        // Clear provisional snapshot (commit provisional)
                        try { this.commitProvisional(); } catch(e) { /* fail silently */ }
                        // If we were in Recovery and cleared debt provisionally, now we actually switch mode
                        if (this.mode === 'RECOVERY' && this.debtBits <= 0) {
                            this.mode = 'NORMAL';
                            this.recoveryLevel = 0;
                            this.initialLossBits = 0;
                        }
                        actionLabel = 'WIN';
                    }
                    this.activeBet = null;
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
                actionLabel = 'WAITING';
            }

            // --- ORDERING FIX: STATS FIRST, LOGS LAST ---
            // 1. Update Panel (Visuals)
            this.updatePanel(false, actionLabel, profitBits, true);

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

    // Commit a provisional win (called when server confirms or we decide to accept)
    commitProvisional() {
        if (!this._provisionalActive) return;
        this.logger.log(`✅ Provisional win confirmed — committing and clearing snapshot`, 'info');
        this._provisionalActive = false;
        if (this._provisionalTimeoutId) { clearTimeout(this._provisionalTimeoutId); this._provisionalTimeoutId = null; }
        this._provisionalSnapshot = null;
        // nothing else required — handleStrategyState already adjusted stats/state on provisional true,
        // and GAME_ENDED handler will perform mode transitions on confirmed win (it already does).
    }

    // [FIND this method in class CrashBot]
    rollbackEarlyWin(crashValue) {
        this.logger.log(`⚠️ ROLLBACK: Early Win Triggered but Server Crashed @ ${crashValue}x`, 'error');
        // If we have a snapshot, restore everything captured there.
        if (this._provisionalSnapshot) {
            try {
                // Restore bot internals
                const b = this._provisionalSnapshot.botState || {};
                this.debtBits = (typeof b.debtBits === 'number') ? b.debtBits : this.debtBits;
                this.initialLossBits = (typeof b.initialLossBits === 'number') ? b.initialLossBits : this.initialLossBits;
                this.recoveryLevel = (typeof b.recoveryLevel === 'number') ? b.recoveryLevel : this.recoveryLevel;
                this.mode = (b.mode || this.mode);
                this.maxRecLevel = (typeof b.maxRecLevel === 'number') ? b.maxRecLevel : this.maxRecLevel;
                this.maxRecStakeBitsEver = (typeof b.maxRecStakeBitsEver === 'number') ? b.maxRecStakeBitsEver : this.maxRecStakeBitsEver;

                // Restore StatsTracker internal counters (deep replace)
                if (this.stats && this._provisionalSnapshot.statsSnapshot) {
                    this.stats.stats = JSON.parse(JSON.stringify(this._provisionalSnapshot.statsSnapshot));
                }

                // Restore light panel counters
                if (this._provisionalSnapshot.panelSnapshot) {
                    const p = this._provisionalSnapshot.panelSnapshot;
                    this.normalWin = p.normalWin || 0;
                    this.normalLoss = p.normalLoss || 0;
                    this.recoveryWin = p.recoveryWin || 0;
                    this.recoveryLoss = p.recoveryLoss || 0;
                    this.normalSkips = p.normalSkips || 0;
                    this.recoverySkips = p.recoverySkips || 0;
                    this.rounds = p.rounds || 0;
                }

                // Clear provisional bookkeeping
                this._provisionalActive = false;
                if (this._provisionalTimeoutId) { clearTimeout(this._provisionalTimeoutId); this._provisionalTimeoutId = null; }

                // Make sure active bet is cleared
                if (this.activeBet) this.activeBet = null;

                // Final panel refresh: show corrected loss and indicate rollback
                this.updatePanel(false, 'ROLLBACK_CORRECTION', - (this._provisionalSnapshot.activeBetSnapshot ? (this._provisionalSnapshot.activeBetSnapshot.stakeBits || 0) : 0), true);

                this.logger.log('✅ Snapshot restored. All panel counters and bot state rolled back to pre-provisional values.', 'info');
            } catch (e) {
                this.logger.log(`Rollback restore error: ${e.message}`, 'error');
            } finally {
                this._provisionalSnapshot = null;
            }
        } else {
            // Fallback: no snapshot available — fall back to original conservative behaviour
            const assumedStake = (this.activeBet && this.activeBet.stakeBits) ? this.activeBet.stakeBits : 0;
            const lossResult = { isWin: false, multiplier: 0, crashValue: crashValue, betAmountBits: assumedStake, profitBits: -assumedStake, mode: (this.activeBet ? this.activeBet.modeAtPlace : 'NORMAL'), target: (this.activeBet ? this.activeBet.targetMultiplier : 0) };
            this.handleStrategyState(lossResult, false, false);
            this.updatePanel(false, 'ROLLBACK_LOSS', -assumedStake, true);
        }
    }

    processEarlyWin() {
        if (!this.activeBet) return;
        // 0. Defensive: clear any previous provisional state
        if (this._provisionalTimeoutId) { clearTimeout(this._provisionalTimeoutId); this._provisionalTimeoutId = null; }

        this.logger.log(`⚡ EARLY CASHOUT TRIGGERED @ ${this.activeBet.targetMultiplier}x`, 'success');

        // 1. Build the virtual result (what we *think* we won)
        const result = {
            isWin: true,
            multiplier: this.activeBet.targetMultiplier,
            crashValue: this.activeBet.targetMultiplier,
            betAmountBits: this.activeBet.stakeBits,
            profitBits: this.activeBet.stakeBits * (this.activeBet.targetMultiplier - 1),
            mode: this.mode,
            target: this.activeBet.targetMultiplier
        };

        // 2. SNAPSHOT: capture *all* relevant internal state + every panel counter
        try {
            this._provisionalSnapshot = {
                timestamp: Date.now(),
                botState: {
                    debtBits: this.debtBits,
                    initialLossBits: this.initialLossBits,
                    recoveryLevel: this.recoveryLevel,
                    mode: this.mode,
                    maxRecLevel: this.maxRecLevel,
                    maxRecStakeBitsEver: this.maxRecStakeBitsEver
                },
                // deep copy of tracker stats (all displayed counters live here)
                statsSnapshot: JSON.parse(JSON.stringify(this.stats.stats || {})),
                // shallow copy of simple bot counters we keep on 'this' for panel convenience
                panelSnapshot: {
                    normalWin: this.normalWin || 0,
                    normalLoss: this.normalLoss || 0,
                    recoveryWin: this.recoveryWin || 0,
                    recoveryLoss: this.recoveryLoss || 0,
                    normalSkips: this.normalSkips || 0,
                    recoverySkips: this.recoverySkips || 0,
                    rounds: this.rounds || 0
                },
                activeBetSnapshot: JSON.parse(JSON.stringify(this.activeBet || {}))
            };
        } catch (e) {
            // Defensive fallback if deep copy fails (shouldn't)
            this.logger.log(`Snapshot failed: ${e.message}`, 'warning');
            this._provisionalSnapshot = null;
        }

        // 3. Apply provisional change: call handler with provisional=true so internal code can behave accordingly
        this.handleStrategyState(result, false, true);

        // 4. Mark processed locally and provisional flag
        if (this.activeBet) this.activeBet.processed = true;
        this._provisionalActive = true;

        // 5. Force immediate panel update (all counters will be refreshed from stats, debt, etc.)
        this.updatePanel(false, 'CASHOUT_HIT', result.profitBits, true);

        // 6. Start provisional timeout as a safety net (configurable)
        const timeoutMs = (this.config.getRaw && this.config.getRaw().provisionalTimeoutMs && Number(this.config.getRaw().provisionalTimeoutMs.value)) ? Number(this.config.getRaw().provisionalTimeoutMs.value) : 3500;
        this._provisionalTimeoutId = setTimeout(() => {
            // If still provisional and no confirmation arrived, perform a rollback based on latest known crash
            if (this._provisionalActive) {
                const fallbackCrash = (typeof this.lastActualCrash === 'number' && this.lastActualCrash > 0) ? this.lastActualCrash : 0;
                this.logger.log(`⚠️ Provisional timeout (${timeoutMs}ms) — forcing verification (lastActualCrash=${fallbackCrash})`, 'warning');
                // If we have a lastActualCrash and it's < target -> rollback. Otherwise, commit.
                if (fallbackCrash > 0 && fallbackCrash < (this.activeBet ? this.activeBet.targetMultiplier : Number(result.multiplier))) {
                    this.rollbackEarlyWin(fallbackCrash);
                } else {
                    this.commitProvisional();
                }
            }
        }, timeoutMs);
    }

    // ============================================================
    //  LOGIC: Staking & Recovery Math (The New Titan Logic)
    // ============================================================
    calculateRecoveryStake(simulate = false) {
        const recCfg = this.config.get('recovery');
        const target = recCfg.target || 1.77;
        const baseBet = this.config.get('normal', 'baseBetBits');

        // 1. Required Profit = Debt Only (since baseProfitMult is 0)
        const requiredProfit = this.debtBits + (recCfg.baseProfitMult * baseBet);

        // 2. Ideal Stake
        let idealStake = requiredProfit / (target - 1);

        // 3. Cap Logic
        const cap = (this.initialLossBits || baseBet) * recCfg.capMultiplier;
        if (idealStake > cap) {
            if (!simulate) this.logger.log(`⚠️ Stake capped: ${idealStake.toFixed(2)} -> ${cap.toFixed(2)}`, 'warning');
            idealStake = cap;
        }

        // 4. Final Stake Rounding
        let finalStake = Math.max(1, Math.ceil(idealStake));

        // 5. Update State ONLY if not simulating
        // Calculate Recovery Level (Ladder Simulation)
        // Simulates how many losses at 1.77x it takes to accumulate this debt
        if (!simulate) {
            this.maxRecStakeBitsEver = Math.max(this.maxRecStakeBitsEver, finalStake);
            let simDebt = 0;
            let level = 0;
            // We simulate up to the current debt.
            // If current debt is 3, and 1 loss = 1 debt, 2 losses = 3 debt. Level is 2.
            while (simDebt < this.debtBits && level < recCfg.recoveryLevelSimThreshold) {
                level++;
                // Stake needed to recover 'simDebt' at this level
                let simStake = (simDebt + baseBet) / (target - 1);
                simDebt += simStake;
            }
            this.recoveryLevel = level;
            this.maxRecLevel = Math.max(this.maxRecLevel, this.recoveryLevel);
        }
        return finalStake;
    }

    // Updates Bot Mode and Debt based on the result calculated by BettingEngine
    // Added 'silent' parameter to prevent out-of-order logging
    handleStrategyState(result, silent = false, provisional = false) {
        const profit = result.profitBits;
        const stake = result.betAmountBits;

        if (result.isWin) {
            if (!silent) this.logger.log(`✅ WIN! +${profit.toFixed(2)} bits`, 'success');

            if (this.mode === 'RECOVERY') {
                this.debtBits -= profit;
                if (this.debtBits <= 0.01) {
                    this.debtBits = 0;
                    // IF PROVISIONAL: Don't switch mode yet to prevent logic corruption on near-miss
                    if (!provisional) {
                        this.mode = 'NORMAL';
                        this.recoveryLevel = 0;
                        this.initialLossBits = 0;
                        this.updatePanel(false, 'RECOVERY_CLEARED');
                    }
                } else {
                    if (!silent) this.logger.log(`📉 Debt Reduced. Remaining: ${this.debtBits.toFixed(2)} bits`, 'info');
                }
            }
        } else {
            // ... (Existing Loss Logic remains same) ...
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

        // Only add to history if not provisional (or handle provisional logic in tracker)
        // For simplicity, we add it, and if rollback happens, the loss overwrite will balance it visually.
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
            this.betStartTimeMalaysia = this._malaysiaTimeString(new Date());
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
        this.mode = 'NORMAL';
        // +++ Clear debt when starting a fresh scheduled session +++
        this.debtBits = 0;
        this.recoveryLevel = 0;
        this.initialLossBits = 0;
        this.betStartTimeMalaysia = this._malaysiaTimeString(new Date());
        this.runtime.currentScheduleKey = key;
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
        this.haltReason = `[${type.toUpperCase()}] ${reason}`;

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
                    // Fallback rules
                    if (configuredCount === 0 || configuredCount === 1) wantStop = true;
                    else if (configuredCount === 2 && this.runtime.resumesDone >= configuredCount) wantStop = true;
                    else if (scheduleKey === 'betSchedule2') wantStop = true;
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

            this.betStartTimeMalaysia = null;
            this.betEndTimeMalaysia = null;
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
    updatePanel(isBetting = false, lastAction = null, lastPL = null, force = false) {
        if (this.panel) {
            this.panel.updateStats(
                this.stats.getStats(),
                this.config.getCurrentBalance(),
                this.config.initialBalance,
                this.activeBet,
                isBetting,
                lastAction,
                lastPL
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
    }

    start() {
        console.log('💓 KeepAlive: Starting Heartbeat...');

        // FIX: Use Arrow Function to keep 'this' scope
        this.interval = setInterval(() => {
            if (this.adapter) {
                // accessing getBalance keeps the websocket connection alive
                this.adapter.getBalance();
            }
        }, 15000);

        // FIX: Removed AudioContext entirely.
        // It triggers SecurityError on Bustabit and is not required for the bot to run.
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
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
