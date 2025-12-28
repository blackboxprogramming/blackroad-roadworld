// Treasure Hunt System for RoadWorld
// Mystery quests and treasure hunts across the map

export class TreasureHunt {
    constructor(mapManager, gameEngine, storageManager) {
        this.mapManager = mapManager;
        this.gameEngine = gameEngine;
        this.storageManager = storageManager;

        this.activeHunt = null;
        this.completedHunts = [];
        this.huntMarkers = [];
        this.panelElement = null;
        this.isVisible = false;

        // Treasure hunt templates
        this.huntTemplates = {
            worldWonder: {
                id: 'worldWonder',
                name: 'Seven Wonders Quest',
                icon: '🏛️',
                description: 'Visit the Seven Wonders of the World!',
                rarity: 'legendary',
                waypoints: [
                    { name: 'Great Pyramid', lat: 29.9792, lng: 31.1342, icon: '🏜️' },
                    { name: 'Colosseum', lat: 41.8902, lng: 12.4922, icon: '🏟️' },
                    { name: 'Machu Picchu', lat: -13.1631, lng: -72.5450, icon: '🏔️' },
                    { name: 'Taj Mahal', lat: 27.1751, lng: 78.0421, icon: '🕌' },
                    { name: 'Great Wall', lat: 40.4319, lng: 116.5704, icon: '🧱' },
                    { name: 'Christ the Redeemer', lat: -22.9519, lng: -43.2105, icon: '✝️' },
                    { name: 'Petra', lat: 30.3285, lng: 35.4444, icon: '🏺' }
                ],
                rewards: { xp: 5000, items: { trophies: 10, gems: 20 } }
            },
            capitalCrawl: {
                id: 'capitalCrawl',
                name: 'Capital Explorer',
                icon: '🏛️',
                description: 'Visit 5 major world capitals!',
                rarity: 'epic',
                waypoints: [
                    { name: 'Washington D.C.', lat: 38.8951, lng: -77.0364, icon: '🇺🇸' },
                    { name: 'London', lat: 51.5074, lng: -0.1278, icon: '🇬🇧' },
                    { name: 'Tokyo', lat: 35.6762, lng: 139.6503, icon: '🇯🇵' },
                    { name: 'Paris', lat: 48.8566, lng: 2.3522, icon: '🇫🇷' },
                    { name: 'Beijing', lat: 39.9042, lng: 116.4074, icon: '🇨🇳' }
                ],
                rewards: { xp: 3000, items: { trophies: 5, gems: 10 } }
            },
            naturePilgrimage: {
                id: 'naturePilgrimage',
                name: 'Nature Pilgrimage',
                icon: '🌲',
                description: 'Explore natural wonders!',
                rarity: 'epic',
                waypoints: [
                    { name: 'Grand Canyon', lat: 36.1069, lng: -112.1129, icon: '🏜️' },
                    { name: 'Victoria Falls', lat: -17.9243, lng: 25.8572, icon: '💧' },
                    { name: 'Mount Everest', lat: 27.9881, lng: 86.9250, icon: '🏔️' },
                    { name: 'Amazon River', lat: -3.4653, lng: -62.2159, icon: '🌿' },
                    { name: 'Great Barrier Reef', lat: -18.2871, lng: 147.6992, icon: '🐠' }
                ],
                rewards: { xp: 2500, items: { gems: 8, stars: 15 } }
            },
            mysteryIslands: {
                id: 'mysteryIslands',
                name: 'Island Mysteries',
                icon: '🏝️',
                description: 'Discover mysterious islands!',
                rarity: 'rare',
                waypoints: [
                    { name: 'Easter Island', lat: -27.1127, lng: -109.3497, icon: '🗿' },
                    { name: 'Bermuda', lat: 32.3078, lng: -64.7505, icon: '🔺' },
                    { name: 'Iceland', lat: 64.9631, lng: -19.0208, icon: '❄️' },
                    { name: 'Galapagos', lat: -0.9538, lng: -90.9656, icon: '🐢' }
                ],
                rewards: { xp: 2000, items: { keys: 5, gems: 5 } }
            },
            urbanExplorer: {
                id: 'urbanExplorer',
                name: 'Urban Explorer',
                icon: '🌆',
                description: 'Visit famous city landmarks!',
                rarity: 'common',
                waypoints: [
                    { name: 'Times Square', lat: 40.7580, lng: -73.9855, icon: '🗽' },
                    { name: 'Shibuya Crossing', lat: 35.6595, lng: 139.7004, icon: '🚶' },
                    { name: 'Champs-Élysées', lat: 48.8698, lng: 2.3075, icon: '🗼' }
                ],
                rewards: { xp: 1000, items: { stars: 10 } }
            }
        };

        // Proximity threshold (in meters)
        this.proximityThreshold = 500;
    }

