<template>
   <div class="vh-100-top-offset-1">
        <div class="bg-white px-3 py-2 h-sidebar-tools-panel">
        <a href="#" @click.prevent="toggleSidePanel('search')" class="text-secondary"><i class="fas fa-arrow-left"></i> Назад к условиям поиска</a>
        </div>
        <ks-tree-options :data="selectedMapObjectDetails.data" :options="selectedMapObjectDetails.options" class="px-3 overflow-auto h100-sidebar-tools-panel"></ks-tree-options>
    </div>
</template>

<script>
export default {
    name: 'DetailsPanel',
    props: {
        selectedMapObjectDetails: { type: Object, required: true }
    },
    data() {
    return {
    }
    },
    computed: {
    },
    watch: {
    },
    methods: {
        toggleSidePanel(panel) {
            this.$store.dispatch('toggleSidePanel', panel);
        },
    }
}
</script>