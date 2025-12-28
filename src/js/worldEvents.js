// World Events System for RoadWorld
// Dynamic global events and challenges

export class WorldEvents {
    constructor(gameEngine, mapManager, storageManager) {
        this.gameEngine = gameEngine;
        this.mapManager = mapManager;
        this.storageManager = storageManager;

        this.activeEvents = [];
        this.completedEvents = new Set();
        this.panelElement = null;
        this.isVisible = false;

        // Event types
        this.eventTypes = {
            meteorShower: {
                name: 'Meteor Shower',
                icon: '☄️',
                description: 'Collect falling stars for bonus XP!',
                duration: 5 * 60 * 1000, // 5 minutes
                rarity: 'epic',
                rewards: { xp: 500, items: { stars: 10 } },
                spawnRate: 0.01 // Per hour
            },
            treasureRush: {
                name: 'Treasure Rush',
                icon: '💰',
                description: 'Treasures spawn everywhere!',
                duration: 3 * 60 * 1000,
                rarity: 'rare',
                rewards: { xp: 300, items: { gems: 5 } },
                spawnRate: 0.05
            },
            doubleTrouble: {
                name: 'Double Trouble',
                icon: '✨',
                description: 'All XP rewards are doubled!',
                duration: 2 * 60 * 1000,
                rarity: 'common',
                rewards: { xp: 200 },
                spawnRate: 0.1
            },
            mysteryZone: {
                name: 'Mystery Zone',
                icon: '🔮',
                description: 'A mysterious area has appeared nearby!',
                duration: 10 * 60 * 1000,
                rarity: 'legendary',
                rewards: { xp: 1000, items: { keys: 3 } },
                spawnRate: 0.005
            },
            speedDemon: {
                name: 'Speed Demon',
                icon: '⚡',
                description: 'Move faster and gain speed bonuses!',
                duration: 4 * 60 * 1000,
                rarity: 'rare',
                rewards: { xp: 250 },
                spawnRate: 0.04
            },
            luckyHour: {
                name: 'Lucky Hour',
                icon: '🍀',
                description: 'Increased rare item drop rates!',
                duration: 60 * 60 * 1000, // 1 hour
                rarity: 'epic',
                rewards: { xp: 400, items: { trophies: 2 } },
                spawnRate: 0.02
            }
        };

        // Community challenges
        this.challenges = {
            globalDistance: {
                name: 'World Tour',
                icon: '🌍',
                description: 'Community goal: Travel 1000km total',
                target: 1000000, // meters
                current: 0,
                rewards: { xp: 2000, items: { trophies: 5 } }
            },
            globalItems: {
                name: 'Treasure Hunters',
                icon: '📦',
                description: 'Community goal: Collect 10,000 items',
                target: 10000,
                current: 0,
                rewards: { xp: 1500, items: { gems: 10 } }
            }
        };

        this.checkInterval = null;
    }

    init() {
        this.createPanel();
        this.loadProgress();
        this.startEventChecker();

        console.log('🌍 World Events initialized');
    }

