<template>
  <td>{{ tableCellValue }}</td>
</template>

<script>
export default {
  name: 'ReportingTableCell',

  props: {
    tableCellValue: {
      type: String,
      required: true,
    },
  },
}
</script>

<style scoped></style>