    init() {
        this.createPanel();
        this.loadProgress();

        console.log('🗺️ Treasure Hunt System initialized');
    }

    createPanel() {
        this.panelElement = document.createElement('div');
        this.panelElement.className = 'treasure-hunt-panel ui-overlay';
        this.panelElement.id = 'treasure-hunt-panel';
        this.panelElement.style.display = 'none';

        this.panelElement.innerHTML = `
            <div class="panel-header">
                <span>🗺️ Treasure Hunts</span>
                <button class="panel-close" id="hunt-close">✕</button>
            </div>
            <div class="panel-content hunt-content">
                <div class="hunt-section" id="active-hunt-section">
                    <h4>🎯 Active Hunt</h4>
                    <div class="active-hunt-display" id="active-hunt-display"></div>
                </div>
                <div class="hunt-section">
                    <h4>📜 Available Hunts</h4>
                    <div class="hunt-list" id="hunt-list"></div>
                </div>
                <div class="hunt-section">
                    <h4>🏆 Completed</h4>
                    <div class="completed-hunts" id="completed-hunts"></div>
                </div>
            </div>
        `;

        document.body.appendChild(this.panelElement);
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('hunt-close').addEventListener('click', () => {
            this.hide();
        });
    }

    loadProgress() {
        const saved = this.storageManager.data.treasureHunts || {};
        this.completedHunts = saved.completed || [];

        if (saved.active) {
            this.activeHunt = saved.active;
            this.updateMarkers();
        }
    }

    saveProgress() {
        this.storageManager.data.treasureHunts = {
            completed: this.completedHunts,
            active: this.activeHunt
        };
        this.storageManager.save();
    }

    startHunt(huntId) {
        const template = this.huntTemplates[huntId];
        if (!template) return;

        if (this.completedHunts.includes(huntId)) {
            this.showNotification('You have already completed this hunt!');
            return;
        }

        this.activeHunt = {
            ...template,
            startTime: Date.now(),
            visitedWaypoints: [],
            currentWaypoint: 0
        };

        this.updateMarkers();
        this.saveProgress();
        this.renderPanel();

        this.showNotification(`🗺️ Started: ${template.name}`);
    }

    abandonHunt() {
        this.clearMarkers();
        this.activeHunt = null;
        this.saveProgress();
        this.renderPanel();
    }

    updateMarkers() {
        this.clearMarkers();

        if (!this.activeHunt) return;

        this.activeHunt.waypoints.forEach((wp, index) => {
            const isVisited = this.activeHunt.visitedWaypoints.includes(index);
            const isCurrent = index === this.activeHunt.currentWaypoint;

            const el = document.createElement('div');
            el.className = `hunt-marker ${isVisited ? 'visited' : ''} ${isCurrent ? 'current' : ''}`;
            el.innerHTML = `
                <div class="hunt-marker-icon">${wp.icon}</div>
                <div class="hunt-marker-number">${index + 1}</div>
                ${isVisited ? '<div class="hunt-marker-check">✓</div>' : ''}
            `;

            const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
                .setLngLat([wp.lng, wp.lat])
                .addTo(this.mapManager.map);

            this.huntMarkers.push(marker);
        });
    }

