# geo-draw

A tiny drawing utility for MapLibre GL JS.

## PointDrawTool

`PointDrawTool` lets users click the map to place point features.

### Install

Copy `src/point-draw-tool.js` into your project, or import from this repo.

### Usage

```js
import maplibregl from 'maplibre-gl';
import { PointDrawTool } from './src/index.js';

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://demotiles.maplibre.org/style.json',
  center: [0, 0],
  zoom: 2
});

const drawTool = new PointDrawTool(map, {
  circleColor: '#2563eb',
  onPointCreated: (pointFeature) => {
    console.log('Point created:', pointFeature);
  }
});

drawTool.enable();

// later
// drawTool.disable();
// drawTool.clear();
// drawTool.destroy();
```

### API

- `enable()` — Start drawing points on map click.
- `disable()` — Stop drawing.
- `isEnabled()` — Check if drawing mode is active.
- `getPoints()` — Return all point features.
- `clear()` — Remove all created points.
- `destroy()` — Disable and remove layer/source.
