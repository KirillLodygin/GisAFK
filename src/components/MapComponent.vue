<template>
  <div class="map-wrap" >
    <div ref="myMap" class="map"></div>
    <profile-item :is-profile="isProfile" @closeProfile='closeProfile' />
    <div class="maplibregl-ctrl-top-right mapboxgl-ctrl-top-right">
      <div class="maplibregl-ctrl maplibregl-ctrl-group mapboxgl-ctrl mapboxgl-ctrl-group" style="margin-top: 110px;">
        <button id="measureBtn" :class="{'text-primary': mapMode === 'measure'}" type="button" title="Измерение расстояния"  @click="toggleMeasureMode">
          <i class="fas fa-ruler"></i>
        </button>
      </div>
      <div class="maplibregl-ctrl maplibregl-ctrl-group mapboxgl-ctrl mapboxgl-ctrl-group dropdown" style="margin-top: 12px;">
        <button id="showLayersBtn" :class="{'text-primary': showLayersPanel}" type="button" title="Отображение слоёв" aria-label="Отображение слоёв" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" @click="showLayersPanel = !showLayersPanel">
          <i class="fas fa-layer-group"></i>
        </button>
        <div v-if="showLayersPanel" class="dropdown-menu dropdown-menu-lg-right show px-3 py-2" aria-labelledby="showLayersBtn">
          <div class="text-primary text-center text-uppercase mb-2" style="width: 270px">Отображение слоёв</div>
          <span v-if="!layersTree.tree_data.length" class="text-muted">cлои не загружены</span>
          <ks-tree-input v-else v-model="visibleLayers" class="mb-1" :input="layersTree">
          </ks-tree-input>
        </div>
      </div>
    </div>
    <map-ctx-menu ref="ctxMenu" :map="map"></map-ctx-menu>
    <map-measure ref="measure" :map="map"></map-measure>
    <geo-layer v-for="layerId in visibleLayers" :key="layerId" :map="map" :bounds="bounds" :layer-item="layersTreeItem(layerId)" :map-mode="mapMode"></geo-layer>
    <geo-layer v-if="layersTreeItem('search') && bounds" id="search" :map="map" :bounds="bounds" :layer-item="layersTreeItem('search')" :map-mode="mapMode"></geo-layer>
  </div>
</template>

