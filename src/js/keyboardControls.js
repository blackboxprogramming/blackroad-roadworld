// Keyboard Controls for RoadWorld
// WASD movement with smooth camera following

export class KeyboardControls {
    constructor(mapManager, gameEngine, playerAvatar) {
        this.mapManager = mapManager;
        this.gameEngine = gameEngine;
        this.playerAvatar = playerAvatar;

        this.isEnabled = false;
        this.keys = new Set();
        this.moveSpeed = 0.0005; // Base movement speed
        this.sprintMultiplier = 2.5;
        this.isSprinting = false;

        // Movement state
        this.moveInterval = null;
        this.lastMoveTime = 0;

        // Key bindings
        this.bindings = {
            forward: ['w', 'W', 'ArrowUp'],
            backward: ['s', 'S', 'ArrowDown'],
            left: ['a', 'A', 'ArrowLeft'],
            right: ['d', 'D', 'ArrowRight'],
            sprint: ['Shift'],
            interact: ['e', 'E', ' '],
            rotateLeft: ['q', 'Q'],
            rotateRight: ['r', 'R']
        };
    }

    init() {
        this.setupEventListeners();
        console.log('⌨️ Keyboard Controls initialized');
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        document.addEventListener('blur', () => this.clearKeys());
    }

    onKeyDown(e) {
        if (!this.isEnabled) return;

        // Ignore if typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const key = e.key;

        // Check for sprint
        if (this.bindings.sprint.includes(key)) {
            this.isSprinting = true;
        }

        // Check for movement keys
        if (this.isMovementKey(key)) {
            e.preventDefault();
            this.keys.add(key);
            this.startMovement();
        }

        // Rotation
        if (this.bindings.rotateLeft.includes(key)) {
            e.preventDefault();
            this.rotateBearing(-15);
        }
        if (this.bindings.rotateRight.includes(key)) {
            e.preventDefault();
            this.rotateBearing(15);
        }

        // Interact
        if (this.bindings.interact.includes(key)) {
            e.preventDefault();
            this.interact();
        }
    }

    onKeyUp(e) {
        const key = e.key;

        if (this.bindings.sprint.includes(key)) {
            this.isSprinting = false;
        }

        this.keys.delete(key);

        if (this.keys.size === 0) {
            this.stopMovement();
        }
    }

    clearKeys() {
        this.keys.clear();
        this.isSprinting = false;
        this.stopMovement();
    }

    isMovementKey(key) {
        return [...this.bindings.forward, ...this.bindings.backward,
                ...this.bindings.left, ...this.bindings.right].includes(key);
    }

    startMovement() {
        if (this.moveInterval) return;

        this.moveInterval = setInterval(() => {
            this.processMovement();
        }, 16); // ~60fps
    }

    stopMovement() {
        if (this.moveInterval) {
            clearInterval(this.moveInterval);
            this.moveInterval = null;
        }
    }

    processMovement() {
        if (!this.gameEngine.player) return;

        const bearing = this.mapManager.getBearing() * Math.PI / 180;
        let dx = 0;
        let dy = 0;

        // Calculate movement direction
        for (const key of this.keys) {
            if (this.bindings.forward.includes(key)) {
                dx += Math.sin(bearing);
                dy += Math.cos(bearing);
            }
            if (this.bindings.backward.includes(key)) {
                dx -= Math.sin(bearing);
                dy -= Math.cos(bearing);
            }
            if (this.bindings.left.includes(key)) {
                dx -= Math.cos(bearing);
                dy += Math.sin(bearing);
            }
            if (this.bindings.right.includes(key)) {
                dx += Math.cos(bearing);
                dy -= Math.sin(bearing);
            }
        }

        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
        }

        if (dx === 0 && dy === 0) return;

        // Apply speed and sprint
        const speed = this.moveSpeed * (this.isSprinting ? this.sprintMultiplier : 1);
        const zoom = this.mapManager.getZoom();
        const zoomFactor = Math.pow(2, 20 - zoom) / 1000; // Adjust speed based on zoom

        const currentPos = this.gameEngine.player.position;
        const newPos = [
            currentPos[0] + dx * speed * zoomFactor,
            currentPos[1] + dy * speed * zoomFactor
        ];

        // Move player
        const distance = this.gameEngine.movePlayer(newPos);

        // Update avatar
        if (this.playerAvatar) {
            this.playerAvatar.updatePosition(newPos);
        }

        // Pan map to follow player
        this.mapManager.map.panTo(newPos, { duration: 50 });

        // Award XP for movement
        const now = Date.now();
        if (now - this.lastMoveTime > 1000 && distance > 5) {
            const xp = Math.floor(distance / 10);
            if (xp > 0) {
                this.gameEngine.addXP(xp, 'keyboard movement');
            }
            this.lastMoveTime = now;
        }
    }

    rotateBearing(degrees) {
        const currentBearing = this.mapManager.getBearing();
        this.mapManager.easeTo({
            bearing: currentBearing + degrees,
            duration: 200
        });
    }

    interact() {
        // Trigger collection check or interaction
        if (this.gameEngine) {
            this.gameEngine.checkCollectibles();
        }
    }

    enable() {
        this.isEnabled = true;
        console.log('⌨️ Keyboard controls enabled (WASD + Shift to sprint)');
    }

    disable() {
        this.isEnabled = false;
        this.clearKeys();
    }

    toggle() {
        if (this.isEnabled) {
            this.disable();
        } else {
            this.enable();
        }
        return this.isEnabled;
    }

    setSpeed(speed) {
        this.moveSpeed = speed;
    }
}
