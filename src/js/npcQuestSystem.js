/**
 * NPC Quest System - Quests with dialogue
 * RoadWorld v7.0
 */

export class NPCQuestSystem {
    constructor(game) {
        this.game = game;
        this.activeQuests = JSON.parse(localStorage.getItem('activeQuests') || '[]');
        this.completedQuests = JSON.parse(localStorage.getItem('completedQuests') || '[]');
        this.npcRelationships = JSON.parse(localStorage.getItem('npcRelationships') || '{}');
        this.currentNPC = null;
        this.dialogueIndex = 0;
        this.npcMarkers = new Map();

        this.npcs = {
            elder_oak: {
                id: 'elder_oak',
                name: 'Elder Oak',
                title: 'The Wise Wanderer',
                icon: '🧙',
                personality: 'wise',
                location: { lat: 0, lng: 0 }, // Will be set relative to player
                dialogues: {
                    greeting: [
                        "Ah, a fellow traveler! The roads have whispered of your coming.",
                        "Welcome, young explorer. These lands hold many secrets.",
                        "I've been waiting for someone with the spirit of adventure."
                    ],
                    farewell: [
                        "May the stars guide your path.",
                        "Until we meet again, wanderer.",
                        "The road awaits. Go forth with courage!"
                    ]
                }
            },
            captain_swift: {
                id: 'captain_swift',
                name: 'Captain Swift',
                title: 'The Speed Demon',
                icon: '🏎️',
                personality: 'energetic',
                dialogues: {
                    greeting: [
                        "Hey speedster! Ready to burn some rubber?",
                        "Zoom zoom! Another racing enthusiast!",
                        "Fast is good, faster is better!"
                    ],
                    farewell: [
                        "Catch you on the flip side!",
                        "Stay speedy, friend!",
                        "Race ya later!"
                    ]
                }
            },
            luna_stargazer: {
                id: 'luna_stargazer',
                name: 'Luna Stargazer',
                title: 'The Celestial Collector',
                icon: '🔮',
                personality: 'mysterious',
                dialogues: {
                    greeting: [
                        "The cosmos speaks... and it speaks of you.",
                        "A collector approaches... how delightful.",
                        "The stars foretold your arrival."
                    ],
                    farewell: [
                        "May stardust light your way.",
                        "The universe watches over you.",
                        "Until the stars align again..."
                    ]
                }
            },
            forge_master: {
                id: 'forge_master',
                name: 'Forge Master Titan',
                title: 'The Master Craftsman',
                icon: '⚒️',
                personality: 'gruff',
                dialogues: {
                    greeting: [
                        "You want something crafted? I'm the best there is.",
                        "Hmph. Another customer. What do you need?",
                        "My forge burns eternal. State your business."
                    ],
                    farewell: [
                        "Now get out there and put it to good use!",
                        "Quality work takes time. Remember that.",
                        "Hmph. Come back when you have more materials."
                    ]
                }
            },
            nature_sprite: {
                id: 'nature_sprite',
                name: 'Pip',
                title: 'The Nature Sprite',
                icon: '🧚',
                personality: 'playful',
                dialogues: {
                    greeting: [
                        "Hehe! A new friend to play with!",
                        "Ooh ooh! You look fun! Let's go on an adventure!",
                        "Yay! The flowers told me you were coming!"
                    ],
                    farewell: [
                        "Bye bye! Come play again soon!",
                        "Wheee! That was fun! See you later!",
                        "The butterflies will guide you! Tee-hee!"
                    ]
                }
            },
            shadow_merchant: {
                id: 'shadow_merchant',
                name: 'The Shadow',
                title: 'Mysterious Merchant',
                icon: '🥷',
                personality: 'secretive',
                dialogues: {
                    greeting: [
                        "...You found me. Impressive.",
                        "Shh. Keep your voice down. I have... goods.",
                        "Not everyone can see me. You're special."
                    ],
                    farewell: [
                        "We never met...",
                        "Forget you saw me.",
                        "Until the shadows call again..."
                    ]
                }
            }
        };

        this.quests = {
            first_journey: {
                id: 'first_journey',
                name: 'The First Journey',
                giver: 'elder_oak',
                type: 'main',
                difficulty: 1,
                description: 'Begin your adventure by exploring the world around you.',
                objectives: [
                    { id: 'travel_1km', type: 'distance', target: 1, description: 'Travel 1 kilometer' },
                    { id: 'collect_10_stars', type: 'collect', item: 'star', target: 10, description: 'Collect 10 stars' }
                ],
                rewards: { xp: 100, stars: 50, items: ['🗺️'] },
                dialogue: {
                    intro: [
                        "Every great journey begins with a single step.",
                        "Your first task is simple: explore and collect.",
                        "Travel one kilometer and gather 10 stars along the way."
                    ],
                    progress: [
                        "You're making good progress, traveler.",
                        "The path reveals itself to those who walk it."
                    ],
                    complete: [
                        "Excellent! You have proven yourself ready.",
                        "Take these rewards. They will serve you well.",
                        "But this is only the beginning..."
                    ]
                },
                unlocks: ['speed_trial', 'star_collector']
            },
            speed_trial: {
                id: 'speed_trial',
                name: 'Need for Speed',
                giver: 'captain_swift',
                type: 'side',
                difficulty: 2,
                description: 'Prove your speed by completing a quick challenge.',
                prerequisites: ['first_journey'],
                objectives: [
                    { id: 'travel_fast', type: 'speed_challenge', target: 0.5, time: 60, description: 'Travel 500m in under 60 seconds' }
                ],
                rewards: { xp: 150, gems: 5, items: ['⚡'] },
                dialogue: {
                    intro: [
                        "Think you're fast? Prove it!",
                        "I challenge you to a speed trial!",
                        "Travel 500 meters in under a minute. Ready? GO!"
                    ],
                    progress: [
                        "Come on, push harder!",
                        "You can do better than that!"
                    ],
                    complete: [
                        "WOOHOO! Now THAT'S what I'm talking about!",
                        "You've got the need for speed!",
                        "Here's your reward, speed demon!"
                    ]
                }
            },
            star_collector: {
                id: 'star_collector',
                name: 'Starlight Gathering',
                giver: 'luna_stargazer',
                type: 'side',
                difficulty: 2,
                description: 'Collect stars for the celestial one.',
                prerequisites: ['first_journey'],
                objectives: [
                    { id: 'collect_100_stars', type: 'collect', item: 'star', target: 100, description: 'Collect 100 stars' }
                ],
                rewards: { xp: 200, stars: 100, items: ['🌟'] },
                dialogue: {
                    intro: [
                        "The cosmos requires your assistance.",
                        "I need 100 stars for my celestial collection.",
                        "Bring them to me, and I shall reward you handsomely."
                    ],
                    progress: [
                        "The stars call to you...",
                        "I can feel your collection growing."
                    ],
                    complete: [
                        "Magnificent! The stars shine brighter now.",
                        "Your dedication to the cosmos is noted.",
                        "Accept this gift from the heavens."
                    ]
                },
                unlocks: ['gem_hunter']
            },
            gem_hunter: {
                id: 'gem_hunter',
                name: 'Precious Stones',
                giver: 'luna_stargazer',
                type: 'side',
                difficulty: 3,
                description: 'Hunt for rare gems across the land.',
                prerequisites: ['star_collector'],
                objectives: [
                    { id: 'collect_25_gems', type: 'collect', item: 'gem', target: 25, description: 'Collect 25 gems' }
                ],
                rewards: { xp: 300, gems: 25, items: ['💎'] },
                dialogue: {
                    intro: [
                        "You've proven worthy of a greater challenge.",
                        "Seek out the rare gems hidden across the world.",
                        "25 gems shall prove your mastery."
                    ],
                    progress: [
                        "Gems are elusive, but you're on the right path.",
                        "The earth's treasures await discovery."
                    ],
                    complete: [
                        "A true gem master! The earth bows to you.",
                        "These treasures are now yours to keep."
                    ]
                }
            },
            crafting_basics: {
                id: 'crafting_basics',
                name: 'The Art of Crafting',
                giver: 'forge_master',
                type: 'side',
                difficulty: 2,
                description: 'Learn the basics of crafting.',
                objectives: [
                    { id: 'craft_3_items', type: 'craft', target: 3, description: 'Craft 3 items' }
                ],
                rewards: { xp: 150, items: ['🔨', '📜'] },
                dialogue: {
                    intro: [
                        "So you want to learn crafting, eh?",
                        "It's not easy, but I'll teach you.",
                        "Craft 3 items using my workshop. Now get to work!"
                    ],
                    progress: [
                        "Put your back into it!",
                        "Crafting is an art. Treat it with respect."
                    ],
                    complete: [
                        "Not bad for a beginner. Not bad at all.",
                        "You've got potential. Keep at it.",
                        "Take these tools. You've earned them."
                    ]
                }
            },
            nature_hunt: {
                id: 'nature_hunt',
                name: 'Hide and Seek',
                giver: 'nature_sprite',
                type: 'side',
                difficulty: 1,
                description: 'Play a game with the mischievous sprite.',
                objectives: [
                    { id: 'find_hidden', type: 'exploration', target: 5, description: 'Find 5 hidden spots' }
                ],
                rewards: { xp: 100, stars: 75, items: ['🍀'] },
                dialogue: {
                    intro: [
                        "Let's play a game!",
                        "I've hidden in 5 special spots around the world!",
                        "Find them all and you win a prize! Ready? GO!"
                    ],
                    progress: [
                        "Warmer... WARMER!",
                        "Tee-hee! You'll never find me!"
                    ],
                    complete: [
                        "Aww, you found all my hiding spots!",
                        "You're really good at this!",
                        "Here's your prize! Let's play again sometime!"
                    ]
                }
            },
            shadow_deal: {
                id: 'shadow_deal',
                name: 'Shady Business',
                giver: 'shadow_merchant',
                type: 'side',
                difficulty: 4,
                description: 'Complete a mysterious task for the shadow merchant.',
                objectives: [
                    { id: 'collect_keys', type: 'collect', item: 'key', target: 10, description: 'Collect 10 keys' },
                    { id: 'night_travel', type: 'time_travel', period: 'night', target: 2, description: 'Travel 2km at night' }
                ],
                rewards: { xp: 500, gems: 20, items: ['🗝️', '🎭'] },
                dialogue: {
                    intro: [
                        "I have a job for you. No questions.",
                        "Bring me 10 keys. Travel in darkness.",
                        "Complete this, and I'll make it worth your while."
                    ],
                    progress: [
                        "Keep to the shadows...",
                        "You're being watched. Be careful."
                    ],
                    complete: [
                        "...Well done.",
                        "You've proven yourself... useful.",
                        "Take this. And remember - we never met."
                    ]
                }
            }
        };

        this.init();
    }

