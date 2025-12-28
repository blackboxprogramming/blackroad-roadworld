/**
 * Multiplayer Presence System - See other players on the map
 * RoadWorld v7.0
 */

export class MultiplayerPresence {
    constructor(game) {
        this.game = game;
        this.playerId = this.generatePlayerId();
        this.playerName = localStorage.getItem('playerName') || this.generatePlayerName();
        this.playerAvatar = localStorage.getItem('playerAvatar') || '🧑';
        this.nearbyPlayers = new Map();
        this.friends = JSON.parse(localStorage.getItem('friends') || '[]');
        this.playerMarkers = new Map();
        this.isOnline = true;
        this.lastPosition = null;
        this.visibilityMode = 'all'; // all, friends, invisible

        this.avatars = ['🧑', '👩', '👨', '🧔', '👱', '🧑‍🦰', '👩‍🦱', '🧑‍🦳', '🥷', '🦸', '🧙', '🧝', '🧛', '🤖', '👽', '🎅'];

        this.statusOptions = ['Exploring', 'Hunting Treasures', 'AFK', 'Looking for Group', 'Speed Running', 'Collecting', 'Chilling'];

        this.currentStatus = 'Exploring';

        this.init();
    }

    generatePlayerId() {
        let id = localStorage.getItem('playerId');
        if (!id) {
            id = 'player_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('playerId', id);
        }
        return id;
    }

