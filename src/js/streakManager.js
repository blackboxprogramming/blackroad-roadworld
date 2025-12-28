// Streak & Daily Rewards System for RoadWorld
// Tracks consecutive login days and awards bonuses

export class StreakManager {
    constructor(gameEngine, storageManager) {
        this.gameEngine = gameEngine;
        this.storageManager = storageManager;

        // Load streak data
        this.streakData = this.loadStreakData();

        // Define daily rewards
        this.dailyRewards = this.defineDailyRewards();
    }

    defineDailyRewards() {
        return [
            { day: 1, xp: 50, items: { stars: 5 }, bonus: null },
            { day: 2, xp: 75, items: { stars: 10 }, bonus: null },
            { day: 3, xp: 100, items: { stars: 10, gems: 2 }, bonus: '1.25x XP for 1 hour' },
            { day: 4, xp: 125, items: { stars: 15, gems: 3 }, bonus: null },
            { day: 5, xp: 150, items: { stars: 20, gems: 5 }, bonus: null },
            { day: 6, xp: 200, items: { stars: 25, gems: 5, trophies: 1 }, bonus: '1.5x XP for 1 hour' },
            { day: 7, xp: 500, items: { stars: 50, gems: 10, trophies: 2, keys: 1 }, bonus: '2x XP for 2 hours' }
        ];
    }

    loadStreakData() {
        const data = this.storageManager.data.streak || {
            currentStreak: 0,
            longestStreak: 0,
            lastLoginDate: null,
            totalLogins: 0,
            todayClaimed: false,
            activeBonus: null
        };
        return data;
    }

    saveStreakData() {
        this.storageManager.data.streak = this.streakData;
        this.storageManager.save();
    }

    checkLogin() {
        const today = new Date().toDateString();
        const lastLogin = this.streakData.lastLoginDate;

        if (lastLogin === today) {
            // Already logged in today
            return {
                isNewDay: false,
                streak: this.streakData.currentStreak,
                reward: null
            };
        }

        // Calculate days since last login
        let streakContinues = false;
        if (lastLogin) {
            const lastDate = new Date(lastLogin);
            const todayDate = new Date(today);
            const diffTime = todayDate - lastDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Consecutive day
                streakContinues = true;
                this.streakData.currentStreak++;
            } else if (diffDays > 1) {
                // Streak broken
                this.streakData.currentStreak = 1;
            }
        } else {
            // First login
            this.streakData.currentStreak = 1;
        }

        // Update stats
        this.streakData.lastLoginDate = today;
        this.streakData.totalLogins++;
        this.streakData.todayClaimed = false;

        // Update longest streak
        if (this.streakData.currentStreak > this.streakData.longestStreak) {
            this.streakData.longestStreak = this.streakData.currentStreak;
        }

        this.saveStreakData();

        return {
            isNewDay: true,
            streak: this.streakData.currentStreak,
            streakContinues,
            reward: this.getTodayReward()
        };
    }

    getTodayReward() {
        const dayIndex = ((this.streakData.currentStreak - 1) % 7);
        return this.dailyRewards[dayIndex];
    }

    claimDailyReward() {
        if (this.streakData.todayClaimed) {
            return { success: false, message: 'Already claimed today!' };
        }

        const reward = this.getTodayReward();

        // Award XP
        if (this.gameEngine && reward.xp) {
            this.gameEngine.addXP(reward.xp, 'daily login reward');
        }

        // Award items
        if (this.gameEngine && reward.items) {
            const player = this.gameEngine.player;
            for (const [item, count] of Object.entries(reward.items)) {
                player.inventory[item] = (player.inventory[item] || 0) + count;
            }
            this.gameEngine.savePlayer();
        }

        // Apply bonus
        if (reward.bonus) {
            this.activateBonus(reward.bonus);
        }

        this.streakData.todayClaimed = true;
        this.saveStreakData();

        return {
            success: true,
            reward,
            streak: this.streakData.currentStreak
        };
    }

    activateBonus(bonusString) {
        // Parse bonus string like "1.5x XP for 1 hour"
        const match = bonusString.match(/([\d.]+)x XP for (\d+) hour/);
        if (!match) return;

        const multiplier = parseFloat(match[1]);
        const hours = parseInt(match[2]);
        const expiresAt = Date.now() + hours * 60 * 60 * 1000;

        this.streakData.activeBonus = {
            type: 'xp_multiplier',
            multiplier,
            expiresAt,
            description: bonusString
        };

        this.saveStreakData();
        console.log(`✨ Bonus activated: ${bonusString}`);
    }

    getActiveBonus() {
        if (!this.streakData.activeBonus) return null;

        if (Date.now() > this.streakData.activeBonus.expiresAt) {
            // Bonus expired
            this.streakData.activeBonus = null;
            this.saveStreakData();
            return null;
        }

        return this.streakData.activeBonus;
    }

    getXPMultiplier() {
        const bonus = this.getActiveBonus();
        return bonus ? bonus.multiplier : 1;
    }

    getStreakInfo() {
        return {
            currentStreak: this.streakData.currentStreak,
            longestStreak: this.streakData.longestStreak,
            totalLogins: this.streakData.totalLogins,
            todayClaimed: this.streakData.todayClaimed,
            todayReward: this.getTodayReward(),
            activeBonus: this.getActiveBonus(),
            weekProgress: this.getWeekProgress()
        };
    }

    getWeekProgress() {
        const progress = [];
        const currentDay = ((this.streakData.currentStreak - 1) % 7) + 1;

        for (let i = 0; i < 7; i++) {
            const dayNum = i + 1;
            progress.push({
                day: dayNum,
                reward: this.dailyRewards[i],
                completed: this.streakData.todayClaimed ? dayNum <= currentDay : dayNum < currentDay,
                current: dayNum === currentDay,
                locked: dayNum > currentDay
            });
        }

        return progress;
    }

    getBonusTimeRemaining() {
        const bonus = this.getActiveBonus();
        if (!bonus) return null;

        const remaining = bonus.expiresAt - Date.now();
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

        return { hours, minutes, formatted: `${hours}h ${minutes}m` };
    }
}