<script>
import maplibre from 'maplibre-gl'
import ProfileItem from '~/components/ProfileItem'
// import { EventBus } from '../store/eventbus';
export default {
  name: 'MapComponent',
  comments: {ProfileItem},
  props: {
    objectNames: { type: Array },
    initialState: { type: Object, required: true },
    objectEvaluation: { type: Object, required: false },
    isProfile: { type: Boolean, required: true},
  },
  data() {
    return {
      map: {},
      hoveredStateId: null,
      selectFeaturesId: null,
      objects: [],
      popup: null,                    // Popup to show information about object
      canvas: null,                   // Canvas of map
      start: null,                    // Starting position when 'mousedown' occurs
      current: null,                  // Current position when 'mousemove' or 'mouseup' occurs
      selectArea: null,               // Area to select features
      bounds: null,
      showLayersPanel: true,
      visibleLayers: [],
      layersTree: {
        tree_data: [],
        select: 'multiple',
        border: 'none',
        name: 'mp-layers',
        height: '200px',
        check_align: 'right',
        icon_checked: 'fas fa-eye',
        icon_unchecked: 'fas fa-eye-slash',
        class_unchecked: "text-muted",
      },
    }
  },
  computed: {
    mapMode: {
      get () { return this.$store.state.mapMode },
      set (value) { this.$store.commit('setMapMode', value) }
    },
    goToAddress: {
      get () { return this.$store.state.goToAddress },
      set (value) { this.$store.commit('setGoToAddress', value) }
    },
    layersTreeData: {
      get () { return this.$store.state.layersTreeData },
      set (value) { this.$store.commit('setLayersTreeData', value) }
    },
    analogs: {
      get () { return this.$store.state.analogs },
      set (value) { this.$store.commit('setAnalogs', value) }
    }
  },
  watch: {
    mapMode(mode) {
      if (mode === 'frameCircle' || mode === 'frameRect' || mode === 'measure')
        this.map.canvas.style.cursor = 'crosshair'
      else
      this.map.canvas.style.cursor = null
    },
    goToAddress(newAddress) {
      this.map.setCenter([newAddress.lon, newAddress.lat]);
      var bbox = [
        [newAddress.boundingbox[2], newAddress.boundingbox[0]],
        [newAddress.boundingbox[3], newAddress.boundingbox[1]]
      ];
      this.map.fitBounds(bbox, {padding: 50, linear: true, maxZoom: 18});
      this.nmObjectAddSource(newAddress);
    },
    objectEvaluation(newObjectEvaluation) {
      if ((newObjectEvaluation !== undefined) && (newObjectEvaluation !== null)) {
        if (newObjectEvaluation.id !== undefined) {
          this.showSelectedObjectsWithoutObjectEvaluation()
          this.map.setFilter('polygons-highlighted-object-evaluation', ['==', '$id', newObjectEvaluation.id]);
        }
      } else {
        this.map.setFilter('polygons-highlighted-object-evaluation', ['in', '$id', '']);
      }
    },
    layersTreeData(treeData) {
      this.layersTree.tree_data = treeData;
    },
    visibleLayers() {
      localStorage.setItem('visibleLayers', JSON.stringify(this.visibleLayers));
    },
  },
  mounted() {
    this.createMap();
    document.addEventListener('keydown', this.onKeyDown);
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.onKeyDown);
  },
  methods: {
    layersTreeItem(id) {
        return this.$store.getters.getLayersTreeItem(id);
    },
    async toggleMeasureMode() {
      if (this.mapMode === 'measure') {
        if (await this.$refs.measure.closeQuery()) {
          this.$refs.measure.clear();
          this.mapMode = 'free';
        }
      }
      else {
        this.mapMode = 'measure';
      }
    },
    // Возвращает координаты на карте под указателем
    mousePos(e) {
      const rect = this.map.canvas.getBoundingClientRect();
      return new maplibre.Point(
        e.clientX - rect.left - this.map.canvas.clientLeft,
        e.clientY - rect.top - this.map.canvas.clientTop
      );
    },

    async setObjects() {
      if (!this.objectNames) return;

      this.objects = []

      for (const objectName of this.objectNames) {
        const findObjects = await this.$axios
          .$get(process.env.search_server + '/search?q=' + objectName + '&polygon_geojson=1')
          .catch(error => { console.log(error); })

        const object = {}

        object.id = findObjects[0].place_id
        object.name = objectName
        object.title = objectName
        object.type = findObjects[0].geojson.type
        object.center = { lng: findObjects[0].lon, lat: findObjects[0].lat }
        object.coordinates = findObjects[0].geojson.coordinates

        this.objects.push(object)
      }
    },

    showSelectedObjectsWithoutObjectEvaluation() {
      let objectEvaluationId = -1
      if (this.objectEvaluation) {
        objectEvaluationId = this.objectEvaluation.pk
      }
      if (this.selectFeaturesId) {
        const selFeatureIds = this.selectFeaturesId.filter(x => !objectEvaluationId.includes(x));
        // const selFeatureIds = []
        // this.selectFeaturesId.forEach(selFeatureId => {
        //   if (selFeatureId !== objectEvaluationId) {
        //     selFeatureIds.push(selFeatureId)
        //   }
        // })
        this.selectFeaturesId = selFeatureIds
        this.map.setFilter('polygons-highlighted', ['in', '$id', ...this.selectFeaturesId]);
      }
    },

    selectObjectEvaluation(e) {
      this.$emit('selectObjectEvaluation', e.features[0].id);
    },

    // Инициализация карты maplibre
    createMap() {
      const mapCenterOb = JSON.parse(localStorage.getItem('mapCenter'));
      let mapCenter = [];
      if (mapCenterOb) {
         mapCenter = [mapCenterOb.lng, mapCenterOb.lat];
      }
      else {
        mapCenter = [this.initialState.lng, this.initialState.lat];
      }
      const mapZoom = localStorage.getItem('mapZoom') || this.initialState.zoom;

      this.map = new maplibre.Map({
        container: this.$refs.myMap,
        style: {
          version: 8,
          sources: {
            'raster-tiles': {
              type: 'raster',
              tiles: [this.initialState.url + 'tile/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: 'OSM',
            },
          },
          layers: [
            {
              id: 'simple-tiles',
              type: 'raster',
              source: 'raster-tiles',
              minzoom: 0,
              maxzoom: 20,
            },
          ],
          glyphs: "https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=get_your_own_OpIi9ZULNHzrESv6T2vL",
        },
        center: mapCenter,
        zoom: mapZoom,
        maxZoom: 18,
      })

      this.map.on('load', this.onMapLoad);
    },

    // Событие после загрузки карты
    onMapLoad() {
      const self = this;
      this.map.popup = new maplibre.Popup({
        closeButton: false,
        closeOnClick: false
      });

      this.map.boxZoom.disable();

      this.map.canvas = this.map.getCanvasContainer();
      this.map.canvas.addEventListener('mousedown', this.mouseDown, true);
      this.map.on('contextmenu', this.onContextMenu);
      this.map.on('moveend', this.onMoveEnd);
      // Обновляем объекты из слоёв, которые попадают в область видимости
      this.bounds = this.map.getBounds();

      // this.map.on('style.load', function () {
      //  const waiting = () => {
      //  if (!this.map.isStyleLoaded()) {
      //    setTimeout(waiting, 200);
      //  } else {
      //    this.addObjectsToList();
      //  }
      // };
      // waiting();
      // });
      // this.map.once('styledata', function() {
      //   this.addObjectsToList();
      // })

      this.setObjects().then(_ => {
        this.addObjectsToMap().then(_ => {
          this.map.on('click', 'points', function (e) {
            var coordinates = e.features[0].geometry.coordinates.slice();
            var description = e.features[0].properties.description;
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
            new maplibre.Popup()
              .setLngLat(coordinates)
              .setHTML(description)
              .addTo(this);
          });
          this.map.on('mouseenter', 'points', function () {
            if (self.mapMode !== 'free') return;

            this.getCanvas().style.cursor = 'pointer';
          });
          this.map.on('mouseleave', 'points', function () {
            this.getCanvas().style.cursor = '';
          });

          this.map.on('mousemove', 'polygons', function (e) {
            if (self.mapMode !== 'free') return;

            if (e.features.length > 0) {
              // Update feature state for feature under the mouse
              if (this.hoveredStateId) {
                this.setFeatureState(
                  {
                    source: 'objects',
                    id: this.hoveredStateId
                  },
                  {
                    hover: false
                  }
                )
              }
              this.hoveredStateId = e.features[0].id;
              this.setFeatureState(
                {
                  source: 'objects',
                  id: this.hoveredStateId
                },
                {
                  hover: true
                }
              )
            }

            this.getCanvas().style.cursor = 'pointer';
            var description = e.features[0].properties.description;

            // SHow popup
            this.popup
              .setLngLat(e.lngLat)
              .setHTML(description)
              .addTo(this);

          });

          this.map.on('mouseleave', 'polygons', function () {
            if (this.hoveredStateId) {
              // Update feature state for previously hovered feature
              this.setFeatureState(
                {
                  source: 'objects',
                  id: this.hoveredStateId
                },
                {
                  hover: false
                }
              );
            }
            this.hoveredStateId = null;

            this.getCanvas().style.cursor = '';
            this.popup.remove();
          });

          // this.map.on('click', 'polygons', this.selectObjectEvaluation);
        });
      });

      this.map.loadImage('/img/custom_marker.png',
        function (error, image) {
          if (error) throw error;
          self.map.addImage('custom-marker', image);
        }
      );

      this.addNavControl();
      this.addMarker(this.initialState.lat, this.initialState.lng);

      // Загрузка списка видимых слоёв из localStorage
      const visibleLayers = JSON.parse(localStorage.getItem('visibleLayers'));
      if (visibleLayers.length) {
        // Проверяем, есть ли фактически эти слои. Если нет - удаляем из видимых
        for (let i = visibleLayers.length-1; i >= 0; i--) {
          if (!this.layersTreeItem(visibleLayers[i])) {
           visibleLayers.splice(i, 1);
          }
        }
        this.visibleLayers = visibleLayers;
      }
    },

    // Событие по нажатию мышки на карте
    mouseDown(e) {
      // Устанавливается тип выделения
      // Прямоугольник, если был зажат shift или нажата кнопка rect для рисования области поиска
      if ((e.shiftKey || this.mapMode === 'frameRect') && e.button === 0) {
        this.map.selectType = 1;
      }
      // Круг, если был зажат ctrl или нажата кнопка circle для рисования области поиска
      else if ((e.ctrlKey || this.mapMode === 'frameCircle') && e.button === 0) {
        this.map.selectType = 2;
      }

      if (this.map.selectType) {
        // Disable default drag zooming
        this.map.dragPan.disable();
        // Disable default drag rotate
        this.map.dragRotate.disable();

        this.map.canvas.style.cursor = 'crosshair';

        // Call functions for the following events
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
      }

      this.$refs.ctxMenu.close();

      // Save mouse start coordinates
      this.map.start = this.mousePos(e);
    },

    onMouseMove(e) {
      // Save current mouse position
      this.map.current = this.mousePos(e);

      var minX = 0;
      var maxX = 0;
      var minY = 0;
      var maxY = 0;

      // Create select area element
      if (!this.map.selectArea) {
        this.map.selectArea = document.createElement('div');
        if (this.map.selectType === 1) this.map.selectArea.classList.add('boxDraw');
        if (this.map.selectType === 2) this.map.selectArea.classList.add('circleDraw');
        this.map.canvas.appendChild(this.map.selectArea);
      }

      minX = Math.min(this.map.start.x, this.map.current.x);
      maxX = Math.max(this.map.start.x, this.map.current.x);
      minY = Math.min(this.map.start.y, this.map.current.y);
      maxY = Math.max(this.map.start.y, this.map.current.y);

      // Set width and height of select area
      if (this.map.selectType === 1) {
        this.map.selectArea.style.transform = `translate(${minX}px, ${minY}px)`;
        this.map.selectArea.style.width = maxX - minX + 'px';
        this.map.selectArea.style.height = maxY - minY + 'px';
      }
      if (this.map.selectType === 2) {
        const diffX = maxX - minX;
        const diffY = maxY - minY;
        const diff = Math.sqrt(diffX * diffX + diffY * diffY)
        this.map.selectArea.style.transform = `translate(${this.map.start.x - diff}px, ${this.map.start.y - diff}px)`;
        this.map.selectArea.style.width = 2 * diff + 'px';
        this.map.selectArea.style.height = 2 * diff + 'px';
      }
    },

    // Событие по отжатию мышки на карте
    onMouseUp(e) {
      // Select from start to current mouse position
      if (this.map.selectType === 1) {
        this.select([this.map.start, this.mousePos(e)])
      }
      else if (this.map.selectType === 2) {
        const start = {
          x: this.map.start.x - Math.abs(this.mousePos(e).x - this.map.start.x),
          y: this.map.start.y - Math.abs(this.mousePos(e).y - this.map.start.y)
        }
        const end = {
          x: this.map.start.x + Math.abs(this.mousePos(e).x - this.map.start.x),
          y: this.map.start.y + Math.abs(this.mousePos(e).y - this.map.start.y)
        }
        this.select([start, end])
      }
    },

    // Событие по нажатию кнопки на документе
    onKeyDown(e) {
      // Finish when ESC was pressed
      if (e.keyCode === 27 && (this.map.selectType || this.mapMode === 'frameRect' || this.mapMode === 'frameCircle'))
        this.select()
    },

    // Событие по выпаданию контекстного меню на карте
    onContextMenu(e) {
      e.preventDefault();
      this.$refs.ctxMenu.show({ point: e.point, lngLat: e.lngLat });
    },

    // Событие по окончанию перемещения карты
    onMoveEnd() {
      // Обновляем объекты из слоёв, которые попадают в область видимости
      this.bounds = this.map.getBounds();
      localStorage.setItem('mapBounds', JSON.stringify(this.bounds));
      localStorage.setItem('mapCenter', JSON.stringify(this.map.getCenter()));
      localStorage.setItem('mapZoom', JSON.stringify(this.map.getZoom()));
    },

    openTableWithObjectEvaluationAndAnalogues() {
      this.$emit('showObjectEvaluationAndAnalogues', this.selectFeaturesId);
    },

    getUniqueFeatures(features) {
      const uniqueIds = new Set();
      const uniqueFeatures = [];
      for (const feature of features) {
        const id = feature.id;
        if (!uniqueIds.has(id)) {
          uniqueIds.add(id);
          uniqueFeatures.push(feature);
        }
      }
      return uniqueFeatures;
    },

    select(selArea) {
      // Remove events when finish to select
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup', this.onMouseUp);

      // Remove select area
      if (this.map.selectArea) {
        this.map.selectArea.parentNode.removeChild(this.map.selectArea);
        this.map.selectArea = null;
      }

      // If select objects
      if (selArea) {
        const showlayers = ['polygons']
        this.visibleLayers.forEach(layerId => {
          showlayers.push('geoLayer_' + layerId + '_points')
        })
        const features = this.map.queryRenderedFeatures(selArea, {
          layers: showlayers
        });
        if (features) {
          const uniqueFeatures = this.getUniqueFeatures(features);
          this.selectFeaturesId = uniqueFeatures.map((feature) => feature.id);

          this.showSelectedObjectsWithoutObjectEvaluation()
          this.openTableWithObjectEvaluationAndAnalogues()
        }
      }
      this.map.dragPan.enable();
      this.map.dragRotate.enable();

      this.map.canvas.style.cursor = '';

      this.map.selectType = null;
      this.mapMode = 'free';
    },

    addMarker(_lat, _lng) {
      new maplibre.Marker()
        .setLngLat([_lng, _lat])
        .setPopup(new maplibre.Popup().setText('Moscow Center'))
        .addTo(this.map)
    },

    addNavControl() {
      this.map.addControl(new maplibre.NavigationControl(), 'top-right')
    },

    addSymbolsToMap() {
      return new Promise(resolve => {
        const symbolsList = [];
        this.objects.forEach(obj => {
          if (obj.type === 'Symbol') {
            symbolsList.push({
              'type': 'Feature',
              'properties': {
                'description': obj.title,
                'lng': obj.center.lng,
                'lat': obj.center.lat
              },
              'geometry': {
                'type': 'Point',
                'coordinates': obj.coordinates
              }
            })
          }
        })
        // symbolsList.forEach(obj => { alert(obj.geometry.coordinates) })
        this.map.loadImage('https://maplibre.org/maplibre-gl-js-docs/assets/custom_marker.png', function (error, image) {
          if (error) throw error;
          this.map.addImage('custom-marker', image);

          this.map.addSource('symbols', {
            'type': 'geojson',
            'data': {
              'type': 'FeatureCollection',
              'features': symbolsList
            }
          })
        })
        this.map.addLayer({
          'id': 'symbols',
          'type': 'symbol',
          'source': 'symbols',
          'layout': {
            'icon-image': 'custom-marker'
          }
        })
      })
    },

    addObjectsToMap() {
      return new Promise(resolve => {
        const objectsList = [];
        this.objects.forEach(obj => {
          if (obj.type !== 'Symbol') {
            objectsList.push({
              'id': obj.id,
              'type': 'Feature',
              'properties': {
                'description': obj.title,
                'lng': obj.center.lng,
                'lat': obj.center.lat
              },
              'geometry': {
                'type': obj.type,
                'coordinates': obj.coordinates
              }
            })
          }
        })
        this.map.addSource('objects', {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': objectsList
          }
        })
        const layers = this.map.getStyle().layers;
        var firstSymbolId;
        for (var i = 0; i < layers.length; i++) {
          // alert(layers.length)
          if (layers[i].type === 'symbol') {
            firstSymbolId = layers[i].id;
            break;
          }
        }

        this.map.addLayer({
          'id': 'borders',
          'type': 'line',
          'source': 'objects',
          'layout': {},
          'paint': {
            'line-color': '#627BC1',
            'line-width': 2
          }
        }, firstSymbolId)

        this.map.addLayer({
          'id': 'points',
          'type': 'circle',
          'source': 'objects',
          'layout': {},
          'paint': {
            'circle-radius': 6,
            'circle-color': '#B42222'
          },
          'filter': ['==', '$type', 'Point']
        }, firstSymbolId)

        this.map.addLayer({
          'id': 'polygons',
          'type': 'fill',
          'source': 'objects',
          'layout': {},
          'paint': {
            'fill-color': '#627BC1',
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.7,
              0.5
            ]
          },
          'filter': ['==', '$type', 'Polygon']
        }, firstSymbolId)

        this.map.addLayer({
          'id': 'polygons-highlighted',
          'type': 'fill',
          'source': 'objects',
          'layout': {},
          'paint': {
            'fill-color': '#6263C1',
            'fill-opacity': 0.85
          },
          'filter': ['in', '$id', '']
        }, firstSymbolId)

        this.map.addLayer({
          'id': 'polygons-highlighted-object-evaluation',
          'type': 'fill',
          'source': 'objects',
          'layout': {},
          'paint': {
            'fill-color': '#00A2E8',
            'fill-opacity': 0.35
          },
          'filter': ['in', '$id', '']
        }, firstSymbolId)

        this.map.on('styledata', _ => {
          resolve()
        })
      })
    },

    closeProfile() {
      this.$emit('closeProfile');
    }
  },
}
</script>

<style>
@import '~/node_modules/maplibre-gl/dist/maplibre-gl.css';

.map-wrap {
  position: relative;
  width: 100%;
  height: calc(100vh - 50px);
  /* calculate height of the screen minus the heading */
}

.map {
  position: absolute;
  width: 100%;
  height: 100%;
}

.boxDraw {
  background: rgba(56, 135, 190, 0.1);
  border: 2px solid #3887be;
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
}

.circleDraw {
  background: rgba(56, 135, 190, 0.1);
  border: 2px solid #3887be;
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  border-radius: 50%;
}
</style>
