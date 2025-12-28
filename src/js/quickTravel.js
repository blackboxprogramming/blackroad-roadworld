// Quick Travel System for RoadWorld
// Allows instant teleportation to saved locations

export class QuickTravel {
    constructor(mapManager, gameEngine, storageManager) {
        this.mapManager = mapManager;
        this.gameEngine = gameEngine;
        this.storageManager = storageManager;
        this.panelElement = null;
        this.isVisible = false;

        // Quick travel cooldown
        this.lastTravelTime = 0;
        this.cooldownDuration = 30000; // 30 seconds
    }

    init() {
        this.createPanel();
        console.log('🚀 Quick Travel initialized');
    }

    createPanel() {
        this.panelElement = document.createElement('div');
        this.panelElement.className = 'quick-travel-panel ui-overlay';
        this.panelElement.id = 'quick-travel-panel';
        this.panelElement.style.display = 'none';

        this.panelElement.innerHTML = `
            <div class="panel-header">
                <span>🚀 Quick Travel</span>
                <button class="panel-close" id="quick-travel-close">✕</button>
            </div>
            <div class="panel-content quick-travel-content">
                <div class="quick-travel-cooldown" id="travel-cooldown" style="display: none;">
                    <div class="cooldown-text">Cooldown: <span id="cooldown-timer">0s</span></div>
                    <div class="cooldown-bar">
                        <div class="cooldown-fill" id="cooldown-fill"></div>
                    </div>
                </div>
                <div class="quick-travel-sections">
                    <div class="quick-travel-section">
                        <h4>📍 Saved Locations</h4>
                        <div class="travel-list" id="saved-travel-list"></div>
                    </div>
                    <div class="quick-travel-section">
                        <h4>🌍 Famous Landmarks</h4>
                        <div class="travel-list" id="landmarks-list"></div>
                    </div>
                    <div class="quick-travel-section">
                        <h4>🎲 Random Destination</h4>
                        <button class="travel-random-btn" id="random-travel">
                            🎲 Teleport Somewhere Random
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.panelElement);
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('quick-travel-close').addEventListener('click', () => {
            this.hide();
        });

        document.getElementById('random-travel').addEventListener('click', () => {
            this.travelToRandom();
        });
    }

    renderLocations() {
        // Render saved locations
        const savedLocations = this.storageManager.getSavedLocations();
        const savedList = document.getElementById('saved-travel-list');

        if (savedLocations.length === 0) {
            savedList.innerHTML = `
                <div class="travel-empty">
                    No saved locations yet.<br>
                    Save locations using the 💾 button!
                </div>
            `;
        } else {
            savedList.innerHTML = savedLocations.map(loc => `
                <button class="travel-btn" data-lat="${loc.lat}" data-lng="${loc.lng}" data-zoom="${loc.zoom}">
                    <span class="travel-icon">📍</span>
                    <span class="travel-name">${loc.name}</span>
                    <span class="travel-coords">${loc.lat.toFixed(2)}°, ${loc.lng.toFixed(2)}°</span>
                </button>
            `).join('');
        }

        // Render landmarks
        const landmarks = [
            { name: 'Times Square, NYC', lat: 40.7580, lng: -73.9855, icon: '🗽' },
            { name: 'Eiffel Tower, Paris', lat: 48.8584, lng: 2.2945, icon: '🗼' },
            { name: 'Big Ben, London', lat: 51.5007, lng: -0.1246, icon: '🇬🇧' },
            { name: 'Shibuya, Tokyo', lat: 35.6595, lng: 139.7004, icon: '🗾' },
            { name: 'Colosseum, Rome', lat: 41.8902, lng: 12.4922, icon: '🏛️' },
            { name: 'Sydney Opera House', lat: -33.8568, lng: 151.2153, icon: '🎭' },
            { name: 'Machu Picchu, Peru', lat: -13.1631, lng: -72.5450, icon: '🏔️' },
            { name: 'Pyramids, Egypt', lat: 29.9792, lng: 31.1342, icon: '🏜️' },
            { name: 'Taj Mahal, India', lat: 27.1751, lng: 78.0421, icon: '🕌' },
            { name: 'Grand Canyon, USA', lat: 36.1069, lng: -112.1129, icon: '🏜️' }
        ];

        const landmarksList = document.getElementById('landmarks-list');
        landmarksList.innerHTML = landmarks.map(loc => `
            <button class="travel-btn" data-lat="${loc.lat}" data-lng="${loc.lng}" data-zoom="17">
                <span class="travel-icon">${loc.icon}</span>
                <span class="travel-name">${loc.name}</span>
            </button>
        `).join('');

        // Add click handlers
        this.panelElement.querySelectorAll('.travel-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const lat = parseFloat(btn.dataset.lat);
                const lng = parseFloat(btn.dataset.lng);
                const zoom = parseFloat(btn.dataset.zoom) || 17;
                this.travelTo([lng, lat], zoom);
            });
        });

        // Update cooldown display
        this.updateCooldown();
    }

    canTravel() {
        const now = Date.now();
        return now - this.lastTravelTime >= this.cooldownDuration;
    }

    getCooldownRemaining() {
        const elapsed = Date.now() - this.lastTravelTime;
        return Math.max(0, this.cooldownDuration - elapsed);
    }

    updateCooldown() {
        const cooldownEl = document.getElementById('travel-cooldown');
        const remaining = this.getCooldownRemaining();

        if (remaining > 0) {
            cooldownEl.style.display = 'block';
            document.getElementById('cooldown-timer').textContent =
                `${Math.ceil(remaining / 1000)}s`;
            document.getElementById('cooldown-fill').style.width =
                `${(remaining / this.cooldownDuration) * 100}%`;

            // Disable buttons
            this.panelElement.querySelectorAll('.travel-btn, .travel-random-btn').forEach(btn => {
                btn.disabled = true;
                btn.classList.add('disabled');
            });
        } else {
            cooldownEl.style.display = 'none';

            // Enable buttons
            this.panelElement.querySelectorAll('.travel-btn, .travel-random-btn').forEach(btn => {
                btn.disabled = false;
                btn.classList.remove('disabled');
            });
        }
    }

    travelTo(lngLat, zoom = 17) {
        if (!this.canTravel()) {
            this.showNotification('Quick travel on cooldown!');
            return false;
        }

        // Start travel animation
        this.showTravelAnimation();

        setTimeout(() => {
            // Update map position
            this.mapManager.flyTo({
                center: lngLat,
                zoom: zoom,
                pitch: 60,
                bearing: Math.random() * 60 - 30,
                duration: 2000
            });

            // Update player position
            if (this.gameEngine && this.gameEngine.player) {
                this.gameEngine.player.position = lngLat;
                this.gameEngine.savePlayer();

                // Update avatar
                if (window.app && window.app.playerAvatar) {
                    window.app.playerAvatar.updatePosition(lngLat);
                }
            }

            // Start cooldown
            this.lastTravelTime = Date.now();

            // Close panel
            this.hide();

            this.showNotification('Teleported!');
        }, 500);

        return true;
    }

    travelToRandom() {
        // Generate random location on land (approximation)
        const landCoords = [
            { lat: [25, 50], lng: [-125, -70] },  // North America
            { lat: [35, 60], lng: [-10, 40] },    // Europe
            { lat: [20, 45], lng: [100, 145] },   // Asia
            { lat: [-35, -10], lng: [115, 155] }, // Australia
            { lat: [-55, 5], lng: [-80, -35] },   // South America
            { lat: [-35, 35], lng: [15, 50] }     // Africa
        ];

        const region = landCoords[Math.floor(Math.random() * landCoords.length)];
        const lat = region.lat[0] + Math.random() * (region.lat[1] - region.lat[0]);
        const lng = region.lng[0] + Math.random() * (region.lng[1] - region.lng[0]);

        this.travelTo([lng, lat], 14);
    }

    showTravelAnimation() {
        const overlay = document.createElement('div');
        overlay.className = 'travel-animation';
        overlay.innerHTML = `
            <div class="travel-flash"></div>
            <div class="travel-text">TELEPORTING...</div>
        `;
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 500);
        }, 1000);
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    show() {
        this.isVisible = true;
        this.panelElement.style.display = 'block';
        this.renderLocations();

        // Start cooldown update loop
        this.cooldownInterval = setInterval(() => this.updateCooldown(), 1000);
    }

    hide() {
        this.isVisible = false;
        this.panelElement.style.display = 'none';

        if (this.cooldownInterval) {
            clearInterval(this.cooldownInterval);
        }
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}
