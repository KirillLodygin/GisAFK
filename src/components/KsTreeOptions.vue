<template>
  <!--eslint-disable-->
  <ul>
    <template v-for="(field, _key) in options">
      <ks-tree-options-item
        v-if="_key !== 'parent'"
        :ref="_key"
        :field="field"
        :data="data[_key]"
        class="item"
      ></ks-tree-options-item>
    </template>
  </ul>
</template>

<script>
export default {
  name: "KsTreeOptions",
  props: {
    data: { type: Object, required: true },
    options: { type: Object, required: true },
  },
  /* methods: {
	addParentRef(item) {
		if (item.childs) {
			for (const child of item.childs) {
			  child.parent = item;
			  this.addParentRef(child);
			}
		}
	}
  },
  mounted() {
	  for (const child of this.options) {
		  child.parent = null;
		  this.addParentRef(child);
	  }
  } */
};
</script>
