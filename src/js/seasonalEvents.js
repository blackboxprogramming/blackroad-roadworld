/**
 * Seasonal Events - Holiday content and special events
 * RoadWorld v7.0
 */

export class SeasonalEvents {
    constructor(game) {
        this.game = game;
        this.currentEvent = null;
        this.eventProgress = JSON.parse(localStorage.getItem('eventProgress') || '{}');
        this.eventRewards = JSON.parse(localStorage.getItem('eventRewards') || '[]');

        this.events = {
            new_year: {
                id: 'new_year',
                name: 'New Year Celebration',
                icon: '🎆',
                theme: 'fireworks',
                startDate: { month: 12, day: 31 },
                endDate: { month: 1, day: 7 },
                description: 'Ring in the new year with explosive rewards!',
                colors: ['#FFD700', '#FF6B6B', '#4ECDC4'],
                specialItems: ['🎆', '🎇', '🥂', '🎊'],
                bonuses: { xp: 2.0, items: 1.5 },
                challenges: [
                    { id: 'fireworks_collector', name: 'Firework Collector', target: 50, reward: 500 },
                    { id: 'midnight_explorer', name: 'Midnight Explorer', target: 10, reward: 300 },
                    { id: 'champagne_toast', name: 'Champagne Toast', target: 25, reward: 400 }
                ],
                exclusiveReward: { name: 'New Year Crown', icon: '👑', type: 'accessory' }
            },
            valentines: {
                id: 'valentines',
                name: "Valentine's Day",
                icon: '💝',
                theme: 'hearts',
                startDate: { month: 2, day: 10 },
                endDate: { month: 2, day: 16 },
                description: 'Spread love and collect hearts!',
                colors: ['#FF69B4', '#FF1493', '#DC143C'],
                specialItems: ['💖', '💕', '💝', '🌹'],
                bonuses: { xp: 1.5, items: 2.0 },
                challenges: [
                    { id: 'heart_collector', name: 'Heart Collector', target: 100, reward: 400 },
                    { id: 'love_letter', name: 'Love Letter Delivery', target: 20, reward: 350 },
                    { id: 'cupids_arrow', name: "Cupid's Arrow", target: 15, reward: 450 }
                ],
                exclusiveReward: { name: 'Cupid Wings', icon: '💘', type: 'accessory' }
            },
            st_patricks: {
                id: 'st_patricks',
                name: "St. Patrick's Day",
                icon: '☘️',
                theme: 'luck',
                startDate: { month: 3, day: 15 },
                endDate: { month: 3, day: 19 },
                description: 'Find the pot of gold at the end of the rainbow!',
                colors: ['#228B22', '#32CD32', '#FFD700'],
                specialItems: ['☘️', '🍀', '🌈', '🪙'],
                bonuses: { xp: 1.75, items: 1.75, luck: 2.0 },
                challenges: [
                    { id: 'four_leaf', name: 'Four Leaf Finder', target: 40, reward: 500 },
                    { id: 'rainbow_chaser', name: 'Rainbow Chaser', target: 10, reward: 600 },
                    { id: 'pot_of_gold', name: 'Pot of Gold', target: 5, reward: 1000 }
                ],
                exclusiveReward: { name: 'Lucky Charm', icon: '🍀', type: 'pet' }
            },
            easter: {
                id: 'easter',
                name: 'Easter Egg Hunt',
                icon: '🥚',
                theme: 'eggs',
                startDate: { month: 3, day: 28 },
                endDate: { month: 4, day: 5 },
                description: 'Hunt for hidden Easter eggs everywhere!',
                colors: ['#FFB6C1', '#87CEEB', '#98FB98', '#DDA0DD'],
                specialItems: ['🥚', '🐰', '🐣', '🌷'],
                bonuses: { xp: 1.5, items: 2.5 },
                challenges: [
                    { id: 'egg_hunter', name: 'Egg Hunter', target: 100, reward: 400 },
                    { id: 'golden_egg', name: 'Golden Egg Finder', target: 10, reward: 800 },
                    { id: 'bunny_trail', name: 'Bunny Trail', target: 30, reward: 350 }
                ],
                exclusiveReward: { name: 'Easter Bunny', icon: '🐰', type: 'pet' }
            },
            summer: {
                id: 'summer',
                name: 'Summer Festival',
                icon: '🏖️',
                theme: 'beach',
                startDate: { month: 6, day: 21 },
                endDate: { month: 7, day: 7 },
                description: 'Soak up the sun and ride the waves!',
                colors: ['#00CED1', '#FFD700', '#FF6347'],
                specialItems: ['🏖️', '🌴', '🍦', '🌊'],
                bonuses: { xp: 1.5, speed: 1.25 },
                challenges: [
                    { id: 'beach_comber', name: 'Beach Comber', target: 75, reward: 400 },
                    { id: 'wave_rider', name: 'Wave Rider', target: 50, reward: 450 },
                    { id: 'sandcastle', name: 'Sandcastle Builder', target: 20, reward: 500 }
                ],
                exclusiveReward: { name: 'Surfboard', icon: '🏄', type: 'vehicle' }
            },
            halloween: {
                id: 'halloween',
                name: 'Halloween Spooktacular',
                icon: '🎃',
                theme: 'spooky',
                startDate: { month: 10, day: 25 },
                endDate: { month: 11, day: 2 },
                description: 'Brave the spooky night for treats!',
                colors: ['#FF6600', '#800080', '#000000'],
                specialItems: ['🎃', '👻', '🦇', '🍬'],
                bonuses: { xp: 2.0, mystery: 2.0 },
                challenges: [
                    { id: 'pumpkin_patch', name: 'Pumpkin Patch', target: 50, reward: 500 },
                    { id: 'ghost_hunter', name: 'Ghost Hunter', target: 30, reward: 600 },
                    { id: 'trick_or_treat', name: 'Trick or Treat', target: 100, reward: 400 }
                ],
                exclusiveReward: { name: 'Ghost Pet', icon: '👻', type: 'pet' }
            },
            thanksgiving: {
                id: 'thanksgiving',
                name: 'Harvest Festival',
                icon: '🦃',
                theme: 'harvest',
                startDate: { month: 11, day: 20 },
                endDate: { month: 11, day: 28 },
                description: 'Gather the harvest and give thanks!',
                colors: ['#D2691E', '#8B4513', '#DAA520'],
                specialItems: ['🦃', '🌽', '🥧', '🍂'],
                bonuses: { xp: 1.5, items: 2.0 },
                challenges: [
                    { id: 'harvest_collector', name: 'Harvest Collector', target: 80, reward: 400 },
                    { id: 'turkey_trot', name: 'Turkey Trot', target: 25, reward: 450 },
                    { id: 'pie_baker', name: 'Pie Baker', target: 15, reward: 500 }
                ],
                exclusiveReward: { name: 'Cornucopia', icon: '🌽', type: 'accessory' }
            },
            christmas: {
                id: 'christmas',
                name: 'Winter Wonderland',
                icon: '🎄',
                theme: 'winter',
                startDate: { month: 12, day: 15 },
                endDate: { month: 12, day: 30 },
                description: 'Celebrate the holidays with festive fun!',
                colors: ['#FF0000', '#008000', '#FFFFFF'],
                specialItems: ['🎄', '🎅', '🎁', '⛄'],
                bonuses: { xp: 2.0, items: 2.0, gifts: 3.0 },
                challenges: [
                    { id: 'present_collector', name: 'Present Collector', target: 100, reward: 500 },
                    { id: 'snowman_builder', name: 'Snowman Builder', target: 20, reward: 400 },
                    { id: 'santa_helper', name: "Santa's Helper", target: 50, reward: 600 }
                ],
                exclusiveReward: { name: 'Reindeer Pet', icon: '🦌', type: 'pet' }
            }
        };

        this.init();
    }

