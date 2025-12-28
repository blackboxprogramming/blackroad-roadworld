/**
 * Mini-Games Arcade - Fun arcade games within the game
 * RoadWorld v7.0
 */

export class MiniGamesArcade {
    constructor(game) {
        this.game = game;
        this.currentGame = null;
        this.highScores = JSON.parse(localStorage.getItem('arcadeHighScores') || '{}');
        this.tickets = parseInt(localStorage.getItem('arcadeTickets') || '0');
        this.gamesPlayed = JSON.parse(localStorage.getItem('gamesPlayed') || '{}');

        this.games = {
            memory_match: {
                id: 'memory_match',
                name: 'Memory Match',
                icon: '🎴',
                description: 'Match pairs of cards before time runs out!',
                ticketReward: 5,
                difficulty: 'easy',
                category: 'puzzle'
            },
            catch_stars: {
                id: 'catch_stars',
                name: 'Star Catcher',
                icon: '⭐',
                description: 'Catch falling stars, avoid the bombs!',
                ticketReward: 10,
                difficulty: 'medium',
                category: 'action'
            },
            quick_math: {
                id: 'quick_math',
                name: 'Quick Math',
                icon: '🔢',
                description: 'Solve math problems as fast as you can!',
                ticketReward: 8,
                difficulty: 'medium',
                category: 'puzzle'
            },
            reaction_test: {
                id: 'reaction_test',
                name: 'Reaction Test',
                icon: '⚡',
                description: 'Test your reflexes! Click when the screen turns green.',
                ticketReward: 3,
                difficulty: 'easy',
                category: 'reflex'
            },
            word_scramble: {
                id: 'word_scramble',
                name: 'Word Scramble',
                icon: '📝',
                description: 'Unscramble the letters to form words!',
                ticketReward: 7,
                difficulty: 'medium',
                category: 'puzzle'
            },
            whack_a_mole: {
                id: 'whack_a_mole',
                name: 'Whack-a-Gem',
                icon: '💎',
                description: 'Whack the gems as they pop up!',
                ticketReward: 6,
                difficulty: 'easy',
                category: 'action'
            },
            snake: {
                id: 'snake',
                name: 'Snake',
                icon: '🐍',
                description: 'Classic snake game. Eat to grow!',
                ticketReward: 12,
                difficulty: 'hard',
                category: 'classic'
            },
            simon_says: {
                id: 'simon_says',
                name: 'Simon Says',
                icon: '🎨',
                description: 'Remember and repeat the color sequence!',
                ticketReward: 8,
                difficulty: 'medium',
                category: 'memory'
            }
        };

        this.prizes = {
            small_star_pack: {
                name: 'Small Star Pack',
                icon: '⭐',
                cost: 10,
                reward: { type: 'stars', amount: 50 }
            },
            medium_star_pack: {
                name: 'Medium Star Pack',
                icon: '🌟',
                cost: 25,
                reward: { type: 'stars', amount: 150 }
            },
            gem_pack: {
                name: 'Gem Pack',
                icon: '💎',
                cost: 50,
                reward: { type: 'gems', amount: 10 }
            },
            xp_boost: {
                name: 'XP Boost',
                icon: '📈',
                cost: 30,
                reward: { type: 'xp', amount: 500 }
            },
            fuel_pack: {
                name: 'Fuel Pack',
                icon: '⛽',
                cost: 20,
                reward: { type: 'fuel', amount: 50 }
            },
            mystery_box: {
                name: 'Mystery Box',
                icon: '📦',
                cost: 100,
                reward: { type: 'mystery' }
            }
        };

        this.init();
    }

    init() {
        this.createUI();
    }

