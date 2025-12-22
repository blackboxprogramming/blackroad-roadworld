import { MapManager } from './mapManager.js';
import { UIController } from './uiController.js';
import { SearchService } from './searchService.js';
import { StorageManager } from './storageManager.js';

class RoadWorldApp {
    constructor() {
        this.mapManager = null;
        this.uiController = null;
        this.searchService = null;
        this.storageManager = null;
    }

    async init() {
        // Initialize managers
        this.storageManager = new StorageManager();
        this.mapManager = new MapManager('map');
        await this.mapManager.init();

        this.uiController = new UIController(this.mapManager);
        this.searchService = new SearchService(this.mapManager);

        // Setup event listeners
        this.setupMapEvents();
        this.setupControls();
        this.setupSearch();
        this.setupLayers();
        this.setupQuickLocations();

        // Initial UI update
        this.uiController.updateStats();
        this.updateSavedCount();

        // Load last position if available
        const lastPosition = this.storageManager.getLastPosition();
        if (lastPosition && lastPosition.center) {
            this.mapManager.map.jumpTo(lastPosition);
        }

        console.log('RoadWorld initialized');
    }

    setupMapEvents() {
        this.mapManager.on('move', () => this.uiController.updateStats());
        this.mapManager.on('zoom', () => this.uiController.updateStats());
        this.mapManager.on('moveend', () => {
            this.uiController.updateStats();
            this.saveCurrentPosition();
        });
    }

    setupControls() {
        // Home button
        document.getElementById('btn-home').addEventListener('click', () => {
            this.mapManager.flyTo({
                center: [0, 20],
                zoom: 1.5,
                pitch: 0,
                bearing: 0,
                duration: 2000
            });
        });

        // North button
        document.getElementById('btn-north').addEventListener('click', () => {
            this.mapManager.easeTo({ bearing: 0, pitch: 0, duration: 500 });
        });

        // Zoom buttons
        document.getElementById('btn-zoom-in').addEventListener('click', () => {
            this.mapManager.zoomIn();
        });

        document.getElementById('btn-zoom-out').addEventListener('click', () => {
            this.mapManager.zoomOut();
        });

        // 3D buildings toggle
        document.getElementById('btn-3d').addEventListener('click', (e) => {
            e.target.classList.toggle('active');
            if (e.target.classList.contains('active')) {
                this.mapManager.easeTo({ pitch: 60, duration: 500 });
            } else {
                this.mapManager.easeTo({ pitch: 0, duration: 500 });
            }
        });

        // Globe view
        document.getElementById('btn-globe').addEventListener('click', () => {
            this.mapManager.flyTo({
                center: [0, 20],
                zoom: 1.5,
                pitch: 0,
                bearing: 0,
                duration: 2000
            });
        });

        // Locate user
        document.getElementById('btn-locate').addEventListener('click', () => {
            this.locateUser();
        });

        // Save location
        document.getElementById('btn-save').addEventListener('click', () => {
            this.saveCurrentLocation();
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('search');
        const searchBtn = document.getElementById('search-btn');

        const doSearch = async () => {
            const query = searchInput.value.trim();
            if (!query) return;

            const result = await this.searchService.search(query);

            if (result.success) {
                this.searchService.flyToResult(result);
                this.uiController.updateElement('location-name', result.name);

                // Add to history
                this.storageManager.addToHistory({
                    type: 'search',
                    query: query,
                    result: result.name
                });
            } else {
                this.uiController.updateElement('location-name', 'Not found');
            }
        };

        searchBtn.addEventListener('click', doSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') doSearch();
        });
    }

    setupLayers() {
        document.querySelectorAll('.layer-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const styleName = btn.dataset.style;
                this.mapManager.changeStyle(styleName);

                document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                this.storageManager.updateSettings({ defaultStyle: styleName });
            });
        });
    }

    setupQuickLocations() {
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const lat = parseFloat(btn.dataset.lat);
                const lng = parseFloat(btn.dataset.lng);
                const zoom = parseFloat(btn.dataset.zoom);

                this.mapManager.flyTo({
                    center: [lng, lat],
                    zoom: zoom,
                    pitch: 60,
                    bearing: Math.random() * 60 - 30,
                    duration: 3000
                });

                const locationName = btn.textContent.split(' ')[0] + ' ' +
                    (btn.textContent.split(' ')[1] || '');
                this.uiController.updateElement('location-name', locationName);

                // Add to history
                this.storageManager.addToHistory({
                    type: 'quick_location',
                    name: locationName,
                    lat,
                    lng
                });
            });
        });
    }

    locateUser() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                this.mapManager.flyTo({
                    center: [pos.coords.longitude, pos.coords.latitude],
                    zoom: 17,
                    duration: 2000
                });
                this.uiController.updateElement('location-name', 'Your Location');

                // Add marker
                this.mapManager.addMarker([pos.coords.longitude, pos.coords.latitude], {
                    color: '#FF6B00'
                });
            }, (error) => {
                console.error('Geolocation error:', error);
                alert('Unable to get your location. Please check permissions.');
            });
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    }

    saveCurrentLocation() {
        const center = this.mapManager.getCenter();
        const zoom = this.mapManager.getZoom();
        const locationName = document.getElementById('location-name').textContent;

        const saved = this.storageManager.saveLocation({
            name: locationName,
            lat: center.lat,
            lng: center.lng,
            zoom: zoom
        });

        this.updateSavedCount();

        // Visual feedback
        const btn = document.getElementById('btn-save');
        btn.style.background = 'rgba(0, 212, 255, 0.5)';
        setTimeout(() => {
            btn.style.background = '';
        }, 500);

        console.log('Location saved:', saved);
    }

    saveCurrentPosition() {
        const center = this.mapManager.getCenter();
        const zoom = this.mapManager.getZoom();
        const pitch = this.mapManager.getPitch();
        const bearing = this.mapManager.getBearing();

        this.storageManager.savePosition({
            center: [center.lng, center.lat],
            zoom,
            pitch,
            bearing
        });
    }

    updateSavedCount() {
        const count = this.storageManager.getSavedLocations().length;
        this.uiController.updateElement('saved-count', count.toString());
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const app = new RoadWorldApp();
        app.init();
    });
} else {
    const app = new RoadWorldApp();
    app.init();
}
