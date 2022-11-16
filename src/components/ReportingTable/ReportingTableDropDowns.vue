<template>
  <div class="dropdowns">
    <b-row class="w-auto mb-1">
      <b-form-group :label="reportingTableTypesTitle" :label-for="reportingTableTypesId" class="mr-5">
        <b-form-select
          :id="reportingTableTypesId"
          v-model="typeSelected"
          :options="reportingTableTypesMeaning"
          class="dropdown-item short-dropdown"
        />
      </b-form-group>
      <b-form-group :label="informationSourcesTitle" :label-for="informationSourcesId" class="mr-5">
        <b-form-select
          :id="informationSourcesId"
          v-model="sourceSelected"
          :options="informationSourcesMeaning"
          class="dropdown-item"
          :disabled="!typeSelected || informationSourcesMeaning.length === 1"
        />
      </b-form-group>
      <b-form-group :label="pricingParameterTitle" :label-for="pricingParameterId">
        <b-form-select
          :id="pricingParameterId"
          v-model="pricingParameterSelected"
          :options="pricingParameterMeaning"
          class="long-dropdown dropdown-item"
          :disabled="!sourceSelected"
        />
      </b-form-group>
    </b-row>
    <b-row class="w-auto mb-1">
      <b-form-group :label="nameUniqueTitle" :label-for="nameUniqueId">
        <b-form-select
          :id="nameUniqueId"
          v-model="nameUniqueSelected"
          :options="nameUniqueMeaning"
          class="long-dropdown dropdown-item"
          :disabled="!pricingParameterSelected"
        />
      </b-form-group>
    </b-row>
  </div>
</template>

<script>
// TODO-Кирилл: нужно добавить скелетоны загрузки и описать условия для их отрисовки
export default {
  name: 'ReportingTableDropDowns',
  props: {
    informationSourcesTitle: {
      type: String,
      required: true,
    },
    informationSourcesMeaning: {
      type: Array,
      required: true,
    },
    informationSourcesId: {
      type: String,
      required: true,
    },
    reportingTableTypesTitle: {
      type: String,
      required: true,
    },
    reportingTableTypesMeaning: {
      type: Array,
      required: true,
    },
    reportingTableTypesId: {
      type: String,
      required: true,
    },
    pricingParameterTitle: {
      type: String,
      required: true,
    },
    pricingParameterMeaning: {
      type: Array,
      required: true,
    },
    pricingParameterId: {
      type: String,
      required: true,
    },
    nameUniqueTitle: {
      type: String,
      required: true,
    },
    nameUniqueMeaning: {
      type: Array,
      required: true,
    },
    nameUniqueId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      sourceSelected: null,
      pricingParameterSelected: null,
      typeSelected: null,
      nameUniqueSelected: null,
    }
  },
  watch: {
    typeSelected(currentValue) {
      this.$emit('getNewType', currentValue)
      this.pricingParameterSelected = null
      this.sourceSelected = null
      this.nameUniqueSelected = null
    },

    sourceSelected(currentValue) {
      this.$emit('getSourceNewValue', currentValue)
      this.pricingParameterSelected = null
      this.nameUniqueSelected = null
    },

    pricingParameterSelected(currentValue) {
      this.$emit('getNewPricingParameter', currentValue)
      this.nameUniqueSelected = null
    },

    nameUniqueSelected(currentValue) {
      this.$emit('getTableNameUnique', currentValue)
    },
  },
}
</script>

<style scoped>
.long-dropdown {
  box-sizing: border-box;
  width: 400px;
}

.short-dropdown {
  box-sizing: border-box;
  width: 300px;
}

.dropdown-item {
  font-size: 12px;
}

.dropdowns {
  font-size: 14px;
}
</style>
