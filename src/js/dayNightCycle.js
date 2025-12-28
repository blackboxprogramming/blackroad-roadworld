// Day/Night Cycle System for RoadWorld
// Creates dynamic time-of-day effects with special events

export class DayNightCycle {
    constructor(mapManager, gameEngine, soundManager) {
        this.mapManager = mapManager;
        this.gameEngine = gameEngine;
        this.soundManager = soundManager;

        // Time settings (accelerated game time)
        this.realSecondsPerGameHour = 60; // 1 real minute = 1 game hour
        this.gameTime = 12 * 60; // Start at noon (minutes since midnight)
        this.isRunning = false;
        this.updateInterval = null;

        // Time periods
        this.periods = {
            dawn: { start: 5 * 60, end: 7 * 60, name: 'Dawn', icon: '🌅' },
            morning: { start: 7 * 60, end: 12 * 60, name: 'Morning', icon: '☀️' },
            afternoon: { start: 12 * 60, end: 17 * 60, name: 'Afternoon', icon: '🌤️' },
            dusk: { start: 17 * 60, end: 19 * 60, name: 'Dusk', icon: '🌇' },
            evening: { start: 19 * 60, end: 22 * 60, name: 'Evening', icon: '🌆' },
            night: { start: 22 * 60, end: 5 * 60, name: 'Night', icon: '🌙' }
        };

        // Time-based bonuses
        this.bonuses = {
            dawn: { xpMultiplier: 1.5, description: 'Early Bird Bonus' },
            night: { xpMultiplier: 1.3, description: 'Night Owl Bonus' },
            goldenHour: { xpMultiplier: 2.0, description: 'Golden Hour!' }
        };

        // Special events
        this.activeEvents = [];
        this.eventCooldowns = {};

        this.displayElement = null;
        this.overlayElement = null;
    }

    init() {
        this.createDisplay();
        this.createOverlay();
        this.syncWithRealTime();
        this.start();

        console.log('🌅 Day/Night Cycle initialized');
    }

    createDisplay() {
        this.displayElement = document.createElement('div');
        this.displayElement.className = 'time-display';
        this.displayElement.innerHTML = `
            <div class="time-icon" id="time-icon">☀️</div>
            <div class="time-info">
                <div class="time-clock" id="time-clock">12:00</div>
                <div class="time-period" id="time-period">Afternoon</div>
            </div>
            <div class="time-bonus" id="time-bonus" style="display: none;"></div>
        `;
        document.body.appendChild(this.displayElement);
    }

    createOverlay() {
        this.overlayElement = document.createElement('div');
        this.overlayElement.className = 'day-night-overlay';
        this.overlayElement.id = 'day-night-overlay';
        document.body.appendChild(this.overlayElement);
    }

    syncWithRealTime() {
        // Option to sync with real-world time
        const now = new Date();
        this.gameTime = now.getHours() * 60 + now.getMinutes();
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;

        // Update every second (real time)
        this.updateInterval = setInterval(() => {
            this.tick();
        }, 1000);

        this.updateDisplay();
        this.updateOverlay();
    }

