// Challenge Modes for RoadWorld
// Time trials, races, and special challenges

export class ChallengeModes {
    constructor(mapManager, gameEngine, storageManager) {
        this.mapManager = mapManager;
        this.gameEngine = gameEngine;
        this.storageManager = storageManager;

        this.activeChallenge = null;
        this.challengeRecords = {};
        this.panelElement = null;
        this.hudElement = null;
        this.isVisible = false;

        // Challenge definitions
        this.challenges = {
            // Time Trials
            speedDash: {
                id: 'speedDash',
                name: 'Speed Dash',
                icon: '⚡',
                type: 'timeTrial',
                description: 'Collect 20 items as fast as possible!',
                target: 20,
                targetType: 'items',
                difficulty: 'easy',
                rewards: {
                    bronze: { time: 120, xp: 500, items: { stars: 5 } },
                    silver: { time: 60, xp: 1000, items: { gems: 3 } },
                    gold: { time: 30, xp: 2000, items: { trophies: 1 } }
                }
            },
            marathonMaster: {
                id: 'marathonMaster',
                name: 'Marathon Master',
                icon: '🏃',
                type: 'timeTrial',
                description: 'Travel 5km as fast as possible!',
                target: 5000, // meters
                targetType: 'distance',
                difficulty: 'medium',
                rewards: {
                    bronze: { time: 600, xp: 800, items: { stars: 10 } },
                    silver: { time: 300, xp: 1500, items: { gems: 5 } },
                    gold: { time: 180, xp: 3000, items: { trophies: 2 } }
                }
            },
            xpExpress: {
                id: 'xpExpress',
                name: 'XP Express',
                icon: '✨',
                type: 'timeTrial',
                description: 'Earn 1000 XP as fast as possible!',
                target: 1000,
                targetType: 'xp',
                difficulty: 'hard',
                rewards: {
                    bronze: { time: 300, xp: 1000, items: { stars: 15 } },
                    silver: { time: 180, xp: 2000, items: { gems: 8 } },
                    gold: { time: 90, xp: 4000, items: { trophies: 3 } }
                }
            },

            // Survival Challenges
            comboKing: {
                id: 'comboKing',
                name: 'Combo King',
                icon: '🔥',
                type: 'survival',
                description: 'Reach a 50x combo without breaking!',
                target: 50,
                targetType: 'combo',
                difficulty: 'hard',
                rewards: {
                    complete: { xp: 2500, items: { gems: 10 } }
                }
            },
            nightSurvivor: {
                id: 'nightSurvivor',
                name: 'Night Survivor',
                icon: '🌙',
                type: 'survival',
                description: 'Collect 30 items during night time!',
                target: 30,
                targetType: 'nightItems',
                difficulty: 'medium',
                rewards: {
                    complete: { xp: 1500, items: { gems: 5, keys: 2 } }
                }
            },

            // Collection Challenges
            gemCollector: {
                id: 'gemCollector',
                name: 'Gem Collector',
                icon: '💎',
                type: 'collection',
                description: 'Collect 10 gems in one session!',
                target: 10,
                targetType: 'gems',
                difficulty: 'medium',
                rewards: {
                    complete: { xp: 1200, items: { gems: 5 } }
                }
            },
            trophyHunter: {
                id: 'trophyHunter',
                name: 'Trophy Hunter',
                icon: '🏆',
                type: 'collection',
                description: 'Collect 5 trophies in one session!',
                target: 5,
                targetType: 'trophies',
                difficulty: 'hard',
                rewards: {
                    complete: { xp: 2000, items: { trophies: 3 } }
                }
            },

            // Special Challenges
            worldTour: {
                id: 'worldTour',
                name: 'World Tour',
                icon: '🌍',
                type: 'exploration',
                description: 'Visit 3 continents in 10 minutes!',
                target: 3,
                targetType: 'continents',
                timeLimit: 600,
                difficulty: 'hard',
                rewards: {
                    complete: { xp: 3000, items: { trophies: 2, gems: 10 } }
                }
            },
            photoJourney: {
                id: 'photoJourney',
                name: 'Photo Journey',
                icon: '📸',
                type: 'special',
                description: 'Take 5 screenshots at famous landmarks!',
                target: 5,
                targetType: 'photos',
                difficulty: 'easy',
                rewards: {
                    complete: { xp: 1000, items: { stars: 20 } }
                }
            }
        };

        this.updateInterval = null;
    }

    init() {
        this.createPanel();
        this.createHUD();
        this.loadRecords();

        console.log('🏁 Challenge Modes initialized');
    }

