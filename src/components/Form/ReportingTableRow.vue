<template>
  <tr
    :class="{
      'table-info': toggle1,
      'table-warning': toggle2
    }"
  >
    <reporting-table-cell v-for="tableCell in tableRow" :key="tableCell.index" :table-cell-value="String(tableCell)" />
  </tr>
</template>

<script>
import ReportingTableCell from '~/components/Form/ReportingTableCell'

export default {
  name: 'ReportingTableRow',
  components: { ReportingTableCell },

  props: {
    tableRow: {
      type: Array,
      required: true,
    },
  },
  data() {
    const toggle1 = typeof this.tableRow[2] === 'string'
    const toggle2 = this.tableRow[1] === ''

    return {
      toggle1,
      toggle2
    }
  },
}
</script>

<style scoped></style>
