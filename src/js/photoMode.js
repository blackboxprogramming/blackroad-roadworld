// Photo Mode for RoadWorld
// Advanced screenshot system with filters and frames

export class PhotoMode {
    constructor(mapManager, storageManager) {
        this.mapManager = mapManager;
        this.storageManager = storageManager;

        this.isActive = false;
        this.panelElement = null;
        this.previewElement = null;
        this.currentPhoto = null;

        // Filter presets
        this.filters = {
            none: {
                name: 'Original',
                icon: '📷',
                css: 'none'
            },
            vintage: {
                name: 'Vintage',
                icon: '📜',
                css: 'sepia(0.4) contrast(1.1) brightness(0.95)'
            },
            noir: {
                name: 'Noir',
                icon: '🖤',
                css: 'grayscale(1) contrast(1.2)'
            },
            cyberpunk: {
                name: 'Cyberpunk',
                icon: '💜',
                css: 'saturate(1.5) hue-rotate(30deg) contrast(1.1)'
            },
            sunset: {
                name: 'Sunset',
                icon: '🌅',
                css: 'saturate(1.3) sepia(0.2) brightness(1.05) contrast(1.1)'
            },
            arctic: {
                name: 'Arctic',
                icon: '❄️',
                css: 'saturate(0.8) brightness(1.1) hue-rotate(-10deg)'
            },
            dream: {
                name: 'Dream',
                icon: '💭',
                css: 'saturate(1.2) blur(0.5px) brightness(1.1)'
            },
            neon: {
                name: 'Neon',
                icon: '🌈',
                css: 'saturate(2) contrast(1.3)'
            }
        };

        // Frame presets
        this.frames = {
            none: {
                name: 'None',
                icon: '⬜',
                template: null
            },
            polaroid: {
                name: 'Polaroid',
                icon: '🖼️',
                padding: { top: 20, bottom: 60, left: 20, right: 20 },
                background: '#fff',
                shadow: true
            },
            filmStrip: {
                name: 'Film Strip',
                icon: '🎬',
                padding: { top: 30, bottom: 30, left: 40, right: 40 },
                background: '#111',
                perforations: true
            },
            vintage: {
                name: 'Vintage',
                icon: '🏛️',
                padding: { top: 30, bottom: 30, left: 30, right: 30 },
                background: '#e8dcc8',
                border: true
            },
            modern: {
                name: 'Modern',
                icon: '✨',
                padding: { top: 15, bottom: 40, left: 15, right: 15 },
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                rounded: true
            },
            roadworld: {
                name: 'RoadWorld',
                icon: '🌍',
                padding: { top: 50, bottom: 60, left: 20, right: 20 },
                background: 'linear-gradient(180deg, #0a0f1e 0%, #1a1f3e 100%)',
                branded: true
            }
        };

        this.selectedFilter = 'none';
        this.selectedFrame = 'none';
        this.photoGallery = [];
    }

    init() {
        this.createPanel();
        this.loadGallery();

        console.log('📸 Photo Mode initialized');
    }

    createPanel() {
        this.panelElement = document.createElement('div');
        this.panelElement.className = 'photo-mode-panel';
        this.panelElement.id = 'photo-mode-panel';
        this.panelElement.style.display = 'none';

        this.panelElement.innerHTML = `
            <div class="photo-mode-header">
                <span>📸 Photo Mode</span>
                <button class="photo-mode-exit" id="photo-exit">Exit</button>
            </div>
            <div class="photo-mode-content">
                <div class="photo-controls">
                    <div class="photo-section">
                        <h4>🎨 Filters</h4>
                        <div class="filter-grid" id="filter-grid"></div>
                    </div>
                    <div class="photo-section">
                        <h4>🖼️ Frames</h4>
                        <div class="frame-grid" id="frame-grid"></div>
                    </div>
                    <div class="photo-section">
                        <h4>📍 Info Overlay</h4>
                        <div class="overlay-options">
                            <label><input type="checkbox" id="show-location" checked> Location</label>
                            <label><input type="checkbox" id="show-coords" checked> Coordinates</label>
                            <label><input type="checkbox" id="show-date" checked> Date</label>
                            <label><input type="checkbox" id="show-watermark" checked> Watermark</label>
                        </div>
                    </div>
                </div>
                <div class="photo-preview-area">
                    <div class="photo-preview" id="photo-preview"></div>
                    <div class="photo-actions">
                        <button class="photo-btn capture" id="photo-capture">📷 Capture</button>
                        <button class="photo-btn download" id="photo-download" disabled>💾 Save</button>
                        <button class="photo-btn share" id="photo-share" disabled>📤 Share</button>
                    </div>
                </div>
            </div>
            <div class="photo-gallery-section">
                <h4>📚 Gallery (${this.photoGallery.length})</h4>
                <div class="photo-gallery" id="photo-gallery"></div>
            </div>
        `;

        document.body.appendChild(this.panelElement);
        this.setupEventListeners();
        this.renderFilters();
        this.renderFrames();
    }

