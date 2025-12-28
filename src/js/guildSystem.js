/**
 * Guild System - Team up with other players
 * RoadWorld v7.0
 */

export class GuildSystem {
    constructor(game) {
        this.game = game;
        this.currentGuild = JSON.parse(localStorage.getItem('currentGuild') || 'null');
        this.guildInvites = JSON.parse(localStorage.getItem('guildInvites') || '[]');
        this.guildContributions = JSON.parse(localStorage.getItem('guildContributions') || '{}');

        this.guildRanks = {
            leader: { name: 'Guild Leader', icon: '👑', permissions: ['all'] },
            officer: { name: 'Officer', icon: '⚔️', permissions: ['invite', 'kick', 'announce'] },
            veteran: { name: 'Veteran', icon: '🛡️', permissions: ['invite'] },
            member: { name: 'Member', icon: '👤', permissions: [] }
        };

        this.guildPerks = {
            xp_boost: { name: 'XP Boost', icon: '📈', description: '+10% XP per level', maxLevel: 5 },
            star_boost: { name: 'Star Boost', icon: '⭐', description: '+5% stars per level', maxLevel: 5 },
            storage: { name: 'Guild Storage', icon: '📦', description: '+100 storage per level', maxLevel: 10 },
            speed_boost: { name: 'Speed Boost', icon: '⚡', description: '+5% speed per level', maxLevel: 3 },
            lucky: { name: 'Lucky Find', icon: '🍀', description: '+2% rare items per level', maxLevel: 5 }
        };

        // Simulated guilds for demo
        this.availableGuilds = [
            {
                id: 'guild_explorers',
                name: 'The Explorers Guild',
                tag: 'EXP',
                icon: '🗺️',
                description: 'For those who love to explore every corner of the world!',
                members: 24,
                maxMembers: 50,
                level: 8,
                requirement: { level: 5 },
                perks: { xp_boost: 3, star_boost: 2, storage: 5 }
            },
            {
                id: 'guild_collectors',
                name: 'Collector\'s Club',
                tag: 'COL',
                icon: '💎',
                description: 'Dedicated to collecting every item in the game.',
                members: 42,
                maxMembers: 50,
                level: 12,
                requirement: { level: 10 },
                perks: { star_boost: 5, lucky: 3, storage: 8 }
            },
            {
                id: 'guild_speedsters',
                name: 'Speed Demons',
                tag: 'SPD',
                icon: '⚡',
                description: 'The fastest players in RoadWorld!',
                members: 18,
                maxMembers: 30,
                level: 6,
                requirement: { level: 3 },
                perks: { speed_boost: 3, xp_boost: 2 }
            },
            {
                id: 'guild_legends',
                name: 'Legendary Knights',
                tag: 'LEG',
                icon: '🏆',
                description: 'Only the best of the best may join.',
                members: 15,
                maxMembers: 25,
                level: 20,
                requirement: { level: 25 },
                perks: { xp_boost: 5, star_boost: 5, speed_boost: 3, lucky: 5, storage: 10 }
            }
        ];

        this.init();
    }

    init() {
        this.createUI();
        this.updateUI();
    }

