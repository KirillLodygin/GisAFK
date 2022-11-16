<template>
  <b-form action="#" @submit.prevent validated>
    <b-modal
      size="xl"
      centered
      body-class="overflow-hidden"
      id="tableObjectInfo"
      title="Объявление"
    >
      <div class="h-100">
        <b-tabs
          class="tabs-style"
          active-tab-class="tab"
          content-class="tab-content-style"
        >
          <b-tab title="Стандартные поля">
            <div class="tab-content-wrapper">
              <div class="input-container">
                <div class="short-input">
                  <label>{{ mutableOptions.object_type.label }}</label
                  ><br />
                  <b-form-select
                    v-model="mutableData.object_type"
                    :disabled="mutableOptions.object_type.read_only"
                    :required="mutableOptions.object_type.required"
                  >
                    <b-form-select-option
                      v-for="(field_obj, key_obj) in mutableOptions.object_type.choices"
                      :key="key_obj"
                      :value="field_obj.value"
                      >{{ field_obj.display_name }}</b-form-select-option
                    >
                  </b-form-select>
                  <button class="btn btn-primary mb-2 mt-2" @click="changeObjectType()">
                    Подтвердить изменение типа
                  </button>
                </div>
              </div>
              <div
                v-for="(field, key) in mutableOptions"
                :key="key"
                class="input-container"
              >
                <template
                  v-if="
                    key === 'geo_pos' ||
                    key === 'geo_layer' ||
                    key === 'images_links' ||
                    key === 'files' ||
                    key === 'object_type'
                  "
                ></template>

                <div v-else-if="key === 'ads_misc'">
                  <label>{{ field.label }}</label
                  ><br />
                  <div
                    v-for="(value, key_obj) in mutableData[key]"
                    :key="key_obj"
                    class="nested"
                  >
                    <label>{{ key_obj }}</label>
                    <b-form-input v-model="mutableData[key][key_obj]" />
                  </div>
                </div>

                <div v-else-if="field.type == 'nested object' && mutableData[key]">
                  <label>{{ field.label }}</label
                  ><br />
                  <NestedObject
                    :options="field.children"
                    :data="mutableData[key]"
                    @change="mutableData[key] = $event"
                    class="nested"
                  ></NestedObject>
                </div>

                <div v-else-if="field.type == 'integer'" class="short-input">
                  <label>{{ field.label }}</label
                  ><br />
                  <b-form-input
                    v-model="mutableData[key]"
                    type="number"
                    :disabled="field.read_only"
                    :required="field.required"
                  />
                </div>

                <div v-else-if="field.type == 'decimal'" class="short-input">
                  <label>{{ field.label }}</label
                  ><br />
                  <b-form-input
                    v-model="mutableData[key]"
                    type="number"
                    step="0.01"
                    :disabled="field.read_only"
                    :required="field.required"
                  />
                </div>

                <div v-else-if="field.type == 'date'" class="short-input">
                  <label>{{ field.label }}</label
                  ><br />
                  <b-form-input
                    v-model="mutableData[key]"
                    type="date"
                    :disabled="field.read_only"
                    :required="field.required"
                  />
                </div>

                <div
                  v-else-if="field.type == 'string' && field.max_length"
                  class="short-input"
                >
                  <label>{{ field.label }}</label
                  ><br />
                  <b-form-input
                    v-model="mutableData[key]"
                    :disabled="field.read_only"
                    :required="field.required"
                  />
                </div>

                <div v-else-if="field.type == 'string' && !field.max_length">
                  <label>{{ field.label }}</label
                  ><br />
                  <b-form-textarea
                    v-model="mutableData[key]"
                    :disabled="field.read_only"
                    :required="field.required"
                  />
                </div>

                <div v-else-if="field.type == 'boolean'" class="short-input">
                  <label>{{ field.label }}</label
                  ><br />
                  <b-form-radio-group
                    v-model="mutableData[key]"
                    :disabled="field.read_only"
                    :required="field.required"
                  >
                    <b-form-radio value="true">да</b-form-radio>
                    <b-form-radio value="false">нет</b-form-radio>
                  </b-form-radio-group>
                </div>

                <div v-else-if="field.type == 'datetime'" class="short-input">
                  <label>{{ field.label }}</label
                  ><br />
                  <DateTime
                    v-model="mutableData[key]"
                    :disabled="field.read_only"
                    :required="field.required"
                  ></DateTime>
                </div>

                <b-form-checkbox-group
                  v-else-if="field.type == 'list'"
                  v-model="mutableData[key]"
                  :aria-describedby="ariaDescribedby"
                  class="short-input"
                  :disabled="field.read_only"
                  :required="field.required"
                >
                  <label>{{ field.label }}</label
                  ><br />
                  <b-form-checkbox
                    :value="field_obj.value"
                    v-for="(field_obj, key_obj) in field.child.choices"
                    :key="key_obj"
                    >{{ field_obj.display_name }}</b-form-checkbox
                  >
                </b-form-checkbox-group>

                <div v-else-if="field.type == 'choice'" class="short-input">
                  <label>{{ field.label }}</label
                  ><br />
                  <b-form-select
                    v-model="mutableData[key]"
                    :disabled="field.read_only"
                    :required="field.required"
                  >
                    <b-form-select-option
                      v-for="(field_obj, key_obj) in field.choices"
                      :key="key_obj"
                      :value="field_obj.value"
                      >{{ field_obj.display_name }}</b-form-select-option
                    >
                  </b-form-select>
                </div>

                <div v-else-if="mutableData[key]">
                  <label>{{ field.label }}</label
                  ><br />
                  <b-form-input
                    v-model="mutableData[key]"
                    :disabled="field.read_only"
                    :required="field.required"
                  />
                </div>
              </div>
            </div>
          </b-tab>

          <b-tab title="Работа с файлами">
            <div class="tab-content-wrapper">
              <div
                v-for="(field, key) in mutableOptions"
                :key="key"
                class="input-container"
              >
                <div v-if="key === 'images_links'" class="short-input">
                  <label>{{ field.label }}</label
                  ><br />

                  <b-form-input
                    placeholder="Добавить изображение"
                    @blur="addImage(key, $event)"
                  ></b-form-input>

                  <LightGallery
                    :images="mutableData[key]"
                    :index="selectedImage"
                    @close="selectedImage = null"
                  ></LightGallery>

                  <div class="images-container">
                    <div v-for="(value, key_obj) in mutableData[key]" :key="key_obj">
                      <div v-if="value !== ''" class="image-container">
                        <b-img
                          :src="value"
                          rounded
                          fluid
                          thumbnail
                          @click="selectedImage = key_obj"
                        ></b-img>
                        <b-button
                          class="close-button"
                          @click="mutableData[key].splice(key_obj, 1)"
                        >
                          <i class="fas fa-times fa-1 text-dark"></i>
                        </b-button>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else-if="key === 'files'" class="short-input">
                  <label>{{ field.label }}</label>

                  <div v-if="selectedImageFile" class="selected-image">
                    <b-img
                      :src="baseURL + selectedImageFile"
                      fluid
                      rounded
                      thumbnail
                      @click="selectedImageFile = null"
                    ></b-img>
                  </div>

                  <b-form-file
                    v-model="currentFiles"
                    placeholder="Файл"
                    multiple
                  ></b-form-file>
                  <b-button @click="fileUpload()" class="mb-2 mt-2">Загрузить</b-button>

                  <template v-if="mutableData[key].length !== 0">
                    <div
                      v-for="(file, index) of mutableData[key]"
                      :key="index"
                      class="file"
                    >
                      <div
                        v-if="isImage(file.original_filename)"
                        @click="selectedImageFile = file.url"
                      >
                        <span>{{ file.original_filename }}</span>
                        <b-img
                          :src="baseURL + file.url"
                          fluid
                          rounded
                          thumbnail
                          width="75"
                          height="75"
                        ></b-img>
                      </div>

                      <template v-else>
                        <a :href="baseURL + file.url" download class="download-link">
                          <!-- <strong>{{ file.name }}</strong> -->
                          <span>{{ file.original_filename }}</span>
                        </a>
                      </template>

                      <b-button class="close-button" @click="fileDelete(file.pk)">
                        <i class="fas fa-times fa-1 text-dark"></i>
                      </b-button>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </b-tab>
        </b-tabs>
      </div>
      <template #modal-footer="{ ok, cancel }">
        <button
          class="btn btn-primary mr-auto button-footer"
          @click="saveMapObject(mutableData)"
        >
          Сохранить
        </button>
        <button class="btn btn-secondary button-footer" @click="cancel()">
          Отменить
        </button>
        <button
          class="btn btn-primary button-footer"
          @click="
            saveMapObject(mutableData);
            ok();
          "
        >
          Сохранить и закрыть
        </button>
      </template>
    </b-modal>
  </b-form>
