<template>
  <div class="p-3">
    <div class="text-primary mb-2" style="text-transform: uppercase">
      <i class="fas fa-map-marker-alt fw mr-1"></i> Район поиска
    </div>
    <div class="form-group ml-2">
      <label for="address">введите адрес объекта</label>
      <div class="dropdown">
        <input id="address" v-model="search.address" class="form-control dropdown-toggle" type="text" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" placeholder="адрес объекта" @focus="saShowDropDown = true" @click="saShowDropDown = true" @keyup.enter="jumpToAddress()" @keyup.down="nextSaVariant()" @keyup.up="prevSaVariant()" @keyup.esc="saShowDropDown = false">
        <div v-if="saShowDropDown && saVariants.length" class="dropdown-menu show shadow mt-0" aria-labelledby="dropdownMenuButton">
          <a v-for="(variant, index) in saVariants" :key="variant.place_id" :class="{'dropdown-item': true, 'active': index==saActiveIndex}" href="#" @click.prevent="jumpToAddress(index)">
            <i :class="[variant.icon, 'fa-fw']"></i> {{ variant.category_rus || variant.category }}: {{ variant.shortName }}
          </a>
        </div>
      </div>
      <div class="my-2">или укажите область поиска</div>
      <div class="btn-group btn-group-toggle" data-toggle="buttons">
        <label :class="{'btn btn-light': true, 'active': mapMode === 'frameCircle'}">
          <input v-model="mapMode" type="radio" name="mapMode" value="frameCircle"><i
            class="far fa-circle fw mr-1"></i> Круг
        </label>
        <label :class="{'btn btn-light': true, 'active': mapMode === 'frameRect'}">
          <input v-model="mapMode" type="radio" name="mapMode" value="frameRect"><i
            class="far fa-square fw mr-1"></i> Прямоугольник
        </label>
      </div>
    </div>
    <b-form-group>
      <div class="text-primary" style="text-transform: uppercase">
        <i class="fas fa-layer-group fw mr-1"></i> Слои поиска
      </div>
      <div class="form-group ml-2">
        <span v-if="!layersTreeData.length" class="text-muted">слои поиска не загружены</span>
        <ks-tree-input v-else v-model="search.layers" name="sp-layers" border="none" height="200px" :tree-data="layersTreeData" :select-filter="true"></ks-tree-input>
      </div>

      <div class="text-primary" style="text-transform: uppercase">
        <i class="fas fa-tasks fw mr-1"></i> Атрибуты поиска
      </div>
      <div class="form-group ml-2">
        <div v-for="(field, name) in searchFields" :key="name">
          <div class="my-1" v-b-toggle="'collapse-'+name">
            <i class="fas fa-fw fa-angle-down when-open"></i><i class="fas fa-fw fa-angle-right when-closed"></i>
            {{ field.label }}
          </div>
          <b-collapse :id="'collapse-'+name" class="my-1 pl-2">
            <div v-if="field.type === 'decimal'" class="form-row">
              <div class="col">
                <b-form-input :id="'input-'+name+'-min'" type="number" placeholder="от" v-model="searchAttribs[name+'_min']"></b-form-input>
              </div>
              <div class="col">
                <b-form-input :id="'input-'+name+'-max'" type="number" placeholder="до" v-model="searchAttribs[name+'_max']"></b-form-input>
              </div>
            </div>  
            <div v-else-if="field.type === 'choice'">
              <b-form-checkbox-group v-model="searchAttribs[name]">
                <div v-for="(choice, index) in field.choices" :key="index" class="custom-control custom-checkbox">
                  <b-form-checkbox :id="'input-'+name+'-'+index" :value="choice.value">
                    <label class="custom-control-label1" :for="'input-'+name+'-'+index">{{ choice.display_name }}</label>
                  </b-form-checkbox>
                </div>
              </b-form-checkbox-group>
            </div>
          </b-collapse>
        </div>
        <div class="mt-2 text-center">
          <a href="#" @click.prevent="attrModalVisible = true" class="text-muted">Все атрибуты поиска <i class="fas fa-grip-horizontal" style="vertical-align: text-bottom;"></i></a>
          <b-modal v-model="attrModalVisible" centered>
            <template #modal-title>
              <i class="fas fa-grip-horizontal mr-2" style="font-size: .9em;"></i> Все атрибуты поиска
            </template>
            <div v-for="(field, name) in realtyFields.buildings" :key="name">
              <div class="my-1">
                {{ field.label }}
              </div>
            </div>
          </b-modal>
        </div>
      </div>
    </b-form-group>
    <div class="text-right">
      <b-button variant="light" @click="findObjects()">К результатам <i class="fas fa-caret-right fa-fw"></i></b-button>    
    </div>
    <div class="text-right">
      <b-button variant="light" @click="searchReset()">Сброс <i class="fas fa-caret-right fa-fw"></i></b-button>    
    </div>
  </div>
</template>

<script>
  import { EventBus } from '../store/eventbus';

  export default {
    name: 'SearchPanel',
    props: {
    },
    data() {
      return {
        search: {
            address: '',
            layers: []
        },
        saShowDropDown: false,
        saActiveIndex: 0,
        saVariants: [],
        searchAttribs: {},
        attrModalVisible: false
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
      realtyFields: {
        get () { return this.$store.state.realtyFields },
        set (value) { this.$store.commit('setRealtyFields', value) }
      },
      searchFields: {
        get () { return this.$store.state.searchFields },
        set (value) { this.$store.commit('setSearchFields', value) }
      },
    },
    watch: {
      'search.address'(address) {
        this.getsaVariants(address);
        this.saActiveIndex = 0;
      }
    },
    mounted() {
      // Добавляем событие клика на странице onDocumentClick
      document.addEventListener('click', this.onDocumentClick);
    },
    beforeDestroy() {
      // Убираем событие клика на странице onDocumentClick
      document.removeEventListener('click', this.onDocumentClick);
    },
    methods: {
      onDocumentClick(event) {
        if (!event.target.matches('#address')) {
          this.saShowDropDown = false;
        }
      },       
      nextSaVariant() {
          if (this.saVariants.length-1 > this.saActiveIndex)
              this.saActiveIndex++;
      },
      prevSaVariant() {
          if (this.saActiveIndex > 0)
              this.saActiveIndex--;
      },
      async getsaVariants(address) {
          if (address) {
              this.saVariants = await this.$axios
              .$get(process.env.search_server + '/search.php?q='+encodeURIComponent(address)+'&addressdetails=1&format=jsonv2&accept-language=ru&countrycodes=ru&limit=10&polygon_geojson=1')
              .catch(error => {
                  console.log(error);
              });
              this.saVariants.forEach(variant => {
              this.mapObjectDefaults(variant);
              });
          }
      },
      jumpToAddress(variantIndex) {
        if (typeof variantIndex !== 'undefined') this.saActiveIndex = variantIndex;
        if (this.saVariants.length > 0 && this.saActiveIndex < this.saVariants.length) {
          this.goToAddress = this.saVariants[this.saActiveIndex];
          this.saShowDropDown = false;
          }
      },

      findObjects() {
        EventBus.$emit('findObjectsByParams', { filterParams: this.searchAttribs, searchLayers: this.search.layers })
      },

      searchReset() {
        this.searchAttribs = {}
        this.search.layers = []
        EventBus.$emit('findObjectsByParams', { ilterParams: this.searchAttribs, searchLayers: this.search.layers })
      }
    },
  }
</script>