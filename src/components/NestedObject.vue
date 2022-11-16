<template>
  <div>
    <div v-for="(field, key) in options" :key="key" class="input-container">
      <template
        v-if="
          (key === 'geo_pos') | (key === 'geo_layer') ||
          key === 'images_links' ||
          key === 'files' ||
          key === 'object_type' ||
          key === 'parent'
        "
      ></template>

      <div v-else-if="key === 'ads_misc'">
        <label>{{ field.label }}</label
        ><br />
        <div v-for="(value, key_obj) in mutableData[key]" :key="key_obj" class="nested">
          <label>{{ key_obj }}</label>
          <b-form-input v-model="mutableData[key][key_obj]" />
        </div>
      </div>

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
              <b-button class="close-button" @click="mutableData[key].splice(key_obj, 1)">
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

        <b-form-file v-model="currentFiles" placeholder="Файл" multiple></b-form-file>
        <b-button @click="fileUpload()" class="mb-2 mt-2">Загрузить</b-button>

        <template v-if="mutableData[key].length !== 0">
          <div v-for="(file, index) of mutableData[key]" :key="index" class="file">
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

      <div v-else-if="field.type == 'nested object' && mutableData[key]">
        <label>{{ field.label }}</label
        ><br />
        <NestedObject
          :options="field.children"
          :data="mutableData[key]"
          @change="mutableData[key] = $event"
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

      <div v-else-if="field.type == 'string' && field.max_length" class="short-input">
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
</template>
<script>
import mime from "mime/lite";

export default {
  name: "NestedObject",
  props: {
    options: Object,
    data: Object,
  },
  data() {
    return {
      mutableData: this.data,
      selectedImage: null,
      selectedImageFile: null,
      currentFiles: [],
      objectTypes: { Q: "quarters", B: "buildings", L: "landplots" },
    };
  },
  computed: {
    baseURL() {
      return process.env.baseURL;
    },
  },
  methods: {
    async fileUpload() {
      const formdata = new FormData();
      for (const file of this.currentFiless) {
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

      this.mutableData.parent = resp.data;
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
      const imageArray = this.mutableData[key];
      if (imageArray[imageArray.length - 1]) {
        imageArray.push(event.target.value);
        event.target.value = "";
      } else {
        imageArray[imageArray.length - 1] = event.target.value;
        event.target.value = "";
      }
    },

    isImage(name) {
      return mime.getType(name).includes("image/");
    },
  },
  mounted() {
    for (const key in this.options) {
      if (this.options[key].type === "list") {
        this.mutableData[key] = [];
      }
    }
  },
  watch: {
    mutableData: {
      handler(newValue) {
        this.$emit("change", newValue);
      },
      deep: true,
    },
  },
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
</style>
