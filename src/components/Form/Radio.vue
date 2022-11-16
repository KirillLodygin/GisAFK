<template>
  <div>
    <label v-if="label">{{ label_lower }}</label>
    <input :type="type_input" :name="name" :value="value" @input="onInput" @change="onChange" class="form-control" />

    <b-form-group>
      <b-form-radio :aria-describedby="label_lower" name="some-radios" value="false">false</b-form-radio>
      <b-form-radio :aria-describedby="label_lower" name="some-radios" value="true">true</b-form-radio>
    </b-form-group>
  </div>
</template>

<script>
export default {
  name: 'Radio',
  props: {
    label: {
      type: String,
      required: false,
    },
    value: {
      type: String,
      required: true,
    },
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