    init() {
        this.createUI();
        this.spawnNPCs();
    }

    createUI() {
        // Quest log panel
        const panel = document.createElement('div');
        panel.id = 'quest-panel';
        panel.className = 'game-panel quest-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <h3>📜 Quest Log</h3>
                <button class="close-btn" id="close-quest-panel">×</button>
            </div>
            <div class="panel-content">
                <div class="quest-tabs">
                    <button class="quest-tab active" data-tab="active">Active</button>
                    <button class="quest-tab" data-tab="available">Available</button>
                    <button class="quest-tab" data-tab="completed">Completed</button>
                </div>

                <div class="quest-tab-content active" id="active-quests-tab">
                    <div id="active-quests-list" class="quests-list"></div>
                </div>

                <div class="quest-tab-content" id="available-quests-tab">
                    <div id="available-quests-list" class="quests-list"></div>
                </div>

                <div class="quest-tab-content" id="completed-quests-tab">
                    <div id="completed-quests-list" class="quests-list"></div>
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        // Dialogue box
        const dialogue = document.createElement('div');
        dialogue.id = 'dialogue-box';
        dialogue.className = 'dialogue-box hidden';
        dialogue.innerHTML = `
            <div class="dialogue-portrait" id="dialogue-portrait"></div>
            <div class="dialogue-content">
                <div class="dialogue-speaker" id="dialogue-speaker"></div>
                <div class="dialogue-text" id="dialogue-text"></div>
                <div class="dialogue-options" id="dialogue-options"></div>
            </div>
        `;
        document.body.appendChild(dialogue);

        // Quest tracker widget
        const tracker = document.createElement('div');
        tracker.id = 'quest-tracker';
        tracker.className = 'quest-tracker';
        tracker.innerHTML = `
            <div class="tracker-header">📜 Current Quest</div>
            <div id="tracker-content" class="tracker-content">No active quest</div>
        `;
        document.body.appendChild(tracker);

        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        document.getElementById('close-quest-panel').addEventListener('click', () => {
            this.hidePanel();
        });

        document.querySelectorAll('.quest-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.quest-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.quest-tab-content').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(`${e.target.dataset.tab}-quests-tab`).classList.add('active');
            });
        });

        document.getElementById('quest-tracker').addEventListener('click', () => {
            this.showPanel();
        });
    }

    showPanel() {
        document.getElementById('quest-panel').classList.add('active');
        this.updateUI();
    }

    hidePanel() {
        document.getElementById('quest-panel').classList.remove('active');
    }

    spawnNPCs() {
        // Spawn NPCs near player
        if (!this.game.currentPosition) {
            setTimeout(() => this.spawnNPCs(), 1000);
            return;
        }

        Object.entries(this.npcs).forEach(([id, npc], index) => {
            const angle = (index / Object.keys(this.npcs).length) * Math.PI * 2;
            const distance = 0.002 + Math.random() * 0.003;

            npc.location = {
                lat: this.game.currentPosition.lat + Math.cos(angle) * distance,
                lng: this.game.currentPosition.lng + Math.sin(angle) * distance
            };

            this.createNPCMarker(npc);
        });
    }

    createNPCMarker(npc) {
        if (!this.game.map) return;

        const el = document.createElement('div');
        el.className = 'npc-marker';
        el.innerHTML = `
            <span class="npc-icon">${npc.icon}</span>
            <span class="npc-name">${npc.name}</span>
        `;
        el.addEventListener('click', () => this.interactWithNPC(npc.id));

        const marker = new maplibregl.Marker({ element: el })
            .setLngLat([npc.location.lng, npc.location.lat])
            .addTo(this.game.map);

        this.npcMarkers.set(npc.id, marker);
    }

    interactWithNPC(npcId) {
        const npc = this.npcs[npcId];
        if (!npc) return;

        this.currentNPC = npc;
        this.dialogueIndex = 0;

        // Check for quest updates
        const relevantQuest = this.getRelevantQuest(npcId);

        if (relevantQuest) {
            if (this.isQuestComplete(relevantQuest)) {
                this.showDialogue(npc, relevantQuest.dialogue.complete, () => {
                    this.completeQuest(relevantQuest.id);
                });
            } else if (this.activeQuests.includes(relevantQuest.id)) {
                this.showDialogue(npc, relevantQuest.dialogue.progress);
            } else {
                this.showDialogue(npc, relevantQuest.dialogue.intro, () => {
                    this.startQuest(relevantQuest.id);
                });
            }
        } else {
            this.showDialogue(npc, npc.dialogues.greeting);
        }
    }

    getRelevantQuest(npcId) {
        // Find quest from this NPC
        for (const quest of Object.values(this.quests)) {
            if (quest.giver !== npcId) continue;

            // Check if already completed
            if (this.completedQuests.includes(quest.id)) continue;

            // Check prerequisites
            if (quest.prerequisites) {
                const prereqsMet = quest.prerequisites.every(p => this.completedQuests.includes(p));
                if (!prereqsMet) continue;
            }

            return quest;
        }
        return null;
    }

    showDialogue(npc, lines, onComplete = null) {
        const box = document.getElementById('dialogue-box');
        const portrait = document.getElementById('dialogue-portrait');
        const speaker = document.getElementById('dialogue-speaker');
        const text = document.getElementById('dialogue-text');
        const options = document.getElementById('dialogue-options');

        portrait.innerHTML = npc.icon;
        speaker.textContent = `${npc.name} - ${npc.title}`;

        box.classList.remove('hidden');

        const showLine = (index) => {
            if (index >= lines.length) {
                if (onComplete) onComplete();
                options.innerHTML = '<button class="dialogue-btn" id="dialogue-close">Goodbye</button>';
                document.getElementById('dialogue-close').addEventListener('click', () => {
                    this.closeDialogue();
                });
                return;
            }

            text.textContent = '';
            const line = lines[index];
            let charIndex = 0;

            const typeWriter = () => {
                if (charIndex < line.length) {
                    text.textContent += line.charAt(charIndex);
                    charIndex++;
                    setTimeout(typeWriter, 30);
                } else {
                    options.innerHTML = '<button class="dialogue-btn" id="dialogue-next">Continue</button>';
                    document.getElementById('dialogue-next').addEventListener('click', () => {
                        showLine(index + 1);
                    });
                }
            };

            typeWriter();
        };

        showLine(0);
    }

    closeDialogue() {
        document.getElementById('dialogue-box').classList.add('hidden');
        this.currentNPC = null;
    }

    startQuest(questId) {
        const quest = this.quests[questId];
        if (!quest || this.activeQuests.includes(questId)) return;

        this.activeQuests.push(questId);
        localStorage.setItem('activeQuests', JSON.stringify(this.activeQuests));

        // Initialize quest progress
        const progress = {};
        quest.objectives.forEach(obj => {
            progress[obj.id] = 0;
        });
        localStorage.setItem(`quest_${questId}`, JSON.stringify(progress));

        this.game.showNotification(`📜 New Quest: ${quest.name}`, 'success');
        this.updateUI();
        this.updateQuestTracker();
    }

    isQuestComplete(quest) {
        if (!this.activeQuests.includes(quest.id)) return false;

        const progress = JSON.parse(localStorage.getItem(`quest_${quest.id}`) || '{}');
        return quest.objectives.every(obj => (progress[obj.id] || 0) >= obj.target);
    }

    completeQuest(questId) {
        const quest = this.quests[questId];
        if (!quest) return;

        // Remove from active
        this.activeQuests = this.activeQuests.filter(q => q !== questId);
        localStorage.setItem('activeQuests', JSON.stringify(this.activeQuests));

        // Add to completed
        this.completedQuests.push(questId);
        localStorage.setItem('completedQuests', JSON.stringify(this.completedQuests));

        // Give rewards
        if (quest.rewards.xp) this.game.addXP(quest.rewards.xp);
        if (quest.rewards.stars) this.game.addStars(quest.rewards.stars);
        if (quest.rewards.gems) this.game.addGems(quest.rewards.gems);

        // Update NPC relationship
        this.improveRelationship(quest.giver);

        this.game.showNotification(`🎉 Quest Complete: ${quest.name}!`, 'legendary');
        this.updateUI();
        this.updateQuestTracker();
    }

    improveRelationship(npcId) {
        if (!this.npcRelationships[npcId]) {
            this.npcRelationships[npcId] = 0;
        }
        this.npcRelationships[npcId]++;
        localStorage.setItem('npcRelationships', JSON.stringify(this.npcRelationships));
    }

    updateQuestProgress(type, value, item = null) {
        this.activeQuests.forEach(questId => {
            const quest = this.quests[questId];
            if (!quest) return;

            const progress = JSON.parse(localStorage.getItem(`quest_${questId}`) || '{}');
            let updated = false;

            quest.objectives.forEach(obj => {
                if (obj.type === type) {
                    if (type === 'collect' && obj.item === item) {
                        progress[obj.id] = (progress[obj.id] || 0) + value;
                        updated = true;
                    } else if (type === 'distance' || type === 'craft' || type === 'exploration') {
                        progress[obj.id] = (progress[obj.id] || 0) + value;
                        updated = true;
                    }
                }
            });

            if (updated) {
                localStorage.setItem(`quest_${questId}`, JSON.stringify(progress));
                this.updateQuestTracker();

                // Check if quest is now complete
                if (this.isQuestComplete(quest)) {
                    this.game.showNotification(`📜 Quest objectives complete! Return to ${this.npcs[quest.giver].name}`, 'info');
                }
            }
        });
    }

    updateUI() {
        this.updateActiveQuests();
        this.updateAvailableQuests();
        this.updateCompletedQuests();
    }

    updateActiveQuests() {
        const container = document.getElementById('active-quests-list');

        if (this.activeQuests.length === 0) {
            container.innerHTML = '<div class="no-quests">No active quests. Talk to NPCs to find quests!</div>';
            return;
        }

        container.innerHTML = this.activeQuests.map(questId => {
            const quest = this.quests[questId];
            if (!quest) return '';

            const npc = this.npcs[quest.giver];
            const progress = JSON.parse(localStorage.getItem(`quest_${questId}`) || '{}');

            return `
                <div class="quest-item">
                    <div class="quest-header">
                        <span class="quest-giver">${npc?.icon || '❓'}</span>
                        <div class="quest-info">
                            <h4>${quest.name}</h4>
                            <span class="quest-type ${quest.type}">${quest.type}</span>
                        </div>
                    </div>
                    <p class="quest-desc">${quest.description}</p>
                    <div class="quest-objectives">
                        ${quest.objectives.map(obj => {
                            const current = progress[obj.id] || 0;
                            const complete = current >= obj.target;
                            return `
                                <div class="objective ${complete ? 'complete' : ''}">
                                    <span class="obj-check">${complete ? '✓' : '○'}</span>
                                    <span class="obj-text">${obj.description}</span>
                                    <span class="obj-progress">${current}/${obj.target}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div class="quest-rewards">
                        ${quest.rewards.xp ? `<span>+${quest.rewards.xp} XP</span>` : ''}
                        ${quest.rewards.stars ? `<span>+${quest.rewards.stars} ⭐</span>` : ''}
                        ${quest.rewards.gems ? `<span>+${quest.rewards.gems} 💎</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    updateAvailableQuests() {
        const container = document.getElementById('available-quests-list');
        const available = [];

        Object.values(this.quests).forEach(quest => {
            if (this.activeQuests.includes(quest.id)) return;
            if (this.completedQuests.includes(quest.id)) return;

            if (quest.prerequisites) {
                const prereqsMet = quest.prerequisites.every(p => this.completedQuests.includes(p));
                if (!prereqsMet) return;
            }

            available.push(quest);
        });

        if (available.length === 0) {
            container.innerHTML = '<div class="no-quests">No new quests available. Complete current quests to unlock more!</div>';
            return;
        }

        container.innerHTML = available.map(quest => {
            const npc = this.npcs[quest.giver];
            return `
                <div class="quest-item available">
                    <div class="quest-header">
                        <span class="quest-giver">${npc?.icon || '❓'}</span>
                        <div class="quest-info">
                            <h4>${quest.name}</h4>
                            <span class="quest-difficulty">Difficulty: ${'⭐'.repeat(quest.difficulty)}</span>
                        </div>
                    </div>
                    <p class="quest-desc">${quest.description}</p>
                    <p class="quest-hint">Talk to ${npc?.name || 'the NPC'} to start this quest</p>
                </div>
            `;
        }).join('');
    }

    updateCompletedQuests() {
        const container = document.getElementById('completed-quests-list');

        if (this.completedQuests.length === 0) {
            container.innerHTML = '<div class="no-quests">No completed quests yet.</div>';
            return;
        }

        container.innerHTML = this.completedQuests.map(questId => {
            const quest = this.quests[questId];
            if (!quest) return '';

            return `
                <div class="quest-item completed">
                    <div class="quest-header">
                        <span class="quest-check">✓</span>
                        <div class="quest-info">
                            <h4>${quest.name}</h4>
                            <span class="quest-type ${quest.type}">${quest.type}</span>
                        </div>
                    </div>
                    <p class="quest-desc">${quest.description}</p>
                </div>
            `;
        }).join('');
    }

    updateQuestTracker() {
        const container = document.getElementById('tracker-content');

        if (this.activeQuests.length === 0) {
            container.innerHTML = 'No active quest';
            return;
        }

        const questId = this.activeQuests[0];
        const quest = this.quests[questId];
        if (!quest) return;

        const progress = JSON.parse(localStorage.getItem(`quest_${questId}`) || '{}');

        container.innerHTML = `
            <div class="tracker-quest-name">${quest.name}</div>
            ${quest.objectives.map(obj => {
                const current = Math.min(progress[obj.id] || 0, obj.target);
                const complete = current >= obj.target;
                return `
                    <div class="tracker-objective ${complete ? 'complete' : ''}">
                        ${complete ? '✓' : '○'} ${obj.description}: ${current}/${obj.target}
                    </div>
                `;
            }).join('')}
        `;
    }
}

// Global reference
window.npcQuestSystem = null;
