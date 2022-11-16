<template>
  <div>
    <table class="table table-hover">
      <thead>
        <tr class="table-success">
          <th><strong>{{ region }}</strong></th>
        </tr>
      </thead>
      <tbody>
        <reporting-table-row v-for='tableRow in tableBodyArr' :key='tableRow.id' :table-row='tableRow.body'/>
      </tbody>
    </table>
  </div>
</template>

<script>
import ReportingTableRow from '~/components/Form/ReportingTableRow'

export default {
  name: 'ReportingTablePattern',
  components: { ReportingTableRow },

  props: {
    region: {
      type: String,
      required: true,
    },
    tableBody: {
      type: Array,
      required: true,
    },
  },

  data() {
    const tableBodyArr = this.tableBody.map((item, index) => ({ id: index, body: item }))

    return {
      tableBodyArr,
    }
  },
}
</script>

<style scoped></style>
