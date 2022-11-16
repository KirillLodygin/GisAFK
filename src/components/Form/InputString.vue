<template>
  <b-form-group :label="title" :label-for="id">
    <b-form-input
      :id="id"
      :value="value"
      :placeholder="placeholder"
      required
      :readonly="isReadonly"
      @input="onInput"
    ></b-form-input>
  </b-form-group>
</template>

<script>
export default {
  name: 'InputString',
  props: {
    title: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    isReadonly: {
      type: Boolean,
      required: false
    }
  },
  /*
  watch: {
    value: {
      handler(newValue, oldValue) {

      },
    },
  },
  */
  computed: {
    label_lower() {
      return (this.label) ? this.label.toLowerCase() : this.label;
    },
  },
  methods: {

    onInput(event) {
      this.$emit('input', event.target.value);
    },

    /*

   onChange(event) {
     this.$emit('change', event.target.value);
   },
   */

  },
}
</script>
