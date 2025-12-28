/**
 * Vehicle System - Different transportation modes
 * RoadWorld v7.0
 */

export class VehicleSystem {
    constructor(game) {
        this.game = game;
        this.currentVehicle = localStorage.getItem('currentVehicle') || 'walking';
        this.unlockedVehicles = JSON.parse(localStorage.getItem('unlockedVehicles') || '["walking"]');
        this.vehicleStats = JSON.parse(localStorage.getItem('vehicleStats') || '{}');
        this.fuel = parseFloat(localStorage.getItem('vehicleFuel') || '100');
        this.maxFuel = 100;

        this.vehicles = {
            walking: {
                id: 'walking',
                name: 'Walking',
                icon: '🚶',
                description: 'Good old walking. Reliable and always available.',
                speedMultiplier: 1.0,
                xpMultiplier: 1.0,
                fuelConsumption: 0,
                unlockCost: { stars: 0, gems: 0 },
                rarity: 'common',
                category: 'basic'
            },
            running: {
                id: 'running',
                name: 'Running',
                icon: '🏃',
                description: 'Pick up the pace! Move faster but use more energy.',
                speedMultiplier: 1.5,
                xpMultiplier: 1.2,
                fuelConsumption: 1,
                unlockCost: { stars: 50, gems: 0 },
                rarity: 'common',
                category: 'basic'
            },
            bicycle: {
                id: 'bicycle',
                name: 'Bicycle',
                icon: '🚲',
                description: 'Eco-friendly and efficient transportation.',
                speedMultiplier: 2.0,
                xpMultiplier: 1.0,
                fuelConsumption: 0.5,
                unlockCost: { stars: 200, gems: 10 },
                rarity: 'uncommon',
                category: 'land'
            },
            skateboard: {
                id: 'skateboard',
                name: 'Skateboard',
                icon: '🛹',
                description: 'Ride in style with tricks bonus!',
                speedMultiplier: 1.8,
                xpMultiplier: 1.3,
                fuelConsumption: 0.3,
                unlockCost: { stars: 150, gems: 5 },
                rarity: 'uncommon',
                category: 'land',
                special: 'tricks'
            },
            scooter: {
                id: 'scooter',
                name: 'Electric Scooter',
                icon: '🛴',
                description: 'Modern and nimble city transport.',
                speedMultiplier: 2.2,
                xpMultiplier: 1.1,
                fuelConsumption: 1.5,
                unlockCost: { stars: 300, gems: 20 },
                rarity: 'uncommon',
                category: 'land'
            },
            motorcycle: {
                id: 'motorcycle',
                name: 'Motorcycle',
                icon: '🏍️',
                description: 'Feel the wind as you cruise at high speed.',
                speedMultiplier: 3.0,
                xpMultiplier: 1.0,
                fuelConsumption: 2.0,
                unlockCost: { stars: 500, gems: 50 },
                rarity: 'rare',
                category: 'land'
            },
            car: {
                id: 'car',
                name: 'Sports Car',
                icon: '🚗',
                description: 'Luxury speed and comfort.',
                speedMultiplier: 4.0,
                xpMultiplier: 0.9,
                fuelConsumption: 3.0,
                unlockCost: { stars: 1000, gems: 100 },
                rarity: 'rare',
                category: 'land'
            },
            hoverboard: {
                id: 'hoverboard',
                name: 'Hoverboard',
                icon: '🛸',
                description: 'Futuristic floating transport!',
                speedMultiplier: 2.5,
                xpMultiplier: 1.5,
                fuelConsumption: 2.0,
                unlockCost: { stars: 750, gems: 75 },
                rarity: 'epic',
                category: 'special',
                special: 'hover'
            },
            jetpack: {
                id: 'jetpack',
                name: 'Jetpack',
                icon: '🚀',
                description: 'Take to the skies! Ignore terrain.',
                speedMultiplier: 3.5,
                xpMultiplier: 1.3,
                fuelConsumption: 4.0,
                unlockCost: { stars: 1500, gems: 150 },
                rarity: 'epic',
                category: 'air',
                special: 'flight'
            },
            submarine: {
                id: 'submarine',
                name: 'Mini Submarine',
                icon: '🚤',
                description: 'Explore underwater areas!',
                speedMultiplier: 2.0,
                xpMultiplier: 1.8,
                fuelConsumption: 2.5,
                unlockCost: { stars: 800, gems: 80 },
                rarity: 'epic',
                category: 'water',
                special: 'underwater'
            },
            dragon: {
                id: 'dragon',
                name: 'Dragon Mount',
                icon: '🐉',
                description: 'Legendary dragon companion for ultimate travel!',
                speedMultiplier: 5.0,
                xpMultiplier: 2.0,
                fuelConsumption: 5.0,
                unlockCost: { stars: 5000, gems: 500 },
                rarity: 'legendary',
                category: 'special',
                special: 'flight'
            },
            unicorn: {
                id: 'unicorn',
                name: 'Unicorn',
                icon: '🦄',
                description: 'Magical unicorn with rainbow trails!',
                speedMultiplier: 4.0,
                xpMultiplier: 2.5,
                fuelConsumption: 3.0,
                unlockCost: { stars: 3000, gems: 300 },
                rarity: 'legendary',
                category: 'special',
                special: 'magic'
            },
            teleporter: {
                id: 'teleporter',
                name: 'Teleporter',
                icon: '⚡',
                description: 'Instant teleportation to visited locations!',
                speedMultiplier: 10.0,
                xpMultiplier: 0.5,
                fuelConsumption: 20.0,
                unlockCost: { stars: 10000, gems: 1000 },
                rarity: 'legendary',
                category: 'special',
                special: 'teleport'
            }
        };

        this.rarityColors = {
            common: '#9E9E9E',
            uncommon: '#4CAF50',
            rare: '#2196F3',
            epic: '#9C27B0',
            legendary: '#FFD700'
        };

        this.init();
    }

