<template>
    <div class="d-flex mt-2">
        <div class="fa-stack mr-2">
            <i class="fas fa-map-marker fa-stack-1x" style="font-size: 1.5em;"></i>
            <span class="fa-inverse fa-stack-1x" style="font-size: .8em; margin: -2px 0 0 2px">{{ index+1 }}</span>
        </div>
        <div style="font-size: 0.9em;">
            <div>{{ item.address.raw }}</div>
            <div class="text-muted">{{ item.ads_text_short }}</div>
        </div>
        <div class="dropdown" style="height: 32px; width: 46px">
            <a :id="'analog-menu-btn-'+item.id" class="page-link p-1 dropdown-toggle" data-toggle="dropdown" href="#" @click.prevent="menuVisible=true">
                <i v-if="type==='aim'" class="fas fa-balance-scale-right fw text-primary"></i>
                <i v-else class="fas fa-star fw text-primary"></i>
            </a>
            <div v-if="type==='aim' && menuVisible" class="dropdown-menu show shadow mt-0">
                <a class="dropdown-item" href="#" @click.prevent="toggleAimAnalog(item)"><i class="fas fa-star fa-fw"></i> Использовать объект как аналог</a>
                <a class="dropdown-item" href="#" @click.prevent="toggleAim(item)"><i class="fas fa-trash-alt fa-fw"></i> Убрать объект из списка</a>
            </div>
            <div v-else-if="type==='analog' && menuVisible" class="dropdown-menu show shadow mt-0">
                <a class="dropdown-item" href="#" @click.prevent="toggleAimAnalog(item)"><i class="fas fa-balance-scale-right fa-fw"></i> Использовать объект как целевой</a>
                <a class="dropdown-item" href="#" @click.prevent="toggleAnalog(item)"><i class="fas fa-trash-alt fa-fw"></i> Убрать объект из списка</a>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AnalogItem',
    props: {
        item: { type: Object, required: true },
        index: { type: Number, required: true },
        type: { type: String, required: true },
    },
    data() {
    return {
        menuVisible: false,
    }
    },
    computed: {       
    },
    watch: {       
    },
    mounted() {
		document.addEventListener('click', this.onDocumentClick);
	},
	beforeDestroy() {
		document.removeEventListener('click', this.onDocumentClick);
	},
    methods: {
        toggleAnalog(advObject) {
            this.$store.dispatch('toggleAnalog', advObject);
        },
        toggleAim(advObject) {
            this.$store.dispatch('toggleAim', advObject);
        },
        toggleAimAnalog(advObject) {
            this.$store.dispatch('toggleAimAnalog', advObject);
        },
        onDocumentClick(event) {
			if (!event.target.closest('#analog-menu-btn-'+this.item.id)) {
				this.menuVisible = false;
			}
		},
    }
}
</script>