    generatePlayerName() {
        const adjectives = ['Swift', 'Bold', 'Mystic', 'Shadow', 'Golden', 'Silver', 'Cosmic', 'Thunder', 'Iron', 'Crystal'];
        const nouns = ['Explorer', 'Wanderer', 'Voyager', 'Seeker', 'Ranger', 'Knight', 'Sage', 'Phoenix', 'Dragon', 'Wolf'];
        const name = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${Math.floor(Math.random() * 100)}`;
        localStorage.setItem('playerName', name);
        return name;
    }

    init() {
        this.createUI();
        this.simulateNearbyPlayers();
        this.startPresenceUpdates();
    }

    createUI() {
        // Main multiplayer panel
        const panel = document.createElement('div');
        panel.id = 'multiplayer-panel';
        panel.className = 'game-panel multiplayer-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <h3>👥 Multiplayer</h3>
                <button class="close-btn" id="close-multiplayer">×</button>
            </div>
            <div class="panel-content">
                <div class="player-profile">
                    <div class="avatar-display" id="my-avatar">${this.playerAvatar}</div>
                    <div class="profile-info">
                        <input type="text" id="player-name-input" value="${this.playerName}" maxlength="20">
                        <select id="player-status">
                            ${this.statusOptions.map(s => `<option value="${s}" ${s === this.currentStatus ? 'selected' : ''}>${s}</option>`).join('')}
                        </select>
                    </div>
                    <button id="change-avatar-btn" class="avatar-btn">Change</button>
                </div>

                <div class="visibility-settings">
                    <span>Visibility:</span>
                    <div class="visibility-buttons">
                        <button class="vis-btn active" data-mode="all">🌍 All</button>
                        <button class="vis-btn" data-mode="friends">👥 Friends</button>
                        <button class="vis-btn" data-mode="invisible">👻 Invisible</button>
                    </div>
                </div>

                <div class="online-stats">
                    <div class="stat-box">
                        <span class="stat-value" id="players-online">0</span>
                        <span class="stat-label">Online Now</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-value" id="players-nearby">0</span>
                        <span class="stat-label">Nearby</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-value" id="friends-online">0</span>
                        <span class="stat-label">Friends Online</span>
                    </div>
                </div>

                <div class="tabs-container">
                    <div class="tab-buttons">
                        <button class="tab-btn active" data-tab="nearby">Nearby</button>
                        <button class="tab-btn" data-tab="friends">Friends</button>
                        <button class="tab-btn" data-tab="global">Global</button>
                    </div>

                    <div class="tab-content active" id="tab-nearby">
                        <div id="nearby-players-list" class="players-list"></div>
                    </div>

                    <div class="tab-content" id="tab-friends">
                        <div id="friends-list" class="players-list"></div>
                        <input type="text" id="add-friend-input" placeholder="Enter player name...">
                        <button id="add-friend-btn">Add Friend</button>
                    </div>

                    <div class="tab-content" id="tab-global">
                        <div id="global-chat" class="chat-container"></div>
                        <div class="chat-input-container">
                            <input type="text" id="chat-input" placeholder="Say something..." maxlength="200">
                            <button id="send-chat-btn">Send</button>
                        </div>
                    </div>
                </div>

                <div class="quick-actions">
                    <button id="wave-btn" class="action-btn">👋 Wave</button>
                    <button id="teleport-friend-btn" class="action-btn">🌀 Teleport to Friend</button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        // Avatar selection modal
        const avatarModal = document.createElement('div');
        avatarModal.id = 'avatar-modal';
        avatarModal.className = 'avatar-modal hidden';
        avatarModal.innerHTML = `
            <div class="modal-content">
                <h3>Choose Your Avatar</h3>
                <div class="avatar-grid">
                    ${this.avatars.map(a => `<div class="avatar-option" data-avatar="${a}">${a}</div>`).join('')}
                </div>
                <button id="close-avatar-modal">Done</button>
            </div>
        `;
        document.body.appendChild(avatarModal);

        // Player count widget
        const widget = document.createElement('div');
        widget.id = 'players-widget';
        widget.className = 'players-widget';
        widget.innerHTML = `
            <span class="online-dot"></span>
            <span id="widget-player-count">0 nearby</span>
        `;
        document.body.appendChild(widget);

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close panel
        document.getElementById('close-multiplayer').addEventListener('click', () => {
            this.hidePanel();
        });

        // Widget click
        document.getElementById('players-widget').addEventListener('click', () => {
            this.showPanel();
        });

        // Name change
        document.getElementById('player-name-input').addEventListener('change', (e) => {
            this.playerName = e.target.value;
            localStorage.setItem('playerName', this.playerName);
        });

        // Status change
        document.getElementById('player-status').addEventListener('change', (e) => {
            this.currentStatus = e.target.value;
        });

        // Avatar change
        document.getElementById('change-avatar-btn').addEventListener('click', () => {
            document.getElementById('avatar-modal').classList.remove('hidden');
        });

        document.getElementById('close-avatar-modal').addEventListener('click', () => {
            document.getElementById('avatar-modal').classList.add('hidden');
        });

        document.querySelectorAll('.avatar-option').forEach(opt => {
            opt.addEventListener('click', (e) => {
                this.playerAvatar = e.target.dataset.avatar;
                localStorage.setItem('playerAvatar', this.playerAvatar);
                document.getElementById('my-avatar').textContent = this.playerAvatar;
            });
        });

        // Visibility buttons
        document.querySelectorAll('.vis-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.vis-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.visibilityMode = e.target.dataset.mode;
            });
        });

        // Tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(`tab-${e.target.dataset.tab}`).classList.add('active');
            });
        });

        // Add friend
        document.getElementById('add-friend-btn').addEventListener('click', () => {
            const name = document.getElementById('add-friend-input').value.trim();
            if (name) {
                this.addFriend(name);
                document.getElementById('add-friend-input').value = '';
            }
        });

        // Chat
        document.getElementById('send-chat-btn').addEventListener('click', () => {
            this.sendChatMessage();
        });

        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });

        // Quick actions
        document.getElementById('wave-btn').addEventListener('click', () => {
            this.wave();
        });

        document.getElementById('teleport-friend-btn').addEventListener('click', () => {
            this.teleportToFriend();
        });
    }

    showPanel() {
        document.getElementById('multiplayer-panel').classList.add('active');
    }

    hidePanel() {
        document.getElementById('multiplayer-panel').classList.remove('active');
    }

    simulateNearbyPlayers() {
        // Simulate other players for demo
        const simulatedPlayers = [
            { id: 'sim_1', name: 'SpeedyRacer42', avatar: '🧑', status: 'Speed Running', level: 15, distance: 0.3 },
            { id: 'sim_2', name: 'TreasureHunterX', avatar: '🧙', status: 'Hunting Treasures', level: 28, distance: 0.8 },
            { id: 'sim_3', name: 'NightOwl99', avatar: '🦸', status: 'Exploring', level: 12, distance: 1.2 },
            { id: 'sim_4', name: 'CosmicDrifter', avatar: '👽', status: 'Chilling', level: 45, distance: 2.1 },
            { id: 'sim_5', name: 'IronWanderer', avatar: '🤖', status: 'Looking for Group', level: 8, distance: 3.5 }
        ];

        simulatedPlayers.forEach(player => {
            this.nearbyPlayers.set(player.id, player);
        });

        this.updateUI();
    }

    startPresenceUpdates() {
        // Update player positions periodically
        setInterval(() => {
            this.updatePlayerPositions();
            this.updateUI();
        }, 5000);

        // Simulate players joining/leaving
        setInterval(() => {
            if (Math.random() < 0.3) {
                this.simulatePlayerActivity();
            }
        }, 15000);
    }

    updatePlayerPositions() {
        // Simulate position updates
        this.nearbyPlayers.forEach((player, id) => {
            player.distance = Math.max(0.1, player.distance + (Math.random() - 0.5) * 0.5);
        });
    }

    simulatePlayerActivity() {
        const actions = ['join', 'leave', 'move'];
        const action = actions[Math.floor(Math.random() * actions.length)];

        if (action === 'join' && this.nearbyPlayers.size < 10) {
            const newPlayer = {
                id: 'sim_' + Date.now(),
                name: this.generatePlayerName(),
                avatar: this.avatars[Math.floor(Math.random() * this.avatars.length)],
                status: this.statusOptions[Math.floor(Math.random() * this.statusOptions.length)],
                level: Math.floor(Math.random() * 50) + 1,
                distance: Math.random() * 5
            };
            this.nearbyPlayers.set(newPlayer.id, newPlayer);
            this.game.showNotification(`${newPlayer.avatar} ${newPlayer.name} appeared nearby!`, 'info');
        } else if (action === 'leave' && this.nearbyPlayers.size > 2) {
            const keys = Array.from(this.nearbyPlayers.keys());
            const removeKey = keys[Math.floor(Math.random() * keys.length)];
            const player = this.nearbyPlayers.get(removeKey);
            this.nearbyPlayers.delete(removeKey);
            this.removePlayerMarker(removeKey);
        }
    }

    updateUI() {
        // Update stats
        const totalOnline = 1247 + Math.floor(Math.random() * 100);
        document.getElementById('players-online').textContent = totalOnline.toLocaleString();
        document.getElementById('players-nearby').textContent = this.nearbyPlayers.size;
        document.getElementById('friends-online').textContent = Math.min(this.friends.length, 3);

        // Update widget
        document.getElementById('widget-player-count').textContent = `${this.nearbyPlayers.size} nearby`;

        // Update nearby players list
        this.updateNearbyList();

        // Update friends list
        this.updateFriendsList();

        // Update player markers on map
        this.updatePlayerMarkers();
    }

    updateNearbyList() {
        const container = document.getElementById('nearby-players-list');
        const sortedPlayers = Array.from(this.nearbyPlayers.values())
            .sort((a, b) => a.distance - b.distance);

        if (sortedPlayers.length === 0) {
            container.innerHTML = '<div class="empty-list">No players nearby</div>';
            return;
        }

        container.innerHTML = sortedPlayers.map(player => `
            <div class="player-item" data-id="${player.id}">
                <div class="player-avatar">${player.avatar}</div>
                <div class="player-info">
                    <div class="player-name">${player.name}</div>
                    <div class="player-status">${player.status}</div>
                </div>
                <div class="player-meta">
                    <span class="player-level">Lv.${player.level}</span>
                    <span class="player-distance">${player.distance.toFixed(1)}km</span>
                </div>
                <div class="player-actions">
                    <button class="mini-btn" onclick="window.multiplayerPresence.addFriend('${player.name}')">➕</button>
                    <button class="mini-btn" onclick="window.multiplayerPresence.viewPlayer('${player.id}')">👁️</button>
                </div>
            </div>
        `).join('');
    }

    updateFriendsList() {
        const container = document.getElementById('friends-list');

        if (this.friends.length === 0) {
            container.innerHTML = '<div class="empty-list">No friends yet. Add some!</div>';
            return;
        }

        container.innerHTML = this.friends.map(friend => `
            <div class="player-item friend-item">
                <div class="player-avatar">${friend.avatar || '👤'}</div>
                <div class="player-info">
                    <div class="player-name">${friend.name}</div>
                    <div class="player-status ${friend.online ? 'online' : 'offline'}">
                        ${friend.online ? '🟢 Online' : '⚫ Offline'}
                    </div>
                </div>
                <div class="player-actions">
                    <button class="mini-btn" onclick="window.multiplayerPresence.removeFriend('${friend.name}')">❌</button>
                </div>
            </div>
        `).join('');
    }

    updatePlayerMarkers() {
        if (!this.game.map) return;

        this.nearbyPlayers.forEach((player, id) => {
            if (!this.playerMarkers.has(id)) {
                this.createPlayerMarker(player);
            }
        });
    }

    createPlayerMarker(player) {
        if (!this.game.map || !this.game.currentPosition) return;

        // Position marker at a random offset from current position
        const offset = {
            lat: (Math.random() - 0.5) * 0.02 * player.distance,
            lng: (Math.random() - 0.5) * 0.02 * player.distance
        };

        const el = document.createElement('div');
        el.className = 'player-marker';
        el.innerHTML = `
            <div class="marker-avatar">${player.avatar}</div>
            <div class="marker-name">${player.name}</div>
        `;

        const marker = new maplibregl.Marker({ element: el })
            .setLngLat([
                this.game.currentPosition.lng + offset.lng,
                this.game.currentPosition.lat + offset.lat
            ])
            .addTo(this.game.map);

        this.playerMarkers.set(player.id, marker);
    }

    removePlayerMarker(playerId) {
        const marker = this.playerMarkers.get(playerId);
        if (marker) {
            marker.remove();
            this.playerMarkers.delete(playerId);
        }
    }

    addFriend(name) {
        if (this.friends.find(f => f.name === name)) {
            this.game.showNotification('Already in your friends list!', 'warning');
            return;
        }

        const friend = {
            name: name,
            avatar: this.avatars[Math.floor(Math.random() * this.avatars.length)],
            online: Math.random() > 0.5,
            addedAt: Date.now()
        };

        this.friends.push(friend);
        localStorage.setItem('friends', JSON.stringify(this.friends));
        this.game.showNotification(`Added ${name} as a friend!`, 'success');
        this.updateUI();
    }

    removeFriend(name) {
        this.friends = this.friends.filter(f => f.name !== name);
        localStorage.setItem('friends', JSON.stringify(this.friends));
        this.game.showNotification(`Removed ${name} from friends`, 'info');
        this.updateUI();
    }

    viewPlayer(playerId) {
        const player = this.nearbyPlayers.get(playerId);
        if (player) {
            this.game.showNotification(`Viewing ${player.name}'s location...`, 'info');
            // Could pan map to player location
        }
    }

    sendChatMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();

        if (!message) return;

        const chatContainer = document.getElementById('global-chat');
        const msgEl = document.createElement('div');
        msgEl.className = 'chat-message own-message';
        msgEl.innerHTML = `
            <span class="chat-avatar">${this.playerAvatar}</span>
            <span class="chat-name">${this.playerName}:</span>
            <span class="chat-text">${message}</span>
        `;
        chatContainer.appendChild(msgEl);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        input.value = '';

        // Simulate response
        setTimeout(() => {
            this.simulateChatResponse();
        }, 1000 + Math.random() * 3000);
    }

    simulateChatResponse() {
        const responses = [
            'Hey! Nice to meet you!',
            'Anyone want to team up?',
            'Just found a rare treasure!',
            'This weather is crazy!',
            'Level 50 here, need help?',
            'GG everyone!',
            'Where are all the gems?',
            'Love this game!',
            '👋',
            'Anyone near the mountains?'
        ];

        const randomPlayer = Array.from(this.nearbyPlayers.values())[
            Math.floor(Math.random() * this.nearbyPlayers.size)
        ];

        if (!randomPlayer) return;

        const chatContainer = document.getElementById('global-chat');
        const msgEl = document.createElement('div');
        msgEl.className = 'chat-message';
        msgEl.innerHTML = `
            <span class="chat-avatar">${randomPlayer.avatar}</span>
            <span class="chat-name">${randomPlayer.name}:</span>
            <span class="chat-text">${responses[Math.floor(Math.random() * responses.length)]}</span>
        `;
        chatContainer.appendChild(msgEl);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    wave() {
        this.game.showNotification('👋 You waved at nearby players!', 'success');

        // Show wave animation on map
        if (this.game.map && this.game.currentPosition) {
            const waveEl = document.createElement('div');
            waveEl.className = 'wave-animation';
            waveEl.textContent = '👋';
            document.body.appendChild(waveEl);

            setTimeout(() => waveEl.remove(), 2000);
        }
    }

    teleportToFriend() {
        const onlineFriends = this.friends.filter(f => f.online);

        if (onlineFriends.length === 0) {
            this.game.showNotification('No friends online to teleport to!', 'warning');
            return;
        }

        const friend = onlineFriends[Math.floor(Math.random() * onlineFriends.length)];
        this.game.showNotification(`🌀 Teleporting to ${friend.name}...`, 'info');

        // Simulate teleport animation
        setTimeout(() => {
            this.game.showNotification(`Arrived at ${friend.name}'s location!`, 'success');
        }, 2000);
    }

    getPlayerInfo() {
        return {
            id: this.playerId,
            name: this.playerName,
            avatar: this.playerAvatar,
            status: this.currentStatus,
            level: this.game.level || 1
        };
    }
}

// Make globally accessible for inline event handlers
window.multiplayerPresence = null;