</template>

<script>
import mime from "mime";
import DateTime from "./Form/DateTime.vue";

export default {
  name: "MapObjectProperties",
  props: {
    data: { type: Object },
    options: { type: Object },
  },
  data() {
    return {
      mutableData: this.data,
      mutableOptions: this.options,
      selectedImage: null,
      selectedImageFile: null,
      currentFiles: [],
      objectTypes: { Q: "quaters", B: "buildings", L: "landplots" },
    };
  },
  computed: {
    baseURL() {
      return process.env.baseURL;
    },
  },
  methods: {
    show() {
      this.$bvModal.show("tableObjectInfo");
    },

    async saveMapObject(mutableData) {
      await this.$axios
        .put(
          `api/v1/realty/${this.objectTypes[mutableData.object_type]}/${mutableData.pk}/`,
          mutableData
        )
        .catch((error) => {
          console.log(error);
        });
    },

    async changeObjectType() {
      const type = this.mutableData.object_type;
      if (this.previousType === type) {
        console.log("cancel");
        return;
      }

      // await this.$axios.delete(`api/v1/realty/${this.objectTypes[this.previousType]}/`)
      let options, data;
      try {
        options = await this.$axios.options(`api/v1/realty/${this.objectTypes[type]}/`);
        data = await this.$axios.post(
          `api/v1/realty/${this.objectTypes[type]}/`,
          this.mutableData
        );
      } catch (error) {
        console.error(error);
        this.mutableData.object_type = this.previousType;
        return;
      }

      this.mutableOptions = {};
      this.mutableData = data.data;
      this.mutableOptions = options.data.actions.POST;
      this.previousType = this.mutableData.object_type;
    },

    async fileUpload() {
      const formdata = new FormData();
      for (const file of this.currentFiles) {
        formdata.append("files", file);
      }

      const resp = await this.$axios
        .post(
          "api/v1/realty/" +
            this.objectTypes[this.mutableData.object_type] +
            "/" +
            this.mutableData.pk +
            "/upload_file/",
          formdata,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .catch((error) => {
          console.log(error);
        });

      this.mutableData = resp.data;
      this.currentFiles = {};
    },

    async fileDelete(id) {
      const resp = await this.$axios.delete(
        `api/v1/realty/${this.objectTypes[this.mutableData.object_type]}/${
          this.mutableData.pk
        }/delete_file/?file_id=${id}`
      );
      this.mutableData = resp.data;
    },

    addImage(key, event) {
      if (!event.target.value) {
        return;
      }
      if (!this.mutableData[key]) {
        this.mutableData[key] = [];
        this.mutableData[key].push(event.target.value);
        event.target.value = "";
      }
      if (this.mutableData[key][this.mutableData[key].length - 1]) {
        this.mutableData[key].push(event.target.value);
        event.target.value = "";
      } else {
        this.mutableData[key][this.mutableData[key].length - 1] = event.target.value;
        event.target.value = "";
      }
    },

    isImage(name) {
      if (typeof mime.getType(name) === "string") {
        return mime.getType(name).includes("image/");
      } else {
        return false;
      }
    },
  },
  mounted() {
    for (const key in this.mutableOptions) {
      if (this.mutableOptions[key].type === "list") {
        this.mutableData[key] = [];
      }
    }

    this.$root.$on("ok", () => {
      this.saveMapObject(this.mutableData);
    });
    this.$root.$on("bv::modal::show", () => {
      this.mutableData = this.data;
    });
  },
  watch: {
    data: {
      handler(newValue) {
        this.mutableData = newValue;
        this.mutableOptions = this.options;
        this.selectedImage = null;
        this.selectedImageFile = null;
        this.currentFiles = [];
      },
      deep: true,
    },
  },
  components: { DateTime },
};
</script>

<style scoped>
.input-container {
  display: block;
  position: relative;
  min-width: 100%;
}
.input-container > * {
  margin-bottom: 10px;
}
.close-button {
  position: absolute;
  right: 0px;
  top: 0px;
  background-color: rgba(0, 0, 0, 0);
  box-shadow: none;
}
.image-container {
  position: relative;
  margin-left: 7px;
  min-height: 30px;
  min-width: 60px;
  max-height: 150px;
  max-width: 150px;
}
.images-container {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.nested {
  margin-left: 2%;
}
.short-input {
  width: 48%;
}
.input-container > :not(.short-input) {
  width: 100%;
}
.download-link {
  display: inline-block;
  text-decoration: none;
  color: black;
}
.file {
  position: relative;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  margin-bottom: 10px;
  padding: 0.375rem 0.75rem;
}
.selected-image {
  margin-bottom: 10px;
}
.tab-content-wrapper {
  max-height: 100%;
  overflow-y: auto;
}
.tab {
  margin: 10px;
  height: 100%;
}
.tabs-style {
  height: 94% !important;
}
.button-footer {
  margin: 5px 10px;
}
</style>

<style>
.tab-content-style {
  height: 100% !important;
}
</style>
