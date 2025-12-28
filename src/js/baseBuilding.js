/**
 * Base Building System - Create your own locations
 * RoadWorld v7.0
 */

export class BaseBuilding {
    constructor(game) {
        this.game = game;
        this.bases = JSON.parse(localStorage.getItem('playerBases') || '[]');
        this.currentBase = null;
        this.maxBases = 5;
        this.baseMarkers = new Map();

        this.buildingTypes = {
            home: {
                name: 'Home Base',
                icon: '🏠',
                cost: { stars: 100, gems: 10 },
                description: 'Your main headquarters. Provides daily bonuses.',
                bonuses: { dailyXP: 50, storage: 100 },
                upgrades: ['cozy', 'spacious', 'mansion']
            },
            outpost: {
                name: 'Outpost',
                icon: '🏕️',
                cost: { stars: 50, gems: 5 },
                description: 'A small camp for quick rest stops.',
                bonuses: { restoreEnergy: 25, quickTravel: true },
                upgrades: ['watchtower', 'fortress']
            },
            workshop: {
                name: 'Workshop',
                icon: '🔧',
                cost: { stars: 150, gems: 20 },
                description: 'Craft items faster and unlock special recipes.',
                bonuses: { craftSpeed: 1.5, specialRecipes: true },
                upgrades: ['factory', 'laboratory']
            },
            garden: {
                name: 'Garden',
                icon: '🌻',
                cost: { stars: 75, gems: 8 },
                description: 'Grow resources passively over time.',
                bonuses: { passiveStars: 5, passiveGems: 1 },
                upgrades: ['greenhouse', 'paradise']
            },
            observatory: {
                name: 'Observatory',
                icon: '🔭',
                cost: { stars: 200, gems: 30 },
                description: 'See items and events from further away.',
                bonuses: { visionRange: 2.0, eventNotify: true },
                upgrades: ['satellite', 'spacestation']
            },
            tavern: {
                name: 'Tavern',
                icon: '🍺',
                cost: { stars: 125, gems: 15 },
                description: 'Meet other players and get quests.',
                bonuses: { socialXP: 1.5, questUnlock: true },
                upgrades: ['inn', 'resort']
            },
            vault: {
                name: 'Vault',
                icon: '🏦',
                cost: { stars: 250, gems: 40 },
                description: 'Safely store your treasures with interest.',
                bonuses: { storageBonus: 200, dailyInterest: 0.01 },
                upgrades: ['bank', 'treasury']
            },
            monument: {
                name: 'Monument',
                icon: '🗿',
                cost: { stars: 500, gems: 100 },
                description: 'A landmark visible to all players.',
                bonuses: { famePoints: 100, globalVisibility: true },
                upgrades: ['landmark', 'wonder']
            }
        };

        this.decorations = {
            flag: { name: 'Flag', icon: '🚩', cost: { stars: 10 } },
            fountain: { name: 'Fountain', icon: '⛲', cost: { stars: 30 } },
            statue: { name: 'Statue', icon: '🗽', cost: { stars: 50 } },
            tree: { name: 'Tree', icon: '🌳', cost: { stars: 15 } },
            flowers: { name: 'Flowers', icon: '🌸', cost: { stars: 8 } },
            lamp: { name: 'Lamp Post', icon: '🏮', cost: { stars: 12 } },
            bench: { name: 'Bench', icon: '🪑', cost: { stars: 20 } },
            mailbox: { name: 'Mailbox', icon: '📫', cost: { stars: 10 } }
        };

        this.init();
    }

    init() {
        this.createUI();
        this.loadBases();
    }

