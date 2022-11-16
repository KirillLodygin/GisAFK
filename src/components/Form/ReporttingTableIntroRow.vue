<template>
  <tr>
    <td>{{ rowText }}</td>
    <th name="fade" scope="row">
      <span v-if="!!rowValue">{{ rowValue }}</span>
    </th>
  </tr>
</template>

<script>
export default {
  name: 'RepTableIntroRow',
  props: {
    rowText: {
      type: String,
      required: true,
    },
    rowValue: {
      type: String,
      required: true,
    },
  },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

th {
  width: 50%;
  font-size: 14px;
}

td {
  width: 50%;
  font-size: 14px;
}
</style>
