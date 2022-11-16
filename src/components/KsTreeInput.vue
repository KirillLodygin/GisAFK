<template>
  <div class="form-group">
	<label v-if="_input.label" :for="_input.name">{{ _input.label }}</label>
	<ul :id="_input.name+'_holder'" :class="{'form-control': !_input.border || _input.border === 'single', 'p-0': true, 'm-0': true}" :style="{'overflow-y': 'auto', 'height': _input.height, 'resize': 'vertical'}">
		<ks-tree-input-item
			v-for="(child, index) in childs"
			:ref="child.node.name"
			:key="index"
			:item="child"
			:input="_input"
			:drop-zones="dropZones"
			:value="value"
			@change="$emit('input', $event)"
			@action="$emit('action', $event)"
			class="item"
		></ks-tree-input-item>
	</ul>
	<div class="invalid-feedback">{{ _input.errorText }}</div>
  </div>
</template>

<script>
export default {
  name: 'KsTreeInput',
  props: {
    input: { type: Object, default: null },
    value: { type: Array, default: null },
    name: { type: String, default: null },
    filterAdv: { type: Boolean, default: false },
    actions: { type: Array, default: null },
    treeData: { type: Array, default: null },
    label: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    border: { type: String, default: 'single' },
    height: { type: String, default: '' },
    select: { type: String, default: 'multiple' },
    selectFilter: { type: Boolean, default: false },
    lockSelectedChilds: { type: Boolean, default: true },
    icon_checked: { type: String, default: null },
    icon_unchecked: { type: String, default: null },
    class_unchecked: { type: String, default: null },
    errorText: { type: String, default: '' },
  },
  data() {
		return {
			dropZones: false
		};
	},
  computed: {
		_input() {
			return this.input || {
				tree_data: this.treeData,
				name: this.name,
				filterAdv: this.filterAdv,
				actions: this.actions,
				moveItems: this.moveItems,
				label: this.label,
				border: this.border,
				height: this.height,
				select: this.select,
				lockSelectedChilds: this.lockSelectedChilds,
				selectFilter: this.selectFilter,
				disabled: this.disabled,
				icon_checked: this.icon_checked,
				icon_unchecked: this.icon_unchecked,
				class_unchecked: this.class_unchecked,
				error_text: this.errorText,
			};
		},
		childs() {
			if (this._input.filterAdv) {
				const res = [];
				for (const child of this._input.tree_data) {
					if (child.node.layer_type === 'A') {
						res.push(child);
					}
				}
				return res;
			} else {
        		const res = [];
        		for (const child of this._input.tree_data) {
          			if (child.node.id !== 'search') {
          		  		res.push(child);
          		}
        	}
        	return res;
        // return this._input.tree_data;
      		}
	  	}		
  },
	mounted() {
		if (this._input.tree_data && this._input.tree_data.length) {
			for (const child of this._input.tree_data) {
				child.parent = null;
				this.addParentRef(child);
			}
		}
	},
	methods: {
		addParentRef(item) {
			if (item.childs) {
				for (const child of item.childs) {
          child.parent = item;
          this.addParentRef(child);
				}
			}
		},
	},
}
</script>
