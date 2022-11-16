<template>
   <div class="vh-100-top-offset-1">
        <div class="bg-white px-3 py-2 h-sidebar-tools-panel">
            <a href="#" @click.prevent="toggleSidePanel('search')" class="text-secondary"><i class="fas fa-arrow-left"></i> Назад к условиям поиска</a>
        </div>
        <div class="p-3">
            <div class="text-primary" style="text-transform: uppercase">
                <i class="fas fa-star fw mr-1"></i> Выбранные аналоги
            </div>
            <div v-if="!analogs.length && !aim" class="text-muted px-1">
                Список аналогов пуст. Добавить объект к списку аналогов можно через контекстное меню на карте
            </div>
            <analog-item v-if="aim" :item="aim" type="aim" :index="0"></analog-item>
            <analog-item v-for="(analog, index) in analogs" :key="analog.id" :item="analog" type="analog" :index="index + (aim ? 1 : 0)"></analog-item>
            <ObjectEvaluation v-if="analogs.length && aim" ref="objectEvaluation" :ids="ids"></ObjectEvaluation>
            <div class="text-right mt-3">
                <b-button variant="light" @click="showObjectEvaluation()">
                    Перейти к оценке
                    <i class="fas fa-balance-scale-right fw"></i>
                </b-button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "AnalogsPanel",
    props: {},
    data() {
        return {
            showModal: false
        };
    },
    errorCaptured(err, vm, info) {
        console.log(err, vm, info)
        return false
    },
    computed: {
        analogs: {
            get() { return this.$store.state.analogs; },
            set(value) { this.$store.commit("setAnalogs", value); }
        },
        aim: {
            get() { return this.$store.state.aim; },
            set(value) { this.$store.commit("setAim", value); }
        },
        ids() {
            const analogsId = this.analogs.map((analog) => analog.id);
            return {
                aim: this.aim.id,
                analogs: analogsId
            } || null
        }
    },
    watch: {},
    methods: {
        toggleSidePanel(panel) {
            this.$store.dispatch("toggleSidePanel", panel);
        },
        showObjectEvaluation() {
            this.$refs.objectEvaluation.show();
        }
    }
}
</script>