    clearMarkers() {
        this.huntMarkers.forEach(marker => marker.remove());
        this.huntMarkers = [];
    }

    checkWaypointProximity(playerLngLat) {
        if (!this.activeHunt) return;

        this.activeHunt.waypoints.forEach((wp, index) => {
            if (this.activeHunt.visitedWaypoints.includes(index)) return;

            const distance = this.calculateDistance(
                playerLngLat[1], playerLngLat[0],
                wp.lat, wp.lng
            );

            if (distance <= this.proximityThreshold) {
                this.visitWaypoint(index);
            }
        });
    }

    visitWaypoint(index) {
        if (!this.activeHunt || this.activeHunt.visitedWaypoints.includes(index)) return;

        const wp = this.activeHunt.waypoints[index];
        this.activeHunt.visitedWaypoints.push(index);

        // Find next unvisited waypoint
        for (let i = 0; i < this.activeHunt.waypoints.length; i++) {
            if (!this.activeHunt.visitedWaypoints.includes(i)) {
                this.activeHunt.currentWaypoint = i;
                break;
            }
        }

        this.showNotification(`📍 Discovered: ${wp.name}!`);

        // Award partial XP
        const partialXP = Math.floor(this.activeHunt.rewards.xp / this.activeHunt.waypoints.length);
        if (this.gameEngine) {
            this.gameEngine.addXP(partialXP, 'exploration');
        }

        // Check completion
        if (this.activeHunt.visitedWaypoints.length === this.activeHunt.waypoints.length) {
            this.completeHunt();
        } else {
            this.updateMarkers();
            this.saveProgress();
        }
    }

    completeHunt() {
        const hunt = this.activeHunt;
        this.completedHunts.push(hunt.id);

        // Award remaining rewards
        if (this.gameEngine) {
            this.gameEngine.addXP(Math.floor(hunt.rewards.xp / 2), 'quest');

            if (hunt.rewards.items) {
                Object.entries(hunt.rewards.items).forEach(([type, count]) => {
                    for (let i = 0; i < count; i++) {
                        this.gameEngine.collectItem({ type, rarity: 'quest' });
                    }
                });
            }
        }

        this.showCompletionScreen(hunt);
        this.clearMarkers();
        this.activeHunt = null;
        this.saveProgress();
        this.renderPanel();
    }