    createUI() {
        const panel = document.createElement('div');
        panel.id = 'guild-panel';
        panel.className = 'game-panel guild-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <h3>⚔️ Guilds</h3>
                <button class="close-btn" id="close-guild">×</button>
            </div>
            <div class="panel-content">
                <div id="guild-content"></div>
            </div>
        `;
        document.body.appendChild(panel);

        // Create guild modal
        const createModal = document.createElement('div');
        createModal.id = 'create-guild-modal';
        createModal.className = 'create-guild-modal hidden';
        createModal.innerHTML = `
            <div class="modal-content">
                <h3>Create New Guild</h3>
                <div class="form-group">
                    <label>Guild Name</label>
                    <input type="text" id="new-guild-name" maxlength="30" placeholder="Enter guild name">
                </div>
                <div class="form-group">
                    <label>Guild Tag (3-4 characters)</label>
                    <input type="text" id="new-guild-tag" maxlength="4" placeholder="TAG">
                </div>
                <div class="form-group">
                    <label>Guild Icon</label>
                    <div class="icon-selector" id="guild-icon-selector">
                        ${['⚔️', '🛡️', '🗡️', '🏰', '🐉', '🦅', '🦁', '🐺', '🌟', '💎', '🔥', '❄️', '⚡', '🌙', '☀️', '🌈'].map(icon =>
                            `<span class="icon-option" data-icon="${icon}">${icon}</span>`
                        ).join('')}
                    </div>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="new-guild-desc" maxlength="200" placeholder="Describe your guild..."></textarea>
                </div>
                <div class="creation-cost">
                    <span>Cost: 💎 100 Gems</span>
                </div>
                <div class="modal-actions">
                    <button id="confirm-create-guild">Create Guild</button>
                    <button id="cancel-create-guild">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(createModal);

        // Guild widget
        const widget = document.createElement('div');
        widget.id = 'guild-widget';
        widget.className = 'guild-widget';
        widget.innerHTML = `<span id="guild-widget-icon">⚔️</span>`;
        document.body.appendChild(widget);

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('close-guild').addEventListener('click', () => {
            this.hidePanel();
        });

        document.getElementById('guild-widget').addEventListener('click', () => {
            this.showPanel();
        });

        document.getElementById('cancel-create-guild').addEventListener('click', () => {
            this.hideCreateModal();
        });

        document.getElementById('confirm-create-guild').addEventListener('click', () => {
            this.createGuild();
        });

        document.querySelectorAll('.icon-option').forEach(opt => {
            opt.addEventListener('click', (e) => {
                document.querySelectorAll('.icon-option').forEach(o => o.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });
    }

    showPanel() {
        document.getElementById('guild-panel').classList.add('active');
        this.updateUI();
    }

    hidePanel() {
        document.getElementById('guild-panel').classList.remove('active');
    }

    showCreateModal() {
        document.getElementById('create-guild-modal').classList.remove('hidden');
    }

    hideCreateModal() {
        document.getElementById('create-guild-modal').classList.add('hidden');
    }

    updateUI() {
        const content = document.getElementById('guild-content');

        if (this.currentGuild) {
            this.renderGuildView(content);
        } else {
            this.renderNoGuildView(content);
        }

        // Update widget
        if (this.currentGuild) {
            document.getElementById('guild-widget-icon').textContent = this.currentGuild.icon;
        }
    }

    renderNoGuildView(container) {
        container.innerHTML = `
            <div class="no-guild-view">
                <div class="no-guild-message">
                    <span class="big-icon">⚔️</span>
                    <h3>You're not in a guild</h3>
                    <p>Join a guild to team up with other players and earn bonus rewards!</p>
                </div>

                <div class="guild-actions">
                    <button id="create-guild-btn" class="action-btn primary">Create Guild (💎100)</button>
                    <button id="browse-guilds-btn" class="action-btn">Browse Guilds</button>
                </div>

                ${this.guildInvites.length > 0 ? `
                    <div class="guild-invites">
                        <h4>📩 Pending Invites (${this.guildInvites.length})</h4>
                        ${this.guildInvites.map(invite => `
                            <div class="invite-item">
                                <span>${invite.guildIcon} ${invite.guildName}</span>
                                <div class="invite-actions">
                                    <button onclick="window.guildSystem.acceptInvite('${invite.id}')">Accept</button>
                                    <button onclick="window.guildSystem.declineInvite('${invite.id}')">Decline</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <div class="available-guilds">
                    <h4>🏰 Available Guilds</h4>
                    <div id="guilds-list" class="guilds-list">
                        ${this.availableGuilds.map(guild => this.renderGuildCard(guild)).join('')}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('create-guild-btn').addEventListener('click', () => {
            this.showCreateModal();
        });
    }

    renderGuildCard(guild) {
        const playerLevel = this.game.level || 1;
        const canJoin = playerLevel >= guild.requirement.level;

        return `
            <div class="guild-card ${canJoin ? '' : 'locked'}">
                <div class="guild-header">
                    <span class="guild-icon">${guild.icon}</span>
                    <div class="guild-info">
                        <h4>${guild.name} <span class="guild-tag">[${guild.tag}]</span></h4>
                        <span class="guild-level">Level ${guild.level}</span>
                    </div>
                </div>
                <p class="guild-desc">${guild.description}</p>
                <div class="guild-stats">
                    <span>👥 ${guild.members}/${guild.maxMembers}</span>
                    <span>📋 Req: Lv.${guild.requirement.level}</span>
                </div>
                <div class="guild-perks-preview">
                    ${Object.entries(guild.perks).map(([perk, level]) =>
                        `<span class="perk-tag">${this.guildPerks[perk].icon} ${level}</span>`
                    ).join('')}
                </div>
                <button class="join-btn" ${canJoin ? `onclick="window.guildSystem.joinGuild('${guild.id}')"` : 'disabled'}>
                    ${canJoin ? 'Join Guild' : `Requires Lv.${guild.requirement.level}`}
                </button>
            </div>
        `;
    }

    renderGuildView(container) {
        const guild = this.currentGuild;
        const myContribution = this.guildContributions[guild.id] || 0;

        container.innerHTML = `
            <div class="guild-view">
                <div class="guild-banner">
                    <span class="guild-icon-large">${guild.icon}</span>
                    <div class="guild-title">
                        <h2>${guild.name}</h2>
                        <span class="guild-tag">[${guild.tag}]</span>
                    </div>
                </div>

                <div class="guild-stats-bar">
                    <div class="stat">
                        <span class="stat-value">${guild.level}</span>
                        <span class="stat-label">Level</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${guild.members}/${guild.maxMembers}</span>
                        <span class="stat-label">Members</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${myContribution}</span>
                        <span class="stat-label">My Contribution</span>
                    </div>
                </div>

                <div class="guild-tabs">
                    <button class="guild-tab active" data-tab="overview">Overview</button>
                    <button class="guild-tab" data-tab="members">Members</button>
                    <button class="guild-tab" data-tab="perks">Perks</button>
                    <button class="guild-tab" data-tab="challenges">Challenges</button>
                </div>

                <div class="guild-tab-content active" id="overview-tab">
                    <p class="guild-description">${guild.description}</p>

                    <div class="guild-level-progress">
                        <h4>Guild Level Progress</h4>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(guild.xp % 1000) / 10}%"></div>
                        </div>
                        <span>${guild.xp % 1000}/1000 XP to next level</span>
                    </div>

                    <div class="guild-announcements">
                        <h4>📢 Announcements</h4>
                        <div class="announcement">
                            <p>Welcome to the guild! Let's explore together!</p>
                            <span class="announcement-time">- Guild Leader</span>
                        </div>
                    </div>

                    <div class="contribute-section">
                        <h4>Contribute to Guild</h4>
                        <div class="contribute-buttons">
                            <button onclick="window.guildSystem.contribute('stars', 100)">
                                ⭐ 100 Stars (+10 XP)
                            </button>
                            <button onclick="window.guildSystem.contribute('gems', 10)">
                                💎 10 Gems (+50 XP)
                            </button>
                        </div>
                    </div>
                </div>

                <div class="guild-tab-content" id="members-tab">
                    <div class="members-list">
                        ${this.generateMembersList(guild)}
                    </div>
                </div>

                <div class="guild-tab-content" id="perks-tab">
                    <div class="perks-list">
                        ${Object.entries(this.guildPerks).map(([id, perk]) => {
                            const currentLevel = guild.perks[id] || 0;
                            return `
                                <div class="perk-item">
                                    <div class="perk-icon">${perk.icon}</div>
                                    <div class="perk-info">
                                        <h4>${perk.name}</h4>
                                        <p>${perk.description}</p>
                                        <div class="perk-level">
                                            Level ${currentLevel}/${perk.maxLevel}
                                            <div class="perk-dots">
                                                ${Array(perk.maxLevel).fill(0).map((_, i) =>
                                                    `<span class="dot ${i < currentLevel ? 'filled' : ''}"></span>`
                                                ).join('')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div class="guild-tab-content" id="challenges-tab">
                    <div class="guild-challenges">
                        <div class="challenge-item active">
                            <div class="challenge-header">
                                <span>🌟 Weekly Star Hunt</span>
                                <span class="challenge-reward">+500 Guild XP</span>
                            </div>
                            <p>Collect 10,000 stars as a guild</p>
                            <div class="challenge-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 65%"></div>
                                </div>
                                <span>6,500/10,000</span>
                            </div>
                        </div>
                        <div class="challenge-item">
                            <div class="challenge-header">
                                <span>🏃 Distance Marathon</span>
                                <span class="challenge-reward">+300 Guild XP</span>
                            </div>
                            <p>Travel 100km combined</p>
                            <div class="challenge-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 42%"></div>
                                </div>
                                <span>42/100 km</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="guild-footer">
                    <button class="leave-btn" onclick="window.guildSystem.leaveGuild()">Leave Guild</button>
                </div>
            </div>
        `;

        // Setup tab listeners
        container.querySelectorAll('.guild-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                container.querySelectorAll('.guild-tab').forEach(t => t.classList.remove('active'));
                container.querySelectorAll('.guild-tab-content').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(`${e.target.dataset.tab}-tab`).classList.add('active');
            });
        });
    }

    generateMembersList(guild) {
        const members = [
            { name: 'GuildMaster99', rank: 'leader', level: 50, contribution: 5000, online: true },
            { name: 'OfficerOne', rank: 'officer', level: 42, contribution: 3500, online: true },
            { name: 'VeteranPlayer', rank: 'veteran', level: 35, contribution: 2000, online: false },
            { name: 'You', rank: 'member', level: this.game.level || 1, contribution: this.guildContributions[guild.id] || 0, online: true, isYou: true },
            { name: 'NewMember', rank: 'member', level: 12, contribution: 100, online: false }
        ];

        return members.map(member => `
            <div class="member-item ${member.isYou ? 'is-you' : ''}">
                <div class="member-status ${member.online ? 'online' : 'offline'}"></div>
                <div class="member-info">
                    <span class="member-name">${member.name}</span>
                    <span class="member-rank">${this.guildRanks[member.rank].icon} ${this.guildRanks[member.rank].name}</span>
                </div>
                <div class="member-stats">
                    <span>Lv.${member.level}</span>
                    <span>📊 ${member.contribution}</span>
                </div>
            </div>
        `).join('');
    }

    createGuild() {
        const name = document.getElementById('new-guild-name').value.trim();
        const tag = document.getElementById('new-guild-tag').value.trim().toUpperCase();
        const desc = document.getElementById('new-guild-desc').value.trim();
        const selectedIcon = document.querySelector('.icon-option.selected');
        const icon = selectedIcon ? selectedIcon.dataset.icon : '⚔️';

        if (!name || name.length < 3) {
            this.game.showNotification('Guild name must be at least 3 characters!', 'warning');
            return;
        }

        if (!tag || tag.length < 3 || tag.length > 4) {
            this.game.showNotification('Guild tag must be 3-4 characters!', 'warning');
            return;
        }

        const resources = this.game.getResources();
        if (resources.gems < 100) {
            this.game.showNotification('Not enough gems! Need 100 gems.', 'warning');
            return;
        }

        this.game.spendResources(0, 100);

        this.currentGuild = {
            id: 'guild_' + Date.now(),
            name: name,
            tag: tag,
            icon: icon,
            description: desc || 'A new guild ready for adventure!',
            members: 1,
            maxMembers: 25,
            level: 1,
            xp: 0,
            perks: {},
            createdAt: Date.now()
        };

        localStorage.setItem('currentGuild', JSON.stringify(this.currentGuild));

        this.hideCreateModal();
        this.game.showNotification(`${icon} Guild "${name}" created!`, 'legendary');
        this.updateUI();
    }

    joinGuild(guildId) {
        const guild = this.availableGuilds.find(g => g.id === guildId);
        if (!guild) return;

        const playerLevel = this.game.level || 1;
        if (playerLevel < guild.requirement.level) {
            this.game.showNotification(`You need to be level ${guild.requirement.level} to join!`, 'warning');
            return;
        }

        if (guild.members >= guild.maxMembers) {
            this.game.showNotification('This guild is full!', 'warning');
            return;
        }

        this.currentGuild = {
            ...guild,
            xp: 0
        };
        localStorage.setItem('currentGuild', JSON.stringify(this.currentGuild));

        this.game.showNotification(`${guild.icon} Joined ${guild.name}!`, 'success');
        this.updateUI();
    }

    leaveGuild() {
        if (!this.currentGuild) return;

        if (!confirm('Are you sure you want to leave this guild?')) {
            return;
        }

        this.game.showNotification(`Left ${this.currentGuild.name}`, 'info');
        this.currentGuild = null;
        localStorage.removeItem('currentGuild');
        this.updateUI();
    }

    contribute(type, amount) {
        if (!this.currentGuild) return;

        const resources = this.game.getResources();

        if (type === 'stars' && resources.stars < amount) {
            this.game.showNotification('Not enough stars!', 'warning');
            return;
        }
        if (type === 'gems' && resources.gems < amount) {
            this.game.showNotification('Not enough gems!', 'warning');
            return;
        }

        if (type === 'stars') {
            this.game.spendResources(amount, 0);
            this.currentGuild.xp += 10;
        } else {
            this.game.spendResources(0, amount);
            this.currentGuild.xp += 50;
        }

        // Track contribution
        if (!this.guildContributions[this.currentGuild.id]) {
            this.guildContributions[this.currentGuild.id] = 0;
        }
        this.guildContributions[this.currentGuild.id] += type === 'stars' ? 10 : 50;

        localStorage.setItem('currentGuild', JSON.stringify(this.currentGuild));
        localStorage.setItem('guildContributions', JSON.stringify(this.guildContributions));

        this.game.showNotification(`Contributed ${amount} ${type} to the guild!`, 'success');
        this.updateUI();
    }

    acceptInvite(inviteId) {
        const invite = this.guildInvites.find(i => i.id === inviteId);
        if (!invite) return;

        this.guildInvites = this.guildInvites.filter(i => i.id !== inviteId);
        localStorage.setItem('guildInvites', JSON.stringify(this.guildInvites));

        this.joinGuild(invite.guildId);
    }

    declineInvite(inviteId) {
        this.guildInvites = this.guildInvites.filter(i => i.id !== inviteId);
        localStorage.setItem('guildInvites', JSON.stringify(this.guildInvites));
        this.updateUI();
    }

    getGuildBonuses() {
        if (!this.currentGuild || !this.currentGuild.perks) {
            return { xp: 1, stars: 1, speed: 1, luck: 1 };
        }

        const perks = this.currentGuild.perks;
        return {
            xp: 1 + (perks.xp_boost || 0) * 0.1,
            stars: 1 + (perks.star_boost || 0) * 0.05,
            speed: 1 + (perks.speed_boost || 0) * 0.05,
            luck: 1 + (perks.lucky || 0) * 0.02
        };
    }

    isInGuild() {
        return this.currentGuild !== null;
    }

    getGuildTag() {
        return this.currentGuild ? `[${this.currentGuild.tag}]` : '';
    }
}

// Global reference
window.guildSystem = null;
