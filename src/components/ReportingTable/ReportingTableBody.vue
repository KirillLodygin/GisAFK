<template>
  <div>
    <b-row class="mb-3">
      <b-card-text><strong>{{ tableTitle }}</strong></b-card-text>
    </b-row>
    <reporting-table-pattern
      v-for="item in meaning"
      :key="item.id"
      :region="item.region"
      :table-body="item.json_data"
    />
  </div>
</template>

<script>
import ReportingTablePattern from '@/components/Form/ReportingTablePattern'

export default {
  // TODO-Кирилл: нужно добавить скелетоны загрузки и описать условия для их отрисовки
  name: 'ReportingTableBody',
  components: { ReportingTablePattern },

  props: {
    tableTitle: {
      type: String,
      required: true,
    },
    meaning: {
      type: Array,
      required: true,
    },
  },
}
</script>

<style scoped></style>
