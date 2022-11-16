<template>
  <b-form-group :label="title" :label-for="id">
    <b-form-select :id="id" v-model="selected" :options="options"/>
  </b-form-group>
</template>

<script>

export default {
  name: 'ProfileDropDownList',
  props: {
    title: {
      type: String,
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      required: false,
    },
  },
  data() {
    return {
      selected: null,
    }
  },
  watch: {
    selected(currentValue) {
      this.$emit('getNewRole', currentValue)
    }
  }
}
</script>

<style scoped></style>
