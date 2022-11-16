<template>
  <table class="table table-striped table-sm">
    <tbody>
      <rep-table-intro-row
        v-for="row in reportingTableIntro"
        :key="row.name"
        :row-value="row.value"
        :row-text="row.text"
      />
    </tbody>
  </table>
</template>

<script>
// TODO-Кирилл: нужно добавить скелетоны загрузки и описать условия для их отрисовки
import RepTableIntroRow from '@/components/Form/ReporttingTableIntroRow'

export default {
  name: 'ReportingTableIntro',
  components: { RepTableIntroRow },

  props: {
    reportingTableIntro: {
      type: Array,
      required: true,
    },
  },
}
</script>

<style scoped></style>