    init() {
        this.createUI();
        this.checkCurrentEvent();
        this.startEventCheck();
    }

    createUI() {
        const panel = document.createElement('div');
        panel.id = 'seasonal-panel';
        panel.className = 'game-panel seasonal-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <h3>🎉 Seasonal Events</h3>
                <button class="close-btn" id="close-seasonal">×</button>
            </div>
            <div class="panel-content">
                <div id="active-event-container">
                    <div class="no-event">
                        <span class="no-event-icon">📅</span>
                        <p>No active event right now</p>
                        <p class="next-event" id="next-event-info"></p>
                    </div>
                </div>

                <div class="past-rewards">
                    <h4>🏆 Event Rewards Collected</h4>
                    <div id="collected-rewards" class="rewards-grid"></div>
                </div>

                <div class="event-calendar">
                    <h4>📅 Upcoming Events</h4>
                    <div id="event-calendar-list" class="calendar-list"></div>
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        // Event banner
        const banner = document.createElement('div');
        banner.id = 'event-banner';
        banner.className = 'event-banner hidden';
        document.body.appendChild(banner);

        // Event particles container
        const particles = document.createElement('div');
        particles.id = 'event-particles';
        particles.className = 'event-particles';
        document.body.appendChild(particles);

        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        document.getElementById('close-seasonal').addEventListener('click', () => {
            this.hidePanel();
        });
    }

