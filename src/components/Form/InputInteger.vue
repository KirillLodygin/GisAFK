<template>
  <div>
    <label v-if="label">{{ label_lower }}</label>
    <input :min="min" :max="max" type="number" :name="name" :value="value" @input="onInput" @change="onChange" class="form-control" />
  </div>
</template>

<script>
export default {
  name: 'InputInteger',
  props: {
    label: {
      type: String,
      required: false,
    },
    value: {
      type: String,
      required: true,
    },
    min: {
      type: Number,
      required: false,
    },
    max: {
      type: Number,
      required: false,
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
