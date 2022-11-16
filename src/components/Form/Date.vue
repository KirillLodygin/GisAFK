<template>
  <div>
    <label v-if="label">{{ label_lower }}</label>
    <b-form-input :type="date"></b-form-input>
  </div>
</template>

<script>
export default {
  name: 'Date',
  props: {
    label: {
      type: String,
      required: false,
    },
    value: {
      type: String,
      required: true,
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

    /*
    onInput(event) {
      this.$emit('input', event.target.value);
    },
    onChange(event) {
      this.$emit('change', event.target.value);
    },
    */

  },
}
</script>
