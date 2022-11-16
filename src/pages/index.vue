<template>
  <div>
    <b-navbar id="mainNav" class="fixed-top">
      <b-container>
        <b-navbar-brand class="p-0" href="/"
          ><img src="/img/gisanda_logo.svg"
        /></b-navbar-brand>
        <b-navbar-nav class="ml-auto">
          <b-nav-item
            @click.prevent="toggleSidePanel('layers')"
            href="#"
            title="Управление слоями"
          >
            <i id="layers-ico" class="fas fa-layer-group nav-icon"></i>
          </b-nav-item>
          <b-nav-item
            href="#"
            title="Список аналогов"
            :class="{ 'nav-warning position-relative': analogs.length || aim }"
            @click.prevent="toggleSidePanel('analogs')"
          >
            <span
              v-if="analogs.length || aim"
              class="badge badge-primary position-absolute"
              style="left: 30px; top: 0px; z-index: 10"
              >{{ analogs.length + (aim ? 1 : 0) }}</span
            >
            <i id="fav-ico" class="fas fa-star nav-icon"></i>
          </b-nav-item>
          <b-nav-item href="#" title="Список уведомлений">
            <i id="notify-ico" class="fas fa-bell nav-icon"></i>
          </b-nav-item>
          <b-nav-item-dropdown>
            <template #button-content>
              <i id="usr-ico" class="fas fa-user-circle mr-sm-2 nav-icon"></i>
              <span class="d-none d-sm-inline">{{ $auth.user.email }}</span>
            </template>
            <b-dropdown-item @click="showProfile">
              <i class="fas fa-address-card fa-fw"></i> Профиль
            </b-dropdown-item>
            <b-dropdown-item href="/logout" @click.prevent="$auth.logout()">
              <i class="fas fa-sign-out-alt fa-fw"></i> Выход
            </b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-container>
    </b-navbar>

    <div id="wrapper">
      <b-navbar-nav
        id="accordionSidebar"
        class="bg-gradient-primary sidebar sidebar-dark accordion p-top-offset-1"
      >
        <layers-panel
          v-if="isSidePanel('layers')"
          @update-layers="loadLayersTree()"
        ></layers-panel>
        <analogs-panel v-else-if="isSidePanel('analogs')"></analogs-panel>
        <details-panel
          v-else-if="isSidePanel('details')"
          :selectedMapObjectDetails="selectedMapObjectDetails"
        ></details-panel>
        <search-panel v-else-if="isSidePanel('search') && searchFields"></search-panel>
      </b-navbar-nav>
      <div id="content-wrapper" class="p-top-offset-1">
        <map-component
          ref="vMap"
          class="vh-100-p-top-offset-1"
          :object-names="objectNames"
          :initial-state="initialState"
          :object-evaluation="objectEvaluation"
          :is-profile="isProfile"
          @showObjectEvaluationAndAnalogues="showObjectEvaluationAndAnalogues"
          @selectObjectEvaluation="selectObjectEvaluation"
          @closeProfile='closeProfile'
        ></map-component>
      </div>
    </div>
    <div>
      <calc-table
        ref="tableCalc"
        :objectEvaluation="objectEvaluation"
        :analogues="analogues"
        :tableFields="tableFields"
      ></calc-table>
    </div>
    <div>
      <map-object-properties
        v-if="selectedMapObjectDetails"
        ref="tableObjectInfo"
        :data="selectedMapObjectDetails.data"
        :options="selectedMapObjectDetails.options"
        @cancel="resetObjectEvaluation"
      />
    </div>
    <div>
      <b-modal
        id="errorModal"
        centered
        title="Ошибка"
        header-bg-variant="danger"
        header-text-variant="light"
      >
        <p>{{ errorModal.text }}</p>
        <template #modal-footer>
          <b-button type="button" variant="secondary" @click="$bvModal.hide('errorModal')"
            >Закрыть</b-button
          >
        </template>
      </b-modal>
    </div>
  </div>
</template>

