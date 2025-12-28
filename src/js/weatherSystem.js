/**
 * Weather System - Real-time weather with gameplay effects
 * RoadWorld v7.0
 */

export class WeatherSystem {
    constructor(game) {
        this.game = game;
        this.currentWeather = 'clear';
        this.temperature = 20;
        this.windSpeed = 0;
        this.humidity = 50;
        this.visibility = 100;

        this.weatherTypes = {
            clear: {
                name: 'Clear Skies',
                icon: '☀️',
                xpMultiplier: 1.0,
                speedModifier: 1.0,
                effects: [],
                rarity: 0.3
            },
            cloudy: {
                name: 'Cloudy',
                icon: '☁️',
                xpMultiplier: 1.0,
                speedModifier: 1.0,
                effects: ['reduced_visibility'],
                rarity: 0.25
            },
            rain: {
                name: 'Rainy',
                icon: '🌧️',
                xpMultiplier: 1.2,
                speedModifier: 0.9,
                effects: ['wet_roads', 'reduced_visibility'],
                rarity: 0.15
            },
            storm: {
                name: 'Thunderstorm',
                icon: '⛈️',
                xpMultiplier: 1.5,
                speedModifier: 0.7,
                effects: ['lightning', 'wet_roads', 'low_visibility'],
                rarity: 0.08
            },
            snow: {
                name: 'Snowy',
                icon: '❄️',
                xpMultiplier: 1.3,
                speedModifier: 0.8,
                effects: ['slippery', 'reduced_visibility'],
                rarity: 0.07
            },
            fog: {
                name: 'Foggy',
                icon: '🌫️',
                xpMultiplier: 1.4,
                speedModifier: 0.85,
                effects: ['mystery_bonus', 'low_visibility'],
                rarity: 0.08
            },
            windy: {
                name: 'Windy',
                icon: '💨',
                xpMultiplier: 1.1,
                speedModifier: 0.95,
                effects: ['drift'],
                rarity: 0.05
            },
            heatwave: {
                name: 'Heat Wave',
                icon: '🔥',
                xpMultiplier: 0.9,
                speedModifier: 0.9,
                effects: ['stamina_drain', 'mirage'],
                rarity: 0.02
            }
        };

        this.forecasts = [];
        this.weatherHistory = [];
        this.activeEffects = [];

        this.init();
    }

    init() {
        this.createUI();
        this.generateForecast();
        this.setWeather('clear');
        this.startWeatherCycle();
        this.createWeatherOverlay();
    }

    createUI() {
        const panel = document.createElement('div');
        panel.id = 'weather-panel';
        panel.className = 'game-panel weather-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <h3>🌤️ Weather Station</h3>
                <button class="close-btn" id="close-weather">×</button>
            </div>
            <div class="panel-content">
                <div class="current-weather">
                    <div class="weather-icon" id="weather-icon">☀️</div>
                    <div class="weather-info">
                        <div class="weather-name" id="weather-name">Clear Skies</div>
                        <div class="weather-temp" id="weather-temp">20°C</div>
                    </div>
                </div>

                <div class="weather-stats">
                    <div class="stat-row">
                        <span>💨 Wind:</span>
                        <span id="wind-speed">0 km/h</span>
                    </div>
                    <div class="stat-row">
                        <span>💧 Humidity:</span>
                        <span id="humidity">50%</span>
                    </div>
                    <div class="stat-row">
                        <span>👁️ Visibility:</span>
                        <span id="visibility">100%</span>
                    </div>
                </div>

                <div class="weather-effects">
                    <h4>Active Effects</h4>
                    <div id="active-effects" class="effects-list">
                        <div class="no-effects">No special effects</div>
                    </div>
                </div>

                <div class="weather-bonuses">
                    <div class="bonus-item">
                        <span>XP Multiplier:</span>
                        <span id="weather-xp-bonus" class="bonus-value">1.0x</span>
                    </div>
                    <div class="bonus-item">
                        <span>Speed Modifier:</span>
                        <span id="weather-speed-mod" class="bonus-value">100%</span>
                    </div>
                </div>

                <div class="forecast-section">
                    <h4>📅 3-Hour Forecast</h4>
                    <div id="forecast-list" class="forecast-list"></div>
                </div>

                <div class="weather-controls">
                    <button id="weather-control-btn" class="weather-btn">🎮 Weather Control</button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        // Weather widget for HUD
        const widget = document.createElement('div');
        widget.id = 'weather-widget';
        widget.className = 'weather-widget';
        widget.innerHTML = `
            <span id="widget-weather-icon">☀️</span>
            <span id="widget-temp">20°C</span>
        `;
        document.body.appendChild(widget);

        // Weather control modal
        const controlModal = document.createElement('div');
        controlModal.id = 'weather-control-modal';
        controlModal.className = 'weather-control-modal hidden';
        controlModal.innerHTML = `
            <div class="modal-content">
                <h3>🎮 Weather Control Station</h3>
                <p>Use weather orbs to change the weather!</p>
                <div class="weather-orbs" id="weather-orbs"></div>
                <div class="orb-inventory">
                    <span>Weather Orbs: </span>
                    <span id="orb-count">3</span>
                </div>
                <button id="close-weather-control">Close</button>
            </div>
        `;
        document.body.appendChild(controlModal);

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('close-weather').addEventListener('click', () => {
            this.hidePanel();
        });

        document.getElementById('weather-widget').addEventListener('click', () => {
            this.showPanel();
        });

        document.getElementById('weather-control-btn').addEventListener('click', () => {
            this.showWeatherControl();
        });

        document.getElementById('close-weather-control').addEventListener('click', () => {
            this.hideWeatherControl();
        });
    }

