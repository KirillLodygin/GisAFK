<script>
import * as turf from '@turf/turf'
export default {
    name: 'MapMeasure',
    props: {
        map: { type: Object, required: true },
    },
    data() {
    return {
        geojson: {},
        linestring: {}
    }
    },
    computed: {
        mapMode: {
            get () { return this.$store.state.mapMode },
            set (value) { this.$store.commit('setMapMode', value) }
        },
    },
    watch: {
        map() {
            if (this.map) this.map.on('load', this.onMapLoad);
        },
    },
    mounted() {
	},
	beforeDestroy() {		
	},
    methods: {
        onMapLoad() {
            this.geojson = {
                type: 'FeatureCollection',
                features: []
            };
            
            this.linestring = {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: []
                }
            };
            
            this.map.addSource('geojson', {
                type: 'geojson',
                data: this.geojson
            });
                        
            this.map.addLayer({
                id: 'measure-lines',
                type: 'line',
                source: 'geojson',
                layout: {
                    'line-cap': 'round',
                    'line-join': 'round'
                },
                paint: {
                    'line-color': '#888',
                    'line-width': 3
                },
                filter: ['in', '$type', 'LineString']
            });
            this.map.addLayer({
                id: 'measure-points',
                type: 'circle',
                source: 'geojson',
                paint: {
                    'circle-radius': 3.5,
                    'circle-color': '#ffffff',
                    'circle-stroke-width': 3,
                    'circle-stroke-color': '#888'
                },
                filter: ['in', '$type', 'Point']
            });
            /* this.map.addLayer({
                id: 'measure-label',
                type: 'symbol',
                source: 'geojson',
                filter: ['in', '$type', 'Point'],
                layout: {
                    'text-field': 'hi',
                    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                    'text-size': 12
                }
            }); */

            this.map.on('click', this.onMapClick);
            this.map.on('dblclick', this.onMapDblClick);
            this.map.on('mousemove', this.onMapMouseMove);
        },
        onMapClick(e) {
            if (this.mapMode !== 'measure') return;
            
            if (this.geojson.features.length > 1) this.geojson.features.pop();

            // Если клик + ctrl, то удаляем точку под курсором
            if (e.ctrlKey) {
                var features = this.map.queryRenderedFeatures(e.point, {
                    layers: ['measure-points']
                });

                if (features.length) {
                    var id = features[0].properties.id;
                    this.geojson.features = this.geojson.features.filter(function (point) {
                        return point.properties.id !== id;
                    });
                }
            }
            // Иначе добавляем новую точку под указателем
            else {
                const point = {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [e.lngLat.lng, e.lngLat.lat]
                    },
                    properties: {
                        id: String(new Date().getTime()),
                    }
                };                
                this.geojson.features.push(point);

                if (this.geojson.features.length > 1) {
                    this.linestring.geometry.coordinates = this.geojson.features.map(
                        function (point) {
                            return point.geometry.coordinates;
                        }
                    );
                    
                    this.geojson.features.push(this.linestring);

                    point.properties.label = turf.length(this.linestring).toLocaleString() + ' км';
                }
                else {
                    point.properties.label = 'Начальная точка';
                }
            }            

            this.map.getSource('geojson').setData(this.geojson);
        },
        onMapMouseMove(e) {
            if (this.mapMode !== 'measure') return;
            
            var features = this.map.queryRenderedFeatures(e.point, {
                layers: ['measure-points']
            });
            // UI indicator for clicking/hovering a point on the map
            if (features.length) {
                this.map.getCanvas().style.cursor = 'pointer';
                const coordinates = features[0].geometry.coordinates;
                this.map.popup
                .setLngLat(coordinates)
                .setHTML(features[0].properties.label)
                .addTo(this.map);
            }
            else {
                this.map.popup.remove();
                if (this.mapMode === 'measure') {
                    this.map.getCanvas().style.cursor = 'crosshair'
                }
                else {
                    this.map.getCanvas().style.cursor = null;
                }
            }            
        },
        async closeQuery() {
            var result = false;
            if (this.geojson.features.length > 0) {
                await this.$bvModal.msgBoxConfirm('Линейка будет удалена. Продолжить?', {
                    title: 'Закрыть режим измерения',
                    buttonSize: 'sm',
                    okVariant: 'danger',
                    okTitle: 'Удалить',
                    cancelTitle: 'Отменить',
                    footerClass: 'p-2',
                    hideHeaderClose: false,
                    centered: true
                })
                .then(value => {                    
                    result = value;
                })
            } 
            else {
                result = true;
            }            
            return result;
        },
        clear() {
            this.geojson = {
                type: 'FeatureCollection',
                features: []
            };
            
            this.linestring = {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: []
                }
            };

            this.map.getSource('geojson').setData(this.geojson);
        }
    },
    render() {
        return '';
    },
}
</script>