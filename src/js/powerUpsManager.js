// Power-ups System for RoadWorld
// Temporary buffs that enhance gameplay

export class PowerUpsManager {
    constructor(gameEngine, storageManager) {
        this.gameEngine = gameEngine;
        this.storageManager = storageManager;

        // Active power-ups
        this.activePowerUps = new Map();

        // Power-up definitions
        this.powerUpTypes = this.definePowerUps();

        // UI element
        this.powerUpBar = null;

        this.init();
    }

    definePowerUps() {
        return {
            xp_boost: {
                id: 'xp_boost',
                name: 'XP Boost',
                description: 'Double XP gain',
                icon: '⚡',
                color: '#FFD700',
                duration: 300000, // 5 minutes
                effect: { type: 'xp_multiplier', value: 2 }
            },
            magnet: {
                id: 'magnet',
                name: 'Item Magnet',
                description: 'Increased collection radius',
                icon: '🧲',
                color: '#FF6B00',
                duration: 180000, // 3 minutes
                effect: { type: 'collection_radius', value: 3 }
            },
            lucky: {
                id: 'lucky',
                name: 'Lucky Star',
                description: 'Better item rarity chances',
                icon: '🍀',
                color: '#00FF88',
                duration: 240000, // 4 minutes
                effect: { type: 'rarity_boost', value: 2 }
            },
            speed: {
                id: 'speed',
                name: 'Speed Boost',
                description: 'Move faster',
                icon: '💨',
                color: '#00d4ff',
                duration: 120000, // 2 minutes
                effect: { type: 'speed_multiplier', value: 2 }
            },
            shield: {
                id: 'shield',
                name: 'Combo Shield',
                description: 'Combo timer paused',
                icon: '🛡️',
                color: '#7b2ff7',
                duration: 60000, // 1 minute
                effect: { type: 'combo_freeze', value: true }
            },
            golden: {
                id: 'golden',
                name: 'Golden Hour',
                description: 'All effects combined!',
                icon: '👑',
                color: '#FFD700',
                duration: 60000, // 1 minute
                effect: { type: 'all_boosts', value: true },
                legendary: true
            }
        };
    }

    init() {
        this.createPowerUpBar();
        this.loadActivePowerUps();
        this.startUpdateLoop();
    }

    createPowerUpBar() {
        this.powerUpBar = document.createElement('div');
        this.powerUpBar.className = 'power-up-bar';
        this.powerUpBar.innerHTML = `<div class="power-up-list"></div>`;
        document.body.appendChild(this.powerUpBar);
    }

    loadActivePowerUps() {
        const saved = this.storageManager.data.activePowerUps || [];
        const now = Date.now();

        saved.forEach(pu => {
            if (pu.expiresAt > now) {
                this.activePowerUps.set(pu.id, pu);
            }
        });

        this.updateUI();
    }

    savePowerUps() {
        this.storageManager.data.activePowerUps = Array.from(this.activePowerUps.values());
        this.storageManager.save();
    }

    activatePowerUp(typeId) {
        const type = this.powerUpTypes[typeId];
        if (!type) return null;

        const now = Date.now();

        // Check if already active - extend duration
        if (this.activePowerUps.has(typeId)) {
            const existing = this.activePowerUps.get(typeId);
            existing.expiresAt += type.duration;
        } else {
            // Create new power-up
            const powerUp = {
                id: typeId,
                ...type,
                activatedAt: now,
                expiresAt: now + type.duration
            };
            this.activePowerUps.set(typeId, powerUp);
        }

        this.savePowerUps();
        this.updateUI();

        console.log(`⚡ Power-up activated: ${type.name}`);
        return this.activePowerUps.get(typeId);
    }

    deactivatePowerUp(typeId) {
        this.activePowerUps.delete(typeId);
        this.savePowerUps();
        this.updateUI();
    }

    isActive(typeId) {
        if (!this.activePowerUps.has(typeId)) return false;

        const pu = this.activePowerUps.get(typeId);
        if (Date.now() > pu.expiresAt) {
            this.deactivatePowerUp(typeId);
            return false;
        }
        return true;
    }

    getEffectValue(effectType, defaultValue = 1) {
        for (const pu of this.activePowerUps.values()) {
            if (Date.now() > pu.expiresAt) continue;

            if (pu.effect.type === effectType) {
                return pu.effect.value;
            }

            // Golden hour gives all effects
            if (pu.effect.type === 'all_boosts') {
                if (effectType === 'xp_multiplier') return 2;
                if (effectType === 'collection_radius') return 3;
                if (effectType === 'rarity_boost') return 2;
                if (effectType === 'speed_multiplier') return 1.5;
            }
        }

        return defaultValue;
    }

    getXPMultiplier() {
        return this.getEffectValue('xp_multiplier', 1);
    }

    getCollectionRadius() {
        return this.getEffectValue('collection_radius', 1);
    }

    getRarityBoost() {
        return this.getEffectValue('rarity_boost', 1);
    }

    getSpeedMultiplier() {
        return this.getEffectValue('speed_multiplier', 1);
    }

    isComboFrozen() {
        return this.isActive('shield') || this.isActive('golden');
    }

    startUpdateLoop() {
        setInterval(() => {
            this.checkExpired();
            this.updateUI();
        }, 1000);
    }

    checkExpired() {
        const now = Date.now();
        for (const [id, pu] of this.activePowerUps) {
            if (now > pu.expiresAt) {
                this.deactivatePowerUp(id);
                this.showExpiredNotification(pu);
            }
        }
    }

    showExpiredNotification(powerUp) {
        const notification = document.createElement('div');
        notification.className = 'notification power-up-expired';
        notification.innerHTML = `${powerUp.icon} ${powerUp.name} expired!`;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    updateUI() {
        const list = this.powerUpBar.querySelector('.power-up-list');
        const now = Date.now();

        if (this.activePowerUps.size === 0) {
            this.powerUpBar.style.display = 'none';
            return;
        }

        this.powerUpBar.style.display = 'block';

        list.innerHTML = Array.from(this.activePowerUps.values())
            .filter(pu => pu.expiresAt > now)
            .map(pu => {
                const remaining = pu.expiresAt - now;
                const seconds = Math.ceil(remaining / 1000);
                const minutes = Math.floor(seconds / 60);
                const secs = seconds % 60;
                const progress = (remaining / pu.duration) * 100;

                return `
                    <div class="power-up-item ${pu.legendary ? 'legendary' : ''}" style="border-color: ${pu.color}">
                        <div class="power-up-icon">${pu.icon}</div>
                        <div class="power-up-info">
                            <div class="power-up-name">${pu.name}</div>
                            <div class="power-up-timer">${minutes}:${secs.toString().padStart(2, '0')}</div>
                        </div>
                        <div class="power-up-progress" style="width: ${progress}%; background: ${pu.color}"></div>
                    </div>
                `;
            }).join('');
    }

    grantRandomPowerUp() {
        const types = Object.keys(this.powerUpTypes).filter(t => t !== 'golden');
        const randomType = types[Math.floor(Math.random() * types.length)];
        return this.activatePowerUp(randomType);
    }

    getActivePowerUps() {
        return Array.from(this.activePowerUps.values()).filter(pu => Date.now() < pu.expiresAt);
    }
}