    showPanel() {
        document.getElementById('weather-panel').classList.add('active');
    }

    hidePanel() {
        document.getElementById('weather-panel').classList.remove('active');
    }

    showWeatherControl() {
        const modal = document.getElementById('weather-control-modal');
        const orbsContainer = document.getElementById('weather-orbs');
        orbsContainer.innerHTML = '';

        Object.entries(this.weatherTypes).forEach(([key, weather]) => {
            const orb = document.createElement('div');
            orb.className = 'weather-orb';
            orb.innerHTML = `
                <span class="orb-icon">${weather.icon}</span>
                <span class="orb-name">${weather.name}</span>
            `;
            orb.addEventListener('click', () => this.useWeatherOrb(key));
            orbsContainer.appendChild(orb);
        });

        modal.classList.remove('hidden');
    }

    hideWeatherControl() {
        document.getElementById('weather-control-modal').classList.add('hidden');
    }

    useWeatherOrb(weatherType) {
        const orbCount = parseInt(localStorage.getItem('weatherOrbs') || '3');
        if (orbCount <= 0) {
            this.game.showNotification('No weather orbs left!', 'warning');
            return;
        }

        localStorage.setItem('weatherOrbs', (orbCount - 1).toString());
        document.getElementById('orb-count').textContent = orbCount - 1;

        this.setWeather(weatherType);
        this.hideWeatherControl();
        this.game.showNotification(`Weather changed to ${this.weatherTypes[weatherType].name}!`, 'success');
    }

    createWeatherOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'weather-overlay';
        overlay.className = 'weather-overlay';
        document.body.appendChild(overlay);

        // Rain container
        const rainContainer = document.createElement('div');
        rainContainer.id = 'rain-container';
        rainContainer.className = 'rain-container';
        overlay.appendChild(rainContainer);

        // Snow container
        const snowContainer = document.createElement('div');
        snowContainer.id = 'snow-container';
        snowContainer.className = 'snow-container';
        overlay.appendChild(snowContainer);

        // Lightning container
        const lightningContainer = document.createElement('div');
        lightningContainer.id = 'lightning-container';
        lightningContainer.className = 'lightning-container';
        overlay.appendChild(lightningContainer);

