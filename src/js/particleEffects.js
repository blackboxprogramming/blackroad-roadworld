// Particle Effects System for RoadWorld
// Creates visual effects for collections, level ups, etc.

export class ParticleEffects {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.isRunning = false;
    }

    init() {
        this.createCanvas();
        this.startLoop();
        console.log('✨ Particle Effects initialized');
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'particle-canvas';
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    startLoop() {
        this.isRunning = true;
        this.animate();
    }

    animate() {
        if (!this.isRunning) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];

            // Update
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += particle.gravity || 0;
            particle.life -= particle.decay;
            particle.rotation += particle.rotationSpeed || 0;

            if (particle.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            // Draw
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation);

            if (particle.type === 'sparkle') {
                this.drawSparkle(particle);
            } else if (particle.type === 'star') {
                this.drawStar(particle);
            } else if (particle.type === 'confetti') {
                this.drawConfetti(particle);
            } else if (particle.type === 'ring') {
                this.drawRing(particle);
            } else if (particle.type === 'text') {
                this.drawText(particle);
            } else {
                this.drawCircle(particle);
            }

            this.ctx.restore();
        }

        requestAnimationFrame(() => this.animate());
    }

    drawSparkle(p) {
        const size = p.size * p.life;
        this.ctx.fillStyle = p.color;

        // 4-pointed star shape
        this.ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            const innerSize = size * 0.3;
            this.ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
            this.ctx.lineTo(Math.cos(angle + Math.PI/4) * innerSize, Math.sin(angle + Math.PI/4) * innerSize);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawStar(p) {
        const size = p.size * p.life;
        this.ctx.font = `${size}px sans-serif`;
        this.ctx.fillText('⭐', -size/2, size/2);
    }

    drawConfetti(p) {
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2);
    }

    drawRing(p) {
        const size = p.size * (2 - p.life);
        this.ctx.strokeStyle = p.color;
        this.ctx.lineWidth = 3 * p.life;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawCircle(p) {
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size * p.life, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawText(p) {
        this.ctx.font = `bold ${p.size}px Orbitron, sans-serif`;
        this.ctx.fillStyle = p.color;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(p.text, 0, 0);
    }

    // Effect: Collection burst
    collectionBurst(x, y, rarity = 'common') {
        const colors = {
            common: ['#fff', '#ddd', '#aaa'],
            rare: ['#00d4ff', '#66e0ff', '#99ebff'],
            epic: ['#7b2ff7', '#9955ff', '#bb88ff'],
            legendary: ['#FFD700', '#FFA500', '#FFFF00']
        };

        const particleColors = colors[rarity] || colors.common;
        const count = rarity === 'legendary' ? 30 : rarity === 'epic' ? 20 : 15;

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const speed = 3 + Math.random() * 4;

            this.particles.push({
                type: 'sparkle',
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 8 + Math.random() * 6,
                color: particleColors[Math.floor(Math.random() * particleColors.length)],
                life: 1,
                decay: 0.02 + Math.random() * 0.01,
                gravity: 0.05,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            });
        }

        // Add ring effect for rare+
        if (rarity !== 'common') {
            this.particles.push({
                type: 'ring',
                x, y,
                vx: 0, vy: 0,
                size: 20,
                color: particleColors[0],
                life: 1,
                decay: 0.03
            });
        }
    }

    // Effect: Level up celebration
    levelUpBurst(x, y) {
        // Confetti explosion
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 5 + Math.random() * 8;

            this.particles.push({
                type: 'confetti',
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 5,
                size: 8 + Math.random() * 4,
                color: ['#FFD700', '#FF6B00', '#00d4ff', '#7b2ff7', '#FF0066'][Math.floor(Math.random() * 5)],
                life: 1,
                decay: 0.01,
                gravity: 0.15,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3
            });
        }

        // Rising text
        this.particles.push({
            type: 'text',
            text: 'LEVEL UP!',
            x, y,
            vx: 0,
            vy: -2,
            size: 32,
            color: '#FFD700',
            life: 1,
            decay: 0.01,
            rotation: 0
        });

        // Multiple rings
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.particles.push({
                    type: 'ring',
                    x, y,
                    vx: 0, vy: 0,
                    size: 30,
                    color: '#FFD700',
                    life: 1,
                    decay: 0.025
                });
            }, i * 100);
        }
    }

    // Effect: Combo milestone
    comboBurst(x, y, comboCount) {
        const colors = comboCount >= 20 ? ['#FFD700', '#FFA500'] :
                       comboCount >= 10 ? ['#FF6B00', '#FF9900'] :
                       comboCount >= 5 ? ['#7b2ff7', '#9955ff'] :
                       ['#00d4ff', '#66e0ff'];

        for (let i = 0; i < comboCount; i++) {
            setTimeout(() => {
                const angle = Math.random() * Math.PI * 2;
                this.particles.push({
                    type: 'sparkle',
                    x: x + (Math.random() - 0.5) * 50,
                    y: y + (Math.random() - 0.5) * 50,
                    vx: Math.cos(angle) * 2,
                    vy: Math.sin(angle) * 2 - 1,
                    size: 10,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    life: 1,
                    decay: 0.03,
                    rotation: 0,
                    rotationSpeed: 0.1
                });
            }, i * 20);
        }

        // Combo text
        this.particles.push({
            type: 'text',
            text: `${comboCount}x`,
            x, y: y - 30,
            vx: 0,
            vy: -1.5,
            size: 24 + Math.min(comboCount, 20),
            color: colors[0],
            life: 1,
            decay: 0.015,
            rotation: 0
        });
    }

    // Effect: Achievement unlock
    achievementBurst(x, y) {
        // Golden particles
        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 4 + Math.random() * 6;

            this.particles.push({
                type: 'sparkle',
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 10 + Math.random() * 8,
                color: ['#FFD700', '#FFA500', '#FFFF00'][Math.floor(Math.random() * 3)],
                life: 1,
                decay: 0.015,
                gravity: 0.02,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.15
            });
        }

        // Trophy icon rising
        this.particles.push({
            type: 'text',
            text: '🏆',
            x, y,
            vx: 0,
            vy: -2,
            size: 48,
            color: '#FFD700',
            life: 1,
            decay: 0.008,
            rotation: 0
        });
    }

    // Effect: XP gain popup
    xpPopup(x, y, amount) {
        this.particles.push({
            type: 'text',
            text: `+${amount} XP`,
            x: x + (Math.random() - 0.5) * 30,
            y,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -2,
            size: 16,
            color: '#00d4ff',
            life: 1,
            decay: 0.02,
            rotation: 0
        });
    }

    // Screen position from map coordinates
    getScreenPosition(map, lngLat) {
        const point = map.project(lngLat);
        return { x: point.x, y: point.y };
    }

    destroy() {
        this.isRunning = false;
        if (this.canvas) {
            this.canvas.remove();
        }
    }
}