    createPanel() {
        this.panelElement = document.createElement('div');
        this.panelElement.className = 'world-events-panel ui-overlay';
        this.panelElement.id = 'world-events-panel';
        this.panelElement.style.display = 'none';

        this.panelElement.innerHTML = `
            <div class="panel-header">
                <span>🌍 World Events</span>
                <button class="panel-close" id="events-close">✕</button>
            </div>
            <div class="panel-content events-content">
                <div class="events-section">
                    <h4>🎯 Active Events</h4>
                    <div class="active-events-list" id="active-events-list"></div>
                </div>
                <div class="events-section">
                    <h4>🏆 Community Challenges</h4>
                    <div class="challenges-list" id="challenges-list"></div>
                </div>
                <div class="events-section">
                    <h4>📅 Upcoming</h4>
                    <div class="upcoming-events" id="upcoming-events">
                        <div class="event-hint">Events spawn randomly based on your activity!</div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.panelElement);
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('events-close').addEventListener('click', () => {
            this.hide();
        });
    }

    loadProgress() {
        const saved = this.storageManager.data.worldEvents || {};
        this.completedEvents = new Set(saved.completed || []);

        // Load challenge progress
        if (saved.challenges) {
            Object.keys(saved.challenges).forEach(key => {
                if (this.challenges[key]) {
                    this.challenges[key].current = saved.challenges[key];
                }
            });
        }
    }

    saveProgress() {
        const challengeProgress = {};
        Object.keys(this.challenges).forEach(key => {
            challengeProgress[key] = this.challenges[key].current;
        });

        this.storageManager.data.worldEvents = {
            completed: Array.from(this.completedEvents),
            challenges: challengeProgress
        };
        this.storageManager.save();
    }

    startEventChecker() {
        // Check for new events every minute
        this.checkInterval = setInterval(() => {
            this.checkForNewEvents();
            this.updateActiveEvents();
        }, 60000);

        // Initial check
        this.checkForNewEvents();
    }

    checkForNewEvents() {
        // Random chance to spawn events
        Object.entries(this.eventTypes).forEach(([type, event]) => {
            if (Math.random() < event.spawnRate / 60) {
                this.startEvent(type);
            }
        });
    }

    updateActiveEvents() {
        const now = Date.now();
        this.activeEvents = this.activeEvents.filter(event => {
            if (now > event.endTime) {
                this.onEventEnd(event);
                return false;
            }
            return true;
        });

        this.renderEvents();
    }

    startEvent(type) {
        const eventType = this.eventTypes[type];
        if (!eventType) return;

        // Check if event is already active
        if (this.activeEvents.some(e => e.type === type)) return;

        const event = {
            id: `${type}_${Date.now()}`,
            type,
            ...eventType,
            startTime: Date.now(),
            endTime: Date.now() + eventType.duration,
            progress: 0,
            target: this.getEventTarget(type)
        };

        this.activeEvents.push(event);
        this.showEventNotification(event, 'start');
        this.renderEvents();

        return event;
    }

    getEventTarget(type) {
        switch (type) {
            case 'meteorShower': return 10;
            case 'treasureRush': return 15;
            case 'mysteryZone': return 1;
            default: return 0;
        }
    }

    onEventEnd(event) {
        this.completedEvents.add(event.id);
        this.showEventNotification(event, 'end');

        // Award completion rewards if target met
        if (event.target && event.progress >= event.target) {
            this.awardEventRewards(event);
        }

        this.saveProgress();
    }

    awardEventRewards(event) {
        if (this.gameEngine && event.rewards) {
            if (event.rewards.xp) {
                this.gameEngine.addXP(event.rewards.xp, 'event');
            }

            if (event.rewards.items) {
                Object.entries(event.rewards.items).forEach(([item, count]) => {
                    for (let i = 0; i < count; i++) {
                        this.gameEngine.collectItem({ type: item, rarity: 'event' });
                    }
                });
            }
        }

        this.showNotification(`🎉 Event Complete! +${event.rewards.xp} XP`);
    }

    showEventNotification(event, type) {
        const notification = document.createElement('div');
        notification.className = `event-notification ${event.rarity}`;

        if (type === 'start') {
            notification.innerHTML = `
                <div class="event-notif-icon">${event.icon}</div>
                <div class="event-notif-info">
                    <div class="event-notif-title">${event.name} Started!</div>
                    <div class="event-notif-desc">${event.description}</div>
                </div>
            `;
        } else {
            notification.innerHTML = `
                <div class="event-notif-icon">${event.icon}</div>
                <div class="event-notif-info">
                    <div class="event-notif-title">${event.name} Ended</div>
                    <div class="event-notif-desc">Progress: ${event.progress}/${event.target || '∞'}</div>
                </div>
            `;
        }

        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 4000);
    }

    updateEventProgress(eventType, amount = 1) {
        this.activeEvents.forEach(event => {
            if (event.type === eventType && event.target) {
                event.progress = Math.min(event.progress + amount, event.target);
            }
        });
        this.renderEvents();
    }

    updateChallengeProgress(type, amount) {
        if (this.challenges[type]) {
            this.challenges[type].current = Math.min(
                this.challenges[type].current + amount,
                this.challenges[type].target
            );

            // Check completion
            if (this.challenges[type].current >= this.challenges[type].target) {
                this.completeChallenge(type);
            }

            this.saveProgress();
            this.renderEvents();
        }
    }

    completeChallenge(type) {
        const challenge = this.challenges[type];
        this.showNotification(`🏆 Challenge Complete: ${challenge.name}!`);
        this.awardEventRewards({ rewards: challenge.rewards });

        // Reset for next round
        challenge.current = 0;
        challenge.target = Math.floor(challenge.target * 1.5);
    }

    isEventActive(type) {
        return this.activeEvents.some(e => e.type === type);
    }

    getActiveEventMultiplier() {
        let multiplier = 1;

        if (this.isEventActive('doubleTrouble')) multiplier *= 2;
        if (this.isEventActive('luckyHour')) multiplier *= 1.5;

        return multiplier;
    }

    renderEvents() {
        // Active events
        const activeList = document.getElementById('active-events-list');
        if (!activeList) return;

        if (this.activeEvents.length === 0) {
            activeList.innerHTML = `
                <div class="no-events">No active events. Keep exploring!</div>
            `;
        } else {
            activeList.innerHTML = this.activeEvents.map(event => {
                const remaining = Math.max(0, event.endTime - Date.now());
                const minutes = Math.floor(remaining / 60000);
                const seconds = Math.floor((remaining % 60000) / 1000);
                const progressPercent = event.target ? (event.progress / event.target) * 100 : 100;

                return `
                    <div class="event-card ${event.rarity}">
                        <div class="event-header">
                            <span class="event-icon">${event.icon}</span>
                            <span class="event-name">${event.name}</span>
                            <span class="event-timer">${minutes}:${seconds.toString().padStart(2, '0')}</span>
                        </div>
                        <div class="event-desc">${event.description}</div>
                        ${event.target ? `
                            <div class="event-progress">
                                <div class="event-progress-bar" style="width: ${progressPercent}%"></div>
                            </div>
                            <div class="event-progress-text">${event.progress}/${event.target}</div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        }

        // Challenges
        const challengesList = document.getElementById('challenges-list');
        if (challengesList) {
            challengesList.innerHTML = Object.entries(this.challenges).map(([key, challenge]) => {
                const progressPercent = (challenge.current / challenge.target) * 100;
                return `
                    <div class="challenge-card">
                        <div class="challenge-header">
                            <span class="challenge-icon">${challenge.icon}</span>
                            <span class="challenge-name">${challenge.name}</span>
                        </div>
                        <div class="challenge-desc">${challenge.description}</div>
                        <div class="challenge-progress">
                            <div class="challenge-progress-bar" style="width: ${progressPercent}%"></div>
                        </div>
                        <div class="challenge-progress-text">
                            ${challenge.current.toLocaleString()}/${challenge.target.toLocaleString()}
                        </div>
                    </div>
                `;
            }).join('');
        }
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
        this.renderEvents();
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

    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }
}