    stop() {
        this.isRunning = false;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    tick() {
        // Advance game time
        const minutesPerSecond = 60 / this.realSecondsPerGameHour;
        this.gameTime += minutesPerSecond;

        // Wrap around midnight
        if (this.gameTime >= 24 * 60) {
            this.gameTime -= 24 * 60;
            this.onNewDay();
        }

        this.updateDisplay();
        this.updateOverlay();
        this.checkTimeEvents();
    }

    onNewDay() {
        // Trigger new day events
        if (this.gameEngine) {
            this.showNotification('🌅 A new day begins!', 'info');
        }
    }

    getCurrentPeriod() {
        const time = this.gameTime;

        for (const [key, period] of Object.entries(this.periods)) {
            if (key === 'night') {
                // Night wraps around midnight
                if (time >= period.start || time < period.end) {
                    return { key, ...period };
                }
            } else {
                if (time >= period.start && time < period.end) {
                    return { key, ...period };
                }
            }
        }

        return { key: 'day', name: 'Day', icon: '☀️' };
    }

    getFormattedTime() {
        const hours = Math.floor(this.gameTime / 60);
        const minutes = Math.floor(this.gameTime % 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    updateDisplay() {
        const period = this.getCurrentPeriod();
        const timeStr = this.getFormattedTime();

        document.getElementById('time-icon').textContent = period.icon;
        document.getElementById('time-clock').textContent = timeStr;
        document.getElementById('time-period').textContent = period.name;

        // Show active bonus
        const bonus = this.getCurrentBonus();
        const bonusEl = document.getElementById('time-bonus');
        if (bonus) {
            bonusEl.style.display = 'block';
            bonusEl.textContent = `${bonus.description} x${bonus.xpMultiplier}`;
        } else {
            bonusEl.style.display = 'none';
        }
    }

    updateOverlay() {
        const period = this.getCurrentPeriod();
        const overlay = this.overlayElement;

        // Calculate overlay opacity and color based on time
        let opacity = 0;
        let color = 'rgba(0, 0, 0, 0)';

        switch (period.key) {
            case 'dawn':
                opacity = 0.1;
                color = `rgba(255, 180, 100, ${opacity})`;
                break;
            case 'morning':
                opacity = 0;
                break;
            case 'afternoon':
                opacity = 0.05;
                color = `rgba(255, 200, 150, ${opacity})`;
                break;
            case 'dusk':
                opacity = 0.15;
                color = `rgba(255, 100, 50, ${opacity})`;
                break;
            case 'evening':
                opacity = 0.25;
                color = `rgba(50, 50, 100, ${opacity})`;
                break;
            case 'night':
                opacity = 0.4;
                color = `rgba(10, 10, 40, ${opacity})`;
                break;
        }

        overlay.style.background = color;
        overlay.style.pointerEvents = 'none';
    }

    getCurrentBonus() {
        const period = this.getCurrentPeriod();

        // Check for golden hour (just after dawn or before dusk)
        const time = this.gameTime;
        if ((time >= 6 * 60 && time < 7 * 60) || (time >= 18 * 60 && time < 19 * 60)) {
            return this.bonuses.goldenHour;
        }

        if (this.bonuses[period.key]) {
            return this.bonuses[period.key];
        }

        return null;
    }

    getXPMultiplier() {
        const bonus = this.getCurrentBonus();
        return bonus ? bonus.xpMultiplier : 1;
    }

    checkTimeEvents() {
        const period = this.getCurrentPeriod();
        const time = this.gameTime;

        // Midnight event
        if (time >= 0 && time < 1 && !this.eventCooldowns.midnight) {
            this.triggerEvent('midnight', {
                name: 'Midnight Mystery',
                description: 'Rare items spawn more frequently!',
                icon: '🌑',
                duration: 60 // 1 game hour
            });
            this.eventCooldowns.midnight = true;
            setTimeout(() => { this.eventCooldowns.midnight = false; }, 60000);
        }

        // Noon event
        if (time >= 12 * 60 && time < 12 * 60 + 1 && !this.eventCooldowns.noon) {
            this.triggerEvent('noon', {
                name: 'High Noon',
                description: 'Double XP for movement!',
                icon: '🌞',
                duration: 30
            });
            this.eventCooldowns.noon = true;
            setTimeout(() => { this.eventCooldowns.noon = false; }, 60000);
        }
    }

    triggerEvent(type, eventData) {
        this.activeEvents.push({
            type,
            ...eventData,
            startTime: this.gameTime,
            endTime: this.gameTime + eventData.duration
        });

        this.showNotification(`${eventData.icon} ${eventData.name}: ${eventData.description}`, 'event');

        if (this.soundManager) {
            this.soundManager.playAchievement();
        }
    }

    isEventActive(type) {
        return this.activeEvents.some(e => e.type === type && this.gameTime < e.endTime);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `time-notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    setTimeScale(scale) {
        // Adjust how fast time passes (1 = normal, 2 = double speed)
        this.realSecondsPerGameHour = 60 / scale;
    }

    setTime(hours, minutes = 0) {
        this.gameTime = hours * 60 + minutes;
        this.updateDisplay();
        this.updateOverlay();
    }

    isNight() {
        const period = this.getCurrentPeriod();
        return period.key === 'night' || period.key === 'evening';
    }

    isDawn() {
        return this.getCurrentPeriod().key === 'dawn';
    }
}
