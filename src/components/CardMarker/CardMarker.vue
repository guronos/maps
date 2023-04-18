<template>
  <div v-if="markerReady">
    <ymap-marker
      :coords="polygonPoints"
      :marker-id="itemInner.id"
      :marker-fill="fill"
      :marker-stroke="stroke"
      marker-type="Polygon"
    /><ymap-marker
      :coords="rotationPolylinePoints"
      :marker-id="itemInner.id"
      :marker-stroke="rotationStroke"
      marker-type="Polyline"
    />
    <ymap-marker
      :coords="itemInner.coords"
      :marker-id="itemInner.id"
      :marker-fill="fillCircle"
      :circle-radius="2"
      :marker-stroke="strokeCircle"
      marker-type="Circle"
    />
  </div>
</template>
<script>
import { loadYmap } from 'vue-yandex-maps';
export default {
  name: 'CardMarker',
  props: {
    item: Object,
    instansMap: Object,
  },
  data() {
    return {
      markerReady: false,
      itemInner: {},
      polygonPoints: [],
      rotationPolylinePoints: [],
      fillCircle: {
        color: '#000',
      },
      fill: {
        opacity: 0,
      },
      strokeCircle: {
        color: '#fff',
        width: '2px',
      },
      stroke: {
        color: '#fff',
        width: '5px',
      },
      rotationStroke: {
        color: '#000',
        width: '3px',
      },
      corner: 0,
    };
  },
  methods: {
    async getFigure() {
      const precision = 160;
      const PIradian = Math.PI / 180;
      const zoom = this.instansMap.getZoom();
      const projection = await this.instansMap.options.get('projection');
      const center = projection.toGlobalPixels(this.itemInner.coords, zoom);
      const radius = this.getRadius(center, projection, zoom);
      this.corner = this.itemInner.cornerEnd - this.itemInner.cornerBegin;
      const radianEnd = this.corner * PIradian;
      const step = radianEnd / precision;
      const radianStart = -this.itemInner.cornerBegin * PIradian;
      for (let i = 0; i <= radianEnd + step; i += step) {
        this.polygonPoints.push([
          center[0] + radius * Math.cos(radianStart - i),
          center[1] + radius * Math.sin(radianStart - i),
        ]);
      }
      this.getRotationPolylinePoints(center, projection, zoom, radius);
      if (
        !(this.itemInner.cornerBegin === 0 && this.itemInner.cornerEnd === 360)
      ) {
        this.polygonPoints.push(center);
      }
      this.polygonPoints = [
        this.polygonPoints.map((point) =>
          projection.fromGlobalPixels(point, zoom),
        ),
      ];
    },
    getRadius(center, projection, zoom) {
      const azimuth = Math.PI / 4;
      const direction = [Math.cos(azimuth), Math.sin(azimuth)];
      const endCoords = ymaps.coordSystem.geo.solveDirectProblem(
        this.itemInner.coords,
        direction,
        this.itemInner.radius,
      ).endPoint;
      const radiusPixel = ymaps.coordSystem.cartesian.getDistance(
        center,
        projection.toGlobalPixels(endCoords, zoom),
      );
      return radiusPixel;
    },
    getRotationPolylinePoints(center, projection, zoom, radius) {
      const { cornerRevers } = this.itemInner;
      const PIradian = Math.PI / 180;
      this.rotationPolylinePoints.push(center);
      this.rotationPolylinePoints.push([
        center[0] + radius * Math.cos(-cornerRevers * PIradian),
        center[1] + radius * Math.sin(-cornerRevers * PIradian),
      ]);
      this.rotationPolylinePoints = this.rotationPolylinePoints.map((point) =>
        projection.fromGlobalPixels(point, zoom),
      );
    },
  },
  watch: {
    itemInner: {
      handler(newValue) {
        if (newValue.edit) {
          this.stroke.color = newValue.color;
          this.polygonPoints = [];
          this.rotationPolylinePoints = [];
          this.getFigure();
          this.itemInner.edit = false;
        }
      },
      deep: true,
    },
  },
  async created() {
    this.itemInner = this.item;
    const settings = { lang: 'en_US' };
    await loadYmap(settings);
    this.stroke.color = this.item.color;
    await this.getFigure();
    this.markerReady = true;
  },
};
</script>