    showPanel() {
        document.getElementById('seasonal-panel').classList.add('active');
        this.updateUI();
    }

    hidePanel() {
        document.getElementById('seasonal-panel').classList.remove('active');
    }

    checkCurrentEvent() {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentDay = now.getDate();

        for (const [id, event] of Object.entries(this.events)) {
            if (this.isEventActive(event, currentMonth, currentDay)) {
                this.activateEvent(event);
                return;
            }
        }

        this.currentEvent = null;
        this.hideEventBanner();
    }

    isEventActive(event, month, day) {
        const start = event.startDate;
        const end = event.endDate;

        // Handle year-wrapping events (like New Year)
        if (start.month > end.month) {
            return (month === start.month && day >= start.day) ||
                   (month === end.month && day <= end.day) ||
                   (month > start.month || month < end.month);
        }

        // Normal events
        if (month === start.month && month === end.month) {
            return day >= start.day && day <= end.day;
        }

        if (month === start.month) return day >= start.day;
        if (month === end.month) return day <= end.day;

        return month > start.month && month < end.month;
    }

    activateEvent(event) {
        this.currentEvent = event;

        // Initialize progress
        if (!this.eventProgress[event.id]) {
            this.eventProgress[event.id] = {
                startedAt: Date.now(),
                challenges: {},
                itemsCollected: 0
            };
            localStorage.setItem('eventProgress', JSON.stringify(this.eventProgress));
        }

        this.showEventBanner(event);
        this.applyEventTheme(event);
        this.startEventParticles(event);
        this.updateUI();

        this.game.showNotification(`🎉 ${event.name} is now active!`, 'legendary');
    }

    showEventBanner(event) {
        const banner = document.getElementById('event-banner');
        banner.style.background = `linear-gradient(135deg, ${event.colors.join(', ')})`;
        banner.innerHTML = `
            <span class="banner-icon">${event.icon}</span>
            <span class="banner-text">${event.name}</span>
            <span class="banner-bonus">XP x${event.bonuses.xp}</span>
        `;
        banner.classList.remove('hidden');
    }

    hideEventBanner() {
        document.getElementById('event-banner').classList.add('hidden');
    }

    applyEventTheme(event) {
        document.body.setAttribute('data-event-theme', event.theme);

        // Apply event-specific CSS variables
        document.documentElement.style.setProperty('--event-color-1', event.colors[0]);
        document.documentElement.style.setProperty('--event-color-2', event.colors[1]);
        document.documentElement.style.setProperty('--event-color-3', event.colors[2] || event.colors[0]);
    }

