/**
 * PointDrawTool for MapLibre GL JS.
 *
 * Features:
 * - Click to add point features on the map.
 * - Optional callback when a point is created.
 * - Enable/disable/destroy lifecycle.
 * - Get and clear drawn points.
 */
export class PointDrawTool {
  /**
   * @param {import('maplibre-gl').Map} map
   * @param {object} [options]
   * @param {string} [options.sourceId='draw-points-source']
   * @param {string} [options.layerId='draw-points-layer']
   * @param {number|string} [options.circleRadius=6]
   * @param {string} [options.circleColor='#ff3b30']
   * @param {string} [options.circleStrokeColor='#ffffff']
   * @param {number} [options.circleStrokeWidth=2]
   * @param {(feature: GeoJSON.Feature<GeoJSON.Point>) => void} [options.onPointCreated]
   */
  constructor(map, options = {}) {
    if (!map) {
      throw new Error('PointDrawTool requires a valid MapLibre map instance.');
    }

    this.map = map;
    this.options = {
      sourceId: options.sourceId ?? 'draw-points-source',
      layerId: options.layerId ?? 'draw-points-layer',
      circleRadius: options.circleRadius ?? 6,
      circleColor: options.circleColor ?? '#ff3b30',
      circleStrokeColor: options.circleStrokeColor ?? '#ffffff',
      circleStrokeWidth: options.circleStrokeWidth ?? 2,
      onPointCreated: options.onPointCreated
    };

    this._enabled = false;
    this._features = [];

    this._onMapClick = this._onMapClick.bind(this);
    this._ensureSourceAndLayer = this._ensureSourceAndLayer.bind(this);

    if (this.map.loaded()) {
      this._ensureSourceAndLayer();
    } else {
      this.map.once('load', this._ensureSourceAndLayer);
    }
  }

  _ensureSourceAndLayer() {
    if (!this.map.getSource(this.options.sourceId)) {
      this.map.addSource(this.options.sourceId, {
        type: 'geojson',
        data: this._toFeatureCollection()
      });
    }

    if (!this.map.getLayer(this.options.layerId)) {
      this.map.addLayer({
        id: this.options.layerId,
        type: 'circle',
        source: this.options.sourceId,
        paint: {
          'circle-radius': this.options.circleRadius,
          'circle-color': this.options.circleColor,
          'circle-stroke-color': this.options.circleStrokeColor,
          'circle-stroke-width': this.options.circleStrokeWidth
        }
      });
    }
  }

  _onMapClick(event) {
    const feature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [event.lngLat.lng, event.lngLat.lat]
      },
      properties: {
        createdAt: new Date().toISOString()
      }
    };

    this._features.push(feature);
    this._syncSourceData();

    if (typeof this.options.onPointCreated === 'function') {
      this.options.onPointCreated(feature);
    }
  }

  _toFeatureCollection() {
    return {
      type: 'FeatureCollection',
      features: this._features
    };
  }

  _syncSourceData() {
    const source = this.map.getSource(this.options.sourceId);
    if (source && typeof source.setData === 'function') {
      source.setData(this._toFeatureCollection());
    }
  }

  enable() {
    if (this._enabled) {
      return;
    }

    this._enabled = true;
    this.map.on('click', this._onMapClick);
  }

  disable() {
    if (!this._enabled) {
      return;
    }

    this._enabled = false;
    this.map.off('click', this._onMapClick);
  }

  isEnabled() {
    return this._enabled;
  }

  getPoints() {
    return [...this._features];
  }

  clear() {
    this._features = [];
    this._syncSourceData();
  }

  destroy() {
    this.disable();

    if (this.map.getLayer(this.options.layerId)) {
      this.map.removeLayer(this.options.layerId);
    }

    if (this.map.getSource(this.options.sourceId)) {
      this.map.removeSource(this.options.sourceId);
    }
  }
}
