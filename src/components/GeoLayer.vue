<script>
import { EventBus } from '../store/eventbus';

export default {
    name: 'GeoLayer',
    props: {
        map: { type: Object, required: true },
        layerItem: { type: Object, required: true },
        bounds: { type: Object, required: true },
        mapMode: { type: String, required: true },
    },
    data() {
    return {
        objects: [],
        visible: false,
        loadLimit: 0, // число объектов для загрузки в одной странице
        loadLimitMax: 5000, 
        loadLimitMin: 500,
        loadedPages: 0, // число загруженных страниц с объектами
        loadThreads: 0, // сколько потоков запущено для загрузки объектов
        loadThreadsMax: 2,
        loadController: null, // токен axios для отмены загрузки
        loadBounds: null, // границы карты, для которой происходит загрузка объектов
        // Названия для источников и слоёв maplibre
        sourceName: '',
        circleLayerName: '',
        polygonLayerName: '',
        clusterLayerName: '',
        clusterCountLayerName: '',
        filterStr: '',
        filterParams: {},
        searchLayers: [],
    }
    },

    computed: {
        // Короткая форма получения id слоя
        id() {
            return this.layerItem.node.id;
        },
        // Короткая форма получения типа слоя
        layerType() {
            return this.layerItem.node.layer_type;
        },
        // URL для загрузки объектов в зависимости от типа слоя
        objectsURL() {
            let url = null;
            if (this.layerType === 'A') {
                url = 'api/v1/realty/all/?' + this.filterStr;
            }
            else if (this.layerType === 'G') {
                url = 'api/v1/layers/geo_object/?' + this.filterStr;
            }
            return url;
        },
        selectedMapObject: {
            get () { return this.$store.state.selectedMapObject },
            set (value) { this.$store.commit('setSelectedMapObject', value) }
        },
    },
    watch: {
        bounds() {
            if (this.id !== 'search') {
                this.filterParams = {}
                this.searchLayers = []
            }
            this.loadObjectsData()
        }
    },
    mounted() {
        // Названия для источников и слоёв maplibre
        this.sourceName = 'geoLayer_' + this.id + '_source';
        this.circleLayerName = 'geoLayer_' + this.id + '_points';
        this.polygonLayerName = 'geoLayer_' + this.id + '_polygons';
        this.clusterLayerName = 'geoLayer_' + this.id + '_cluster';
        this.clusterCountLayerName = 'geoLayer_' + this.id + '_cluster_count';
        
        this.visible = true;

        if (this.id === 'search') {
            EventBus.$on("findObjectsByParams", ({ filterParams, searchLayers }) => {
                this.removeSourceAndLayers()
                this.objects = []
                this.loadBounds = null
                this.$store.commit('setLayerItemProperty', {id: this.id, prop: 'objCount', value: null})
                this.filterParams = filterParams
                this.searchLayers = searchLayers
                this.loadObjectsData();
            })
        } else {
            this.filterParams = {}
            this.searchLayers = []

            this.loadObjectsData()
        }
    },
    beforeDestroy() {
        // Отмена предыдущей сессии с загрузкой объектов в потоках
        if (this.loadController) {
            this.loadController.cancel('layer was hidden');
        }
        this.$store.commit('setLayerItemFinished', this.id);
        this.removeSourceAndLayers();
        this.visible = false;
        if (this.id === 'search') {
            EventBus.$off("findObjectsByParams")
        }
    },
    methods: {
        boundsStr(bounds) {
            var res = [];
            res.push(bounds._sw.lng);
            res.push(bounds._sw.lat);
            res.push(bounds._ne.lng);
            res.push(bounds._ne.lat);
            return res.join(',');
        },
        setToRange(value, min, max) {
            if (value < min) value = min;
            if (value > max) value = max;
            return value;
        },
        boundsInBounds(boundsIn, boundsOut) {
            return (
                this.between(boundsIn._sw.lng, boundsOut._sw.lng, boundsOut._ne.lng) &&
                this.between(boundsIn._sw.lat, boundsOut._sw.lat, boundsOut._ne.lat) &&
                this.between(boundsIn._ne.lng, boundsOut._sw.lng, boundsOut._ne.lng) &&
                this.between(boundsIn._ne.lat, boundsOut._sw.lat, boundsOut._ne.lat)
            );
        },
        between(value, i1, i2) {
            if (i1 < i2) 
                return (value >= i1) && (value <= i2)
            else
                return (value <= i1) && (value >= i2);
        },
        // Получение объектов для текущего слоя в границах экрана
        async loadObjectsData(filterParams, searchLayers) {
            if (this.id === 'search') {
                const filter = []
                if ((this.searchLayers) && (this.searchLayers.length > 0) && (this.filterParams)) {
                    // alert(this.filterParams)
                    console.log(this.filterParams)
                    filter.push('geo_layer__in=' + this.searchLayers.join(','))
                
                    let paramsCount = 0
                    for (const key in this.filterParams) {
                        if ((this.filterParams[key] !== undefined) && (this.filterParams[key] !== '') && (this.filterParams[key].length > 0)) {
                            paramsCount++
                            if (key.search('_min') > 0) 
                                filter.push(key.substring(0, key.search('_min'))+'__gte='+this.filterParams[key])
                            else if (key.search('_max') > 0) 
                                filter.push(key.substring(0, key.search('_max'))+'__lte='+this.filterParams[key])
                            else 
                                filter.push(key+'__in='+this.filterParams[key].join(','))
                       }   
                    }
                    if (paramsCount > 0) {
                       this.filterStr = filter.join('&')
                        console.log(this.filterStr)
                        let objCountTotal = this.layerItem.objCount;            
                        // Если число загруженных объектов и общее число объектов слоя на сервере совпадает
                        if (objCountTotal === this.objects.length)
                            return;

                        if (this.loadBounds)
                            console.log('boundsInBounds: '+this.boundsInBounds(this.bounds, this.loadBounds));
                        // Если границы карты попадают в границы предыдущего
                        if (this.loadBounds && this.boundsInBounds(this.bounds, this.loadBounds))
                            return;
            
                        this.loadBounds = this.bounds;    
                    
                        this.objects = [];
                        if (objCountTotal === null) {
                            objCountTotal = await this.getObjectsCount();
                            this.$store.commit('setLayerItemProperty', {id: this.id, prop: 'objCount', value: objCountTotal});
                        }

                        const objCountInBounds = await this.getObjectsCount(true);
                        if (objCountInBounds === 0)
                            return;

                        // Отмена предыдущей сессии с загрузкой объектов в потоках
                        if (this.loadController) {
                            this.loadController.cancel('startded new loading session'); 
                        }
                        this.loadController = this.$axios.CancelToken.source();
                        this.loadLimit = Math.round(objCountInBounds / 10);
                        this.loadLimit = this.setToRange(this.loadLimit, this.loadLimitMin, this.loadLimitMax);
                        const pagesToLoad = Math.ceil(objCountInBounds / this.loadLimit);            
                        // сколько потоков запускается для загрузки объектов
                        this.loadThreads = (pagesToLoad > this.loadThreadsMax) ? this.loadThreadsMax : pagesToLoad;           
                        // Сбрасываем процент загрузки слоя
                        this.$store.commit('setLayerItemProperty', {id: this.id, prop: 'percentLoaded', value: 0});
                        this.loadedPages = 0;
                        // Запуск нужного числа потоков с загрузкой объектов
                       for (let th = 1; th <= this.loadThreads; th++) {                
                            this.loadPagedObjectsData(th);
                        }
                    }
                }
            } else {
                this.filterStr = 'geo_layer=' + this.id
            
                let objCountTotal = this.layerItem.objCount;            
                // Если число загруженных объектов и общее число объектов слоя на сервере совпадает
                if (objCountTotal === this.objects.length)
                    return;

                if (this.loadBounds)
                    console.log('boundsInBounds: '+this.boundsInBounds(this.bounds, this.loadBounds));
                // Если границы карты попадают в границы предыдущего
                if (this.loadBounds && this.boundsInBounds(this.bounds, this.loadBounds))
                    return;
            
                this.loadBounds = this.bounds;    
            
                this.objects = [];
                if (objCountTotal === null) {
                    objCountTotal = await this.getObjectsCount();
                    this.$store.commit('setLayerItemProperty', {id: this.id, prop: 'objCount', value: objCountTotal});
                }

                const objCountInBounds = await this.getObjectsCount(true);
                if (objCountInBounds === 0)
                    return;

                // Отмена предыдущей сессии с загрузкой объектов в потоках
                if (this.loadController) {
                    this.loadController.cancel('startded new loading session');
                }
                this.loadController = this.$axios.CancelToken.source();
                this.loadLimit = Math.round(objCountInBounds / 10);
                this.loadLimit = this.setToRange(this.loadLimit, this.loadLimitMin, this.loadLimitMax);
                const pagesToLoad = Math.ceil(objCountInBounds / this.loadLimit);            
                // сколько потоков запускается для загрузки объектов
                this.loadThreads = (pagesToLoad > this.loadThreadsMax) ? this.loadThreadsMax : pagesToLoad;           
                // Сбрасываем процент загрузки слоя
                this.$store.commit('setLayerItemProperty', {id: this.id, prop: 'percentLoaded', value: 0});
                this.loadedPages = 0;
                // Запуск нужного числа потоков с загрузкой объектов
                for (let th = 1; th <= this.loadThreads; th++) {                
                    this.loadPagedObjectsData(th);
                }
            }
        },  
        async getObjectsCount(inBounds) {
            let url = this.objectsURL + '&limit=1';
            if (inBounds) {
                url += '&in_bbox=' + this.boundsStr(this.bounds);
            }
            var paged = await this.$axios
                .$get(url)
                .catch(error => { console.log(error); });
            if (paged && paged.rows_filtered) {
                return paged.rows_filtered;
            }
            else {                
                return 0;
            }
        },
        async loadPagedObjectsData(page) {
            console.log('page: ' + page + ' threads: ' + this.loadThreads);
            if ((this.loadBounds !== this.bounds) || !this.visible) return;
            // Помечаем, что слой загружается
            this.$store.commit('setLayerItemLoading', this.id);
            page = page || 1;
            var loadLink = this.objectsURL + '&in_bbox=' + this.boundsStr(this.bounds) + '&limit=' + this.loadLimit + '&page=' + page;
            var paged = await this.$axios
                .$get(loadLink, { cancelToken: this.loadController.token })
                .catch(error => { 
                    if (this.$axios.isCancel(error)) {
                        console.log('page: ' + page + ' canceled', error)
                    } else {
                        console.log(error); 
                    }
                });
            // Если к окончанию загрузки слой ещё отображается
            if (this.visible) {
                // добавляем в переменную загруженные записи
                if (paged && paged.results) {
                    this.concatObjects(paged.results);
                    this.loadedPages++;
                    this.$store.commit('setLayerItemProperty', {id: this.id, prop: 'percentLoaded', value: (this.loadedPages / paged.total_pages)*100});
                }
                // Проверяем, есть ли ещё страницы для загрузки, учитывая те, что загружаются в других потоках
                if (paged && paged.total_pages >= page + this.loadThreads) {
                    this.loadPagedObjectsData(page + this.loadThreads);
                }
            }
            // Если объекты не загружены, то убираем сопутствующие слои карты
            if (!this.objects) {
                this.removeSourceAndLayers();
            }
            // Иначе обновляем слои карты
            else if (this.visible) {
                this.addSourceAndLayers();
            }
            // Если загружены все партии, снимаем пометку о загрузке
            if ((paged && paged.total_pages === page) || !this.visible) {
                this.$store.commit('setLayerItemFinished', this.id);
                this.loadController = null;
            }
        },
        concatObjects(newObjects) {
            this.objects = this.objects.concat(newObjects);
        },
        addSourceAndLayers() {
            const self = this;
            const boundaryObjects = [];

            if (this.layerItem.node.layer_type === 'A') {
                for (const _object of this.objects) {
                    boundaryObjects.push({
                        id: _object.id,
                        type: 'Feature',
                        properties: {
                            label: 'Земельный участок',
                            info: _object.ads_text_short + '<br/>' + _object.address.raw,
                            type: 'Point',
                            object_type: _object.object_type,
                            lng: _object.geo_pos.coordinates[0],
                            lat: _object.geo_pos.coordinates[1]
                        },
                        geometry: _object.geo_pos
                    });
                }

                const boundaryObjectsSource = this.map.getSource(this.sourceName);
                if (boundaryObjectsSource) {
                    boundaryObjectsSource.setData({
                        type: 'FeatureCollection',
                        features: boundaryObjects
                    });
                }
                else {
                    this.map.addSource(this.sourceName, {
                        type: "geojson",
                        data: {
                            type: 'FeatureCollection',
                            features: boundaryObjects
                        },
                        cluster: true,
                        clusterMaxZoom: 14, // Max zoom to cluster points on
                        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
                    });

                    this.map.addLayer({
                        id: this.circleLayerName,
                        type: 'circle',
                        source: this.sourceName,
                        filter: ['!', ['has', 'point_count']],
                        paint: {
                            'circle-radius': 5,
                            'circle-color': '#fff',
                            'circle-stroke-width': 5,
                            'circle-stroke-color': this.layerItem.node.color
                        }
                    });

                    this.map.addLayer({
                        id: this.clusterLayerName,
                        type: 'circle',
                        source: this.sourceName,
                        filter: ['has', 'point_count'],
                        paint: {
                        // with three steps to implement three types of circles:
                        //   * Blue, 20px circles when point count is less than 100
                        //   * Yellow, 30px circles when point count is between 100 and 750
                        //   * Pink, 40px circles when point count is greater than or equal to 750
                            'circle-color': [
                            'step', ['get', 'point_count'],
                            '#51bbd6',
                            100, '#f1f075',
                            750, '#f28cb1'
                            ],
                            'circle-radius': [
                            'step', ['get', 'point_count'],
                            20,
                            100, 30,
                            750, 40
                            ]
                        }
                    });

                    this.map.addLayer({
                        id: this.clusterCountLayerName,
                        type: 'symbol',
                        source: this.sourceName,
                        filter: ['has', 'point_count'],
                        layout: {
                            'text-field': '{point_count_abbreviated}',
                            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                            'text-size': 12
                        }
                    });

                    this.map.on('mouseenter', this.circleLayerName, this.onObjectMouseEnter);
                    this.map.on('mouseleave', this.circleLayerName, this.onObjectMouseLeave);

                    this.map.on('click', this.circleLayerName, function(e) {
                        self.selectedMapObject = {
                           id: e.features[0].id,
                           object_type: e.features[0].properties.object_type,
                        };
                    });

                    // Приближение карты по клику на кластере
                    this.map.on('click', this.clusterLayerName, function (e) {
                        var features = self.map.queryRenderedFeatures(e.point, {
                            layers: [self.clusterLayerName]
                        });
                        var clusterId = features[0].properties.cluster_id;
                        self.map.getSource(self.sourceName).getClusterExpansionZoom(
                            clusterId,
                            function (err, _zoom) {
                            if (err) return;

                            self.map.easeTo({
                                center: features[0].geometry.coordinates,
                                zoom: _zoom
                            });
                            }
                        );
                    });

                    this.map.on('mouseenter', this.clusterLayerName, function () {
                        this.getCanvas().style.cursor = 'pointer';
                    });

                    this.map.on('mouseleave', this.clusterLayerName, function () {
                        this.getCanvas().style.cursor = '';
                    });
                }
            }
            else if (this.layerItem.node.layer_type === 'G') {
                for (const _object of this.objects) {
                    boundaryObjects.push({
                        id: _object.id,
                        type: 'Feature',
                        properties: {
                            label: _object.name,
                            type: _object.geo_pos.type,
                        },
                        geometry: _object.geo_pos
                    });
                }

                const boundaryObjectsSource = this.map.getSource(this.sourceName);
                if (boundaryObjectsSource) {
                    boundaryObjectsSource.setData({
                    type: 'FeatureCollection',
                    features: boundaryObjects
                    });
                }
                else {
                    this.map.addSource(this.sourceName, {
                        type: "geojson",
                        data: {
                            type: 'FeatureCollection',
                            features: boundaryObjects
                        },
                    });

                    this.map.addLayer({
                        id: this.circleLayerName,
                        type: 'circle',
                        source: this.sourceName,
                        paint: {
                            'circle-radius': 5,
                            'circle-color': '#fff',
                            'circle-stroke-width': 5,
                            'circle-stroke-color': this.layerItem.node.color
                        },
                        filter: ['==', '$type', 'Point']
                    });

                    this.map.addLayer({
                        id: this.polygonLayerName,
                        type: 'fill',
                        source: this.sourceName,
                        paint: {
                            'fill-color': this.layerItem.node.color,
                            'fill-opacity': [
                                'case', ['boolean', ['feature-state', 'hover'], false], 0.7, 0.5
                            ]
                        },
                        filter: ['==', '$type', 'Polygon']
                    });
                }
            }

            this.map.on('mouseenter', this.circleLayerName, this.onObjectMouseEnter);
            this.map.on('mouseleave', this.circleLayerName, this.onObjectMouseLeave);

            this.map.on('mouseenter', this.polygonLayerName, this.onObjectMouseEnter);
            this.map.on('mousemove', this.polygonLayerName, this.onObjectMouseMove);
            this.map.on('mouseleave', this.polygonLayerName, this.onObjectMouseLeave);
        },
        updateHoverObject(e) {
            var coordinates;
            if (e.features[0].properties.type === 'Polygon') {
                coordinates = e.lngLat;
            }
            else if (e.features[0].properties.type === 'Point') {
                coordinates = e.features[0].geometry.coordinates.slice();
            }

            // Уточнение координат при масштабировании
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            if (e.features.length > 0) {
                if (this.hoveredStateId) {
                    this.map.setFeatureState(
                        {   source: this.sourceName,
                            id: this.hoveredStateId
                        },
                        {   hover: false   }
                    );
                }
                this.hoveredStateId = e.features[0].id;
                this.map.setFeatureState(
                    {   source: this.sourceName,
                        id: this.hoveredStateId
                    },
                    {   hover: true   }
                );
            }

            const icon = '<i class="'+this.layerItem.node.glyph_name+'" style="font-size: 1.2em; color:'+this.layerItem.node.color+'"></i>';
            const title = icon + ' ' + (this.layerItem.node.caption || this.layerItem.node.name) + ' <strong>'+e.features[0].properties.label+'</strong><br/>' + (e.features[0].properties.info || '');
            this.map.popup
                .setLngLat(coordinates)
                .setHTML(title)
                .addTo(this.map);
        },
        onObjectMouseEnter(e) {
            if (this.mapMode !== 'free') return;

            this.map.getCanvas().style.cursor = 'pointer';
            this.updateHoverObject(e);
        },
        onObjectMouseMove(e) {
            if (this.mapMode !== 'free') return;

           // if (this.hoveredStateId !== e.features[0].id) {
                this.updateHoverObject(e);
           // }
        },
        onObjectMouseLeave() {
            if (this.hoveredStateId) {
                this.map.setFeatureState(
                    {   source: this.sourceName,
                        id: this.hoveredStateId
                    },
                    {   hover: false   }
                );
            }
            this.hoveredStateId = null;

            this.map.getCanvas().style.cursor = '';
            this.map.popup.remove();
        },
        removeSourceAndLayers() {
            if (this.map.getLayer(this.circleLayerName)) {
                this.map.removeLayer(this.circleLayerName);
            }
            if (this.map.getLayer(this.polygonLayerName)) {
                this.map.removeLayer(this.polygonLayerName);
            }
            if (this.map.getLayer(this.clusterLayerName)) {
                this.map.removeLayer(this.clusterLayerName);
            }
            if (this.map.getLayer(this.clusterCountLayerName)) {
                this.map.removeLayer(this.clusterCountLayerName);
            }
            if (this.map.getSource(this.sourceName)) {
                this.map.removeSource(this.sourceName);
            }
        },
    },
    render() {
        return '';
    },
};
</script>