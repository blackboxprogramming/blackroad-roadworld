// Crafting System for RoadWorld
// Combine collected items to create special gear and consumables

export class CraftingSystem {
    constructor(gameEngine, storageManager) {
        this.gameEngine = gameEngine;
        this.storageManager = storageManager;

        this.panelElement = null;
        this.isVisible = false;

        // Crafting recipes
        this.recipes = {
            // Consumables
            xpPotion: {
                id: 'xpPotion',
                name: 'XP Potion',
                icon: '🧪',
                category: 'consumable',
                description: 'Grants 500 bonus XP instantly!',
                ingredients: { stars: 10, gems: 2 },
                effect: { type: 'instantXP', value: 500 },
                craftTime: 0
            },
            luckyCharm: {
                id: 'luckyCharm',
                name: 'Lucky Charm',
                icon: '🍀',
                category: 'consumable',
                description: '+50% rare item chance for 5 minutes',
                ingredients: { gems: 5, stars: 5 },
                effect: { type: 'rareBoost', value: 1.5, duration: 300000 },
                craftTime: 0
            },
            speedBoost: {
                id: 'speedBoost',
                name: 'Speed Elixir',
                icon: '⚡',
                category: 'consumable',
                description: '+30% movement speed for 3 minutes',
                ingredients: { stars: 8, keys: 1 },
                effect: { type: 'speedBoost', value: 1.3, duration: 180000 },
                craftTime: 0
            },
            magnetOrb: {
                id: 'magnetOrb',
                name: 'Magnet Orb',
                icon: '🔮',
                category: 'consumable',
                description: 'Auto-collect items in 100m radius',
                ingredients: { gems: 8, trophies: 1 },
                effect: { type: 'magnetPulse', value: 100 },
                craftTime: 0
            },

            // Equipment
            explorerBadge: {
                id: 'explorerBadge',
                name: 'Explorer Badge',
                icon: '🎖️',
                category: 'equipment',
                description: '+10% XP permanently while equipped',
                ingredients: { trophies: 3, gems: 10, stars: 20 },
                effect: { type: 'xpBoost', value: 1.1 },
                craftTime: 60000 // 1 minute
            },
            treasureCompass: {
                id: 'treasureCompass',
                name: 'Treasure Compass',
                icon: '🧭',
                category: 'equipment',
                description: 'Shows nearby rare items on map',
                ingredients: { keys: 5, gems: 15 },
                effect: { type: 'treasureRadar', value: 200 },
                craftTime: 120000
            },
            goldenBoots: {
                id: 'goldenBoots',
                name: 'Golden Boots',
                icon: '👢',
                category: 'equipment',
                description: '+20% movement speed, leave golden trail',
                ingredients: { trophies: 5, gems: 25, stars: 50 },
                effect: { type: 'goldenSpeed', value: 1.2 },
                craftTime: 300000 // 5 minutes
            },
            starCape: {
                id: 'starCape',
                name: 'Star Cape',
                icon: '🌟',
                category: 'equipment',
                description: 'Stars give 2x XP',
                ingredients: { stars: 100, gems: 20 },
                effect: { type: 'starBonus', value: 2 },
                craftTime: 180000
            },

            // Special items
            petEgg: {
                id: 'petEgg',
                name: 'Mystery Egg',
                icon: '🥚',
                category: 'special',
                description: 'Hatches into a random pet!',
                ingredients: { gems: 30, trophies: 3, keys: 3 },
                effect: { type: 'petUnlock', value: 'random' },
                craftTime: 600000 // 10 minutes
            },
            warpCrystal: {
                id: 'warpCrystal',
                name: 'Warp Crystal',
                icon: '💎',
                category: 'special',
                description: 'Instant teleport, no cooldown!',
                ingredients: { gems: 20, keys: 5 },
                effect: { type: 'instantTravel', value: 1 },
                craftTime: 60000
            },
            experienceOrb: {
                id: 'experienceOrb',
                name: 'Experience Orb',
                icon: '💫',
                category: 'special',
                description: 'Grants a full level instantly!',
                ingredients: { trophies: 10, gems: 50, stars: 100 },
                effect: { type: 'levelUp', value: 1 },
                craftTime: 900000 // 15 minutes
            }
        };

        // Currently crafting
        this.craftingQueue = [];
        this.equippedItems = [];
        this.craftedItems = {};

        this.updateInterval = null;
    }

    init() {
        this.createPanel();
        this.loadProgress();
        this.startUpdateLoop();

        console.log('🔨 Crafting System initialized');
    }

