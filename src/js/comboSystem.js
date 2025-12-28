// Combo System for RoadWorld
// Rewards rapid item collection with bonus XP multipliers

export class ComboSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;

        // Combo state
        this.currentCombo = 0;
        this.maxCombo = 0;
        this.lastCollectionTime = 0;
        this.comboTimeout = 5000; // 5 seconds to maintain combo

        // Combo tiers
        this.comboTiers = [
            { min: 0, name: '', multiplier: 1, color: '#fff' },
            { min: 3, name: 'COMBO!', multiplier: 1.25, color: '#00d4ff' },
            { min: 5, name: 'SUPER!', multiplier: 1.5, color: '#7b2ff7' },
            { min: 10, name: 'MEGA!', multiplier: 2, color: '#FF6B00' },
            { min: 15, name: 'ULTRA!', multiplier: 2.5, color: '#FF0066' },
            { min: 20, name: 'INSANE!', multiplier: 3, color: '#FFD700' },
            { min: 30, name: 'LEGENDARY!', multiplier: 4, color: '#FFD700' }
        ];

        // Timer for combo decay
        this.comboTimer = null;
        this.comboElement = null;

        this.init();
    }

    init() {
        this.createComboDisplay();
    }

    createComboDisplay() {
        this.comboElement = document.createElement('div');
        this.comboElement.className = 'combo-display';
        this.comboElement.innerHTML = `
            <div class="combo-counter">
                <span class="combo-number">0</span>
                <span class="combo-label">COMBO</span>
            </div>
            <div class="combo-tier"></div>
            <div class="combo-multiplier"></div>
            <div class="combo-timer-bar">
                <div class="combo-timer-fill"></div>
            </div>
        `;
        this.comboElement.style.display = 'none';
        document.body.appendChild(this.comboElement);
    }

    registerCollection(collectible) {
        const now = Date.now();

        // Check if combo should continue or reset
        if (now - this.lastCollectionTime > this.comboTimeout) {
            this.currentCombo = 0;
        }

        // Increment combo
        this.currentCombo++;
        this.lastCollectionTime = now;

        // Update max combo
        if (this.currentCombo > this.maxCombo) {
            this.maxCombo = this.currentCombo;
        }

        // Get current tier
        const tier = this.getCurrentTier();

        // Update display
        this.updateDisplay(tier);

        // Reset combo timer
        this.resetComboTimer();

        // Return XP multiplier
        return {
            combo: this.currentCombo,
            tier: tier,
            multiplier: tier.multiplier
        };
    }

    getCurrentTier() {
        let tier = this.comboTiers[0];
        for (const t of this.comboTiers) {
            if (this.currentCombo >= t.min) {
                tier = t;
            }
        }
        return tier;
    }

    updateDisplay(tier) {
        if (!this.comboElement) return;

        const numberEl = this.comboElement.querySelector('.combo-number');
        const tierEl = this.comboElement.querySelector('.combo-tier');
        const multEl = this.comboElement.querySelector('.combo-multiplier');

        numberEl.textContent = this.currentCombo;
        numberEl.style.color = tier.color;

        if (tier.name) {
            tierEl.textContent = tier.name;
            tierEl.style.color = tier.color;
            this.comboElement.style.display = 'block';
            this.comboElement.classList.add('active');

            // Animate on tier change
            if (this.currentCombo === tier.min) {
                this.comboElement.classList.remove('tier-up');
                void this.comboElement.offsetWidth; // Force reflow
                this.comboElement.classList.add('tier-up');
            }
        }

        multEl.textContent = tier.multiplier > 1 ? `x${tier.multiplier} XP` : '';

        // Pulse animation on each collection
        numberEl.classList.remove('pulse');
        void numberEl.offsetWidth;
        numberEl.classList.add('pulse');
    }

    resetComboTimer() {
        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
            clearInterval(this.timerInterval);
        }

        // Animate timer bar
        const timerFill = this.comboElement.querySelector('.combo-timer-fill');
        if (timerFill) {
            timerFill.style.transition = 'none';
            timerFill.style.width = '100%';
            void timerFill.offsetWidth;
            timerFill.style.transition = `width ${this.comboTimeout}ms linear`;
            timerFill.style.width = '0%';
        }

        // Set timeout to end combo
        this.comboTimer = setTimeout(() => {
            this.endCombo();
        }, this.comboTimeout);
    }

    endCombo() {
        if (this.currentCombo >= 3) {
            // Show combo end summary
            this.showComboSummary();
        }

        this.currentCombo = 0;
        this.comboElement.classList.remove('active');

        setTimeout(() => {
            if (this.currentCombo === 0) {
                this.comboElement.style.display = 'none';
            }
        }, 500);
    }

    showComboSummary() {
        const tier = this.getCurrentTier();

        const summary = document.createElement('div');
        summary.className = 'combo-summary';
        summary.innerHTML = `
            <div class="combo-summary-title">Combo Ended!</div>
            <div class="combo-summary-count" style="color: ${tier.color}">${this.currentCombo}x</div>
            <div class="combo-summary-tier">${tier.name || 'Nice!'}</div>
        `;
        document.body.appendChild(summary);

        setTimeout(() => {
            summary.classList.add('fade-out');
            setTimeout(() => summary.remove(), 500);
        }, 2000);
    }

    getComboInfo() {
        return {
            current: this.currentCombo,
            max: this.maxCombo,
            tier: this.getCurrentTier(),
            multiplier: this.getCurrentTier().multiplier
        };
    }

    // Get total XP with combo multiplier applied
    calculateXP(baseXP) {
        const multiplier = this.getCurrentTier().multiplier;
        return Math.floor(baseXP * multiplier);
    }
}
