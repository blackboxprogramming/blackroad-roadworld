// Screenshot Capture for RoadWorld
// Captures and exports the current map view

export class ScreenshotCapture {
    constructor(mapManager) {
        this.mapManager = mapManager;
        this.isCapturing = false;
    }

    async capture(options = {}) {
        if (this.isCapturing) return null;
        this.isCapturing = true;

        const {
            includeUI = false,
            format = 'png',
            quality = 0.95,
            watermark = true
        } = options;

        try {
            // Get the map canvas
            const mapCanvas = this.mapManager.map.getCanvas();

            // Create a new canvas for the screenshot
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (includeUI) {
                // Capture entire viewport including UI
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;

                // Use html2canvas if available, otherwise just the map
                ctx.drawImage(mapCanvas, 0, 0, canvas.width, canvas.height);
            } else {
                // Just the map
                canvas.width = mapCanvas.width;
                canvas.height = mapCanvas.height;
                ctx.drawImage(mapCanvas, 0, 0);
            }

            // Add watermark
            if (watermark) {
                this.addWatermark(ctx, canvas);
            }

            // Add location info
            this.addLocationInfo(ctx, canvas);

            // Convert to blob
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, `image/${format}`, quality);
            });

            this.isCapturing = false;

            return {
                blob,
                canvas,
                dataUrl: canvas.toDataURL(`image/${format}`, quality)
            };
        } catch (error) {
            console.error('Screenshot capture failed:', error);
            this.isCapturing = false;
            return null;
        }
    }

    addWatermark(ctx, canvas) {
        const padding = 20;

        // Gradient background for watermark
        const gradient = ctx.createLinearGradient(padding, canvas.height - 60, padding + 200, canvas.height - 60);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, canvas.height - 60, 300, 60);

        // Logo text
        ctx.font = 'bold 16px Orbitron, sans-serif';
        ctx.fillStyle = '#00d4ff';
        ctx.fillText('BLACKROAD EARTH', padding, canvas.height - 35);

        ctx.font = '10px Orbitron, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText('ROADWORLD', padding, canvas.height - 20);
    }

    addLocationInfo(ctx, canvas) {
        const center = this.mapManager.getCenter();
        const zoom = this.mapManager.getZoom();
        const padding = 20;

        // Right side info
        const infoX = canvas.width - padding;
        const infoY = canvas.height - 20;

        ctx.font = '12px monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.textAlign = 'right';

        const coords = `${center.lat.toFixed(6)}°, ${center.lng.toFixed(6)}°`;
        const zoomText = `Zoom: ${zoom.toFixed(1)}`;
        const timestamp = new Date().toLocaleString();

        ctx.fillText(coords, infoX, infoY);
        ctx.fillText(zoomText, infoX, infoY - 15);

        ctx.font = '10px monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText(timestamp, infoX, infoY - 30);

        ctx.textAlign = 'left';
    }

    async download(filename = null) {
        const result = await this.capture();
        if (!result) return false;

        // Generate filename
        const center = this.mapManager.getCenter();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const defaultName = `roadworld_${center.lat.toFixed(4)}_${center.lng.toFixed(4)}_${timestamp}.png`;

        // Create download link
        const link = document.createElement('a');
        link.href = result.dataUrl;
        link.download = filename || defaultName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return true;
    }

    async copyToClipboard() {
        const result = await this.capture();
        if (!result) return false;

        try {
            await navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': result.blob
                })
            ]);
            return true;
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    }

    async share() {
        const result = await this.capture();
        if (!result) return false;

        // Check if Web Share API is available
        if (!navigator.share) {
            // Fallback to download
            return this.download();
        }

        const center = this.mapManager.getCenter();
        const file = new File([result.blob], 'roadworld_screenshot.png', { type: 'image/png' });

        try {
            await navigator.share({
                title: 'RoadWorld Screenshot',
                text: `Check out this location! ${center.lat.toFixed(4)}°, ${center.lng.toFixed(4)}°`,
                files: [file]
            });
            return true;
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Share failed:', error);
            }
            return false;
        }
    }

    // Create a preview of the screenshot
    async preview() {
        const result = await this.capture();
        if (!result) return;

        // Create preview overlay
        const overlay = document.createElement('div');
        overlay.className = 'screenshot-preview-overlay';
        overlay.innerHTML = `
            <div class="screenshot-preview-container">
                <div class="screenshot-preview-header">
                    <span>Screenshot Preview</span>
                    <button class="screenshot-close">✕</button>
                </div>
                <div class="screenshot-preview-image">
                    <img src="${result.dataUrl}" alt="Screenshot" />
                </div>
                <div class="screenshot-preview-actions">
                    <button class="screenshot-action" data-action="download">
                        <span>💾</span> Download
                    </button>
                    <button class="screenshot-action" data-action="copy">
                        <span>📋</span> Copy
                    </button>
                    <button class="screenshot-action" data-action="share">
                        <span>🔗</span> Share
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Event handlers
        overlay.querySelector('.screenshot-close').onclick = () => overlay.remove();
        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.remove();
        };

        overlay.querySelectorAll('.screenshot-action').forEach(btn => {
            btn.onclick = async () => {
                const action = btn.dataset.action;
                let success = false;

                switch (action) {
                    case 'download':
                        success = await this.download();
                        break;
                    case 'copy':
                        success = await this.copyToClipboard();
                        break;
                    case 'share':
                        success = await this.share();
                        break;
                }

                if (success) {
                    overlay.remove();
                }
            };
        });
    }
}