    setupEventListeners() {
        document.getElementById('photo-exit').addEventListener('click', () => {
            this.deactivate();
        });

        document.getElementById('photo-capture').addEventListener('click', () => {
            this.capturePhoto();
        });

        document.getElementById('photo-download').addEventListener('click', () => {
            this.downloadPhoto();
        });

        document.getElementById('photo-share').addEventListener('click', () => {
            this.sharePhoto();
        });
    }

    renderFilters() {
        const grid = document.getElementById('filter-grid');
        if (!grid) return;

        grid.innerHTML = Object.entries(this.filters).map(([id, filter]) => `
            <button class="filter-btn ${this.selectedFilter === id ? 'selected' : ''}"
                    data-filter="${id}">
                <span class="filter-icon">${filter.icon}</span>
                <span class="filter-name">${filter.name}</span>
            </button>
        `).join('');

        grid.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectedFilter = btn.dataset.filter;
                this.renderFilters();
                this.updatePreview();
            });
        });
    }

    renderFrames() {
        const grid = document.getElementById('frame-grid');
        if (!grid) return;

        grid.innerHTML = Object.entries(this.frames).map(([id, frame]) => `
            <button class="frame-btn ${this.selectedFrame === id ? 'selected' : ''}"
                    data-frame="${id}">
                <span class="frame-icon">${frame.icon}</span>
                <span class="frame-name">${frame.name}</span>
            </button>
        `).join('');

        grid.querySelectorAll('.frame-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectedFrame = btn.dataset.frame;
                this.renderFrames();
                this.updatePreview();
            });
        });
    }

    activate() {
        this.isActive = true;
        this.panelElement.style.display = 'block';

        // Hide other UI elements
        document.querySelectorAll('.ui-overlay:not(.photo-mode-panel)').forEach(el => {
            el.style.opacity = '0.3';
            el.style.pointerEvents = 'none';
        });

        // Initial capture for preview
        this.updatePreview();
    }

    deactivate() {
        this.isActive = false;
        this.panelElement.style.display = 'none';

        // Restore UI elements
        document.querySelectorAll('.ui-overlay').forEach(el => {
            el.style.opacity = '';
            el.style.pointerEvents = '';
        });
    }

    toggle() {
        if (this.isActive) {
            this.deactivate();
        } else {
            this.activate();
        }
    }

    async updatePreview() {
        const preview = document.getElementById('photo-preview');
        if (!preview) return;

        preview.innerHTML = '<div class="loading-preview">Generating preview...</div>';

        try {
            const canvas = await this.captureMap();
            const processedCanvas = await this.applyEffects(canvas);

            preview.innerHTML = '';
            processedCanvas.style.maxWidth = '100%';
            processedCanvas.style.maxHeight = '300px';
            preview.appendChild(processedCanvas);
        } catch (error) {
            preview.innerHTML = '<div class="preview-error">Preview unavailable</div>';
        }
    }

    async capturePhoto() {
        try {
            const canvas = await this.captureMap();
            this.currentPhoto = await this.applyEffects(canvas);

            // Update preview
            const preview = document.getElementById('photo-preview');
            preview.innerHTML = '';
            this.currentPhoto.style.maxWidth = '100%';
            this.currentPhoto.style.maxHeight = '300px';
            preview.appendChild(this.currentPhoto.cloneNode(true));

            // Enable buttons
            document.getElementById('photo-download').disabled = false;
            document.getElementById('photo-share').disabled = false;

            // Add to gallery
            this.addToGallery();

            this.showNotification('📸 Photo captured!');
        } catch (error) {
            this.showNotification('Failed to capture photo');
            console.error('Photo capture error:', error);
        }
    }

    async captureMap() {
        // Create a canvas from the map
        const mapCanvas = this.mapManager.map.getCanvas();

        const canvas = document.createElement('canvas');
        canvas.width = mapCanvas.width;
        canvas.height = mapCanvas.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(mapCanvas, 0, 0);

        return canvas;
    }

    async applyEffects(sourceCanvas) {
        const filter = this.filters[this.selectedFilter];
        const frame = this.frames[this.selectedFrame];

        // Calculate final dimensions
        const padding = frame.padding || { top: 0, bottom: 0, left: 0, right: 0 };
        const finalWidth = sourceCanvas.width + padding.left + padding.right;
        const finalHeight = sourceCanvas.height + padding.top + padding.bottom;

        const canvas = document.createElement('canvas');
        canvas.width = finalWidth;
        canvas.height = finalHeight;

        const ctx = canvas.getContext('2d');

        // Draw frame background
        if (frame.background) {
            if (frame.background.startsWith('linear-gradient')) {
                const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                gradient.addColorStop(0, '#667eea');
                gradient.addColorStop(1, '#764ba2');
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = frame.background;
            }
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Apply filter to source
        ctx.filter = filter.css || 'none';

        // Draw photo with frame padding
        ctx.drawImage(
            sourceCanvas,
            padding.left,
            padding.top,
            sourceCanvas.width,
            sourceCanvas.height
        );

        ctx.filter = 'none';

        // Add frame decorations
        if (frame.perforations) {
            this.drawFilmPerforations(ctx, canvas.width, canvas.height, padding);
        }

        if (frame.border) {
            ctx.strokeStyle = '#8b7355';
            ctx.lineWidth = 3;
            ctx.strokeRect(
                padding.left - 5,
                padding.top - 5,
                sourceCanvas.width + 10,
                sourceCanvas.height + 10
            );
        }

        if (frame.shadow) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
        }

        // Add branded header for RoadWorld frame
        if (frame.branded) {
            ctx.fillStyle = '#00d4ff';
            ctx.font = 'bold 24px Orbitron, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('ROADWORLD', canvas.width / 2, 35);
        }

        // Add info overlay
        this.addInfoOverlay(ctx, canvas, padding);

        return canvas;
    }

    drawFilmPerforations(ctx, width, height, padding) {
        ctx.fillStyle = '#333';
        const perfSize = 15;
        const perfSpacing = 30;

        // Left perforations
        for (let y = perfSpacing; y < height; y += perfSpacing) {
            ctx.beginPath();
            ctx.roundRect(8, y, perfSize, perfSize, 3);
            ctx.fill();
        }

        // Right perforations
        for (let y = perfSpacing; y < height; y += perfSpacing) {
            ctx.beginPath();
            ctx.roundRect(width - 23, y, perfSize, perfSize, 3);
            ctx.fill();
        }
    }

    addInfoOverlay(ctx, canvas, padding) {
        const showLocation = document.getElementById('show-location')?.checked ?? true;
        const showCoords = document.getElementById('show-coords')?.checked ?? true;
        const showDate = document.getElementById('show-date')?.checked ?? true;
        const showWatermark = document.getElementById('show-watermark')?.checked ?? true;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '14px "Exo 2", sans-serif';
        ctx.textAlign = 'left';

        const bottom = canvas.height - 15;
        let textY = bottom;

        // Location name
        if (showLocation) {
            const locationName = document.getElementById('location-name')?.textContent || 'Unknown Location';
            ctx.fillText(`📍 ${locationName}`, padding.left + 10, textY);
            textY -= 20;
        }

        // Coordinates
        if (showCoords) {
            const center = this.mapManager.getCenter();
            ctx.font = '12px "Exo 2", sans-serif';
            ctx.fillText(`${center.lat.toFixed(4)}°, ${center.lng.toFixed(4)}°`, padding.left + 10, textY);
        }

        // Date
        if (showDate) {
            ctx.textAlign = 'right';
            ctx.font = '12px "Exo 2", sans-serif';
            const date = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            ctx.fillText(date, canvas.width - padding.right - 10, bottom);
        }

        // Watermark
        if (showWatermark) {
            ctx.textAlign = 'right';
            ctx.fillStyle = 'rgba(0, 212, 255, 0.7)';
            ctx.font = 'bold 12px Orbitron, sans-serif';
            ctx.fillText('ROADWORLD', canvas.width - padding.right - 10, padding.top + 20);
        }
    }

    downloadPhoto() {
        if (!this.currentPhoto) return;

        const link = document.createElement('a');
        link.download = `roadworld_${Date.now()}.png`;
        link.href = this.currentPhoto.toDataURL('image/png');
        link.click();

        this.showNotification('📥 Photo saved!');
    }

    async sharePhoto() {
        if (!this.currentPhoto) return;

        try {
            const blob = await new Promise(resolve => {
                this.currentPhoto.toBlob(resolve, 'image/png');
            });

            if (navigator.share && navigator.canShare({ files: [new File([blob], 'roadworld.png')] })) {
                await navigator.share({
                    files: [new File([blob], 'roadworld.png', { type: 'image/png' })],
                    title: 'RoadWorld Photo',
                    text: 'Check out this view from RoadWorld!'
                });
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                this.showNotification('📋 Copied to clipboard!');
            }
        } catch (error) {
            this.showNotification('Share failed');
            console.error('Share error:', error);
        }
    }

    addToGallery() {
        if (!this.currentPhoto) return;

        const photoData = {
            id: Date.now(),
            dataUrl: this.currentPhoto.toDataURL('image/jpeg', 0.7),
            timestamp: new Date().toISOString(),
            location: document.getElementById('location-name')?.textContent || 'Unknown'
        };

        this.photoGallery.unshift(photoData);

        // Limit gallery size
        if (this.photoGallery.length > 20) {
            this.photoGallery.pop();
        }

        this.saveGallery();
        this.renderGallery();
    }

    loadGallery() {
        const saved = this.storageManager.data.photoGallery || [];
        this.photoGallery = saved;
    }

    saveGallery() {
        this.storageManager.data.photoGallery = this.photoGallery;
        this.storageManager.save();
    }

    renderGallery() {
        const gallery = document.getElementById('photo-gallery');
        if (!gallery) return;

        if (this.photoGallery.length === 0) {
            gallery.innerHTML = '<div class="no-photos">No photos yet. Start capturing!</div>';
            return;
        }

        gallery.innerHTML = this.photoGallery.map(photo => `
            <div class="gallery-item" data-id="${photo.id}">
                <img src="${photo.dataUrl}" alt="${photo.location}">
                <div class="gallery-info">
                    <span>${photo.location}</span>
                </div>
            </div>
        `).join('');

        gallery.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', () => {
                const photo = this.photoGallery.find(p => p.id === parseInt(item.dataset.id));
                if (photo) {
                    this.showFullPhoto(photo);
                }
            });
        });
    }

    showFullPhoto(photo) {
        const overlay = document.createElement('div');
        overlay.className = 'photo-fullscreen';
        overlay.innerHTML = `
            <img src="${photo.dataUrl}" alt="${photo.location}">
            <div class="photo-fullscreen-info">
                <span>${photo.location}</span>
                <span>${new Date(photo.timestamp).toLocaleDateString()}</span>
            </div>
            <button class="photo-fullscreen-close">✕</button>
        `;

        document.body.appendChild(overlay);

        overlay.querySelector('.photo-fullscreen-close').addEventListener('click', () => {
            overlay.remove();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
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
}