    startEventParticles(event) {
        const container = document.getElementById('event-particles');
        container.innerHTML = '';

        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'event-particle';
            particle.textContent = event.specialItems[Math.floor(Math.random() * event.specialItems.length)];
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 10}s`;
            particle.style.animationDuration = `${10 + Math.random() * 10}s`;
            container.appendChild(particle);
        }
    }

    updateUI() {
        this.updateActiveEvent();
        this.updateCollectedRewards();
        this.updateEventCalendar();
    }

    updateActiveEvent() {
        const container = document.getElementById('active-event-container');

        if (!this.currentEvent) {
            const nextEvent = this.getNextEvent();
            container.innerHTML = `
                <div class="no-event">
                    <span class="no-event-icon">📅</span>
                    <p>No active event right now</p>
                    ${nextEvent ? `<p class="next-event">Next: ${nextEvent.icon} ${nextEvent.name}</p>` : ''}
                </div>
            `;
            return;
        }

        const event = this.currentEvent;
        const progress = this.eventProgress[event.id] || { challenges: {}, itemsCollected: 0 };

        container.innerHTML = `
            <div class="active-event" style="background: linear-gradient(135deg, ${event.colors[0]}22, ${event.colors[1]}22)">
                <div class="event-header">
                    <span class="event-icon">${event.icon}</span>
                    <div class="event-info">
                        <h3>${event.name}</h3>
                        <p>${event.description}</p>
                    </div>
                </div>

                <div class="event-bonuses">
                    ${Object.entries(event.bonuses).map(([key, value]) =>
                        `<span class="bonus-tag">${key.toUpperCase()} x${value}</span>`
                    ).join('')}
                </div>

