<template>
  <transition>
    <b-button
      v-if="show"
      type="submit"
      variant="primary"
      :class="{
        'show-button': show,
        'del-button': !show
      }"
      @click="onClick">{{ title }}</b-button>
  </transition>
</template>

<script>
export default {
  name: 'FormButton',
  props: {
    title: {
      type: String,
      required: true,
    },
    show: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    onClick() {
      this.$emit('onButtonClick', this.title)
    },

  },
}
</script>

<style scoped>
.show-button {
  display: inline-block;
}

.del-button {
  display: none;
}
</style>