    createUI() {
        const panel = document.createElement('div');
        panel.id = 'base-panel';
        panel.className = 'game-panel base-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <h3>🏗️ Base Building</h3>
                <button class="close-btn" id="close-base">×</button>
            </div>
            <div class="panel-content">
                <div class="base-tabs">
                    <button class="base-tab active" data-tab="my-bases">My Bases</button>
                    <button class="base-tab" data-tab="build-new">Build New</button>
                    <button class="base-tab" data-tab="decorations">Decorations</button>
                </div>

                <div class="base-tab-content active" id="my-bases-tab">
                    <div class="bases-count">
                        <span id="base-count">0</span>/<span>${this.maxBases}</span> Bases
                    </div>
                    <div id="bases-list" class="bases-list"></div>
                </div>

                <div class="base-tab-content" id="build-new-tab">
                    <div class="build-instructions">
                        <p>📍 Build at your current location</p>
                        <p class="location-display">Location: <span id="build-location">Loading...</span></p>
                    </div>
                    <div id="building-options" class="building-options"></div>
                </div>

                <div class="base-tab-content" id="decorations-tab">
                    <div class="decoration-instructions">
                        <p>Select a base first, then add decorations</p>
                        <select id="decoration-base-select">
                            <option value="">Select a base...</option>
                        </select>
                    </div>
                    <div id="decoration-options" class="decoration-options"></div>
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        // Base detail modal
        const detailModal = document.createElement('div');
        detailModal.id = 'base-detail-modal';
        detailModal.className = 'base-detail-modal hidden';
        detailModal.innerHTML = `
            <div class="modal-content">
                <div id="base-detail-content"></div>
                <div class="modal-actions">
                    <button id="teleport-to-base" class="action-btn">🌀 Teleport</button>
                    <button id="upgrade-base" class="action-btn">⬆️ Upgrade</button>
                    <button id="demolish-base" class="action-btn danger">🗑️ Demolish</button>
                    <button id="close-base-detail">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(detailModal);

        this.setupEventListeners();
        this.renderBuildingOptions();
        this.renderDecorationOptions();
    }

    setupEventListeners() {
        document.getElementById('close-base').addEventListener('click', () => {
            this.hidePanel();
        });

        document.querySelectorAll('.base-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.base-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.base-tab-content').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(`${e.target.dataset.tab}-tab`).classList.add('active');
            });
        });

        document.getElementById('close-base-detail').addEventListener('click', () => {
            this.hideDetailModal();
        });

        document.getElementById('teleport-to-base').addEventListener('click', () => {
            this.teleportToBase();
        });

        document.getElementById('upgrade-base').addEventListener('click', () => {
            this.upgradeBase();
        });

        document.getElementById('demolish-base').addEventListener('click', () => {
            this.demolishBase();
        });
    }

    showPanel() {
        document.getElementById('base-panel').classList.add('active');
        this.updateUI();
        this.updateBuildLocation();
    }

    hidePanel() {
        document.getElementById('base-panel').classList.remove('active');
    }

    updateBuildLocation() {
        if (this.game.currentPosition) {
            const lat = this.game.currentPosition.lat.toFixed(4);
            const lng = this.game.currentPosition.lng.toFixed(4);
            document.getElementById('build-location').textContent = `${lat}, ${lng}`;
        }
    }

    renderBuildingOptions() {
        const container = document.getElementById('building-options');

        container.innerHTML = Object.entries(this.buildingTypes).map(([key, building]) => `
            <div class="building-option" data-type="${key}">
                <div class="building-icon">${building.icon}</div>
                <div class="building-info">
                    <h4>${building.name}</h4>
                    <p>${building.description}</p>
                    <div class="building-cost">
                        <span>⭐ ${building.cost.stars}</span>
                        <span>💎 ${building.cost.gems}</span>
                    </div>
                </div>
                <button class="build-btn" onclick="window.baseBuilding.buildBase('${key}')">Build</button>
            </div>
        `).join('');
    }

    renderDecorationOptions() {
        const container = document.getElementById('decoration-options');

        container.innerHTML = Object.entries(this.decorations).map(([key, deco]) => `
            <div class="decoration-option" data-type="${key}">
                <span class="deco-icon">${deco.icon}</span>
                <span class="deco-name">${deco.name}</span>
                <span class="deco-cost">⭐ ${deco.cost.stars}</span>
                <button class="add-deco-btn" onclick="window.baseBuilding.addDecoration('${key}')">+</button>
            </div>
        `).join('');
    }

    updateUI() {
        document.getElementById('base-count').textContent = this.bases.length;
        this.renderBasesList();
        this.updateDecorationSelect();
    }

    renderBasesList() {
        const container = document.getElementById('bases-list');

        if (this.bases.length === 0) {
            container.innerHTML = `
                <div class="no-bases">
                    <p>You haven't built any bases yet!</p>
                    <p>Go to "Build New" to create your first base.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.bases.map((base, index) => {
            const building = this.buildingTypes[base.type];
            return `
                <div class="base-item" onclick="window.baseBuilding.showBaseDetail(${index})">
                    <div class="base-icon">${building.icon}</div>
                    <div class="base-info">
                        <h4>${base.name || building.name}</h4>
                        <p class="base-location">${base.location.lat.toFixed(3)}, ${base.location.lng.toFixed(3)}</p>
                        <div class="base-level">Level ${base.level}</div>
                    </div>
                    <div class="base-decorations">
                        ${(base.decorations || []).map(d => this.decorations[d]?.icon || '').join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    updateDecorationSelect() {
        const select = document.getElementById('decoration-base-select');
        select.innerHTML = `
            <option value="">Select a base...</option>
            ${this.bases.map((base, i) => {
                const building = this.buildingTypes[base.type];
                return `<option value="${i}">${building.icon} ${base.name || building.name}</option>`;
            }).join('')}
        `;
    }

    buildBase(type) {
        if (this.bases.length >= this.maxBases) {
            this.game.showNotification(`Maximum ${this.maxBases} bases allowed!`, 'warning');
            return;
        }

        if (!this.game.currentPosition) {
            this.game.showNotification('Location not available!', 'error');
            return;
        }

        const building = this.buildingTypes[type];
        const resources = this.game.getResources();

        if (resources.stars < building.cost.stars || resources.gems < building.cost.gems) {
            this.game.showNotification('Not enough resources!', 'warning');
            return;
        }

        // Check if too close to another base
        const tooClose = this.bases.some(base => {
            const distance = this.calculateDistance(
                this.game.currentPosition.lat,
                this.game.currentPosition.lng,
                base.location.lat,
                base.location.lng
            );
            return distance < 0.5; // 500 meters
        });

        if (tooClose) {
            this.game.showNotification('Too close to another base! (min 500m)', 'warning');
            return;
        }

        // Deduct resources
        this.game.spendResources(building.cost.stars, building.cost.gems);

        // Create base
        const newBase = {
            id: Date.now(),
            type: type,
            name: building.name,
            level: 1,
            location: {
                lat: this.game.currentPosition.lat,
                lng: this.game.currentPosition.lng
            },
            decorations: [],
            createdAt: Date.now(),
            lastVisit: Date.now()
        };

        this.bases.push(newBase);
        this.saveBases();
        this.createBaseMarker(newBase);

        this.game.showNotification(`${building.icon} ${building.name} built!`, 'success');
        this.updateUI();
    }

    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    showBaseDetail(index) {
        this.currentBase = this.bases[index];
        const base = this.currentBase;
        const building = this.buildingTypes[base.type];

        const content = document.getElementById('base-detail-content');
        content.innerHTML = `
            <div class="base-detail-header">
                <span class="detail-icon">${building.icon}</span>
                <div>
                    <input type="text" class="base-name-input" value="${base.name}"
                           onchange="window.baseBuilding.renameBase(${index}, this.value)">
                    <span class="base-type">${building.name} - Level ${base.level}</span>
                </div>
            </div>

            <div class="base-detail-location">
                📍 ${base.location.lat.toFixed(4)}, ${base.location.lng.toFixed(4)}
            </div>

            <div class="base-detail-bonuses">
                <h4>Active Bonuses</h4>
                ${Object.entries(building.bonuses).map(([key, value]) => `
                    <div class="bonus-row">
                        <span>${this.formatBonusName(key)}:</span>
                        <span class="bonus-value">${this.formatBonusValue(value)}</span>
                    </div>
                `).join('')}
            </div>

            <div class="base-detail-decorations">
                <h4>Decorations (${(base.decorations || []).length}/8)</h4>
                <div class="deco-display">
                    ${(base.decorations || []).map(d => `
                        <span class="deco-item">${this.decorations[d]?.icon || '❓'}</span>
                    `).join('') || '<span class="no-deco">No decorations yet</span>'}
                </div>
            </div>

            ${building.upgrades && base.level < building.upgrades.length ? `
                <div class="upgrade-preview">
                    <h4>Next Upgrade: ${building.upgrades[base.level - 1]}</h4>
                    <p>Cost: ⭐ ${building.cost.stars * (base.level + 1)} 💎 ${building.cost.gems * (base.level + 1)}</p>
                </div>
            ` : '<div class="max-level">✨ Maximum Level Reached!</div>'}
        `;

        document.getElementById('base-detail-modal').classList.remove('hidden');
    }

    hideDetailModal() {
        document.getElementById('base-detail-modal').classList.add('hidden');
        this.currentBase = null;
    }

    renameBase(index, newName) {
        this.bases[index].name = newName;
        this.saveBases();
        this.updateUI();
    }

    formatBonusName(key) {
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }

    formatBonusValue(value) {
        if (typeof value === 'boolean') return value ? '✓' : '✗';
        if (typeof value === 'number' && value < 10) return `${value}x`;
        return value;
    }

    teleportToBase() {
        if (!this.currentBase) return;

        this.game.showNotification(`🌀 Teleporting to ${this.currentBase.name}...`, 'info');

        if (this.game.map) {
            this.game.map.flyTo({
                center: [this.currentBase.location.lng, this.currentBase.location.lat],
                zoom: 16,
                duration: 2000
            });
        }

        this.currentBase.lastVisit = Date.now();
        this.saveBases();
        this.hideDetailModal();
    }

    upgradeBase() {
        if (!this.currentBase) return;

        const building = this.buildingTypes[this.currentBase.type];
        if (this.currentBase.level >= (building.upgrades?.length || 0) + 1) {
            this.game.showNotification('Base is already at maximum level!', 'warning');
            return;
        }

        const upgradeCost = {
            stars: building.cost.stars * (this.currentBase.level + 1),
            gems: building.cost.gems * (this.currentBase.level + 1)
        };

        const resources = this.game.getResources();
        if (resources.stars < upgradeCost.stars || resources.gems < upgradeCost.gems) {
            this.game.showNotification('Not enough resources to upgrade!', 'warning');
            return;
        }

        this.game.spendResources(upgradeCost.stars, upgradeCost.gems);
        this.currentBase.level++;
        this.saveBases();

        this.game.showNotification(`${building.icon} Upgraded to level ${this.currentBase.level}!`, 'success');
        this.showBaseDetail(this.bases.indexOf(this.currentBase));
        this.updateUI();
    }

    demolishBase() {
        if (!this.currentBase) return;

        if (!confirm(`Are you sure you want to demolish ${this.currentBase.name}? This cannot be undone!`)) {
            return;
        }

        const index = this.bases.indexOf(this.currentBase);
        this.removeBaseMarker(this.currentBase.id);
        this.bases.splice(index, 1);
        this.saveBases();

        this.game.showNotification('Base demolished!', 'info');
        this.hideDetailModal();
        this.updateUI();
    }

    addDecoration(type) {
        const selectEl = document.getElementById('decoration-base-select');
        const baseIndex = parseInt(selectEl.value);

        if (isNaN(baseIndex)) {
            this.game.showNotification('Please select a base first!', 'warning');
            return;
        }

        const base = this.bases[baseIndex];
        if ((base.decorations || []).length >= 8) {
            this.game.showNotification('Maximum 8 decorations per base!', 'warning');
            return;
        }

        const deco = this.decorations[type];
        const resources = this.game.getResources();

        if (resources.stars < deco.cost.stars) {
            this.game.showNotification('Not enough stars!', 'warning');
            return;
        }

        this.game.spendResources(deco.cost.stars, 0);

        if (!base.decorations) base.decorations = [];
        base.decorations.push(type);
        this.saveBases();

        this.game.showNotification(`${deco.icon} Added to ${base.name}!`, 'success');
        this.updateUI();
    }

    loadBases() {
        this.bases.forEach(base => {
            this.createBaseMarker(base);
        });
    }

    createBaseMarker(base) {
        if (!this.game.map) return;

        const building = this.buildingTypes[base.type];
        const el = document.createElement('div');
        el.className = 'base-marker';
        el.innerHTML = `<span class="base-marker-icon">${building.icon}</span>`;

        const marker = new maplibregl.Marker({ element: el })
            .setLngLat([base.location.lng, base.location.lat])
            .addTo(this.game.map);

        this.baseMarkers.set(base.id, marker);
    }

    removeBaseMarker(baseId) {
        const marker = this.baseMarkers.get(baseId);
        if (marker) {
            marker.remove();
            this.baseMarkers.delete(baseId);
        }
    }

    saveBases() {
        localStorage.setItem('playerBases', JSON.stringify(this.bases));
    }

    // Get combined bonuses from all bases
    getTotalBonuses() {
        const bonuses = {
            dailyXP: 0,
            storage: 0,
            craftSpeed: 1,
            visionRange: 1,
            passiveStars: 0,
            passiveGems: 0
        };

        this.bases.forEach(base => {
            const building = this.buildingTypes[base.type];
            Object.entries(building.bonuses).forEach(([key, value]) => {
                if (typeof value === 'number') {
                    if (key.includes('Speed') || key.includes('Range')) {
                        bonuses[key] = (bonuses[key] || 1) * value;
                    } else {
                        bonuses[key] = (bonuses[key] || 0) + (value * base.level);
                    }
                }
            });
        });

        return bonuses;
    }

    // Check if player is near any base
    checkNearbyBase() {
        if (!this.game.currentPosition) return null;

        for (const base of this.bases) {
            const distance = this.calculateDistance(
                this.game.currentPosition.lat,
                this.game.currentPosition.lng,
                base.location.lat,
                base.location.lng
            );

            if (distance < 0.1) { // Within 100 meters
                return base;
            }
        }

        return null;
    }
}

// Global reference
window.baseBuilding = null;
