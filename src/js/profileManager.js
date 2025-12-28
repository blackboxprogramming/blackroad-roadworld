// Profile Customization for RoadWorld
// Allows players to customize their username and avatar

export class ProfileManager {
    constructor(gameEngine, storageManager) {
        this.gameEngine = gameEngine;
        this.storageManager = storageManager;
        this.panelElement = null;
        this.isVisible = false;

        // Avatar options
        this.avatarIcons = ['🧑‍🚀', '🧙', '🦸', '🥷', '🧝', '🧛', '🤖', '👽', '🐱', '🐺', '🦊', '🐉'];
        this.avatarColors = [
            { name: 'Cyan', value: '#00d4ff' },
            { name: 'Purple', value: '#7b2ff7' },
            { name: 'Orange', value: '#FF6B00' },
            { name: 'Pink', value: '#FF0066' },
            { name: 'Green', value: '#00FF88' },
            { name: 'Gold', value: '#FFD700' },
            { name: 'Red', value: '#FF4444' },
            { name: 'Blue', value: '#4444FF' }
        ];
    }

    init() {
        this.createPanel();
        console.log('👤 Profile Manager initialized');
    }

    createPanel() {
        this.panelElement = document.createElement('div');
        this.panelElement.className = 'profile-panel ui-overlay';
        this.panelElement.id = 'profile-panel';
        this.panelElement.style.display = 'none';

        this.panelElement.innerHTML = `
            <div class="panel-header">
                <span>👤 Edit Profile</span>
                <button class="panel-close" id="profile-close">✕</button>
            </div>
            <div class="panel-content profile-content">
                <div class="profile-preview" id="profile-preview"></div>

                <div class="profile-section">
                    <label class="profile-label">Username</label>
                    <input type="text" id="profile-username" class="profile-input" maxlength="20" placeholder="Enter username" />
                </div>

                <div class="profile-section">
                    <label class="profile-label">Avatar Icon</label>
                    <div class="avatar-grid" id="avatar-icons"></div>
                </div>

                <div class="profile-section">
                    <label class="profile-label">Avatar Color</label>
                    <div class="color-grid" id="avatar-colors"></div>
                </div>

                <button class="tool-btn primary" id="profile-save">Save Changes</button>
            </div>
        `;

        document.body.appendChild(this.panelElement);
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('profile-close').addEventListener('click', () => {
            this.hide();
        });

        document.getElementById('profile-save').addEventListener('click', () => {
            this.saveProfile();
        });

        document.getElementById('profile-username').addEventListener('input', () => {
            this.updatePreview();
        });
    }

    renderOptions() {
        const player = this.gameEngine.player;

        // Render icon grid
        const iconsEl = document.getElementById('avatar-icons');
        iconsEl.innerHTML = this.avatarIcons.map(icon => `
            <button class="avatar-option ${player.avatar.icon === icon ? 'selected' : ''}"
                    data-icon="${icon}">${icon}</button>
        `).join('');

        // Add click handlers
        iconsEl.querySelectorAll('.avatar-option').forEach(btn => {
            btn.addEventListener('click', () => {
                iconsEl.querySelectorAll('.avatar-option').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.updatePreview();
            });
        });

        // Render color grid
        const colorsEl = document.getElementById('avatar-colors');
        colorsEl.innerHTML = this.avatarColors.map(color => `
            <button class="color-option ${player.avatar.color === color.value ? 'selected' : ''}"
                    data-color="${color.value}"
                    style="background: ${color.value}"
                    title="${color.name}"></button>
        `).join('');

        // Add click handlers
        colorsEl.querySelectorAll('.color-option').forEach(btn => {
            btn.addEventListener('click', () => {
                colorsEl.querySelectorAll('.color-option').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.updatePreview();
            });
        });

        // Set username
        document.getElementById('profile-username').value = player.username;

        this.updatePreview();
    }

    updatePreview() {
        const player = this.gameEngine.player;
        const previewEl = document.getElementById('profile-preview');

        const selectedIcon = document.querySelector('#avatar-icons .selected')?.dataset.icon || player.avatar.icon || '🧑‍🚀';
        const selectedColor = document.querySelector('#avatar-colors .selected')?.dataset.color || player.avatar.color;
        const username = document.getElementById('profile-username').value || player.username;

        previewEl.innerHTML = `
            <div class="preview-avatar" style="background: ${selectedColor}">
                <span class="preview-icon">${selectedIcon}</span>
            </div>
            <div class="preview-info">
                <div class="preview-name">${username}</div>
                <div class="preview-level">Level ${player.level}</div>
            </div>
        `;
    }

    saveProfile() {
        const player = this.gameEngine.player;

        const username = document.getElementById('profile-username').value.trim();
        const selectedIcon = document.querySelector('#avatar-icons .selected')?.dataset.icon;
        const selectedColor = document.querySelector('#avatar-colors .selected')?.dataset.color;

        if (username) {
            player.username = username;
        }
        if (selectedIcon) {
            player.avatar.icon = selectedIcon;
        }
        if (selectedColor) {
            player.avatar.color = selectedColor;
        }

        this.gameEngine.savePlayer();

        // Trigger avatar update if visible
        if (window.app && window.app.playerAvatar) {
            window.app.playerAvatar.updateAppearance();
        }

        this.hide();

        // Show confirmation
        this.showNotification('Profile updated!');
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    show() {
        this.isVisible = true;
        this.panelElement.style.display = 'block';
        this.renderOptions();
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
}