    createPanel() {
        this.panelElement = document.createElement('div');
        this.panelElement.className = 'challenge-panel ui-overlay';
        this.panelElement.id = 'challenge-panel';
        this.panelElement.style.display = 'none';

        this.panelElement.innerHTML = `
            <div class="panel-header">
                <span>🏁 Challenges</span>
                <button class="panel-close" id="challenge-close">✕</button>
            </div>
            <div class="panel-content challenge-content">
                <div class="challenge-tabs">
                    <button class="challenge-tab active" data-type="timeTrial">⚡ Time Trials</button>
                    <button class="challenge-tab" data-type="survival">💪 Survival</button>
                    <button class="challenge-tab" data-type="collection">📦 Collection</button>
                    <button class="challenge-tab" data-type="special">✨ Special</button>
                </div>
                <div class="challenge-list" id="challenge-list"></div>
            </div>
        `;

        document.body.appendChild(this.panelElement);
        this.setupEventListeners();
    }

    createHUD() {
        this.hudElement = document.createElement('div');
        this.hudElement.className = 'challenge-hud';
        this.hudElement.id = 'challenge-hud';
        this.hudElement.style.display = 'none';
        document.body.appendChild(this.hudElement);
    }

    setupEventListeners() {
        document.getElementById('challenge-close').addEventListener('click', () => {
            this.hide();
        });

        this.panelElement.querySelectorAll('.challenge-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.panelElement.querySelectorAll('.challenge-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.renderChallenges(e.target.dataset.type);
            });
        });
    }

    loadRecords() {
        const saved = this.storageManager.data.challengeRecords || {};
        this.challengeRecords = saved;
    }

    saveRecords() {
        this.storageManager.data.challengeRecords = this.challengeRecords;
        this.storageManager.save();
    }

    startChallenge(challengeId) {
        const challenge = this.challenges[challengeId];
        if (!challenge) return;

        if (this.activeChallenge) {
            this.showNotification('Complete or abandon current challenge first!');
            return;
        }

        this.activeChallenge = {
            ...challenge,
            startTime: Date.now(),
            progress: 0,
            startXP: this.gameEngine.player.xp,
            startDistance: this.gameEngine.player.stats.distanceTraveled,
            visitedContinents: new Set()
        };

        this.showHUD();
        this.startUpdateLoop();
        this.hide();

        this.showNotification(`🏁 Challenge started: ${challenge.name}`);
    }

    abandonChallenge() {
        if (!this.activeChallenge) return;

        this.stopUpdateLoop();
        this.hideHUD();
        this.activeChallenge = null;

        this.showNotification('Challenge abandoned');
    }

    updateProgress(type, amount = 1) {
        if (!this.activeChallenge) return;

        const c = this.activeChallenge;

        switch (c.targetType) {
            case 'items':
                if (type === 'item') c.progress += amount;
                break;
            case 'distance':
                const currentDist = this.gameEngine.player.stats.distanceTraveled;
                c.progress = currentDist - c.startDistance;
                break;
            case 'xp':
                const currentXP = this.gameEngine.player.xp;
                c.progress = currentXP - c.startXP;
                break;
            case 'combo':
                if (type === 'combo' && amount > c.progress) c.progress = amount;
                break;
            case 'gems':
            case 'trophies':
            case 'stars':
                if (type === c.targetType) c.progress += amount;
                break;
            case 'nightItems':
                // Would check if night time
                if (type === 'item') c.progress += amount;
                break;
            case 'photos':
                if (type === 'screenshot') c.progress += amount;
                break;
        }

        this.updateHUD();
        this.checkCompletion();
    }

    checkCompletion() {
        if (!this.activeChallenge) return;

        const c = this.activeChallenge;

        // Check time limit for timed challenges
        if (c.timeLimit) {
            const elapsed = (Date.now() - c.startTime) / 1000;
            if (elapsed > c.timeLimit) {
                this.failChallenge();
                return;
            }
        }

        // Check target reached
        if (c.progress >= c.target) {
            this.completeChallenge();
        }
    }

    completeChallenge() {
        const c = this.activeChallenge;
        const elapsed = (Date.now() - c.startTime) / 1000;

        // Determine medal for time trials
        let medal = null;
        let rewards = null;

        if (c.type === 'timeTrial') {
            if (elapsed <= c.rewards.gold.time) {
                medal = 'gold';
                rewards = c.rewards.gold;
            } else if (elapsed <= c.rewards.silver.time) {
                medal = 'silver';
                rewards = c.rewards.silver;
            } else if (elapsed <= c.rewards.bronze.time) {
                medal = 'bronze';
                rewards = c.rewards.bronze;
            }
        } else {
            medal = 'complete';
            rewards = c.rewards.complete;
        }

        // Save record
        const record = this.challengeRecords[c.id] || {};
        if (!record.bestTime || elapsed < record.bestTime) {
            record.bestTime = elapsed;
            record.medal = medal;
        }
        this.challengeRecords[c.id] = record;
        this.saveRecords();

        // Award rewards
        if (rewards && this.gameEngine) {
            this.gameEngine.addXP(rewards.xp, 'challenge');

            if (rewards.items) {
                Object.entries(rewards.items).forEach(([type, count]) => {
                    for (let i = 0; i < count; i++) {
                        this.gameEngine.collectItem({ type, rarity: 'challenge' });
                    }
                });
            }
        }

        this.showCompletionScreen(c, elapsed, medal, rewards);

        this.stopUpdateLoop();
        this.hideHUD();
        this.activeChallenge = null;
    }

    failChallenge() {
        const c = this.activeChallenge;

        this.showNotification(`⏱️ Time's up! Challenge failed.`);

        this.stopUpdateLoop();
        this.hideHUD();
        this.activeChallenge = null;
    }

    showCompletionScreen(challenge, time, medal, rewards) {
        const medalIcons = { gold: '🥇', silver: '🥈', bronze: '🥉', complete: '✅' };
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);

        const overlay = document.createElement('div');
        overlay.className = 'challenge-complete-overlay';
        overlay.innerHTML = `
            <div class="challenge-complete-content">
                <div class="challenge-medal">${medalIcons[medal] || '🏁'}</div>
                <div class="challenge-complete-title">Challenge Complete!</div>
                <div class="challenge-complete-name">${challenge.name}</div>
                <div class="challenge-time">${minutes}:${seconds.toString().padStart(2, '0')}</div>
                ${rewards ? `
                    <div class="challenge-rewards">
                        <div class="reward-xp">+${rewards.xp} XP</div>
                        ${rewards.items ? `
                            <div class="reward-items">
                                ${Object.entries(rewards.items).map(([type, count]) =>
                                    `<span>${this.getItemIcon(type)} x${count}</span>`
                                ).join('')}
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
                <button class="challenge-complete-btn" id="challenge-complete-close">Continue</button>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('challenge-complete-close').addEventListener('click', () => {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 500);
        });
    }

    getItemIcon(type) {
        const icons = { stars: '⭐', gems: '💎', trophies: '🏆', keys: '🗝️' };
        return icons[type] || '✨';
    }

    startUpdateLoop() {
        this.updateInterval = setInterval(() => {
            this.updateHUD();
            this.checkCompletion();
        }, 100);
    }

    stopUpdateLoop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    showHUD() {
        if (!this.activeChallenge) return;

        const c = this.activeChallenge;
        this.hudElement.style.display = 'block';
        this.updateHUD();
    }

    hideHUD() {
        this.hudElement.style.display = 'none';
    }

    updateHUD() {
        if (!this.activeChallenge) return;

        const c = this.activeChallenge;
        const elapsed = (Date.now() - c.startTime) / 1000;
        const minutes = Math.floor(elapsed / 60);
        const seconds = Math.floor(elapsed % 60);
        const progressPercent = Math.min(100, (c.progress / c.target) * 100);

        this.hudElement.innerHTML = `
            <div class="challenge-hud-header">
                <span class="challenge-hud-icon">${c.icon}</span>
                <span class="challenge-hud-name">${c.name}</span>
                <button class="challenge-hud-abandon" id="hud-abandon">✕</button>
            </div>
            <div class="challenge-hud-timer">${minutes}:${seconds.toString().padStart(2, '0')}</div>
            <div class="challenge-hud-progress">
                <div class="challenge-hud-bar">
                    <div class="challenge-hud-fill" style="width: ${progressPercent}%"></div>
                </div>
                <div class="challenge-hud-text">${Math.floor(c.progress)}/${c.target}</div>
            </div>
        `;

        document.getElementById('hud-abandon')?.addEventListener('click', () => {
            if (confirm('Abandon this challenge?')) {
                this.abandonChallenge();
            }
        });
    }

    renderChallenges(type) {
        const listEl = document.getElementById('challenge-list');
        if (!listEl) return;

        const filtered = Object.values(this.challenges).filter(c =>
            c.type === type || (type === 'special' && (c.type === 'exploration' || c.type === 'special'))
        );

        listEl.innerHTML = filtered.map(challenge => {
            const record = this.challengeRecords[challenge.id];
            const medalIcons = { gold: '🥇', silver: '🥈', bronze: '🥉', complete: '✅' };

            return `
                <div class="challenge-card ${challenge.difficulty}" data-challenge="${challenge.id}">
                    <div class="challenge-card-icon">${challenge.icon}</div>
                    <div class="challenge-card-info">
                        <div class="challenge-card-name">${challenge.name}</div>
                        <div class="challenge-card-desc">${challenge.description}</div>
                        <div class="challenge-card-difficulty">${challenge.difficulty.toUpperCase()}</div>
                    </div>
                    <div class="challenge-card-record">
                        ${record ? `
                            <div class="record-medal">${medalIcons[record.medal] || ''}</div>
                            <div class="record-time">${Math.floor(record.bestTime)}s</div>
                        ` : `
                            <div class="no-record">Not attempted</div>
                        `}
                    </div>
                    <button class="challenge-start-btn">Start</button>
                </div>
            `;
        }).join('');

        listEl.querySelectorAll('.challenge-start-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const challengeId = e.target.closest('.challenge-card').dataset.challenge;
                this.startChallenge(challengeId);
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
        this.renderChallenges('timeTrial');
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
