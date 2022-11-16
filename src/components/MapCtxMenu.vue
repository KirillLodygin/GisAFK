<template>
    <div id="mapCtxMenu" v-if="visible" class="dropdown-menu show shadow mt-0" aria-labelledby="dropdownMenuButton" :style="{left: point.x+'px', top: point.y+'px'}">
        <div v-if="error" class="my-0 mx-3 text-danger">
            Ошибка загрузки: {{ error }}
        </div>
        <div v-else-if="loading" class="my-0 mx-3">
            <b-spinner small></b-spinner> <span>Загрузка данных</span>
        </div>
        <template v-else>
            <template v-if="OSMObject">
            <div v-if="OSMObject.address" class="my-1 mx-3 text-primary text-uppercase">{{ OSMObject.shortAddress }}</div>
            <div class="my-1 mx-3" v-b-toggle:collapse-1>
                <i class="fas fa-fw fa-angle-down when-open"></i><i class="fas fa-fw fa-angle-right when-closed"></i>
                <i class="fas fa-map-marked"></i> Объекты OpenStreetMap
            </div>
            <b-collapse visible id="collapse-1" class="my-1">
                <a class="dropdown-item" href="#"><span class="ml-4"><i :class="OSMObject.icon"></i> {{ OSMObject.title }}</span></a>
            </b-collapse>
            </template>
            <template v-if="advObjects.length">
            <div class="my-1 mx-3" v-b-toggle:collapse-2>
                <i class="fas fa-fw fa-angle-down when-open"></i><i class="fas fa-fw fa-angle-right when-closed"></i>
                <i class="fas fa-ad"></i> Объявления
            </div>
            <b-collapse visible id="collapse-2" class="my-1">
                <div v-for="advObject in advObjects" :key="advObject.id" class="dropdown-item d-flex pr-1">
                    <a class="text-body ml-4 w-100" @click.prevent="selectedMapObject = advObject" href="#"><i class="fas fa-ad"></i> {{ advObject.ads_text_short }}</a>                
                    <a class="pl-2" title="Добавить объект к аналогам" @click.prevent="toggleAnalog(advObject)" href="#">
                        <i v-if="getAnalog(advObject.id)" class="fas fa-star text-primary"></i>
                        <i v-else class="fas fa-star text-secondary"></i>
                    </a>
                    <a class="pl-2 pr-2" title="Использовать объект как целевой для сравнения" @click.prevent="toggleAim(advObject)" href="#">
                        <i v-if="isAim(advObject.id)" class="fas fa-balance-scale-right text-primary"></i>
                        <i v-else class="fas fa-balance-scale-right text-secondary"></i>
                    </a>
                </div>
            </b-collapse>
            </template>
            <a class="dropdown-item" href="#">
            <i class="fas fa-plus-circle"></i> Добавить объект недвижимости
            </a>
        </template>
    </div>
</template>

<script>
export default {
    name: 'MapCtxMenu',
    props: {
        map: { type: Object, required: true },
    },
    data() {
    return {
        point: {x: 0, y: 0},
        lngLat: {lng: 0, lat: 0},
        visible: false,
        loading: false,
        error: false,
        OSMObject: {},
        advObjects: [],
    }
    },
    computed: {
        selectedMapObject: {
            get () { return this.$store.state.selectedMapObject },
            set (value) { this.$store.commit('setSelectedMapObject', value) }
        },
        aim: {
            get () { return this.$store.state.aim },
            set (value) { this.$store.commit('setAim', value) }
        },
    },
    watch: {
        OSMObject(newValue) {
            this.nmObjectAddSource(this.OSMObject);
        },
    },
    mounted() {
		document.addEventListener('click', this.onDocumentClick);
	},
	beforeDestroy() {
		document.removeEventListener('click', this.onDocumentClick);
	},
    methods: {
        onDocumentClick(event) {
			if (!event.target.closest('#mapCtxMenu')) {
				this.visible = false;
			}
		},
        show(event) {            
            this.point = event.point;
            this.lngLat = event.lngLat;
            this.error = false;
            this.loading = true;
            this.visible = true;            
            this.getObjects();
        },
        close() {
            this.visible = false;
        },
        getAnalog(id) {
            return this.$store.getters.getAnalog(id);
        },
        isAim(id) {
            return this.$store.getters.isAim(id);
        },
        toggleAnalog(advObject) {
            this.$store.dispatch('toggleAnalog', advObject);
        },
        toggleAim(advObject) {
            this.$store.dispatch('toggleAim', advObject);
        },
        pointOffset(lngLat, offset) {
            return {
                _sw: { lng: lngLat.lng - offset, lat: lngLat.lat - offset },
                _ne: { lng: lngLat.lng + offset, lat: lngLat.lat + offset }
            };
        },
        boundsStr(bounds) {
            var res = [];
            res.push(bounds._sw.lng);
            res.push(bounds._sw.lat);
            res.push(bounds._ne.lng);
            res.push(bounds._ne.lat);
            return res.join(',');
        },
        // Получение данных об объектах под указателем
        async getObjects() {
            // -- Объект OpenStreetMap по API Nomination
            const cnObject = await this.$axios
                .$get(process.env.search_server + '/reverse.php?lat='+this.lngLat.lat+'&lon='+this.lngLat.lng+'&zoom=18&format=jsonv2&accept-language=ru&countrycodes=ru&limit=10&polygon_geojson=1')
                .catch(error => { this.error = error; });
            this.mapObjectDefaults(cnObject);
            // -- Объекты слоёв с объявлениями
            // Коэффициент расширения области поиска объектов, в зависимости от масштаба (масштаб 18 - максимальный)
            const factor = 1 + 18 - this.map.getZoom();
            const bounds = this.pointOffset(this.lngLat, factor*0.00005);
            const paged = await this.$axios
                .$get('api/v1/realty/all/?layer_type=A&in_bbox=' + this.boundsStr(bounds))
                .catch(error => { this.error = error; });
            
            if (!this.error && paged && paged.results) {
                this.OSMObject = cnObject;
                this.advObjects = paged.results;
                this.loading = false;
            }
        },
    }
}
</script>