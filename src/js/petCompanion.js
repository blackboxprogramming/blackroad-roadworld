// Pet Companion System for RoadWorld
// Cute companions that follow you and provide bonuses

export class PetCompanion {
    constructor(mapManager, gameEngine, storageManager) {
        this.mapManager = mapManager;
        this.gameEngine = gameEngine;
        this.storageManager = storageManager;

        this.activePet = null;
        this.petMarker = null;
        this.panelElement = null;
        this.isVisible = false;

        // Pet definitions
        this.pets = {
            cat: {
                id: 'cat',
                name: 'Luna',
                icon: '🐱',
                rarity: 'common',
                description: 'A curious cat that loves exploring!',
                bonus: { type: 'xp', value: 1.1, description: '+10% XP' },
                unlocked: true,
                level: 1,
                xp: 0,
                xpToLevel: 100
            },
            dog: {
                id: 'dog',
                name: 'Max',
                icon: '🐕',
                rarity: 'common',
                description: 'A loyal companion that finds items!',
                bonus: { type: 'itemFind', value: 1.15, description: '+15% Item Find' },
                unlocked: true,
                level: 1,
                xp: 0,
                xpToLevel: 100
            },
            fox: {
                id: 'fox',
                name: 'Ember',
                icon: '🦊',
                rarity: 'rare',
                description: 'A swift fox that grants speed!',
                bonus: { type: 'speed', value: 1.2, description: '+20% Speed' },
                unlocked: false,
                level: 1,
                xp: 0,
                xpToLevel: 150
            },
            owl: {
                id: 'owl',
                name: 'Wisdom',
                icon: '🦉',
                rarity: 'rare',
                description: 'A wise owl that boosts night bonuses!',
                bonus: { type: 'nightXP', value: 1.5, description: '+50% Night XP' },
                unlocked: false,
                level: 1,
                xp: 0,
                xpToLevel: 150
            },
            dragon: {
                id: 'dragon',
                name: 'Spark',
                icon: '🐉',
                rarity: 'epic',
                description: 'A baby dragon with fiery power!',
                bonus: { type: 'xp', value: 1.25, description: '+25% XP' },
                unlocked: false,
                level: 1,
                xp: 0,
                xpToLevel: 250
            },
            phoenix: {
                id: 'phoenix',
                name: 'Blaze',
                icon: '🔥',
                rarity: 'legendary',
                description: 'A legendary phoenix that doubles streak bonuses!',
                bonus: { type: 'streak', value: 2.0, description: '2x Streak Bonus' },
                unlocked: false,
                level: 1,
                xp: 0,
                xpToLevel: 500
            },
            unicorn: {
                id: 'unicorn',
                name: 'Starlight',
                icon: '🦄',
                rarity: 'legendary',
                description: 'A magical unicorn with mystical powers!',
                bonus: { type: 'allStats', value: 1.15, description: '+15% All Stats' },
                unlocked: false,
                level: 1,
                xp: 0,
                xpToLevel: 500
            },
            robot: {
                id: 'robot',
                name: 'Byte',
                icon: '🤖',
                rarity: 'epic',
                description: 'A robot companion that auto-collects nearby items!',
                bonus: { type: 'autoCollect', value: 50, description: 'Auto-collect 50m' },
                unlocked: false,
                level: 1,
                xp: 0,
                xpToLevel: 250
            }
        };

        // Animations
        this.animationFrame = 0;
        this.animationInterval = null;
    }

    init() {
        this.createPanel();
        this.loadPets();
        this.setupEventListeners();

        console.log('🐾 Pet Companion System initialized');
    }

    createPanel() {
        this.panelElement = document.createElement('div');
        this.panelElement.className = 'pet-panel ui-overlay';
        this.panelElement.id = 'pet-panel';
        this.panelElement.style.display = 'none';

        this.panelElement.innerHTML = `
            <div class="panel-header">
                <span>🐾 Pet Companions</span>
                <button class="panel-close" id="pet-close">✕</button>
            </div>
            <div class="panel-content pet-content">
                <div class="active-pet-section" id="active-pet-section">
                    <h4>Active Companion</h4>
                    <div class="active-pet-display" id="active-pet-display"></div>
                </div>
                <div class="pet-collection-section">
                    <h4>Collection</h4>
                    <div class="pet-grid" id="pet-grid"></div>
                </div>
            </div>
        `;

        document.body.appendChild(this.panelElement);
    }

    setupEventListeners() {
        document.getElementById('pet-close').addEventListener('click', () => {
            this.hide();
        });
    }

