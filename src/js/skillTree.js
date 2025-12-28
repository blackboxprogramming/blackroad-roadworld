// Skill Tree System for RoadWorld
// Upgrade and specialize your explorer abilities

export class SkillTree {
    constructor(gameEngine, storageManager) {
        this.gameEngine = gameEngine;
        this.storageManager = storageManager;

        this.skillPoints = 0;
        this.unlockedSkills = new Set();
        this.panelElement = null;
        this.isVisible = false;

        // Skill categories and definitions
        this.skills = {
            // Explorer Branch
            swiftFeet: {
                id: 'swiftFeet',
                name: 'Swift Feet',
                icon: '👟',
                branch: 'explorer',
                tier: 1,
                description: '+10% movement speed',
                effect: { type: 'speed', value: 1.1 },
                cost: 1,
                requires: []
            },
            marathonRunner: {
                id: 'marathonRunner',
                name: 'Marathon Runner',
                icon: '🏃',
                branch: 'explorer',
                tier: 2,
                description: '+25% movement speed',
                effect: { type: 'speed', value: 1.25 },
                cost: 2,
                requires: ['swiftFeet']
            },
            teleporter: {
                id: 'teleporter',
                name: 'Teleporter',
                icon: '⚡',
                branch: 'explorer',
                tier: 3,
                description: 'Quick travel cooldown -50%',
                effect: { type: 'travelCooldown', value: 0.5 },
                cost: 3,
                requires: ['marathonRunner']
            },

            // Collector Branch
            keenEye: {
                id: 'keenEye',
                name: 'Keen Eye',
                icon: '👁️',
                branch: 'collector',
                tier: 1,
                description: '+15% item visibility range',
                effect: { type: 'itemRange', value: 1.15 },
                cost: 1,
                requires: []
            },
            treasureHunter: {
                id: 'treasureHunter',
                name: 'Treasure Hunter',
                icon: '💎',
                branch: 'collector',
                tier: 2,
                description: '+25% rare item chance',
                effect: { type: 'rareChance', value: 1.25 },
                cost: 2,
                requires: ['keenEye']
            },
            magneticAura: {
                id: 'magneticAura',
                name: 'Magnetic Aura',
                icon: '🧲',
                branch: 'collector',
                tier: 3,
                description: 'Auto-collect items within 30m',
                effect: { type: 'autoCollect', value: 30 },
                cost: 3,
                requires: ['treasureHunter']
            },

            // Scholar Branch
            quickLearner: {
                id: 'quickLearner',
                name: 'Quick Learner',
                icon: '📚',
                branch: 'scholar',
                tier: 1,
                description: '+10% XP from all sources',
                effect: { type: 'xp', value: 1.1 },
                cost: 1,
                requires: []
            },
            wisdomSeeker: {
                id: 'wisdomSeeker',
                name: 'Wisdom Seeker',
                icon: '🎓',
                branch: 'scholar',
                tier: 2,
                description: '+25% XP from all sources',
                effect: { type: 'xp', value: 1.25 },
                cost: 2,
                requires: ['quickLearner']
            },
            enlightened: {
                id: 'enlightened',
                name: 'Enlightened',
                icon: '✨',
                branch: 'scholar',
                tier: 3,
                description: '+50% XP, +1 skill point per 5 levels',
                effect: { type: 'xp', value: 1.5 },
                cost: 3,
                requires: ['wisdomSeeker']
            },

            // Survivor Branch
            endurance: {
                id: 'endurance',
                name: 'Endurance',
                icon: '❤️',
                branch: 'survivor',
                tier: 1,
                description: 'Sprint duration +50%',
                effect: { type: 'sprintDuration', value: 1.5 },
                cost: 1,
                requires: []
            },
            nightOwl: {
                id: 'nightOwl',
                name: 'Night Owl',
                icon: '🦉',
                branch: 'survivor',
                tier: 2,
                description: '+50% night time bonuses',
                effect: { type: 'nightBonus', value: 1.5 },
                cost: 2,
                requires: ['endurance']
            },
            weatherProof: {
                id: 'weatherProof',
                name: 'Weather Proof',
                icon: '☔',
                branch: 'survivor',
                tier: 3,
                description: 'Bonus XP during weather events',
                effect: { type: 'weatherBonus', value: 1.3 },
                cost: 3,
                requires: ['nightOwl']
            },

            // Mystic Branch
            luckyStar: {
                id: 'luckyStar',
                name: 'Lucky Star',
                icon: '🍀',
                branch: 'mystic',
                tier: 1,
                description: '+10% critical collection chance',
                effect: { type: 'critChance', value: 0.1 },
                cost: 1,
                requires: []
            },
            fortuneFavored: {
                id: 'fortuneFavored',
                name: 'Fortune Favored',
                icon: '🎰',
                branch: 'mystic',
                tier: 2,
                description: '+20% power-up drop rate',
                effect: { type: 'powerupDrop', value: 1.2 },
                cost: 2,
                requires: ['luckyStar']
            },
            goldTouch: {
                id: 'goldTouch',
                name: 'Gold Touch',
                icon: '👑',
                branch: 'mystic',
                tier: 3,
                description: 'Chance to double all rewards',
                effect: { type: 'doubleRewards', value: 0.1 },
                cost: 3,
                requires: ['fortuneFavored']
            }
        };

        // Branch colors
        this.branchColors = {
            explorer: '#00d4ff',
            collector: '#FFD700',
            scholar: '#9b59b6',
            survivor: '#e74c3c',
            mystic: '#2ecc71'
        };
    }