<script>
export default {
  name: "IndexPage",
  data() {
    return {
      initialState: {
        // lat: 55.63695765,
        // lng: 37.3568355,
        lat: null,
        lng: null,
        zoom: 16,
        url: process.env.tile_server + "/",
      },

      realEstateModel: {},

      objectNames: [
        // 'Шолохова 1 Москва',
        // 'Шолохова 2 Москва',
        // 'Шолохова 3 Москва' ,
        // 'Шолохова 4 к1 Москва',
        // 'Шолохова 6 с1 Москва',
        // 'Шолохова 8 Москва',
        // 'Шолохова 8 к1 Москва'
      ],

      order: {},

      objectEvaluation: {},
      analogues: [],

      tableFields: {},

      fields: [],
      items: [],

      selectedMapObjectDetails: null,

      errorModal: {
        text: "",
      },

      isProfile: false
    };
  },
  computed: {
    sidePanel: {
      get() {
        return this.$store.state.sidePanel;
      },
      set(value) {
        this.$store.commit("setSidePanel", value);
      },
    },
    selectedMapObject: {
      get() {
        return this.$store.state.selectedMapObject;
      },
      set(value) {
        this.$store.commit("setSelectedMapObject", value);
      },
    },
    layersTreeData: {
      get() {
        return this.$store.state.layersTreeData;
      },
      set(value) {
        this.$store.commit("setLayersTreeData", value);
      },
    },
    analogs: {
      get() {
        return this.$store.state.analogs;
      },
      set(value) {
        this.$store.commit("setAnalogs", value);
      },
    },
    aim: {
      get() {
        return this.$store.state.aim;
      },
      set(value) {
        this.$store.commit("setAim", value);
      },
    },
    realtyFields: {
      get() {
        return this.$store.state.realtyFields;
      },
      set(value) {
        this.$store.commit("setRealtyFields", value);
      },
    },
    searchFields: {
      get() {
        return this.$store.state.searchFields;
      },
      set(value) {
        this.$store.commit("setSearchFields", value);
      },
    },
  },
  watch: {
    selectedMapObject(mapObject) {
      this.getMapObjectDetails(mapObject);
     // this.selectObjectEvaluation(mapObject.id);
    },
  },
  mounted() {
    this.loadRealtyFields();
    this.loadLayersTree();
  },
  beforeDestroy() {},

  async asyncData({ $axios }) {
    try {
      const allChoices = await $axios.$get("api/v1/realty/choices/").catch((error) => {
        console.log(error);
      });

      const realEstateModel = await $axios
        .options("api/v1/realty/landplots/")
        .catch((error) => {
          console.log(error);
        });

      return { allChoices, realEstateModel };
    } catch (error) {
      console.log(error);
    }
  },

  errorCaptured: (err, vm, info) => {
    console.log(err);
    console.log(err.message, vm, info);
  },

  methods: {
    isSidePanel(panel) {
      return this.$store.getters.isSidePanel(panel);
    },
    toggleSidePanel(panel) {
      this.$store.dispatch("toggleSidePanel", panel);
    },
    // Загружаем подробные данные об объекте
    async getMapObjectDetails(mapObject) {
      if (!mapObject || !mapObject.id) return;

      const objectTypes = { L: "landplots", B: "buildings", Q: "quaters" };
      const objectType = objectTypes[mapObject.object_type];
      const _data = await this.$axios
        .$get("api/v1/realty/" + objectType + "/" + mapObject.id + "/")
        .catch((error) => {
          console.log(error);
        });

      this.selectedMapObjectDetails = {
        data: _data,
        options: this.realtyFields[objectType],
      };
      this.sidePanel = "details";
      this.$refs.tableObjectInfo.show();
    },

    // Загрузка списка (дерева) слоёв для отображения на панели поиска
    async loadLayersTree() {
      var treeData = await this.$axios
        .$get("api/v1/layers/geo_layer_tree/")
        .catch((error) => {
          this.errorModal.text = error;
          this.$bvModal.show("errorModal");
        });
      treeData.push({
        node: {
          id: "search",
          name: "search",
          descr: null,
          color: "#ff0000",
          caption: null,
          file_name: null,
          layer_type: "A",
          glyph_name: "fas fa-circle",
          tn_parent: null,
        },
        tree: [],
      });
      this.setLayersTreeDataDefaults(treeData);
      this.layersTreeData = treeData;
    },

    setLayersTreeDataDefaults(_tree) {
      var memory = [];
      // в начале память содержит ссылки на корневые элементы
      _tree.forEach((item) => memory.push(item));
      let curItem; // текущий элемент

      // закончить цикл, если не получается извлечь элемент из памяти
      while (memory.length) {
        curItem = memory.pop();
        curItem.loading = false;
        curItem.objCount = null;
        curItem.percentLoaded = null;
        if (curItem.tree) {
          // помещаем дочерние элементы в память
          for (let i = 0; i < curItem.tree.length; i++) {
            memory.push(curItem.tree[i]);
          }
        }
      }
      return true;
    },

    // Загрузка списка полей
    async loadRealtyFields() {
      const objectTypes = ["landplots", "buildings", "quaters"];

      for (const objectType of objectTypes) {
        const fieldsResp = await this.$axios
          .options("api/v1/realty/" + objectType + "/")
          .catch((error) => {
            console.log(error);
          });
        this.realtyFields[objectType] = fieldsResp.data.actions.POST;
      }

      const sFieldsResp = await this.$axios
        .get("api/v1/realty/search_fields/")
        .catch((error) => {
          console.log(error);
        });
      const sFields = JSON.parse(sFieldsResp.data).base_search_fields;
      const searchFields = {};
      for (const sField of sFields) {
        searchFields[sField] = {};
        for (const objectType of objectTypes) {
          if (this.realtyFields[objectType][sField]) {
            searchFields[sField] = this.realtyFields[objectType][sField];
            break;
          }
        }
      }
      this.searchFields = searchFields;
    },

    async getObjectEvaluationAndAnaloguesFromOrder(orderId) {
      try {
        // Пока в базе один заказ, выбираем все, но надо отбирать по идентификатору
        const orders = await this.$axios
          .$get("api/v1/order/orders/" + orderId)
          .catch((error) => {
            console.log(error);
          });
        this.order = orders[0];

        if (this.order) {
          this.objectEvaluation = this.order.source;
          const objectAnalogues = [];
          this.order.analogues.forEach((analogue) => {
            objectAnalogues.push(analogue.source);
          });
          this.analogues = objectAnalogues;
        }
      } catch (error) {
        console.log(error);
      }
    },

    resetObjectEvaluation() {
      this.objectEvaluation = {};
    },

    async getObjectEvaluation(objectId) {
      try {
        this.objectEvaluation = await this.$axios
          .$get("api/v1/realty/landplots/" + objectId)
          .catch((error) => {
            console.log(error);
          });
      } catch (error) {
        console.log(error);
      }
    },

    async getAnalogues(e) {
      try {
        this.analogues = [];
        for (const objectId of e) {
          const analogue = await this.$axios
            .$get("api/v1/realty/landplots/" + objectId)
            .catch((error) => {
              console.log(error);
            });
          if (analogue) this.analogues.push(analogue);
        }
      } catch (error) {
        console.log(error);
      }
    },

    getAddress(addressValues, addressFields) {
      try {
        var addressText = [];
        for (const key in addressFields) {
          if (
            addressValues[key] &&
            addressValues[key] !== "" &&
            key !== "id" &&
            key !== "raw"
          )
            addressText.push(addressFields[key].label + " " + addressValues[key]);
        }
        if (addressText.length > 0) {
          return addressText.join(", ");
        } else {
          return addressValues.raw;
        }
      } catch (error) {
        console.log(error);
      }
    },

    selectObjectEvaluation(e) {
      this.objectEvaluation = {};

      this.getObjectEvaluation(e)
        .then(() => {
          if (this.objectEvaluation) {
            this.fields = [];

            this.fields.push({
              key: "number",
              label: "N",
            });

            this.fields.push({
              key: "parameter",
              label: "Наименование показателя",
            });

            this.fields.push({
              key: "Object" + this.objectEvaluation.pk,
              label: "Объект оценки",
            });

            this.items = [];
            let number = 1;
            for (const key in this.realtyFields.landplots) {
              const parameter = this.realtyFields.landplots[key];
              if (
                (key !== "pk" &&
                  parameter.type !== "nested object" &&
                  parameter.type !== "field") ||
                key === "address"
              ) {
                const item = {};
                item.number = number++;
                item.parameter = parameter.label;
                item["Object" + this.objectEvaluation.pk] = this.objectEvaluation[key];
                if (parameter.type === "boolean") {
                  if (this.objectEvaluation[key] === "true") {
                    item["Object" + this.objectEvaluation.pk] = "Да";
                  } else {
                    item["Object" + this.objectEvaluation.pk] = "Нет";
                  }
                }
                if (parameter.type === "choice") {
                  const choices = parameter.choices;
                  choices.forEach((choice) => {
                    if (this.objectEvaluation[key] === choice.value) {
                      item["Object" + this.objectEvaluation.pk] = choice.display_name;
                    }
                  });
                }
                if (key === "address") {
                  item["Object" + this.objectEvaluation.pk] = this.getAddress(
                    this.objectEvaluation[key],
                    parameter.children
                  );
                }

                this.items.push(item);
              }
            }

            this.$refs.tableObjectInfo.show();
          } else {
            alert("Объект не найден в базе данных!");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },

    showObjectEvaluationAndAnalogues(e) {
      this.items = [];

      if (e.length > 0) {
        // Если есть выделенные объекты, то сначала смотрим, есть ли они в избранном (среди аналогов)
        // Если есть, то вычисления строим по выделенным избранным, если нет, то вычисления строим по всем выделенным объектам

        if (this.aim && this.analogs.length > 0) {
          // Если есть избранные объекты, то используем их
          const advObjectsId = this.analogs.map((analog) => analog.id);
          const analogsId = advObjectsId.filter((x) => e.includes(x));
          this.getObjectEvaluation(this.aim.id).then(() => {
            this.getAnalogues(analogsId).then(() => {
              if (this.analogues.length > 0) {
                this.tableFields = this.realtyFields.landplots;
                this.$refs.tableCalc.setObjectItems(this.realtyFields.landplots, 0);
                this.$bvModal.show("tableCalc");
              } else {
                alert("Объекты не найдены в базе данных!");
              }
            });
          });
        } else {
          this.getAnalogues(e).then(() => {
            if (this.analogues.length > 0) {
              this.tableFields = this.realtyFields.landplots;
              this.$refs.tableCalc.setObjectItems(this.realtyFields.landplots, 0);
              this.$bvModal.show("tableCalc");
            } else {
              alert("Объекты не найдены в базе данных!");
            }
          });
        }
      } else {
        this.order = {};
        // Если выбранных объектов нет, то ищем по заказам (сейчас в базе только один заказ, его и используем)
        this.getObjectEvaluationAndAnaloguesFromOrder("").then(() => {
          if (this.analogues.length > 0) {
            this.tableFields = this.realtyFields.landplots;
            this.$refs.tableCalc.setObjectItems(this.realtyFields.landplots, 0);
            this.$bvModal.show("tableCalc");
          } else {
            alert("Заказы не найдены в базе данных!");
          }
        });
      }
    },
    showProfile() {
      this.isProfile = true
    },
    closeProfile() {
      console.log('closeProfile')
      this.isProfile = false
    }
  },
};
</script>

<style>
.scrollbar {
  width: 100%;
  min-width: 300px;
  max-height: 450px;
}

.scroll {
  background: #eee;
  min-width: 2000px;
}

.cell {
  display: inline-block;
  margin: 5px;
}
</style>