    createPanel() {
        this.panelElement = document.createElement('div');
        this.panelElement.className = 'crafting-panel ui-overlay';
        this.panelElement.id = 'crafting-panel';
        this.panelElement.style.display = 'none';

        this.panelElement.innerHTML = `
            <div class="panel-header">
                <span>🔨 Crafting</span>
                <button class="panel-close" id="crafting-close">✕</button>
            </div>
            <div class="panel-content crafting-content">
                <div class="crafting-resources" id="crafting-resources"></div>
                <div class="crafting-queue" id="crafting-queue"></div>
                <div class="crafting-tabs">
                    <button class="craft-tab active" data-category="consumable">🧪 Consumables</button>
                    <button class="craft-tab" data-category="equipment">⚔️ Equipment</button>
                    <button class="craft-tab" data-category="special">✨ Special</button>
                </div>
                <div class="crafting-recipes" id="crafting-recipes"></div>
                <div class="equipped-items" id="equipped-items"></div>
            </div>
        `;

        document.body.appendChild(this.panelElement);
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('crafting-close').addEventListener('click', () => {
            this.hide();
        });

        this.panelElement.querySelectorAll('.craft-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.panelElement.querySelectorAll('.craft-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.renderRecipes(e.target.dataset.category);
            });
        });
    }

    loadProgress() {
        const saved = this.storageManager.data.crafting || {};
        this.craftingQueue = saved.queue || [];
        this.equippedItems = saved.equipped || [];
        this.craftedItems = saved.crafted || {};
    }

    saveProgress() {
        this.storageManager.data.crafting = {
            queue: this.craftingQueue,
            equipped: this.equippedItems,
            crafted: this.craftedItems
        };
        this.storageManager.save();
    }

    startUpdateLoop() {
        this.updateInterval = setInterval(() => {
            this.updateCraftingQueue();
        }, 1000);
    }

    canCraft(recipeId) {
        const recipe = this.recipes[recipeId];
        if (!recipe) return false;

        const inventory = this.gameEngine.getInventorySummary();

        return Object.entries(recipe.ingredients).every(([item, count]) => {
            return (inventory[item] || 0) >= count;
        });
    }

    craft(recipeId) {
        const recipe = this.recipes[recipeId];
        if (!recipe || !this.canCraft(recipeId)) return false;

        // Consume ingredients
        const inventory = this.gameEngine.player.inventory;
        Object.entries(recipe.ingredients).forEach(([item, count]) => {
            inventory[item] = (inventory[item] || 0) - count;
        });

        if (recipe.craftTime > 0) {
            // Add to queue
            this.craftingQueue.push({
                recipeId,
                startTime: Date.now(),
                endTime: Date.now() + recipe.craftTime
            });
            this.showNotification(`🔨 Crafting ${recipe.name}...`);
        } else {
            // Instant craft
            this.onCraftComplete(recipeId);
        }

        this.gameEngine.savePlayer();
        this.saveProgress();
        this.renderPanel();

        return true;
    }

    updateCraftingQueue() {
        const now = Date.now();
        const completed = [];

        this.craftingQueue = this.craftingQueue.filter(item => {
            if (now >= item.endTime) {
                completed.push(item.recipeId);
                return false;
            }
            return true;
        });

        completed.forEach(recipeId => {
            this.onCraftComplete(recipeId);
        });

        if (this.isVisible) {
            this.renderQueue();
        }
    }

    onCraftComplete(recipeId) {
        const recipe = this.recipes[recipeId];

        // Add to crafted items
        this.craftedItems[recipeId] = (this.craftedItems[recipeId] || 0) + 1;

        this.showNotification(`✨ Crafted: ${recipe.name}!`);

        // Apply immediate effects for consumables
        if (recipe.category === 'consumable') {
            this.useItem(recipeId);
        }

        this.saveProgress();
        this.renderPanel();
    }

    useItem(itemId) {
        const recipe = this.recipes[itemId];
        if (!recipe || (this.craftedItems[itemId] || 0) <= 0) return false;

        const effect = recipe.effect;

        switch (effect.type) {
            case 'instantXP':
                this.gameEngine.addXP(effect.value, 'craft');
                break;

            case 'rareBoost':
            case 'speedBoost':
                // Apply temporary buff
                this.applyTemporaryEffect(effect);
                break;

            case 'magnetPulse':
                this.triggerMagnetPulse(effect.value);
                break;

            case 'levelUp':
                this.gameEngine.addXP(this.gameEngine.player.xpToNextLevel, 'craft');
                break;

            case 'instantTravel':
                // Grant instant travel token
                this.showNotification('💎 Warp Crystal ready! Next quick travel is instant.');
                break;
        }

        // Consume item
        this.craftedItems[itemId]--;
        if (this.craftedItems[itemId] <= 0) {
            delete this.craftedItems[itemId];
        }

        this.saveProgress();
        return true;
    }

    equipItem(itemId) {
        const recipe = this.recipes[itemId];
        if (!recipe || recipe.category !== 'equipment') return false;
        if ((this.craftedItems[itemId] || 0) <= 0) return false;

        // Can only have 3 items equipped
        if (this.equippedItems.length >= 3 && !this.equippedItems.includes(itemId)) {
            this.showNotification('Unequip an item first! (max 3)');
            return false;
        }

        if (this.equippedItems.includes(itemId)) {
            // Unequip
            this.equippedItems = this.equippedItems.filter(i => i !== itemId);
        } else {
            // Equip
            this.equippedItems.push(itemId);
        }

        this.saveProgress();
        this.renderPanel();
        return true;
    }

    applyTemporaryEffect(effect) {
        // Temporary effects handled by power-ups manager integration
        this.showNotification(`⚡ ${effect.type} active for ${effect.duration / 1000}s!`);
    }

    triggerMagnetPulse(range) {
        // Would collect all items within range
        this.showNotification(`🔮 Magnet pulse! Collecting items in ${range}m radius...`);
    }

    getEquippedBonus(type) {
        let bonus = 1;

        this.equippedItems.forEach(itemId => {
            const recipe = this.recipes[itemId];
            if (recipe?.effect.type === type) {
                bonus *= recipe.effect.value;
            }
        });

        return bonus;
    }

    renderPanel() {
        this.renderResources();
        this.renderQueue();
        this.renderRecipes('consumable');
        this.renderEquipped();
    }

    renderResources() {
        const resourcesEl = document.getElementById('crafting-resources');
        if (!resourcesEl) return;

        const inventory = this.gameEngine.getInventorySummary();
        resourcesEl.innerHTML = `
            <div class="resource-item"><span>⭐</span>${inventory.stars}</div>
            <div class="resource-item"><span>💎</span>${inventory.gems}</div>
            <div class="resource-item"><span>🏆</span>${inventory.trophies}</div>
            <div class="resource-item"><span>🗝️</span>${inventory.keys}</div>
        `;
    }

    renderQueue() {
        const queueEl = document.getElementById('crafting-queue');
        if (!queueEl) return;

        if (this.craftingQueue.length === 0) {
            queueEl.innerHTML = '';
            return;
        }

        const now = Date.now();
        queueEl.innerHTML = this.craftingQueue.map(item => {
            const recipe = this.recipes[item.recipeId];
            const remaining = Math.max(0, item.endTime - now);
            const seconds = Math.ceil(remaining / 1000);
            const progress = ((now - item.startTime) / (item.endTime - item.startTime)) * 100;

            return `
                <div class="queue-item">
                    <span class="queue-icon">${recipe.icon}</span>
                    <span class="queue-name">${recipe.name}</span>
                    <div class="queue-progress">
                        <div class="queue-progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="queue-time">${seconds}s</span>
                </div>
            `;
        }).join('');
    }

    renderRecipes(category) {
        const recipesEl = document.getElementById('crafting-recipes');
        if (!recipesEl) return;

        const categoryRecipes = Object.values(this.recipes).filter(r => r.category === category);

        recipesEl.innerHTML = categoryRecipes.map(recipe => {
            const canCraft = this.canCraft(recipe.id);
            const count = this.craftedItems[recipe.id] || 0;
            const inventory = this.gameEngine.getInventorySummary();

            return `
                <div class="recipe-card ${canCraft ? 'craftable' : 'locked'}" data-recipe="${recipe.id}">
                    <div class="recipe-icon">${recipe.icon}</div>
                    <div class="recipe-info">
                        <div class="recipe-name">${recipe.name}</div>
                        <div class="recipe-desc">${recipe.description}</div>
                        <div class="recipe-ingredients">
                            ${Object.entries(recipe.ingredients).map(([item, required]) => {
                                const have = inventory[item] || 0;
                                const enough = have >= required;
                                return `<span class="${enough ? 'enough' : 'need'}">${this.getItemIcon(item)}${have}/${required}</span>`;
                            }).join('')}
                        </div>
                    </div>
                    <div class="recipe-action">
                        ${count > 0 ? `<span class="recipe-count">x${count}</span>` : ''}
                        <button class="craft-btn" ${!canCraft ? 'disabled' : ''}>Craft</button>
                    </div>
                </div>
            `;
        }).join('');

        // Add click handlers
        recipesEl.querySelectorAll('.craft-btn:not([disabled])').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recipeId = e.target.closest('.recipe-card').dataset.recipe;
                this.craft(recipeId);
            });
        });
    }

    renderEquipped() {
        const equippedEl = document.getElementById('equipped-items');
        if (!equippedEl) return;

        if (this.equippedItems.length === 0) {
            equippedEl.innerHTML = '<div class="no-equipped">No equipment active</div>';
            return;
        }

        equippedEl.innerHTML = `
            <div class="equipped-header">Equipped (${this.equippedItems.length}/3)</div>
            <div class="equipped-grid">
                ${this.equippedItems.map(itemId => {
                    const recipe = this.recipes[itemId];
                    return `
                        <div class="equipped-slot" data-item="${itemId}">
                            <span class="equipped-icon">${recipe.icon}</span>
                            <span class="equipped-name">${recipe.name}</span>
                            <button class="unequip-btn">✕</button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        equippedEl.querySelectorAll('.unequip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.closest('.equipped-slot').dataset.item;
                this.equipItem(itemId);
            });
        });
    }

    getItemIcon(type) {
        const icons = { stars: '⭐', gems: '💎', trophies: '🏆', keys: '🗝️' };
        return icons[type] || '✨';
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
