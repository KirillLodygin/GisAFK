<template>
  <div>
    <b-form-datepicker v-model="date" :disabled="disabled" :required="required"></b-form-datepicker>
    <b-form-timepicker v-model="time" :disabled="disabled" :required="required"></b-form-timepicker>
  </div>
</template>
<script>
export default {
  name: "DateTime",
  props: {
    value: { type: String },
    disabled: { type: Boolean },
    required: { type: Boolean }
  },
  data() {
    return {
      datetime: this.value,
    };
  },
  computed: {
    date: {
      get() {
        console.log(this.datetime);
        if (this.datetime) {
          return this.datetime.replace(/(\d{4}-\d{2}-\d{2})(.+)/gm, "$1");
        }
        return "";
      },
      set(value) {
        console.log(this.datetime);
        this.datetime = value + this.datetime.replace(/(\d{4}-\d{2}-\d{2})(.+)/gm, "$2");
      },
    },
    time: {
      get() {
        if (this.datetime) {
          return this.datetime.replace(
            /(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})(.+)/gm,
            "$2"
          );
        }
        return "";
      },
      set(value) {
        this.datetime =
          this.datetime.replace(/(\d{4}-\d{2}-\d{2}T)(\d{2}:\d{2}:\d{2})(.+)/gm, "$1") +
          value +
          this.datetime.replace(/(\d{4}-\d{2}-\d{2}T)(\d{2}:\d{2}:\d{2})(.+)/gm, "$3");
      },
    },
  },
  watch: {
    value(newValue) {
      this.datetime = newValue;
    },
    datetime(newValue) {
      this.$emit("input", newValue);
    },
  },
};
</script>