    loadPets() {
        const saved = this.storageManager.data.pets || {};

        // Load unlocked status and levels
        Object.keys(saved).forEach(petId => {
            if (this.pets[petId]) {
                this.pets[petId] = { ...this.pets[petId], ...saved[petId] };
            }
        });

        // Load active pet
        if (saved.active && this.pets[saved.active]?.unlocked) {
            this.equipPet(saved.active);
        }
    }

    savePets() {
        const petData = {};
        Object.entries(this.pets).forEach(([id, pet]) => {
            petData[id] = {
                unlocked: pet.unlocked,
                level: pet.level,
                xp: pet.xp,
                name: pet.name
            };
        });
        petData.active = this.activePet?.id || null;

        this.storageManager.data.pets = petData;
        this.storageManager.save();
    }

    unlockPet(petId) {
        if (this.pets[petId]) {
            this.pets[petId].unlocked = true;
            this.savePets();
            this.showNotification(`🎉 New pet unlocked: ${this.pets[petId].icon} ${this.pets[petId].name}!`);
            return true;
        }
        return false;
    }

    equipPet(petId) {
        const pet = this.pets[petId];
        if (!pet || !pet.unlocked) return false;

        // Remove current pet marker
        if (this.petMarker) {
            this.petMarker.remove();
        }

        this.activePet = pet;

        // Create pet marker on map
        this.createPetMarker();

        // Start animations
        this.startAnimation();

        this.savePets();
        this.renderPanel();

        this.showNotification(`${pet.icon} ${pet.name} is now following you!`);
        return true;
    }

    unequipPet() {
        if (this.petMarker) {
            this.petMarker.remove();
            this.petMarker = null;
        }

        this.stopAnimation();
        this.activePet = null;
        this.savePets();
        this.renderPanel();
    }

    createPetMarker() {
        if (!this.activePet || !this.mapManager) return;

        const el = document.createElement('div');
        el.className = `pet-marker ${this.activePet.rarity}`;
        el.innerHTML = `
            <div class="pet-icon">${this.activePet.icon}</div>
            <div class="pet-level">Lv.${this.activePet.level}</div>
        `;

        const center = this.mapManager.getCenter();
        const offset = this.getRandomOffset();

        this.petMarker = new maplibregl.Marker({ element: el, anchor: 'center' })
            .setLngLat([center.lng + offset.lng, center.lat + offset.lat])
            .addTo(this.mapManager.map);
    }

    getRandomOffset() {
        // Random position near player
        const angle = Math.random() * Math.PI * 2;
        const distance = 0.0002 + Math.random() * 0.0003;
        return {
            lng: Math.cos(angle) * distance,
            lat: Math.sin(angle) * distance
        };
    }

    startAnimation() {
        this.animationInterval = setInterval(() => {
            this.animatePet();
        }, 500);
    }

    stopAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
    }

    animatePet() {
        if (!this.petMarker || !this.activePet) return;

        // Hop animation
        this.animationFrame = (this.animationFrame + 1) % 4;
        const el = this.petMarker.getElement();
        if (el) {
            el.style.transform = `translateY(${this.animationFrame === 1 ? -5 : 0}px)`;
        }

        // Follow player position with lag
        const center = this.mapManager.getCenter();
        const currentPos = this.petMarker.getLngLat();

        const newLng = currentPos.lng + (center.lng - currentPos.lng) * 0.1;
        const newLat = currentPos.lat + (center.lat - currentPos.lat) * 0.1;

        // Add some wander
        const wander = 0.00005;
        this.petMarker.setLngLat([
            newLng + (Math.random() - 0.5) * wander,
            newLat + (Math.random() - 0.5) * wander
        ]);
    }

    addPetXP(amount) {
        if (!this.activePet) return;

        this.activePet.xp += amount;

        // Check level up
        while (this.activePet.xp >= this.activePet.xpToLevel) {
            this.activePet.xp -= this.activePet.xpToLevel;
            this.levelUpPet();
        }

        this.savePets();
    }

    levelUpPet() {
        if (!this.activePet) return;

        this.activePet.level++;
        this.activePet.xpToLevel = Math.floor(this.activePet.xpToLevel * 1.5);

        // Improve bonus
        if (typeof this.activePet.bonus.value === 'number') {
            this.activePet.bonus.value *= 1.05; // 5% improvement per level
        }

        this.showNotification(`🎉 ${this.activePet.icon} ${this.activePet.name} leveled up to ${this.activePet.level}!`);

        // Update marker
        if (this.petMarker) {
            const levelEl = this.petMarker.getElement().querySelector('.pet-level');
            if (levelEl) {
                levelEl.textContent = `Lv.${this.activePet.level}`;
            }
        }

        this.renderPanel();
    }

    getBonusMultiplier(type) {
        if (!this.activePet) return 1;

        const bonus = this.activePet.bonus;

        if (bonus.type === type) {
            return bonus.value;
        }

        if (bonus.type === 'allStats') {
            return bonus.value;
        }

        return 1;
    }

    getAutoCollectRange() {
        if (!this.activePet || this.activePet.bonus.type !== 'autoCollect') return 0;
        return this.activePet.bonus.value * (1 + (this.activePet.level - 1) * 0.1);
    }

    renamePet(petId, newName) {
        if (this.pets[petId]) {
            this.pets[petId].name = newName;
            this.savePets();
            this.renderPanel();
        }
    }

    renderPanel() {
        // Active pet display
        const activeDisplay = document.getElementById('active-pet-display');
        if (activeDisplay) {
            if (this.activePet) {
                const xpPercent = (this.activePet.xp / this.activePet.xpToLevel) * 100;
                activeDisplay.innerHTML = `
                    <div class="active-pet-card ${this.activePet.rarity}">
                        <div class="active-pet-icon">${this.activePet.icon}</div>
                        <div class="active-pet-info">
                            <div class="active-pet-name">${this.activePet.name}</div>
                            <div class="active-pet-level">Level ${this.activePet.level}</div>
                            <div class="active-pet-xp-bar">
                                <div class="active-pet-xp-fill" style="width: ${xpPercent}%"></div>
                            </div>
                            <div class="active-pet-bonus">${this.activePet.bonus.description}</div>
                        </div>
                        <button class="pet-unequip-btn" id="unequip-pet">Remove</button>
                    </div>
                `;

                document.getElementById('unequip-pet')?.addEventListener('click', () => {
                    this.unequipPet();
                });
            } else {
                activeDisplay.innerHTML = `
                    <div class="no-active-pet">No pet active. Select one below!</div>
                `;
            }
        }

        // Pet grid
        const petGrid = document.getElementById('pet-grid');
        if (petGrid) {
            petGrid.innerHTML = Object.entries(this.pets).map(([id, pet]) => `
                <div class="pet-card ${pet.rarity} ${pet.unlocked ? '' : 'locked'} ${this.activePet?.id === id ? 'equipped' : ''}"
                     data-pet="${id}">
                    <div class="pet-card-icon">${pet.unlocked ? pet.icon : '❓'}</div>
                    <div class="pet-card-name">${pet.unlocked ? pet.name : '???'}</div>
                    <div class="pet-card-rarity">${pet.rarity}</div>
                    ${pet.unlocked ? `
                        <div class="pet-card-level">Lv.${pet.level}</div>
                        <div class="pet-card-bonus">${pet.bonus.description}</div>
                    ` : `
                        <div class="pet-card-locked">Locked</div>
                    `}
                </div>
            `).join('');

            // Add click handlers
            petGrid.querySelectorAll('.pet-card:not(.locked)').forEach(card => {
                card.addEventListener('click', () => {
                    const petId = card.dataset.pet;
                    if (this.activePet?.id !== petId) {
                        this.equipPet(petId);
                    }
                });
            });
        }
    }

    // Check for unlocks based on achievements
    checkUnlocks() {
        const player = this.gameEngine?.player;
        if (!player) return;

        // Fox unlocked at level 10
        if (player.level >= 10 && !this.pets.fox.unlocked) {
            this.unlockPet('fox');
        }

        // Owl unlocked after 50km traveled
        if (player.stats.distanceTraveled >= 50000 && !this.pets.owl.unlocked) {
            this.unlockPet('owl');
        }

        // Dragon unlocked after 500 items
        if (player.stats.itemsCollected >= 500 && !this.pets.dragon.unlocked) {
            this.unlockPet('dragon');
        }

        // Robot unlocked at level 25
        if (player.level >= 25 && !this.pets.robot.unlocked) {
            this.unlockPet('robot');
        }

        // Phoenix unlocked after 30 day streak
        if (player.stats.longestStreak >= 30 && !this.pets.phoenix.unlocked) {
            this.unlockPet('phoenix');
        }

        // Unicorn unlocked at level 50
        if (player.level >= 50 && !this.pets.unicorn.unlocked) {
            this.unlockPet('unicorn');
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    show() {
        this.isVisible = true;
        this.panelElement.style.display = 'block';
        this.renderPanel();
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