    showCompletionScreen(hunt) {
        const overlay = document.createElement('div');
        overlay.className = 'hunt-complete-overlay';
        overlay.innerHTML = `
            <div class="hunt-complete-content">
                <div class="hunt-complete-icon">🏆</div>
                <div class="hunt-complete-title">Quest Complete!</div>
                <div class="hunt-complete-name">${hunt.name}</div>
                <div class="hunt-complete-rewards">
                    <div class="reward-xp">+${hunt.rewards.xp} XP</div>
                    ${hunt.rewards.items ? `
                        <div class="reward-items">
                            ${Object.entries(hunt.rewards.items).map(([type, count]) =>
                                `<span>${this.getItemIcon(type)} x${count}</span>`
                            ).join('')}
                        </div>
                    ` : ''}
                </div>
                <button class="hunt-complete-btn" id="hunt-complete-close">Continue</button>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('hunt-complete-close').addEventListener('click', () => {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 500);
        });
    }

    getItemIcon(type) {
        const icons = { stars: '⭐', gems: '💎', trophies: '🏆', keys: '🗝️' };
        return icons[type] || '✨';
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000; // Earth's radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    flyToNextWaypoint() {
        if (!this.activeHunt) return;

        const wp = this.activeHunt.waypoints[this.activeHunt.currentWaypoint];
        this.mapManager.flyTo({
            center: [wp.lng, wp.lat],
            zoom: 16,
            pitch: 60,
            duration: 3000
        });
    }

    renderPanel() {
        // Active hunt
        const activeDisplay = document.getElementById('active-hunt-display');
        if (activeDisplay) {
            if (this.activeHunt) {
                const progress = this.activeHunt.visitedWaypoints.length;
                const total = this.activeHunt.waypoints.length;
                const currentWp = this.activeHunt.waypoints[this.activeHunt.currentWaypoint];

                activeDisplay.innerHTML = `
                    <div class="active-hunt-card ${this.activeHunt.rarity}">
                        <div class="hunt-header">
                            <span class="hunt-icon">${this.activeHunt.icon}</span>
                            <span class="hunt-name">${this.activeHunt.name}</span>
                        </div>
                        <div class="hunt-progress-info">
                            <div class="hunt-progress-bar">
                                <div class="hunt-progress-fill" style="width: ${(progress/total)*100}%"></div>
                            </div>
                            <div class="hunt-progress-text">${progress}/${total} waypoints</div>
                        </div>
                        <div class="hunt-current">
                            <div class="hunt-current-label">Next Destination:</div>
                            <div class="hunt-current-name">${currentWp.icon} ${currentWp.name}</div>
                        </div>
                        <div class="hunt-actions">
                            <button class="hunt-fly-btn" id="fly-to-waypoint">🚀 Fly There</button>
                            <button class="hunt-abandon-btn" id="abandon-hunt">Abandon</button>
                        </div>
                    </div>
                `;

                document.getElementById('fly-to-waypoint')?.addEventListener('click', () => {
                    this.flyToNextWaypoint();
                });

                document.getElementById('abandon-hunt')?.addEventListener('click', () => {
                    if (confirm('Abandon this treasure hunt?')) {
                        this.abandonHunt();
                    }
                });
            } else {
                activeDisplay.innerHTML = `
                    <div class="no-active-hunt">No active hunt. Choose one below!</div>
                `;
            }
        }

        // Available hunts
        const huntList = document.getElementById('hunt-list');
        if (huntList) {
            const available = Object.entries(this.huntTemplates)
                .filter(([id]) => !this.completedHunts.includes(id) && this.activeHunt?.id !== id);

            huntList.innerHTML = available.map(([id, hunt]) => `
                <div class="hunt-card ${hunt.rarity}" data-hunt="${id}">
                    <div class="hunt-card-icon">${hunt.icon}</div>
                    <div class="hunt-card-info">
                        <div class="hunt-card-name">${hunt.name}</div>
                        <div class="hunt-card-desc">${hunt.description}</div>
                        <div class="hunt-card-meta">
                            <span>${hunt.waypoints.length} waypoints</span>
                            <span>+${hunt.rewards.xp} XP</span>
                        </div>
                    </div>
                    <button class="hunt-start-btn">Start</button>
                </div>
            `).join('') || '<div class="no-hunts">All hunts started or completed!</div>';

            huntList.querySelectorAll('.hunt-start-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const huntId = e.target.closest('.hunt-card').dataset.hunt;
                    if (!this.activeHunt) {
                        this.startHunt(huntId);
                    } else {
                        this.showNotification('Complete or abandon current hunt first!');
                    }
                });
            });
        }

        // Completed hunts
        const completedList = document.getElementById('completed-hunts');
        if (completedList) {
            if (this.completedHunts.length === 0) {
                completedList.innerHTML = '<div class="no-completed">No completed hunts yet.</div>';
            } else {
                completedList.innerHTML = this.completedHunts.map(id => {
                    const hunt = this.huntTemplates[id];
                    return hunt ? `
                        <div class="completed-hunt-item ${hunt.rarity}">
                            <span class="completed-icon">${hunt.icon}</span>
                            <span class="completed-name">${hunt.name}</span>
                            <span class="completed-check">✓</span>
                        </div>
                    ` : '';
                }).join('');
            }
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
