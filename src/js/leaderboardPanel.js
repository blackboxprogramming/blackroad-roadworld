// Leaderboard Panel for RoadWorld
// Displays player rankings and records

export class LeaderboardPanel {
    constructor(gameEngine, storageManager) {
        this.gameEngine = gameEngine;
        this.storageManager = storageManager;
        this.panelElement = null;
        this.isVisible = false;

        // Leaderboard categories
        this.categories = {
            xp: { name: 'Experience', icon: '⭐', format: (v) => `${v.toLocaleString()} XP` },
            distance: { name: 'Distance', icon: '🚶', format: (v) => `${(v/1000).toFixed(2)} km` },
            items: { name: 'Items Collected', icon: '✨', format: (v) => v.toLocaleString() },
            level: { name: 'Level', icon: '🎖️', format: (v) => `Level ${v}` },
            streak: { name: 'Login Streak', icon: '🔥', format: (v) => `${v} days` },
            combo: { name: 'Max Combo', icon: '💥', format: (v) => `${v}x` }
        };
    }

    init() {
        this.createPanel();
        this.loadRecords();
        console.log('🏆 Leaderboard Panel initialized');
    }

    createPanel() {
        this.panelElement = document.createElement('div');
        this.panelElement.className = 'leaderboard-panel ui-overlay';
        this.panelElement.id = 'leaderboard-panel';
        this.panelElement.style.display = 'none';

        this.panelElement.innerHTML = `
            <div class="panel-header">
                <span>🏆 Leaderboards</span>
                <button class="panel-close" id="leaderboard-close">✕</button>
            </div>
            <div class="panel-content leaderboard-content">
                <div class="leaderboard-tabs">
                    <button class="leaderboard-tab active" data-category="xp">⭐ XP</button>
                    <button class="leaderboard-tab" data-category="distance">🚶 Distance</button>
                    <button class="leaderboard-tab" data-category="items">✨ Items</button>
                    <button class="leaderboard-tab" data-category="level">🎖️ Level</button>
                </div>
                <div class="leaderboard-records" id="leaderboard-records"></div>
                <div class="leaderboard-your-stats">
                    <div class="your-stats-header">Your Records</div>
                    <div class="your-stats-grid" id="your-stats-grid"></div>
                </div>
            </div>
        `;

        document.body.appendChild(this.panelElement);
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('leaderboard-close').addEventListener('click', () => {
            this.hide();
        });

        this.panelElement.querySelectorAll('.leaderboard-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.switchCategory(category);
            });
        });
    }

    loadRecords() {
        // Load personal records
        this.records = this.storageManager.data.records || {
            highestXP: 0,
            furthestDistance: 0,
            mostItems: 0,
            highestLevel: 0,
            longestStreak: 0,
            maxCombo: 0,
            fastestLevel: Infinity,
            sessions: []
        };
    }

    saveRecords() {
        this.storageManager.data.records = this.records;
        this.storageManager.save();
    }

    updateRecord(category, value) {
        const recordKey = this.getRecordKey(category);
        if (!recordKey) return;

        const currentRecord = this.records[recordKey] || 0;

        if (category === 'fastestLevel') {
            if (value < currentRecord) {
                this.records[recordKey] = value;
                this.saveRecords();
                return { isNewRecord: true, oldRecord: currentRecord, newRecord: value };
            }
        } else {
            if (value > currentRecord) {
                this.records[recordKey] = value;
                this.saveRecords();
                return { isNewRecord: true, oldRecord: currentRecord, newRecord: value };
            }
        }

        return { isNewRecord: false };
    }

    getRecordKey(category) {
        const keys = {
            xp: 'highestXP',
            distance: 'furthestDistance',
            items: 'mostItems',
            level: 'highestLevel',
            streak: 'longestStreak',
            combo: 'maxCombo'
        };
        return keys[category];
    }

    switchCategory(category) {
        // Update active tab
        this.panelElement.querySelectorAll('.leaderboard-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === category);
        });

        // Show records for category
        this.renderCategory(category);
    }

    renderCategory(category) {
        const recordsEl = document.getElementById('leaderboard-records');
        const cat = this.categories[category];

        // For now, show personal best (could be expanded with actual multiplayer)
        const player = this.gameEngine.player;
        let value;

        switch (category) {
            case 'xp':
                value = player.xp + (player.level - 1) * player.xpToNextLevel;
                break;
            case 'distance':
                value = player.stats.distanceTraveled;
                break;
            case 'items':
                value = player.stats.itemsCollected;
                break;
            case 'level':
                value = player.level;
                break;
        }

        recordsEl.innerHTML = `
            <div class="leaderboard-section">
                <div class="leaderboard-title">${cat.icon} ${cat.name} Rankings</div>
                <div class="leaderboard-list">
                    <div class="leaderboard-entry rank-1 current-player">
                        <div class="entry-rank">🥇</div>
                        <div class="entry-avatar" style="background: ${player.avatar.color}">🧑‍🚀</div>
                        <div class="entry-info">
                            <div class="entry-name">${player.username}</div>
                            <div class="entry-value">${cat.format(value)}</div>
                        </div>
                        <div class="entry-badge">You!</div>
                    </div>

                    <div class="leaderboard-placeholder">
                        <div class="placeholder-icon">🌐</div>
                        <div class="placeholder-text">
                            Global leaderboards coming soon!<br>
                            <small>Connect with players worldwide</small>
                        </div>
                    </div>
                </div>
            </div>

            <div class="leaderboard-section">
                <div class="leaderboard-title">📊 Personal Best</div>
                <div class="personal-best">
                    <div class="personal-best-value">${cat.format(this.records[this.getRecordKey(category)] || value)}</div>
                    <div class="personal-best-label">Your all-time record</div>
                </div>
            </div>
        `;

        this.renderYourStats();
    }

    renderYourStats() {
        const player = this.gameEngine.player;
        const statsGrid = document.getElementById('your-stats-grid');

        const stats = [
            { icon: '⭐', label: 'Total XP', value: player.xp },
            { icon: '🎖️', label: 'Level', value: player.level },
            { icon: '🚶', label: 'Distance', value: `${(player.stats.distanceTraveled/1000).toFixed(2)} km` },
            { icon: '✨', label: 'Items', value: player.stats.itemsCollected },
            { icon: '🔥', label: 'Streak', value: `${this.records.longestStreak || 0} days` },
            { icon: '💥', label: 'Max Combo', value: `${this.records.maxCombo || 0}x` }
        ];

        statsGrid.innerHTML = stats.map(stat => `
            <div class="your-stat-item">
                <div class="your-stat-icon">${stat.icon}</div>
                <div class="your-stat-value">${stat.value}</div>
                <div class="your-stat-label">${stat.label}</div>
            </div>
        `).join('');
    }

    show() {
        this.isVisible = true;
        this.panelElement.style.display = 'block';
        this.switchCategory('xp');
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

    // Check for new records after game actions
    checkAllRecords() {
        const player = this.gameEngine.player;

        const checks = [
            { cat: 'xp', value: player.xp },
            { cat: 'distance', value: player.stats.distanceTraveled },
            { cat: 'items', value: player.stats.itemsCollected },
            { cat: 'level', value: player.level }
        ];

        const newRecords = [];
        checks.forEach(check => {
            const result = this.updateRecord(check.cat, check.value);
            if (result.isNewRecord) {
                newRecords.push({ category: check.cat, ...result });
            }
        });

        return newRecords;
    }
}
