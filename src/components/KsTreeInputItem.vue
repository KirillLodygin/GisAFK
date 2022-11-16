<template>
    <li style="list-style-type: none;">
		<span :id="id+'_container'" :class="{'d-flex': true, 'text-muted': disabled, 'progress-container': true}">
			<span v-if="input.moveItems" class="drag-btn" @mousedown="onDragBtnMouseDown"><i class="fas fa-bars fa-sm fa-fw text-secondary"></i></span>
			<div v-if="item.loading" class="bottom-progress-bar" :style="{width: item.percentLoaded + '%', background: item.node.color}"></div>
			<span v-if="isFolder" style="cursor: pointer;" @click="toggle">
				<i v-if="isOpen" :class="openedIconClass"></i>
				<i v-else :class="closedIconClass"></i>
			</span>
			<span v-else style="width: 1.25em; text-align: center;">
				<i class="fas fa-circle fa-fw" style="font-size: 0.3em; vertical-align: middle;"></i>
			</span>

			<span class="fa-fw">
				<b-spinner v-if="item.loading" small></b-spinner>
				<i v-else :class="item.node.glyph_name || 'fas fa-circle'" :style="{'color': item.node.color}"></i>
			</span>

			<span :class="[marked ? 'bg-blue-30':'', checked ? 'text-body' : input.class_unchecked || '', 'px-1']">
				{{ item.node.name }} <i v-if="item.node.layer_type === 'A'" class="fas fa-ad"></i>
				<span v-if="item.objCount" class="badge badge-secondary" style="font-size: .6em; vertical-align: text-top;">{{ item.objCount }}</span>	
			</span>

			<span class="ml-auto mr-2">
				<template v-if="(!input.select || input.select != 'none') && (!input.selectFilter || item.node.layer_type === 'A')">
					<div v-if="input.icon_checked && input.icon_unchecked" @click="onChange()">
						<i :class="checkIconClass"></i>
					</div>
					<input v-else :id="item.node.name" :name="input.name" :value="item.node.id" :checked="checked" :type="inputType" :disabled="disabled" @change="onChange()"/>
				</template>
				<div v-if="input.actions && input.actions.length" :id="'dropdown-'+item.node.id" class="dropdown position-static">
					<a href="#" @click.prevent="showMenu()" :id="'menu-btn-'+item.node.id">
						<i class="fas fa-ellipsis-v fa-fw text-secondary"></i>
					</a>
					<div :id="'ddmenu-'+item.node.id" :class="'dropdown-menu shadow mt-0' + (menuVisible ? ' show' : '')" aria-labelledby="dropdownMenuButton">
						<a v-for="action in input.actions" :key="action.name" class="dropdown-item" href="#" @click.prevent="onAction(action, item)">
							<i v-if="action.icon" :class="[action.icon, 'fa-fw']"></i> {{ action.label }}
						</a>
					</div>
				</div>
			</span>
        </span>
        <ul v-show="isOpen" v-if="isFolder" style="padding-inline-start: 20px;">
			<ks-tree-input-item            
				v-for="(child, index) in item.tree"
				:ref="child"
				:key="index" 
				:item="child"
				:input="input" 
				:value="value"
				@action="$emit('action', $event)"
				class="item"
			></ks-tree-input-item>
        </ul>
    </li>
</template>

<script>
export default {
    name: 'KsTreeInputItem',
	props: {
	  input: { type: Object, required: true },
      value: { type: Array, required: true },
	  item: { type: Object, required: true },
	},
	data() {
	  return {
		id: null,
		isOpen: false,
		loading: false,
		menuVisible: false,
		dragged: false
	  };
	},
	computed: {
	  disabled() {
		return this.input.readonly || this.input.disabled || (this.input.lockSelectedChilds && this.parentChecked);
	  },
	  inputType() {
		return (this.input.select === 'single') ? 'radio' : 'checkbox';
	  },
	  checked() {
		if (this.value) {
			if (this.input.select === 'single' && this.value === this.item.node.id) {
				return true;
			}
			else if (this.input.select === 'multiple' && this.value.includes( this.item.node.id )) {
				return true;
			}
		}
		return false;
	  },
	  marked() {
		return this.checked || (this.input.lockSelectedChilds && this.$parent && this.$parent.selfOrParentChecked);
	  },
	  selfOrParentChecked() {
		return this.checked || (this.$parent && this.$parent.selfOrParentChecked);
	  },
	  parentChecked() {
		return this.$parent && this.$parent.selfOrParentChecked;
	  },
	  isFolder() {
		return this.item.tree && this.item.tree.length;
	  },
	  openedIconClass() {
		return this.input.icon_opened ? this.input.icon_opened : 'fas fa-fw fa-angle-down';
	  },
	  closedIconClass() {
		return this.input.icon_closed ? this.input.icon_closed : 'fas fa-fw fa-angle-right';
	  },
	  checkIconClass() {
		return this.checked ? this.input.icon_checked : this.input.icon_unchecked;
	  }
	},
	mounted() {
		document.addEventListener('click', this.onDocumentClick);
		this.id = this.input.name + '_item' + this._uid;
	},
	beforeDestroy() {
		document.removeEventListener('click', this.onDocumentClick);
	},
	methods: {
		showMenu() {
			this.menuVisible = !this.menuVisible;
			if (this.menuVisible) {				
				var holder = document.querySelector('#' + this.input.name + '_holder');
				var dropdown = document.querySelector('#dropdown-' + this.item.node.id);
				var dropdownMenu = document.querySelector('#' +'ddmenu-'+this.item.node.id);
				document.body.appendChild(dropdownMenu);
				var dropdownRect = dropdown.getBoundingClientRect();
				dropdownMenu.style.top = dropdownRect.top - holder.scrollTop + "px";
				dropdownMenu.style.left = dropdownRect.left + "px";			
			}
		},
		onDocumentClick(event) {
			if (!event.target.closest('#menu-btn-'+this.item.node.id)) {
				this.menuVisible = false;
			}
		},
		onChange() {
			if (!this.disabled) {
				if (this.input.select === 'single') {
					this.$emit('change', this.item.node.id);
				}
				else if (this.input.select === 'multiple') {
					this.$emit('change', this.checked ? this.removeValue(this.item) : this.addValue());
				}
			}
		},
		onAction(_action, _item) {
			this.$emit('action', {action: _action, item: _item});
			this.menuVisible = false;
		},
		toggle() {
			if (this.isFolder) {
			this.isOpen = !this.isOpen;
			}
		},
		removeValue(item) {
			var result = this.value;
			var index = result.indexOf( item.node.id );
			if (index >= 0) {
				result.splice(index, 1);
			}
			return result;
		},
		addValue() {
			var result = this.value;
			result.push( this.item.node.id );
			this.resetChilds();
			return result;
		},
		resetChilds() {
			if (this.item.childs) {
				for (const child of this.item.childs) {
					this.removeValue(child);
				}
			}
		},
		onDragBtnMouseDown() {
			const dragContainer = document.getElementById(this.id + '_container');
			this.dragged = true;
			dragContainer.setAttribute('draggable', 'true');
			dragContainer.addEventListener('dragend', this.onDragEnd);
			// dragContainer.addEventListener('drag', this.onDrag);
			// this.$parent.setDragZones();
		},
		onDragEnd(e) {
			e.target.removeAttribute('draggable');
			this.dragged = false;
		},
	}
}
</script>