    init() {
        this.createPanel();
        this.loadProgress();

        console.log('🌳 Skill Tree initialized');
    }

    createPanel() {
        this.panelElement = document.createElement('div');
        this.panelElement.className = 'skill-tree-panel ui-overlay';
        this.panelElement.id = 'skill-tree-panel';
        this.panelElement.style.display = 'none';

        this.panelElement.innerHTML = `
            <div class="panel-header">
                <span>🌳 Skill Tree</span>
                <button class="panel-close" id="skills-close">✕</button>
            </div>
            <div class="panel-content skill-content">
                <div class="skill-points-display">
                    <span class="skill-points-label">Skill Points:</span>
                    <span class="skill-points-value" id="skill-points-value">0</span>
                </div>
                <div class="skill-branches" id="skill-branches"></div>
            </div>
        `;

        document.body.appendChild(this.panelElement);
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('skills-close').addEventListener('click', () => {
            this.hide();
        });
    }

    loadProgress() {
        const saved = this.storageManager.data.skillTree || {};
        this.skillPoints = saved.points || 0;
        this.unlockedSkills = new Set(saved.unlocked || []);
    }

    saveProgress() {
        this.storageManager.data.skillTree = {
            points: this.skillPoints,
            unlocked: Array.from(this.unlockedSkills)
        };
        this.storageManager.save();
    }

    addSkillPoints(amount) {
        this.skillPoints += amount;
        this.saveProgress();
        this.updateDisplay();
    }

    canUnlock(skillId) {
        const skill = this.skills[skillId];
        if (!skill) return false;
        if (this.unlockedSkills.has(skillId)) return false;
        if (this.skillPoints < skill.cost) return false;

        // Check requirements
        return skill.requires.every(reqId => this.unlockedSkills.has(reqId));
    }

    unlockSkill(skillId) {
        if (!this.canUnlock(skillId)) return false;

        const skill = this.skills[skillId];
        this.skillPoints -= skill.cost;
        this.unlockedSkills.add(skillId);

        this.saveProgress();
        this.renderPanel();

        this.showNotification(`🌟 Skill unlocked: ${skill.name}!`);
        return true;
    }

    getSkillBonus(effectType) {
        let totalBonus = 1;

        this.unlockedSkills.forEach(skillId => {
            const skill = this.skills[skillId];
            if (skill?.effect.type === effectType) {
                if (effectType === 'critChance' || effectType === 'doubleRewards') {
                    totalBonus += skill.effect.value;
                } else {
                    totalBonus *= skill.effect.value;
                }
            }
        });

        return totalBonus;
    }

    hasSkill(skillId) {
        return this.unlockedSkills.has(skillId);
    }

    getAutoCollectRange() {
        if (this.hasSkill('magneticAura')) {
            return this.skills.magneticAura.effect.value;
        }
        return 0;
    }

    // Called when player levels up
    onLevelUp(newLevel) {
        // Award skill point every level
        this.addSkillPoints(1);

        // Bonus point every 5 levels if enlightened
        if (this.hasSkill('enlightened') && newLevel % 5 === 0) {
            this.addSkillPoints(1);
            this.showNotification('🎓 Enlightened bonus: +1 Skill Point!');
        }
    }

    updateDisplay() {
        const pointsEl = document.getElementById('skill-points-value');
        if (pointsEl) {
            pointsEl.textContent = this.skillPoints;
        }
    }

    renderPanel() {
        this.updateDisplay();

        const branchesEl = document.getElementById('skill-branches');
        if (!branchesEl) return;

        const branches = ['explorer', 'collector', 'scholar', 'survivor', 'mystic'];

        branchesEl.innerHTML = branches.map(branch => {
            const branchSkills = Object.values(this.skills)
                .filter(s => s.branch === branch)
                .sort((a, b) => a.tier - b.tier);

            return `
                <div class="skill-branch" style="--branch-color: ${this.branchColors[branch]}">
                    <div class="branch-header">
                        <span class="branch-name">${branch.charAt(0).toUpperCase() + branch.slice(1)}</span>
                    </div>
                    <div class="branch-skills">
                        ${branchSkills.map(skill => {
                            const isUnlocked = this.unlockedSkills.has(skill.id);
                            const canUnlock = this.canUnlock(skill.id);

                            return `
                                <div class="skill-node ${isUnlocked ? 'unlocked' : ''} ${canUnlock ? 'available' : ''}"
                                     data-skill="${skill.id}">
                                    <div class="skill-icon">${skill.icon}</div>
                                    <div class="skill-tooltip">
                                        <div class="tooltip-name">${skill.name}</div>
                                        <div class="tooltip-desc">${skill.description}</div>
                                        <div class="tooltip-cost">Cost: ${skill.cost} SP</div>
                                        ${skill.requires.length > 0 ? `
                                            <div class="tooltip-requires">
                                                Requires: ${skill.requires.map(r => this.skills[r]?.name).join(', ')}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');

        // Add click handlers
        branchesEl.querySelectorAll('.skill-node.available').forEach(node => {
            node.addEventListener('click', () => {
                const skillId = node.dataset.skill;
                this.unlockSkill(skillId);
            });
        });
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    show() {
        this.isVisible = true;
        this.panelElement.style.display = 'block';
        this.renderPanel();
    }

    hide() {
        this.isVisible = false;
        this.panelElement.style.display = 'none';
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}
