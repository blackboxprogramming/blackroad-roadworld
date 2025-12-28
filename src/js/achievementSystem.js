/**
 * Achievement System - Unlockable achievements and badges
 * RoadWorld v7.0
 */

export class AchievementSystem {
    constructor(game) {
        this.game = game;
        this.unlockedAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        this.achievementProgress = JSON.parse(localStorage.getItem('achievementProgress') || '{}');
        this.totalPoints = 0;
        this.displayedBadges = JSON.parse(localStorage.getItem('displayedBadges') || '[]');

        this.achievements = {
            // Exploration achievements
            first_steps: {
                id: 'first_steps',
                name: 'First Steps',
                description: 'Start your journey in RoadWorld',
                icon: '👣',
                category: 'exploration',
                points: 10,
                rarity: 'common',
                requirement: { type: 'auto', value: 1 }
            },
            wanderer: {
                id: 'wanderer',
                name: 'Wanderer',
                description: 'Travel 10 kilometers',
                icon: '🚶',
                category: 'exploration',
                points: 25,
                rarity: 'common',
                requirement: { type: 'distance', value: 10 }
            },
            marathon_runner: {
                id: 'marathon_runner',
                name: 'Marathon Runner',
                description: 'Travel 42 kilometers',
                icon: '🏃',
                category: 'exploration',
                points: 50,
                rarity: 'uncommon',
                requirement: { type: 'distance', value: 42 }
            },
            globe_trotter: {
                id: 'globe_trotter',
                name: 'Globe Trotter',
                description: 'Travel 1000 kilometers',
                icon: '🌍',
                category: 'exploration',
                points: 200,
                rarity: 'legendary',
                requirement: { type: 'distance', value: 1000 }
            },
            night_owl: {
                id: 'night_owl',
                name: 'Night Owl',
                description: 'Explore during nighttime',
                icon: '🦉',
                category: 'exploration',
                points: 30,
                rarity: 'uncommon',
                requirement: { type: 'time_period', value: 'night' }
            },
            early_bird: {
                id: 'early_bird',
                name: 'Early Bird',
                description: 'Explore at dawn',
                icon: '🐦',
                category: 'exploration',
                points: 30,
                rarity: 'uncommon',
                requirement: { type: 'time_period', value: 'dawn' }
            },

            // Collection achievements
            collector: {
                id: 'collector',
                name: 'Collector',
                description: 'Collect 100 items',
                icon: '🎒',
                category: 'collection',
                points: 25,
                rarity: 'common',
                requirement: { type: 'items_collected', value: 100 }
            },
            treasure_hunter: {
                id: 'treasure_hunter',
                name: 'Treasure Hunter',
                description: 'Collect 1000 items',
                icon: '💎',
                category: 'collection',
                points: 100,
                rarity: 'rare',
                requirement: { type: 'items_collected', value: 1000 }
            },
            star_gazer: {
                id: 'star_gazer',
                name: 'Star Gazer',
                description: 'Collect 500 stars',
                icon: '⭐',
                category: 'collection',
                points: 50,
                rarity: 'uncommon',
                requirement: { type: 'stars', value: 500 }
            },
            gem_master: {
                id: 'gem_master',
                name: 'Gem Master',
                description: 'Collect 100 gems',
                icon: '💠',
                category: 'collection',
                points: 75,
                rarity: 'rare',
                requirement: { type: 'gems', value: 100 }
            },
            key_keeper: {
                id: 'key_keeper',
                name: 'Key Keeper',
                description: 'Collect 50 keys',
                icon: '🔑',
                category: 'collection',
                points: 60,
                rarity: 'uncommon',
                requirement: { type: 'keys', value: 50 }
            },

            // Level achievements
            level_10: {
                id: 'level_10',
                name: 'Rising Star',
                description: 'Reach level 10',
                icon: '🌟',
                category: 'progression',
                points: 25,
                rarity: 'common',
                requirement: { type: 'level', value: 10 }
            },
            level_25: {
                id: 'level_25',
                name: 'Experienced',
                description: 'Reach level 25',
                icon: '🏅',
                category: 'progression',
                points: 50,
                rarity: 'uncommon',
                requirement: { type: 'level', value: 25 }
            },
            level_50: {
                id: 'level_50',
                name: 'Veteran',
                description: 'Reach level 50',
                icon: '🎖️',
                category: 'progression',
                points: 100,
                rarity: 'rare',
                requirement: { type: 'level', value: 50 }
            },
            level_100: {
                id: 'level_100',
                name: 'Legend',
                description: 'Reach level 100',
                icon: '👑',
                category: 'progression',
                points: 300,
                rarity: 'legendary',
                requirement: { type: 'level', value: 100 }
            },

            // Social achievements
            first_friend: {
                id: 'first_friend',
                name: 'Friendly',
                description: 'Add your first friend',
                icon: '🤝',
                category: 'social',
                points: 15,
                rarity: 'common',
                requirement: { type: 'friends', value: 1 }
            },
            social_butterfly: {
                id: 'social_butterfly',
                name: 'Social Butterfly',
                description: 'Add 10 friends',
                icon: '🦋',
                category: 'social',
                points: 50,
                rarity: 'uncommon',
                requirement: { type: 'friends', value: 10 }
            },
            team_player: {
                id: 'team_player',
                name: 'Team Player',
                description: 'Join a guild',
                icon: '⚔️',
                category: 'social',
                points: 30,
                rarity: 'uncommon',
                requirement: { type: 'guild', value: 1 }
            },

            // Challenge achievements
            speed_demon: {
                id: 'speed_demon',
                name: 'Speed Demon',
                description: 'Complete a time trial challenge',
                icon: '⚡',
                category: 'challenge',
                points: 40,
                rarity: 'uncommon',
                requirement: { type: 'challenge_complete', value: 'time_trial' }
            },
            perfectionist: {
                id: 'perfectionist',
                name: 'Perfectionist',
                description: 'Get a gold medal in any challenge',
                icon: '🥇',
                category: 'challenge',
                points: 75,
                rarity: 'rare',
                requirement: { type: 'medal', value: 'gold' }
            },
            challenger: {
                id: 'challenger',
                name: 'Challenger',
                description: 'Complete 25 challenges',
                icon: '🏆',
                category: 'challenge',
                points: 100,
                rarity: 'rare',
                requirement: { type: 'challenges_complete', value: 25 }
            },

            // Special achievements
            weather_warrior: {
                id: 'weather_warrior',
                name: 'Weather Warrior',
                description: 'Play in every weather condition',
                icon: '🌈',
                category: 'special',
                points: 100,
                rarity: 'rare',
                requirement: { type: 'all_weather', value: 8 }
            },
            pet_lover: {
                id: 'pet_lover',
                name: 'Pet Lover',
                description: 'Unlock all pets',
                icon: '🐾',
                category: 'special',
                points: 150,
                rarity: 'epic',
                requirement: { type: 'pets', value: 8 }
            },
            master_crafter: {
                id: 'master_crafter',
                name: 'Master Crafter',
                description: 'Craft 50 items',
                icon: '🔨',
                category: 'special',
                points: 80,
                rarity: 'rare',
                requirement: { type: 'crafted', value: 50 }
            },
            skill_master: {
                id: 'skill_master',
                name: 'Skill Master',
                description: 'Unlock all skills in one branch',
                icon: '🌳',
                category: 'special',
                points: 100,
                rarity: 'rare',
                requirement: { type: 'skill_branch_complete', value: 1 }
            },
            photo_expert: {
                id: 'photo_expert',
                name: 'Photo Expert',
                description: 'Take 100 photos',
                icon: '📸',
                category: 'special',
                points: 50,
                rarity: 'uncommon',
                requirement: { type: 'photos', value: 100 }
            },

            // Secret achievements
            secret_spot: {
                id: 'secret_spot',
                name: '???',
                description: 'Find a hidden location',
                icon: '❓',
                category: 'secret',
                points: 100,
                rarity: 'legendary',
                hidden: true,
                requirement: { type: 'secret', value: 'hidden_spot' }
            },
            midnight_special: {
                id: 'midnight_special',
                name: 'Midnight Special',
                description: 'Play at exactly midnight',
                icon: '🌙',
                category: 'secret',
                points: 75,
                rarity: 'epic',
                hidden: true,
                requirement: { type: 'time', value: '00:00' }
            }
        };

        this.categories = {
            exploration: { name: 'Exploration', icon: '🗺️', color: '#4CAF50' },
            collection: { name: 'Collection', icon: '💎', color: '#9C27B0' },
            progression: { name: 'Progression', icon: '📈', color: '#2196F3' },
            social: { name: 'Social', icon: '👥', color: '#FF9800' },
            challenge: { name: 'Challenges', icon: '🏆', color: '#F44336' },
            special: { name: 'Special', icon: '✨', color: '#FFD700' },
            secret: { name: 'Secret', icon: '🔒', color: '#607D8B' }
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
        this.calculateTotalPoints();
        this.checkForMidnight();

        // Auto-unlock first steps
        if (!this.isUnlocked('first_steps')) {
            this.unlock('first_steps');
        }
    }

    createUI() {
        const panel = document.createElement('div');
        panel.id = 'achievement-panel';
        panel.className = 'game-panel achievement-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <h3>🏆 Achievements</h3>
                <button class="close-btn" id="close-achievements">×</button>
            </div>
            <div class="panel-content">
                <div class="achievement-stats">
                    <div class="stat-box">
                        <span class="stat-value" id="unlocked-count">0</span>
                        <span class="stat-label">Unlocked</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-value" id="total-achievements">${Object.keys(this.achievements).length}</span>
                        <span class="stat-label">Total</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-value" id="achievement-points">0</span>
                        <span class="stat-label">Points</span>
                    </div>
                </div>

                <div class="achievement-progress-bar">
                    <div class="progress-fill" id="achievement-progress-fill"></div>
                    <span class="progress-text" id="achievement-progress-text">0%</span>
                </div>

                <div class="badge-showcase">
                    <h4>🎖️ Displayed Badges</h4>
                    <div id="displayed-badges" class="badge-slots">
                        <div class="badge-slot empty">+</div>
                        <div class="badge-slot empty">+</div>
                        <div class="badge-slot empty">+</div>
                    </div>
                </div>

                <div class="category-tabs" id="category-tabs"></div>

                <div class="achievements-list" id="achievements-list"></div>
            </div>
        `;
        document.body.appendChild(panel);

        // Achievement notification
        const notification = document.createElement('div');
        notification.id = 'achievement-notification';
        notification.className = 'achievement-notification hidden';
        notification.innerHTML = `
            <div class="notif-icon">🏆</div>
            <div class="notif-content">
                <div class="notif-title">Achievement Unlocked!</div>
                <div class="notif-name" id="notif-achievement-name"></div>
            </div>
        `;
        document.body.appendChild(notification);

        this.createCategoryTabs();
        this.setupEventListeners();
        this.updateUI();
    }

    createCategoryTabs() {
        const container = document.getElementById('category-tabs');

        container.innerHTML = `
            <button class="cat-tab active" data-category="all">All</button>
            ${Object.entries(this.categories).map(([key, cat]) =>
                `<button class="cat-tab" data-category="${key}">${cat.icon}</button>`
            ).join('')}
        `;
    }

    setupEventListeners() {
        document.getElementById('close-achievements').addEventListener('click', () => {
            this.hidePanel();
        });

        document.querySelectorAll('.cat-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.filterByCategory(e.target.dataset.category);
            });
        });
    }

    showPanel() {
        document.getElementById('achievement-panel').classList.add('active');
        this.updateUI();
    }

    hidePanel() {
        document.getElementById('achievement-panel').classList.remove('active');
    }

    filterByCategory(category) {
        this.updateUI(category);
    }

    updateUI(filterCategory = 'all') {
        // Update stats
        document.getElementById('unlocked-count').textContent = this.unlockedAchievements.length;
        document.getElementById('achievement-points').textContent = this.totalPoints;

        const progress = (this.unlockedAchievements.length / Object.keys(this.achievements).length) * 100;
        document.getElementById('achievement-progress-fill').style.width = `${progress}%`;
        document.getElementById('achievement-progress-text').textContent = `${Math.round(progress)}%`;

        // Update displayed badges
        this.updateDisplayedBadges();

        // Update achievements list
        this.updateAchievementsList(filterCategory);
    }

    updateDisplayedBadges() {
        const container = document.getElementById('displayed-badges');
        const slots = container.querySelectorAll('.badge-slot');

        slots.forEach((slot, index) => {
            if (this.displayedBadges[index]) {
                const achievement = this.achievements[this.displayedBadges[index]];
                if (achievement) {
                    slot.className = 'badge-slot filled';
                    slot.innerHTML = `<span class="badge-icon">${achievement.icon}</span>`;
                    slot.title = achievement.name;
                }
            } else {
                slot.className = 'badge-slot empty';
                slot.innerHTML = '+';
            }
        });
    }

    updateAchievementsList(filterCategory) {
        const container = document.getElementById('achievements-list');
        let achievements = Object.values(this.achievements);

        if (filterCategory !== 'all') {
            achievements = achievements.filter(a => a.category === filterCategory);
        }

        // Sort: unlocked first, then by points
        achievements.sort((a, b) => {
            const aUnlocked = this.isUnlocked(a.id);
            const bUnlocked = this.isUnlocked(b.id);
            if (aUnlocked !== bUnlocked) return bUnlocked - aUnlocked;
            return b.points - a.points;
        });

        container.innerHTML = achievements.map(achievement => {
            const unlocked = this.isUnlocked(achievement.id);
            const hidden = achievement.hidden && !unlocked;
            const progress = this.getProgress(achievement.id);

            return `
                <div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}"
                     style="--rarity-color: ${this.rarityColors[achievement.rarity]}">
                    <div class="achievement-icon ${hidden ? 'hidden-icon' : ''}">
                        ${hidden ? '❓' : achievement.icon}
                    </div>
                    <div class="achievement-info">
                        <div class="achievement-name">${hidden ? '???' : achievement.name}</div>
                        <div class="achievement-desc">${hidden ? 'Secret achievement' : achievement.description}</div>
                        ${!unlocked && progress !== null ? `
                            <div class="achievement-progress">
                                <div class="mini-progress-bar">
                                    <div class="mini-progress-fill" style="width: ${progress}%"></div>
                                </div>
                                <span>${Math.round(progress)}%</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="achievement-meta">
                        <span class="achievement-points">${achievement.points} pts</span>
                        <span class="achievement-rarity ${achievement.rarity}">${achievement.rarity}</span>
                    </div>
                    ${unlocked ? `<button class="display-badge-btn" onclick="window.achievementSystem.toggleBadge('${achievement.id}')">🎖️</button>` : ''}
                </div>
            `;
        }).join('');
    }

    isUnlocked(achievementId) {
        return this.unlockedAchievements.includes(achievementId);
    }

    getProgress(achievementId) {
        const progress = this.achievementProgress[achievementId];
        const achievement = this.achievements[achievementId];

        if (!progress || !achievement) return null;

        const req = achievement.requirement;
        if (req.type === 'auto') return 100;

        return Math.min(100, (progress / req.value) * 100);
    }

    unlock(achievementId) {
        if (this.isUnlocked(achievementId)) return;

        const achievement = this.achievements[achievementId];
        if (!achievement) return;

        this.unlockedAchievements.push(achievementId);
        localStorage.setItem('achievements', JSON.stringify(this.unlockedAchievements));

        this.totalPoints += achievement.points;
        this.calculateTotalPoints();

        // Show notification
        this.showUnlockNotification(achievement);

        // Add XP bonus
        this.game.addXP(achievement.points * 10);

        this.updateUI();
    }

    showUnlockNotification(achievement) {
        const notif = document.getElementById('achievement-notification');
        document.getElementById('notif-achievement-name').textContent = `${achievement.icon} ${achievement.name}`;

        notif.classList.remove('hidden');
        notif.classList.add('show');

        // Play sound
        this.playUnlockSound();

        setTimeout(() => {
            notif.classList.remove('show');
            notif.classList.add('hidden');
        }, 4000);
    }

    playUnlockSound() {
        // Create achievement unlock sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

        notes.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + index * 0.1);
            gainNode.gain.exponentialDecayTo = 0.01;

            oscillator.start(audioContext.currentTime + index * 0.1);
            oscillator.stop(audioContext.currentTime + index * 0.1 + 0.3);
        });
    }

    updateProgress(type, value) {
        Object.entries(this.achievements).forEach(([id, achievement]) => {
            if (this.isUnlocked(id)) return;

            const req = achievement.requirement;
            if (req.type !== type) return;

            // Update progress
            if (!this.achievementProgress[id]) {
                this.achievementProgress[id] = 0;
            }

            if (typeof value === 'number') {
                this.achievementProgress[id] = value;
            } else if (typeof value === 'string' && req.value === value) {
                this.achievementProgress[id] = 1;
            }

            localStorage.setItem('achievementProgress', JSON.stringify(this.achievementProgress));

            // Check if completed
            if (this.achievementProgress[id] >= req.value) {
                this.unlock(id);
            }
        });
    }

    calculateTotalPoints() {
        this.totalPoints = this.unlockedAchievements.reduce((sum, id) => {
            const achievement = this.achievements[id];
            return sum + (achievement ? achievement.points : 0);
        }, 0);
    }

    toggleBadge(achievementId) {
        const index = this.displayedBadges.indexOf(achievementId);

        if (index > -1) {
            this.displayedBadges.splice(index, 1);
        } else if (this.displayedBadges.length < 3) {
            this.displayedBadges.push(achievementId);
        } else {
            this.game.showNotification('Maximum 3 badges can be displayed!', 'warning');
            return;
        }

        localStorage.setItem('displayedBadges', JSON.stringify(this.displayedBadges));
        this.updateUI();
    }

    checkForMidnight() {
        setInterval(() => {
            const now = new Date();
            if (now.getHours() === 0 && now.getMinutes() === 0) {
                this.unlock('midnight_special');
            }
        }, 60000);
    }

    // Called by other systems to check achievements
    checkDistance(totalDistance) {
        this.updateProgress('distance', totalDistance);
    }

    checkLevel(level) {
        this.updateProgress('level', level);
    }

    checkItems(count) {
        this.updateProgress('items_collected', count);
    }

    checkStars(count) {
        this.updateProgress('stars', count);
    }

    checkGems(count) {
        this.updateProgress('gems', count);
    }

    checkKeys(count) {
        this.updateProgress('keys', count);
    }

    checkFriends(count) {
        this.updateProgress('friends', count);
    }

    checkWeather(weatherType) {
        const weathersSeen = JSON.parse(localStorage.getItem('weathersSeen') || '[]');
        if (!weathersSeen.includes(weatherType)) {
            weathersSeen.push(weatherType);
            localStorage.setItem('weathersSeen', JSON.stringify(weathersSeen));
        }
        this.updateProgress('all_weather', weathersSeen.length);
    }

    checkTimePeriod(period) {
        this.updateProgress('time_period', period);
    }

    checkPhotos(count) {
        this.updateProgress('photos', count);
    }

    checkCrafted(count) {
        this.updateProgress('crafted', count);
    }

    checkChallenges(count) {
        this.updateProgress('challenges_complete', count);
    }

    checkMedal(medalType) {
        this.updateProgress('medal', medalType);
    }
}

// Global reference
window.achievementSystem = null;