    createUI() {
        const panel = document.createElement('div');
        panel.id = 'arcade-panel';
        panel.className = 'game-panel arcade-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <h3>🎮 Arcade</h3>
                <button class="close-btn" id="close-arcade">×</button>
            </div>
            <div class="panel-content">
                <div class="ticket-display">
                    <span class="ticket-icon">🎟️</span>
                    <span id="ticket-count">${this.tickets}</span>
                    <span class="ticket-label">Tickets</span>
                </div>

                <div class="arcade-tabs">
                    <button class="arcade-tab active" data-tab="games">Games</button>
                    <button class="arcade-tab" data-tab="prizes">Prize Shop</button>
                    <button class="arcade-tab" data-tab="scores">High Scores</button>
                </div>

                <div class="arcade-tab-content active" id="games-tab">
                    <div id="games-list" class="games-list"></div>
                </div>

                <div class="arcade-tab-content" id="prizes-tab">
                    <div id="prizes-list" class="prizes-list"></div>
                </div>

                <div class="arcade-tab-content" id="scores-tab">
                    <div id="scores-list" class="scores-list"></div>
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        // Game container
        const gameContainer = document.createElement('div');
        gameContainer.id = 'mini-game-container';
        gameContainer.className = 'mini-game-container hidden';
        gameContainer.innerHTML = `
            <div class="mini-game-header">
                <span id="mini-game-title"></span>
                <span id="mini-game-score">Score: 0</span>
                <button id="exit-mini-game">✕</button>
            </div>
            <div id="mini-game-area" class="mini-game-area"></div>
            <div id="mini-game-controls" class="mini-game-controls"></div>
        `;
        document.body.appendChild(gameContainer);

        this.setupEventListeners();
        this.renderGamesList();
        this.renderPrizesList();
        this.renderHighScores();
    }

