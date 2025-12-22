# RoadWorld Module

BlackRoad Earth street-level exploration module built with MapLibre GL.

## Features

- **Globe View**: Start from space and zoom down to street level
- **Multiple Map Styles**: Satellite, Streets, Dark, Terrain, Hybrid
- **Location Search**: Search any location worldwide using Nominatim
- **Quick Locations**: Pre-configured famous landmarks
- **3D Controls**: Tilt, rotate, and pitch the map
- **User Location**: Find and navigate to your current location
- **Save Locations**: Save favorite places to local storage
- **History Tracking**: Track search and navigation history
- **Responsive UI**: Works on desktop and mobile

## Technology Stack

- **MapLibre GL**: Open-source mapping library
- **Vanilla JavaScript**: Modular ES6+ architecture
- **LocalStorage**: Client-side data persistence
- **Nominatim**: OpenStreetMap geocoding service

## Project Structure

```
roadworld/
├── public/
│   └── index.html          # Main HTML file
├── src/
│   ├── css/
│   │   └── main.css        # Styles
│   └── js/
│       ├── main.js         # Application entry point
│       ├── config.js       # Configuration and constants
│       ├── mapManager.js   # Map initialization and control
│       ├── uiController.js # UI updates and interactions
│       ├── searchService.js # Location search
│       └── storageManager.js # Local storage management
├── package.json
├── wrangler.toml
└── README.md
```

## Development

Run locally:

```bash
cd ~/roadworld
npm run dev
```

Open http://localhost:8000/public in your browser.

## Deployment

Deploy to Cloudflare Pages:

```bash
npm run deploy
```

Or deploy via Git:

```bash
git init
git add .
git commit -m "Initial RoadWorld module"
gh repo create blackroad-roadworld --public --source=. --remote=origin
git push -u origin main

# Then connect to Cloudflare Pages dashboard
```

## Configuration

### Map Styles

Edit `src/js/config.js` to add or modify map tile sources:

```javascript
export const STYLES = {
  // Add your custom style here
}
```

### Default Settings

Modify `MAP_CONFIG` in `src/js/config.js`:

```javascript
export const MAP_CONFIG = {
  center: [0, 20],
  zoom: 1.5,
  minZoom: 0,
  maxZoom: 22,
  projection: 'globe',
  antialias: true
};
```

## Usage

### Search Locations

Type any location name, address, or coordinates in the search bar and click "FLY TO".

### Quick Navigation

Click any of the quick location buttons on the right side for instant travel to famous landmarks.

### 3D View

Click the 🏢 button to toggle 3D building mode and tilt the map.

### Save Locations

Click the 💾 button to save the current view to your favorites.

### Keyboard Shortcuts

- **Drag**: Pan and rotate
- **Scroll**: Zoom in/out
- **Ctrl+Drag**: Tilt the map
- **Right-click drag**: Rotate the view

## API Usage

The application uses free tile providers and the Nominatim geocoding service. No API keys required.

## BlackRoad Integration

Part of the BlackRoad Earth infrastructure. Integrates with:

- BlackRoad OS Operator
- Cloudflare Pages deployment
- GitHub repository system

## License

MIT License - BlackRoad Systems
