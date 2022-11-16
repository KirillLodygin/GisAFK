<template>
	<li style="list-style-type: none; border-bottom: 1px solid silver">
        <div class="d-flex">
			<span>
				<span v-if="isFolder" style="cursor: pointer;" @click="toggle">
					<i v-if="isOpen" :class="openedIconClass"></i>
					<i v-else :class="closedIconClass"></i>
				</span>
				<span v-else>
					<i class="fas fa-fw"></i>
				</span>				
			</span>
			<span style="width: 50%">{{ field.label }}</span>
			<span style="width: 50%; padding-left: 10px;" v-html="dataView"></span>
		</div>
		<ul v-show="isOpen" v-if="isFolder" style="padding-left: 15px">
			<ks-tree-options-item				
				v-for="(_field, _key) in field.children"
				:ref="_key"
				:key="_key" 
				:field="_field"
				:data="data[_key]"
				class="item"
			></ks-tree-options-item>
		</ul>
    </li>
</template>

<script>
export default {
    name: 'KsTreeOptionsItem',
	props: {
	  data: { type: Object, required: true },
	  field: { type: Object, required: true },
	},
	data() {
	  return {
		isOpen: false
	  };
	},
	computed: {
	  dataView() {
		if (this.field.type === 'choice') {
			const choise = this.field.choices.find(x => x.value === this.data);
			return choise.display_name;
		}
		else if (this.field.type === 'boolean') {
			return this.data ? '<i class="far fa-check-circle"></i>' : '<i class="far fa-circle"></i>';
		}
		else if (this.field.type === 'nested object') {
			return '';
		}
		else if (this.field.type === 'url') {
			return '<a href="'+ this.data +'" target="_blank">Перейти <i class="fas fa-sm fa-external-link-alt"></i></a>';
		}
		else if (this.field.type === 'date') {
			return this.convertDate(this.data);
		}
		else if (this.field.type === 'datetime') {
			return this.convertDateTime(this.data);
		}
		else if (this.field.type === 'field') {
			var res = [];
			/* if (this.data) {				
				this.data.forEach(value => {
					res.push('<img src="value"/>');
				});
			} */
			return res.join();
		}
		else {
			return this.data;
		}
	  },
	  isFolder() {
		return this.field.type === 'nested object';
	  },
	  openedIconClass() {
		if (this.field.icons === 'arrows') {
			return 'fas fa-fw fa-angle-down'
		}
		else {
			return 'far fa-fw fa-minus-square'
		}
	  },
	  closedIconClass() {
		if (this.field.icons === 'arrows') {
			return 'fas fa-fw fa-angle-right'
		}
		else {
			return 'far fa-fw fa-plus-square'
		}
	  }
	},
	methods: {
	  // Строка Date в объект js
	  convertDate(str) {
		if (str === '' || str === ' ' || str === '-' || str === null) {
			return '-';
		}
		var dt = new Date(str);
		return dt.toLocaleString("ru-RU", {day: 'numeric', month: 'numeric', year: 'numeric'});
	  },
	  // Строка DateTime в объект js
	  convertDateTime(str) {
		if (str === '' || str === ' ' || str === '-' || str === null) {
			return '-';
		}
		var dt = new Date(str);
		return dt.toLocaleString();
	  },
	  toggle() {
		if (this.isFolder) {
		  this.isOpen = !this.isOpen;
		}
	  },
	}
}
</script>