    setupEventListeners() {
        document.getElementById('close-arcade').addEventListener('click', () => {
            this.hidePanel();
        });

        document.querySelectorAll('.arcade-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.arcade-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.arcade-tab-content').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(`${e.target.dataset.tab}-tab`).classList.add('active');
            });
        });

        document.getElementById('exit-mini-game').addEventListener('click', () => {
            this.exitGame();
        });
    }

    showPanel() {
        document.getElementById('arcade-panel').classList.add('active');
    }

    hidePanel() {
        document.getElementById('arcade-panel').classList.remove('active');
    }

    renderGamesList() {
        const container = document.getElementById('games-list');

        container.innerHTML = Object.values(this.games).map(game => `
            <div class="arcade-game-item" onclick="window.miniGamesArcade.startGame('${game.id}')">
                <div class="game-icon">${game.icon}</div>
                <div class="game-info">
                    <h4>${game.name}</h4>
                    <p>${game.description}</p>
                    <div class="game-meta">
                        <span class="difficulty ${game.difficulty}">${game.difficulty}</span>
                        <span class="reward">🎟️ +${game.ticketReward}</span>
                    </div>
                </div>
                <button class="play-btn">Play</button>
            </div>
        `).join('');
    }

    renderPrizesList() {
        const container = document.getElementById('prizes-list');

        container.innerHTML = Object.entries(this.prizes).map(([id, prize]) => `
            <div class="prize-item">
                <div class="prize-icon">${prize.icon}</div>
                <div class="prize-info">
                    <h4>${prize.name}</h4>
                    <span class="prize-cost">🎟️ ${prize.cost}</span>
                </div>
                <button class="redeem-btn" onclick="window.miniGamesArcade.redeemPrize('${id}')"
                        ${this.tickets < prize.cost ? 'disabled' : ''}>
                    Redeem
                </button>
            </div>
        `).join('');
    }

    renderHighScores() {
        const container = document.getElementById('scores-list');

        const scores = Object.entries(this.highScores)
            .map(([gameId, score]) => ({
                game: this.games[gameId],
                score: score
            }))
            .filter(s => s.game)
            .sort((a, b) => b.score - a.score);

        if (scores.length === 0) {
            container.innerHTML = '<div class="no-scores">Play games to set high scores!</div>';
            return;
        }

        container.innerHTML = scores.map((entry, index) => `
            <div class="score-item">
                <span class="score-rank">#${index + 1}</span>
                <span class="score-game">${entry.game.icon} ${entry.game.name}</span>
                <span class="score-value">${entry.score}</span>
            </div>
        `).join('');
    }

    startGame(gameId) {
        const game = this.games[gameId];
        if (!game) return;

        this.currentGame = gameId;
        this.hidePanel();

        const container = document.getElementById('mini-game-container');
        const gameArea = document.getElementById('mini-game-area');
        const title = document.getElementById('mini-game-title');

        title.textContent = `${game.icon} ${game.name}`;
        container.classList.remove('hidden');

        // Track games played
        this.gamesPlayed[gameId] = (this.gamesPlayed[gameId] || 0) + 1;
        localStorage.setItem('gamesPlayed', JSON.stringify(this.gamesPlayed));

        // Initialize the specific game
        switch (gameId) {
            case 'memory_match':
                this.initMemoryMatch(gameArea);
                break;
            case 'catch_stars':
                this.initCatchStars(gameArea);
                break;
            case 'quick_math':
                this.initQuickMath(gameArea);
                break;
            case 'reaction_test':
                this.initReactionTest(gameArea);
                break;
            case 'word_scramble':
                this.initWordScramble(gameArea);
                break;
            case 'whack_a_mole':
                this.initWhackAMole(gameArea);
                break;
            case 'snake':
                this.initSnake(gameArea);
                break;
            case 'simon_says':
                this.initSimonSays(gameArea);
                break;
        }
    }

    // Memory Match Game
    initMemoryMatch(container) {
        const emojis = ['🌟', '💎', '🔑', '🏆', '⭐', '💫', '🎯', '🎪'];
        const cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
        let flipped = [];
        let matched = 0;
        let moves = 0;
        const startTime = Date.now();

        container.innerHTML = `
            <div class="memory-grid">
                ${cards.map((emoji, i) => `
                    <div class="memory-card" data-index="${i}" data-emoji="${emoji}">
                        <div class="card-front">?</div>
                        <div class="card-back">${emoji}</div>
                    </div>
                `).join('')}
            </div>
            <div class="game-stats">
                <span>Moves: <span id="memory-moves">0</span></span>
                <span>Matched: <span id="memory-matched">0</span>/8</span>
            </div>
        `;

        container.querySelectorAll('.memory-card').forEach(card => {
            card.addEventListener('click', () => {
                if (flipped.length >= 2 || card.classList.contains('flipped')) return;

                card.classList.add('flipped');
                flipped.push(card);

                if (flipped.length === 2) {
                    moves++;
                    document.getElementById('memory-moves').textContent = moves;

                    const [a, b] = flipped;
                    if (a.dataset.emoji === b.dataset.emoji) {
                        matched++;
                        document.getElementById('memory-matched').textContent = matched;
                        flipped = [];

                        if (matched === 8) {
                            const time = Math.round((Date.now() - startTime) / 1000);
                            const score = Math.max(0, 1000 - moves * 10 - time * 5);
                            this.endGame(score);
                        }
                    } else {
                        setTimeout(() => {
                            a.classList.remove('flipped');
                            b.classList.remove('flipped');
                            flipped = [];
                        }, 1000);
                    }
                }
            });
        });
    }

    // Catch Stars Game
    initCatchStars(container) {
        let score = 0;
        let lives = 3;
        let gameActive = true;

        container.innerHTML = `
            <div class="catch-game-area" id="catch-area">
                <div class="catcher" id="catcher">🧺</div>
            </div>
            <div class="game-stats">
                <span>Score: <span id="catch-score">0</span></span>
                <span>Lives: <span id="catch-lives">❤️❤️❤️</span></span>
            </div>
        `;

        const area = document.getElementById('catch-area');
        const catcher = document.getElementById('catcher');
        let catcherX = 50;

        // Mouse/touch controls
        area.addEventListener('mousemove', (e) => {
            const rect = area.getBoundingClientRect();
            catcherX = ((e.clientX - rect.left) / rect.width) * 100;
            catcher.style.left = `${Math.max(5, Math.min(95, catcherX))}%`;
        });

        area.addEventListener('touchmove', (e) => {
            const rect = area.getBoundingClientRect();
            catcherX = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
            catcher.style.left = `${Math.max(5, Math.min(95, catcherX))}%`;
        });

        const spawnObject = () => {
            if (!gameActive) return;

            const obj = document.createElement('div');
            const isStar = Math.random() > 0.3;
            obj.className = 'falling-object';
            obj.textContent = isStar ? '⭐' : '💣';
            obj.dataset.type = isStar ? 'star' : 'bomb';
            obj.style.left = `${Math.random() * 90 + 5}%`;
            obj.style.top = '0';
            area.appendChild(obj);

            let y = 0;
            const fall = setInterval(() => {
                y += 2;
                obj.style.top = `${y}px`;

                // Check collision
                const objRect = obj.getBoundingClientRect();
                const catcherRect = catcher.getBoundingClientRect();

                if (objRect.bottom >= catcherRect.top &&
                    objRect.left < catcherRect.right &&
                    objRect.right > catcherRect.left) {
                    clearInterval(fall);
                    obj.remove();

                    if (obj.dataset.type === 'star') {
                        score += 10;
                        document.getElementById('catch-score').textContent = score;
                    } else {
                        lives--;
                        document.getElementById('catch-lives').textContent = '❤️'.repeat(lives);
                        if (lives <= 0) {
                            gameActive = false;
                            this.endGame(score);
                        }
                    }
                }

                if (y > area.offsetHeight) {
                    clearInterval(fall);
                    obj.remove();
                    if (obj.dataset.type === 'star') {
                        lives--;
                        document.getElementById('catch-lives').textContent = '❤️'.repeat(lives);
                        if (lives <= 0) {
                            gameActive = false;
                            this.endGame(score);
                        }
                    }
                }
            }, 30);
        };

        const spawner = setInterval(() => {
            if (!gameActive) {
                clearInterval(spawner);
                return;
            }
            spawnObject();
        }, 800);

        this.gameCleanup = () => {
            gameActive = false;
            clearInterval(spawner);
        };
    }

    // Quick Math Game
    initQuickMath(container) {
        let score = 0;
        let timeLeft = 30;
        let currentAnswer = 0;

        const generateProblem = () => {
            const ops = ['+', '-', '×'];
            const op = ops[Math.floor(Math.random() * ops.length)];
            let a, b;

            switch (op) {
                case '+':
                    a = Math.floor(Math.random() * 50) + 1;
                    b = Math.floor(Math.random() * 50) + 1;
                    currentAnswer = a + b;
                    break;
                case '-':
                    a = Math.floor(Math.random() * 50) + 10;
                    b = Math.floor(Math.random() * a);
                    currentAnswer = a - b;
                    break;
                case '×':
                    a = Math.floor(Math.random() * 12) + 1;
                    b = Math.floor(Math.random() * 12) + 1;
                    currentAnswer = a * b;
                    break;
            }

            return `${a} ${op} ${b} = ?`;
        };

        container.innerHTML = `
            <div class="math-problem" id="math-problem">${generateProblem()}</div>
            <input type="number" id="math-answer" class="math-input" placeholder="Your answer">
            <button id="math-submit" class="submit-btn">Submit</button>
            <div class="game-stats">
                <span>Score: <span id="math-score">0</span></span>
                <span>Time: <span id="math-time">30</span>s</span>
            </div>
        `;

        const input = document.getElementById('math-answer');
        const submit = document.getElementById('math-submit');

        const checkAnswer = () => {
            const userAnswer = parseInt(input.value);
            if (userAnswer === currentAnswer) {
                score += 10;
                document.getElementById('math-score').textContent = score;
            }
            input.value = '';
            document.getElementById('math-problem').textContent = generateProblem();
            input.focus();
        };

        submit.addEventListener('click', checkAnswer);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkAnswer();
        });

        input.focus();

        const timer = setInterval(() => {
            timeLeft--;
            document.getElementById('math-time').textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                this.endGame(score);
            }
        }, 1000);

        this.gameCleanup = () => clearInterval(timer);
    }

    // Reaction Test Game
    initReactionTest(container) {
        let attempts = 0;
        let totalTime = 0;
        let waiting = false;
        let startTime = 0;

        container.innerHTML = `
            <div class="reaction-box" id="reaction-box">
                <p>Click/Tap when the box turns GREEN!</p>
                <p>Attempts: <span id="reaction-attempts">0</span>/5</p>
                <p>Average: <span id="reaction-avg">--</span>ms</p>
            </div>
        `;

        const box = document.getElementById('reaction-box');

        const startRound = () => {
            if (attempts >= 5) {
                const avgTime = Math.round(totalTime / 5);
                const score = Math.max(0, 500 - avgTime);
                this.endGame(score);
                return;
            }

            box.style.background = '#F44336';
            box.querySelector('p').textContent = 'Wait for GREEN...';
            waiting = true;

            const delay = 1000 + Math.random() * 4000;
            setTimeout(() => {
                if (!waiting) return;
                box.style.background = '#4CAF50';
                box.querySelector('p').textContent = 'CLICK NOW!';
                startTime = Date.now();
            }, delay);
        };

        box.addEventListener('click', () => {
            if (box.style.background === 'rgb(244, 67, 54)') {
                box.querySelector('p').textContent = 'Too early! Wait for GREEN!';
                waiting = false;
                setTimeout(startRound, 1000);
                return;
            }

            if (startTime > 0) {
                const reaction = Date.now() - startTime;
                totalTime += reaction;
                attempts++;

                document.getElementById('reaction-attempts').textContent = attempts;
                document.getElementById('reaction-avg').textContent = Math.round(totalTime / attempts);

                box.querySelector('p').textContent = `${reaction}ms! Click to continue...`;
                box.style.background = '#2196F3';
                startTime = 0;
                waiting = false;

                setTimeout(startRound, 1500);
            }
        });

        setTimeout(startRound, 1000);
    }

    // Word Scramble Game
    initWordScramble(container) {
        const words = ['EXPLORE', 'TREASURE', 'ADVENTURE', 'JOURNEY', 'DISCOVER', 'QUEST', 'MYSTERY', 'CHALLENGE'];
        let score = 0;
        let round = 0;
        let currentWord = '';

        const scramble = (word) => {
            return word.split('').sort(() => Math.random() - 0.5).join('');
        };

        const nextRound = () => {
            if (round >= 5) {
                this.endGame(score);
                return;
            }

            currentWord = words[Math.floor(Math.random() * words.length)];
            let scrambled = scramble(currentWord);
            while (scrambled === currentWord) {
                scrambled = scramble(currentWord);
            }

            document.getElementById('scrambled-word').textContent = scrambled;
            document.getElementById('word-input').value = '';
            document.getElementById('word-input').focus();
        };

        container.innerHTML = `
            <div class="word-display" id="scrambled-word">Loading...</div>
            <input type="text" id="word-input" class="word-input" placeholder="Unscramble the word">
            <button id="word-submit" class="submit-btn">Submit</button>
            <div class="game-stats">
                <span>Score: <span id="word-score">0</span></span>
                <span>Round: <span id="word-round">1</span>/5</span>
            </div>
        `;

        const checkAnswer = () => {
            const answer = document.getElementById('word-input').value.toUpperCase();
            if (answer === currentWord) {
                score += 20;
                document.getElementById('word-score').textContent = score;
            }
            round++;
            document.getElementById('word-round').textContent = round + 1;
            nextRound();
        };

        document.getElementById('word-submit').addEventListener('click', checkAnswer);
        document.getElementById('word-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkAnswer();
        });

        nextRound();
    }

    // Whack-a-Mole Game
    initWhackAMole(container) {
        let score = 0;
        let timeLeft = 30;
        let gameActive = true;

        container.innerHTML = `
            <div class="mole-grid">
                ${Array(9).fill(0).map((_, i) => `
                    <div class="mole-hole" data-index="${i}">
                        <div class="mole">💎</div>
                    </div>
                `).join('')}
            </div>
            <div class="game-stats">
                <span>Score: <span id="mole-score">0</span></span>
                <span>Time: <span id="mole-time">30</span>s</span>
            </div>
        `;

        const holes = container.querySelectorAll('.mole-hole');

        holes.forEach(hole => {
            hole.addEventListener('click', () => {
                if (hole.classList.contains('active')) {
                    score += 10;
                    document.getElementById('mole-score').textContent = score;
                    hole.classList.remove('active');
                }
            });
        });

        const popMole = () => {
            if (!gameActive) return;

            holes.forEach(h => h.classList.remove('active'));
            const randomHole = holes[Math.floor(Math.random() * holes.length)];
            randomHole.classList.add('active');

            setTimeout(() => {
                randomHole.classList.remove('active');
            }, 800);
        };

        const moleInterval = setInterval(popMole, 1000);

        const timer = setInterval(() => {
            timeLeft--;
            document.getElementById('mole-time').textContent = timeLeft;
            if (timeLeft <= 0) {
                gameActive = false;
                clearInterval(timer);
                clearInterval(moleInterval);
                this.endGame(score);
            }
        }, 1000);

        this.gameCleanup = () => {
            gameActive = false;
            clearInterval(timer);
            clearInterval(moleInterval);
        };
    }

    // Snake Game
    initSnake(container) {
        const gridSize = 15;
        let snake = [{ x: 7, y: 7 }];
        let food = { x: 5, y: 5 };
        let direction = { x: 1, y: 0 };
        let score = 0;
        let gameActive = true;

        container.innerHTML = `
            <canvas id="snake-canvas" width="300" height="300"></canvas>
            <div class="game-stats">
                <span>Score: <span id="snake-score">0</span></span>
            </div>
            <p class="controls-hint">Use Arrow Keys or WASD</p>
        `;

        const canvas = document.getElementById('snake-canvas');
        const ctx = canvas.getContext('2d');
        const cellSize = canvas.width / gridSize;

        const draw = () => {
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw food
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(
                food.x * cellSize + cellSize/2,
                food.y * cellSize + cellSize/2,
                cellSize/2 - 2, 0, Math.PI * 2
            );
            ctx.fill();

            // Draw snake
            snake.forEach((segment, i) => {
                ctx.fillStyle = i === 0 ? '#4CAF50' : '#81C784';
                ctx.fillRect(
                    segment.x * cellSize + 1,
                    segment.y * cellSize + 1,
                    cellSize - 2,
                    cellSize - 2
                );
            });
        };

        const moveSnake = () => {
            if (!gameActive) return;

            const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

            // Wall collision
            if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
                gameActive = false;
                this.endGame(score);
                return;
            }

            // Self collision
            if (snake.some(s => s.x === head.x && s.y === head.y)) {
                gameActive = false;
                this.endGame(score);
                return;
            }

            snake.unshift(head);

            // Check food
            if (head.x === food.x && head.y === food.y) {
                score += 10;
                document.getElementById('snake-score').textContent = score;
                food = {
                    x: Math.floor(Math.random() * gridSize),
                    y: Math.floor(Math.random() * gridSize)
                };
            } else {
                snake.pop();
            }

            draw();
        };

        const handleKey = (e) => {
            const key = e.key.toLowerCase();
            if ((key === 'arrowup' || key === 'w') && direction.y !== 1) {
                direction = { x: 0, y: -1 };
            } else if ((key === 'arrowdown' || key === 's') && direction.y !== -1) {
                direction = { x: 0, y: 1 };
            } else if ((key === 'arrowleft' || key === 'a') && direction.x !== 1) {
                direction = { x: -1, y: 0 };
            } else if ((key === 'arrowright' || key === 'd') && direction.x !== -1) {
                direction = { x: 1, y: 0 };
            }
        };

        document.addEventListener('keydown', handleKey);
        draw();

        const gameLoop = setInterval(moveSnake, 150);

        this.gameCleanup = () => {
            gameActive = false;
            clearInterval(gameLoop);
            document.removeEventListener('keydown', handleKey);
        };
    }

    // Simon Says Game
    initSimonSays(container) {
        const colors = ['red', 'blue', 'green', 'yellow'];
        let sequence = [];
        let playerIndex = 0;
        let score = 0;
        let isPlaying = false;

        container.innerHTML = `
            <div class="simon-grid">
                <div class="simon-btn" data-color="red" style="background: #F44336;"></div>
                <div class="simon-btn" data-color="blue" style="background: #2196F3;"></div>
                <div class="simon-btn" data-color="green" style="background: #4CAF50;"></div>
                <div class="simon-btn" data-color="yellow" style="background: #FFEB3B;"></div>
            </div>
            <div class="game-stats">
                <span>Level: <span id="simon-level">1</span></span>
                <button id="simon-start" class="start-btn">Start</button>
            </div>
        `;

        const buttons = container.querySelectorAll('.simon-btn');

        const flash = async (color) => {
            const btn = container.querySelector(`[data-color="${color}"]`);
            btn.classList.add('flash');
            await new Promise(r => setTimeout(r, 500));
            btn.classList.remove('flash');
            await new Promise(r => setTimeout(r, 200));
        };

        const playSequence = async () => {
            isPlaying = true;
            for (const color of sequence) {
                await flash(color);
            }
            isPlaying = false;
            playerIndex = 0;
        };

        const nextRound = () => {
            sequence.push(colors[Math.floor(Math.random() * colors.length)]);
            document.getElementById('simon-level').textContent = sequence.length;
            playSequence();
        };

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (isPlaying) return;

                const color = btn.dataset.color;
                btn.classList.add('flash');
                setTimeout(() => btn.classList.remove('flash'), 200);

                if (color === sequence[playerIndex]) {
                    playerIndex++;
                    if (playerIndex === sequence.length) {
                        score = sequence.length * 10;
                        setTimeout(nextRound, 1000);
                    }
                } else {
                    this.endGame(score);
                }
            });
        });

        document.getElementById('simon-start').addEventListener('click', () => {
            sequence = [];
            score = 0;
            nextRound();
        });
    }

    endGame(score) {
        if (this.gameCleanup) {
            this.gameCleanup();
            this.gameCleanup = null;
        }

        const game = this.games[this.currentGame];

        // Update high score
        if (!this.highScores[this.currentGame] || score > this.highScores[this.currentGame]) {
            this.highScores[this.currentGame] = score;
            localStorage.setItem('arcadeHighScores', JSON.stringify(this.highScores));
        }

        // Award tickets
        const ticketsEarned = Math.floor((score / 100) * game.ticketReward);
        this.tickets += ticketsEarned;
        localStorage.setItem('arcadeTickets', this.tickets.toString());

        // Show results
        const gameArea = document.getElementById('mini-game-area');
        gameArea.innerHTML = `
            <div class="game-over">
                <h2>Game Over!</h2>
                <div class="final-score">${score} points</div>
                <div class="tickets-earned">🎟️ +${ticketsEarned} tickets</div>
                ${score === this.highScores[this.currentGame] ? '<div class="new-record">🏆 NEW HIGH SCORE!</div>' : ''}
                <button class="play-again-btn" onclick="window.miniGamesArcade.startGame('${this.currentGame}')">Play Again</button>
                <button class="exit-btn" onclick="window.miniGamesArcade.exitGame()">Exit</button>
            </div>
        `;

        document.getElementById('ticket-count').textContent = this.tickets;
        this.game.showNotification(`🎟️ Earned ${ticketsEarned} tickets!`, 'success');
    }

    exitGame() {
        if (this.gameCleanup) {
            this.gameCleanup();
            this.gameCleanup = null;
        }

        document.getElementById('mini-game-container').classList.add('hidden');
        this.currentGame = null;
        this.showPanel();
        this.renderHighScores();
    }

    redeemPrize(prizeId) {
        const prize = this.prizes[prizeId];
        if (!prize) return;

        if (this.tickets < prize.cost) {
            this.game.showNotification('Not enough tickets!', 'warning');
            return;
        }

        this.tickets -= prize.cost;
        localStorage.setItem('arcadeTickets', this.tickets.toString());
        document.getElementById('ticket-count').textContent = this.tickets;

        // Give reward
        switch (prize.reward.type) {
            case 'stars':
                this.game.addStars(prize.reward.amount);
                break;
            case 'gems':
                this.game.addGems(prize.reward.amount);
                break;
            case 'xp':
                this.game.addXP(prize.reward.amount);
                break;
            case 'fuel':
                if (this.game.vehicleSystem) {
                    this.game.vehicleSystem.refuel(prize.reward.amount);
                }
                break;
            case 'mystery':
                this.openMysteryBox();
                break;
        }

        this.game.showNotification(`${prize.icon} Redeemed ${prize.name}!`, 'success');
        this.renderPrizesList();
    }

    openMysteryBox() {
        const rewards = [
            { type: 'stars', amount: 200, icon: '⭐' },
            { type: 'gems', amount: 25, icon: '💎' },
            { type: 'xp', amount: 1000, icon: '📈' },
            { type: 'tickets', amount: 50, icon: '🎟️' }
        ];

        const reward = rewards[Math.floor(Math.random() * rewards.length)];

        switch (reward.type) {
            case 'stars':
                this.game.addStars(reward.amount);
                break;
            case 'gems':
                this.game.addGems(reward.amount);
                break;
            case 'xp':
                this.game.addXP(reward.amount);
                break;
            case 'tickets':
                this.tickets += reward.amount;
                localStorage.setItem('arcadeTickets', this.tickets.toString());
                break;
        }

        this.game.showNotification(`📦 Mystery Box: ${reward.icon} +${reward.amount}!`, 'legendary');
    }
}

// Global reference
window.miniGamesArcade = null;