    init() {
        this.createUI();
        this.updateUI();
        this.startFuelRegeneration();
    }

    createUI() {
        const panel = document.createElement('div');
        panel.id = 'vehicle-panel';
        panel.className = 'game-panel vehicle-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <h3>🚗 Vehicles</h3>
                <button class="close-btn" id="close-vehicle">×</button>
            </div>
            <div class="panel-content">
                <div class="fuel-gauge">
                    <div class="fuel-label">⛽ Fuel</div>
                    <div class="fuel-bar">
                        <div class="fuel-fill" id="fuel-fill"></div>
                    </div>
                    <div class="fuel-text" id="fuel-text">100/100</div>
                </div>

                <div class="current-vehicle-display">
                    <span class="current-label">Current:</span>
                    <span id="current-vehicle-icon" class="current-icon">🚶</span>
                    <span id="current-vehicle-name" class="current-name">Walking</span>
                </div>

                <div class="vehicle-stats-display">
                    <div class="stat-item">
                        <span>Speed:</span>
                        <span id="vehicle-speed-stat">1.0x</span>
                    </div>
                    <div class="stat-item">
                        <span>XP Bonus:</span>
                        <span id="vehicle-xp-stat">1.0x</span>
                    </div>
                    <div class="stat-item">
                        <span>Fuel Use:</span>
                        <span id="vehicle-fuel-stat">0/min</span>
                    </div>
                </div>

                <div class="vehicle-categories">
                    <button class="cat-btn active" data-cat="all">All</button>
                    <button class="cat-btn" data-cat="basic">Basic</button>
                    <button class="cat-btn" data-cat="land">Land</button>
                    <button class="cat-btn" data-cat="air">Air</button>
                    <button class="cat-btn" data-cat="water">Water</button>
                    <button class="cat-btn" data-cat="special">Special</button>
                </div>

                <div id="vehicles-list" class="vehicles-list"></div>
            </div>
        `;
        document.body.appendChild(panel);

        // Vehicle widget
        const widget = document.createElement('div');
        widget.id = 'vehicle-widget';
        widget.className = 'vehicle-widget';
        widget.innerHTML = `
            <span id="widget-vehicle-icon">🚶</span>
            <div class="widget-fuel-mini">
                <div class="widget-fuel-fill" id="widget-fuel-fill"></div>
            </div>
        `;
        document.body.appendChild(widget);

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('close-vehicle').addEventListener('click', () => {
            this.hidePanel();
        });

        document.getElementById('vehicle-widget').addEventListener('click', () => {
            this.showPanel();
        });

        document.querySelectorAll('.cat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterVehicles(e.target.dataset.cat);
            });
        });
    }

    showPanel() {
        document.getElementById('vehicle-panel').classList.add('active');
        this.updateUI();
    }

    hidePanel() {
        document.getElementById('vehicle-panel').classList.remove('active');
    }

    filterVehicles(category) {
        this.updateVehiclesList(category);
    }

    updateUI() {
        this.updateFuelDisplay();
        this.updateCurrentVehicle();
        this.updateVehiclesList('all');
    }

    updateFuelDisplay() {
        const percentage = (this.fuel / this.maxFuel) * 100;
        document.getElementById('fuel-fill').style.width = `${percentage}%`;
        document.getElementById('fuel-text').textContent = `${Math.round(this.fuel)}/${this.maxFuel}`;
        document.getElementById('widget-fuel-fill').style.width = `${percentage}%`;

        // Color based on fuel level
        const fillEl = document.getElementById('fuel-fill');
        if (percentage <= 20) {
            fillEl.style.background = '#F44336';
        } else if (percentage <= 50) {
            fillEl.style.background = '#FF9800';
        } else {
            fillEl.style.background = '#4CAF50';
        }
    }

    updateCurrentVehicle() {
        const vehicle = this.vehicles[this.currentVehicle];
        document.getElementById('current-vehicle-icon').textContent = vehicle.icon;
        document.getElementById('current-vehicle-name').textContent = vehicle.name;
        document.getElementById('widget-vehicle-icon').textContent = vehicle.icon;

        document.getElementById('vehicle-speed-stat').textContent = `${vehicle.speedMultiplier}x`;
        document.getElementById('vehicle-xp-stat').textContent = `${vehicle.xpMultiplier}x`;
        document.getElementById('vehicle-fuel-stat').textContent = `${vehicle.fuelConsumption}/min`;
    }

    updateVehiclesList(category = 'all') {
        const container = document.getElementById('vehicles-list');
        let vehicles = Object.values(this.vehicles);

        if (category !== 'all') {
            vehicles = vehicles.filter(v => v.category === category);
        }

        container.innerHTML = vehicles.map(vehicle => {
            const unlocked = this.unlockedVehicles.includes(vehicle.id);
            const current = this.currentVehicle === vehicle.id;
            const stats = this.vehicleStats[vehicle.id] || { distance: 0, uses: 0 };

            return `
                <div class="vehicle-item ${unlocked ? 'unlocked' : 'locked'} ${current ? 'current' : ''}"
                     style="--rarity-color: ${this.rarityColors[vehicle.rarity]}">
                    <div class="vehicle-icon-container">
                        <span class="vehicle-icon">${unlocked ? vehicle.icon : '🔒'}</span>
                        ${vehicle.special ? `<span class="vehicle-special">${this.getSpecialIcon(vehicle.special)}</span>` : ''}
                    </div>
                    <div class="vehicle-info">
                        <h4>${vehicle.name}</h4>
                        <p>${vehicle.description}</p>
                        <div class="vehicle-mini-stats">
                            <span>🚀 ${vehicle.speedMultiplier}x</span>
                            <span>⭐ ${vehicle.xpMultiplier}x</span>
                            <span>⛽ ${vehicle.fuelConsumption}/min</span>
                        </div>
                        ${unlocked ? `
                            <div class="vehicle-usage">
                                Used: ${stats.uses} times | ${stats.distance.toFixed(1)} km
                            </div>
                        ` : `
                            <div class="vehicle-cost">
                                🌟 ${vehicle.unlockCost.stars} | 💎 ${vehicle.unlockCost.gems}
                            </div>
                        `}
                    </div>
                    <div class="vehicle-actions">
                        ${unlocked ? `
                            <button class="vehicle-btn ${current ? 'equipped' : ''}"
                                    onclick="window.vehicleSystem.selectVehicle('${vehicle.id}')"
                                    ${current ? 'disabled' : ''}>
                                ${current ? 'Equipped' : 'Use'}
                            </button>
                        ` : `
                            <button class="vehicle-btn unlock"
                                    onclick="window.vehicleSystem.unlockVehicle('${vehicle.id}')">
                                Unlock
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    }

    getSpecialIcon(special) {
        const icons = {
            tricks: '🎪',
            hover: '✨',
            flight: '🪽',
            underwater: '🫧',
            magic: '🌈',
            teleport: '⚡'
        };
        return icons[special] || '✨';
    }

    selectVehicle(vehicleId) {
        if (!this.unlockedVehicles.includes(vehicleId)) {
            this.game.showNotification('Vehicle not unlocked!', 'warning');
            return;
        }

        const vehicle = this.vehicles[vehicleId];
        if (vehicle.fuelConsumption > 0 && this.fuel <= 0) {
            this.game.showNotification('Not enough fuel! Wait for it to regenerate.', 'warning');
            return;
        }

        this.currentVehicle = vehicleId;
        localStorage.setItem('currentVehicle', vehicleId);

        // Initialize stats if needed
        if (!this.vehicleStats[vehicleId]) {
            this.vehicleStats[vehicleId] = { distance: 0, uses: 0 };
        }
        this.vehicleStats[vehicleId].uses++;
        localStorage.setItem('vehicleStats', JSON.stringify(this.vehicleStats));

        this.game.showNotification(`${vehicle.icon} Now using ${vehicle.name}!`, 'success');
        this.updateUI();
        this.applyVehicleEffects(vehicle);
    }

    unlockVehicle(vehicleId) {
        const vehicle = this.vehicles[vehicleId];
        if (!vehicle) return;

        const resources = this.game.getResources();
        if (resources.stars < vehicle.unlockCost.stars || resources.gems < vehicle.unlockCost.gems) {
            this.game.showNotification('Not enough resources!', 'warning');
            return;
        }

        this.game.spendResources(vehicle.unlockCost.stars, vehicle.unlockCost.gems);

        this.unlockedVehicles.push(vehicleId);
        localStorage.setItem('unlockedVehicles', JSON.stringify(this.unlockedVehicles));

        this.vehicleStats[vehicleId] = { distance: 0, uses: 0 };
        localStorage.setItem('vehicleStats', JSON.stringify(this.vehicleStats));

        this.game.showNotification(`${vehicle.icon} ${vehicle.name} unlocked!`, 'legendary');
        this.updateUI();
    }

    applyVehicleEffects(vehicle) {
        // Add visual effects based on vehicle
        document.body.setAttribute('data-vehicle', vehicle.id);

        if (vehicle.special === 'magic') {
            this.startRainbowTrail();
        }
    }

    startRainbowTrail() {
        // Rainbow particle effect for unicorn
        if (this.rainbowInterval) clearInterval(this.rainbowInterval);

        this.rainbowInterval = setInterval(() => {
            if (this.currentVehicle !== 'unicorn') {
                clearInterval(this.rainbowInterval);
                return;
            }

            const particle = document.createElement('div');
            particle.className = 'rainbow-particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.bottom = '50px';
            document.body.appendChild(particle);

            setTimeout(() => particle.remove(), 1000);
        }, 100);
    }

    consumeFuel(amount) {
        const vehicle = this.vehicles[this.currentVehicle];
        const consumption = vehicle.fuelConsumption * amount;

        this.fuel = Math.max(0, this.fuel - consumption);
        localStorage.setItem('vehicleFuel', this.fuel.toString());

        this.updateFuelDisplay();

        if (this.fuel <= 0 && vehicle.fuelConsumption > 0) {
            this.selectVehicle('walking');
            this.game.showNotification('Out of fuel! Switched to walking.', 'warning');
        }
    }

    startFuelRegeneration() {
        // Regenerate 1 fuel per 30 seconds
        setInterval(() => {
            if (this.fuel < this.maxFuel) {
                this.fuel = Math.min(this.maxFuel, this.fuel + 1);
                localStorage.setItem('vehicleFuel', this.fuel.toString());
                this.updateFuelDisplay();
            }
        }, 30000);
    }

    refuel(amount) {
        this.fuel = Math.min(this.maxFuel, this.fuel + amount);
        localStorage.setItem('vehicleFuel', this.fuel.toString());
        this.updateFuelDisplay();
        this.game.showNotification(`⛽ +${amount} fuel!`, 'success');
    }

    getSpeedMultiplier() {
        return this.vehicles[this.currentVehicle]?.speedMultiplier || 1.0;
    }

    getXPMultiplier() {
        return this.vehicles[this.currentVehicle]?.xpMultiplier || 1.0;
    }

    trackDistance(distance) {
        if (this.vehicleStats[this.currentVehicle]) {
            this.vehicleStats[this.currentVehicle].distance += distance;
            localStorage.setItem('vehicleStats', JSON.stringify(this.vehicleStats));
        }

        // Consume fuel based on distance
        this.consumeFuel(distance);
    }

    getCurrentVehicle() {
        return this.vehicles[this.currentVehicle];
    }

    hasSpecialAbility(ability) {
        return this.vehicles[this.currentVehicle]?.special === ability;
    }
}

// Global reference
window.vehicleSystem = null;