        // Fog overlay
        const fogOverlay = document.createElement('div');
        fogOverlay.id = 'fog-overlay';
        fogOverlay.className = 'fog-overlay';
        overlay.appendChild(fogOverlay);
    }

    setWeather(weatherType) {
        if (!this.weatherTypes[weatherType]) return;

        const previousWeather = this.currentWeather;
        this.currentWeather = weatherType;
        const weather = this.weatherTypes[weatherType];

        // Update temperature based on weather
        this.updateTemperature(weatherType);

        // Update wind
        this.windSpeed = this.calculateWindSpeed(weatherType);

        // Update visibility
        this.visibility = this.calculateVisibility(weatherType);

        // Update humidity
        this.humidity = this.calculateHumidity(weatherType);

        // Log to history
        this.weatherHistory.push({
            type: weatherType,
            timestamp: Date.now()
        });

        // Update UI
        this.updateUI();

        // Apply visual effects
        this.applyWeatherEffects(weatherType, previousWeather);

        // Apply gameplay effects
        this.applyGameplayEffects(weather);
    }

    updateTemperature(weatherType) {
        const baseTemp = 20;
        const tempModifiers = {
            clear: 5,
            cloudy: 0,
            rain: -3,
            storm: -5,
            snow: -15,
            fog: -2,
            windy: -3,
            heatwave: 20
        };

        this.temperature = baseTemp + (tempModifiers[weatherType] || 0) + (Math.random() * 6 - 3);
        this.temperature = Math.round(this.temperature);
    }

    calculateWindSpeed(weatherType) {
        const windBase = {
            clear: 5,
            cloudy: 10,
            rain: 20,
            storm: 50,
            snow: 15,
            fog: 2,
            windy: 60,
            heatwave: 5
        };

        return (windBase[weatherType] || 10) + Math.floor(Math.random() * 10);
    }

    calculateVisibility(weatherType) {
        const visibilityMap = {
            clear: 100,
            cloudy: 90,
            rain: 70,
            storm: 40,
            snow: 50,
            fog: 20,
            windy: 85,
            heatwave: 75
        };

        return visibilityMap[weatherType] || 100;
    }

    calculateHumidity(weatherType) {
        const humidityMap = {
            clear: 40,
            cloudy: 60,
            rain: 90,
            storm: 95,
            snow: 70,
            fog: 100,
            windy: 50,
            heatwave: 20
        };

        return humidityMap[weatherType] || 50;
    }

    updateUI() {
        const weather = this.weatherTypes[this.currentWeather];

        document.getElementById('weather-icon').textContent = weather.icon;
        document.getElementById('weather-name').textContent = weather.name;
        document.getElementById('weather-temp').textContent = `${this.temperature}°C`;
        document.getElementById('wind-speed').textContent = `${this.windSpeed} km/h`;
        document.getElementById('humidity').textContent = `${this.humidity}%`;
        document.getElementById('visibility').textContent = `${this.visibility}%`;
        document.getElementById('weather-xp-bonus').textContent = `${weather.xpMultiplier}x`;
        document.getElementById('weather-speed-mod').textContent = `${Math.round(weather.speedModifier * 100)}%`;

        // Update widget
        document.getElementById('widget-weather-icon').textContent = weather.icon;
        document.getElementById('widget-temp').textContent = `${this.temperature}°C`;

        // Update effects list
        this.updateEffectsList(weather.effects);

        // Update forecast
        this.updateForecastUI();
    }

    updateEffectsList(effects) {
        const container = document.getElementById('active-effects');

        if (effects.length === 0) {
            container.innerHTML = '<div class="no-effects">No special effects</div>';
            return;
        }

        const effectDescriptions = {
            reduced_visibility: { icon: '👁️', name: 'Reduced Visibility', desc: 'Harder to spot items' },
            wet_roads: { icon: '💧', name: 'Wet Roads', desc: 'Slippery terrain' },
            low_visibility: { icon: '🌫️', name: 'Low Visibility', desc: 'Mystery bonus active' },
            lightning: { icon: '⚡', name: 'Lightning', desc: 'Chance for bonus XP strikes' },
            slippery: { icon: '🧊', name: 'Slippery', desc: 'Movement affected' },
            mystery_bonus: { icon: '❓', name: 'Mystery Aura', desc: 'Hidden treasures revealed' },
            drift: { icon: '🌀', name: 'Drift', desc: 'Wind affects movement' },
            stamina_drain: { icon: '😓', name: 'Heat Exhaustion', desc: 'Energy drains faster' },
            mirage: { icon: '🏜️', name: 'Mirage', desc: 'False items may appear' }
        };

        container.innerHTML = effects.map(effect => {
            const info = effectDescriptions[effect] || { icon: '❔', name: effect, desc: '' };
            return `
                <div class="effect-item">
                    <span class="effect-icon">${info.icon}</span>
                    <div class="effect-info">
                        <span class="effect-name">${info.name}</span>
                        <span class="effect-desc">${info.desc}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    generateForecast() {
        this.forecasts = [];
        const weatherKeys = Object.keys(this.weatherTypes);

        for (let i = 1; i <= 6; i++) {
            const hour = new Date();
            hour.setHours(hour.getHours() + i);

            // Weighted random based on rarity
            let selectedWeather = this.getRandomWeather();

            this.forecasts.push({
                time: hour,
                weather: selectedWeather
            });
        }
    }

    getRandomWeather() {
        const rand = Math.random();
        let cumulative = 0;

        for (const [key, weather] of Object.entries(this.weatherTypes)) {
            cumulative += weather.rarity;
            if (rand <= cumulative) {
                return key;
            }
        }

        return 'clear';
    }

    updateForecastUI() {
        const container = document.getElementById('forecast-list');

        container.innerHTML = this.forecasts.slice(0, 3).map(forecast => {
            const weather = this.weatherTypes[forecast.weather];
            const timeStr = forecast.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return `
                <div class="forecast-item">
                    <span class="forecast-time">${timeStr}</span>
                    <span class="forecast-icon">${weather.icon}</span>
                    <span class="forecast-name">${weather.name}</span>
                </div>
            `;
        }).join('');
    }

    applyWeatherEffects(weatherType, previousWeather) {
        const overlay = document.getElementById('weather-overlay');

        // Clear previous effects
        overlay.className = 'weather-overlay';
        document.getElementById('rain-container').innerHTML = '';
        document.getElementById('snow-container').innerHTML = '';

        // Apply new effects
        overlay.classList.add(`weather-${weatherType}`);

        switch (weatherType) {
            case 'rain':
            case 'storm':
                this.createRainEffect();
                break;
            case 'snow':
                this.createSnowEffect();
                break;
            case 'fog':
                document.getElementById('fog-overlay').classList.add('active');
                break;
            case 'storm':
                this.startLightningEffect();
                break;
        }

        if (weatherType !== 'fog') {
            document.getElementById('fog-overlay').classList.remove('active');
        }
    }

    createRainEffect() {
        const container = document.getElementById('rain-container');
        const intensity = this.currentWeather === 'storm' ? 150 : 80;

        for (let i = 0; i < intensity; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.left = `${Math.random() * 100}%`;
            drop.style.animationDuration = `${0.5 + Math.random() * 0.3}s`;
            drop.style.animationDelay = `${Math.random() * 2}s`;
            container.appendChild(drop);
        }
    }

    createSnowEffect() {
        const container = document.getElementById('snow-container');

        for (let i = 0; i < 100; i++) {
            const flake = document.createElement('div');
            flake.className = 'snow-flake';
            flake.textContent = '❄';
            flake.style.left = `${Math.random() * 100}%`;
            flake.style.fontSize = `${8 + Math.random() * 12}px`;
            flake.style.animationDuration = `${3 + Math.random() * 4}s`;
            flake.style.animationDelay = `${Math.random() * 5}s`;
            container.appendChild(flake);
        }
    }

    startLightningEffect() {
        if (this.lightningInterval) clearInterval(this.lightningInterval);

        this.lightningInterval = setInterval(() => {
            if (this.currentWeather === 'storm' && Math.random() < 0.3) {
                this.triggerLightning();
            }
        }, 3000);
    }

    triggerLightning() {
        const container = document.getElementById('lightning-container');
        container.classList.add('flash');

        // Bonus XP for lightning strike
        if (Math.random() < 0.2) {
            const bonusXP = Math.floor(Math.random() * 50) + 10;
            this.game.addXP(bonusXP);
            this.game.showNotification(`⚡ Lightning Strike! +${bonusXP} XP`, 'legendary');
        }

        setTimeout(() => {
            container.classList.remove('flash');
        }, 200);
    }

    applyGameplayEffects(weather) {
        // Store active multipliers for game to use
        this.activeEffects = {
            xpMultiplier: weather.xpMultiplier,
            speedModifier: weather.speedModifier,
            effects: weather.effects
        };
    }

    getXPMultiplier() {
        return this.activeEffects.xpMultiplier || 1.0;
    }

    getSpeedModifier() {
        return this.activeEffects.speedModifier || 1.0;
    }

    hasEffect(effectName) {
        return this.activeEffects.effects?.includes(effectName) || false;
    }

    startWeatherCycle() {
        // Change weather every 10 minutes
        setInterval(() => {
            if (this.forecasts.length > 0) {
                const nextWeather = this.forecasts.shift();
                this.setWeather(nextWeather.weather);

                // Add new forecast
                const lastForecast = this.forecasts[this.forecasts.length - 1];
                const newTime = new Date(lastForecast?.time || Date.now());
                newTime.setHours(newTime.getHours() + 1);

                this.forecasts.push({
                    time: newTime,
                    weather: this.getRandomWeather()
                });

                this.game.showNotification(`Weather changed to ${this.weatherTypes[this.currentWeather].name}`, 'info');
            }
        }, 600000); // 10 minutes
    }

    // Called by game when player collects items
    applyWeatherBonus(baseXP) {
        const multiplier = this.getXPMultiplier();
        const bonusXP = Math.floor(baseXP * multiplier);

        if (multiplier > 1) {
            this.game.showNotification(`${this.weatherTypes[this.currentWeather].icon} Weather bonus: +${bonusXP - baseXP} XP`, 'info');
        }

        return bonusXP;
    }
}