                <div class="event-challenges">
                    <h4>🎯 Event Challenges</h4>
                    ${event.challenges.map(challenge => {
                        const challengeProgress = progress.challenges[challenge.id] || 0;
                        const percent = Math.min(100, (challengeProgress / challenge.target) * 100);
                        const complete = challengeProgress >= challenge.target;

                        return `
                            <div class="event-challenge ${complete ? 'complete' : ''}">
                                <div class="challenge-info">
                                    <span class="challenge-name">${challenge.name}</span>
                                    <span class="challenge-reward">+${challenge.reward} XP</span>
                                </div>
                                <div class="challenge-progress-bar">
                                    <div class="challenge-fill" style="width: ${percent}%"></div>
                                </div>
                                <span class="challenge-count">${challengeProgress}/${challenge.target}</span>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="exclusive-reward">
                    <h4>🌟 Exclusive Reward</h4>
                    <div class="reward-preview">
                        <span class="reward-icon">${event.exclusiveReward.icon}</span>
                        <span class="reward-name">${event.exclusiveReward.name}</span>
                        <span class="reward-type">${event.exclusiveReward.type}</span>
                    </div>
                    <p class="reward-hint">Complete all challenges to unlock!</p>
                </div>

                <div class="event-timer">
                    <span>⏰ Event ends in: </span>
                    <span id="event-countdown"></span>
                </div>
            </div>
        `;

        this.startEventCountdown();
    }

    updateCollectedRewards() {
        const container = document.getElementById('collected-rewards');

        if (this.eventRewards.length === 0) {
            container.innerHTML = '<p class="no-rewards">Complete events to earn exclusive rewards!</p>';
            return;
        }

        container.innerHTML = this.eventRewards.map(reward => `
            <div class="collected-reward">
                <span class="reward-icon">${reward.icon}</span>
                <span class="reward-name">${reward.name}</span>
            </div>
        `).join('');
    }

    updateEventCalendar() {
        const container = document.getElementById('event-calendar-list');
        const now = new Date();
        const currentMonth = now.getMonth() + 1;

        const upcomingEvents = Object.values(this.events)
            .filter(event => {
                // Check if event is upcoming
                if (event.startDate.month > currentMonth) return true;
                if (event.startDate.month === currentMonth && event.startDate.day > now.getDate()) return true;
                return false;
            })
            .sort((a, b) => {
                if (a.startDate.month !== b.startDate.month) {
                    return a.startDate.month - b.startDate.month;
                }
                return a.startDate.day - b.startDate.day;
            })
            .slice(0, 4);

        container.innerHTML = upcomingEvents.map(event => `
            <div class="calendar-event">
                <span class="cal-icon">${event.icon}</span>
                <div class="cal-info">
                    <span class="cal-name">${event.name}</span>
                    <span class="cal-date">${this.getMonthName(event.startDate.month)} ${event.startDate.day}</span>
                </div>
            </div>
        `).join('');

        if (upcomingEvents.length === 0) {
            container.innerHTML = '<p class="no-upcoming">Check back later for more events!</p>';
        }
    }

    getMonthName(month) {
        const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[month];
    }

    getNextEvent() {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentDay = now.getDate();

        let nextEvent = null;
        let minDays = Infinity;

        Object.values(this.events).forEach(event => {
            let daysUntil;

            if (event.startDate.month > currentMonth ||
                (event.startDate.month === currentMonth && event.startDate.day > currentDay)) {
                daysUntil = (event.startDate.month - currentMonth) * 30 + (event.startDate.day - currentDay);
            } else {
                daysUntil = (12 - currentMonth + event.startDate.month) * 30 + (event.startDate.day - currentDay);
            }

            if (daysUntil < minDays && daysUntil > 0) {
                minDays = daysUntil;
                nextEvent = event;
            }
        });

        return nextEvent;
    }

    startEventCountdown() {
        if (!this.currentEvent) return;

        const updateCountdown = () => {
            const now = new Date();
            const end = new Date(now.getFullYear(), this.currentEvent.endDate.month - 1, this.currentEvent.endDate.day, 23, 59, 59);

            if (end < now) {
                end.setFullYear(end.getFullYear() + 1);
            }

            const diff = end - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            const countdownEl = document.getElementById('event-countdown');
            if (countdownEl) {
                countdownEl.textContent = `${days}d ${hours}h ${minutes}m`;
            }
        };

        updateCountdown();
        setInterval(updateCountdown, 60000);
    }

    startEventCheck() {
        // Check for event changes every hour
        setInterval(() => {
            this.checkCurrentEvent();
        }, 3600000);
    }

    // Called when collecting items during event
    collectEventItem(item) {
        if (!this.currentEvent) return;

        const progress = this.eventProgress[this.currentEvent.id];
        if (!progress) return;

        progress.itemsCollected++;

        // Update challenge progress
        this.currentEvent.challenges.forEach(challenge => {
            if (!progress.challenges[challenge.id]) {
                progress.challenges[challenge.id] = 0;
            }
            progress.challenges[challenge.id]++;

            if (progress.challenges[challenge.id] === challenge.target) {
                this.game.showNotification(`🎯 Challenge Complete: ${challenge.name}!`, 'success');
                this.game.addXP(challenge.reward);
            }
        });

        localStorage.setItem('eventProgress', JSON.stringify(this.eventProgress));
        this.checkEventCompletion();
    }

    checkEventCompletion() {
        if (!this.currentEvent) return;

        const progress = this.eventProgress[this.currentEvent.id];
        const allComplete = this.currentEvent.challenges.every(c =>
            (progress.challenges[c.id] || 0) >= c.target
        );

        if (allComplete && !this.eventRewards.find(r => r.eventId === this.currentEvent.id)) {
            this.unlockExclusiveReward();
        }
    }

    unlockExclusiveReward() {
        const reward = {
            ...this.currentEvent.exclusiveReward,
            eventId: this.currentEvent.id,
            unlockedAt: Date.now()
        };

        this.eventRewards.push(reward);
        localStorage.setItem('eventRewards', JSON.stringify(this.eventRewards));

        this.game.showNotification(`🌟 Exclusive Reward Unlocked: ${reward.name}!`, 'legendary');
        this.updateUI();
    }

    getXPMultiplier() {
        if (!this.currentEvent) return 1;
        return this.currentEvent.bonuses.xp || 1;
    }

    getItemMultiplier() {
        if (!this.currentEvent) return 1;
        return this.currentEvent.bonuses.items || 1;
    }
}
