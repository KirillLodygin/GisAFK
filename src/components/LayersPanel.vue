<template>
   <div class="vh-100-top-offset-1">
        <div class="bg-white px-3 py-2 h-sidebar-tools-panel">
            <a href="#" @click.prevent="toggleSidePanel('search')" class="text-secondary"><i class="fas fa-arrow-left"></i> Назад к условиям поиска</a>
        </div>
        <div class="text-primary px-3 py-3" style="text-transform: uppercase">
            <i class="fas fa-layer-group fw mr-1"></i> Управление слоями
        </div>
        <div class="px-4">
            <div v-if="!layersTreeData.length" class="text-muted">
                Слои не загружены
            </div>
            <ks-tree-input v-else v-model="selected" name="lp-layers" border="none" select="none" height="200px" :tree-data="layersTreeData" :actions="layerTreeActions" :moveItems="true" @action="onAction($event)"></ks-tree-input>
            <a href="#" class='list-item btn-xs btn-outline-primary mt-2' @click.prevent="addRootLayer()">
                <i class="fas fa-plus-circle"></i> Добавить корневой слой
            </a>
        </div>
        <modal-form ref="layerForm" :schema="layerForm" @success="$emit('update-layers')"></modal-form>
        <modal-form ref="uploadObjectsForm" :schema="uploadObjectsForm" @success="$emit('update-layers')"></modal-form>
    </div>
</template>

<script>
export default {
    name: 'LayersPanel',
    props: {
    },
    data() {
    return {
        selected: [],
        layerTreeActions: [
            { name: 'addSubLayer', label: 'Добавить вложенный слой', icon: 'fas fa-plus-circle' },
            { name: 'uploadObjects', label: 'Импортировать объекты', icon: 'fas fa-file-import' },
            { name: 'editLayer', label: 'Изменить слой', icon: 'fas fa-edit' },
            { name: 'deleteLayer', label: 'Удалить слой', icon: 'fas fa-trash-alt' },
        ],
        layerForm: {
            name: 'layerForm',
            title: 'Добавление слоя',
            action: 'api/v1/layers/geo_layer/',
            submit: 'Добавить',
            inputs: {
                info: { name: 'info', label: 'Подсказка', mode: 'info-input', visible: false },
                name: { name: 'name', label: 'Название', mode: 'b-form-input', type: 'text', required: true },
                layer_type: { name: 'layer_type', label: 'Тип объектов', mode: 'b-form-select', options: [
                   { value: 'A', text: 'Объявления' }, { value: 'G', text: 'Вспомогательные' },
                ] },
                color: { name: 'color', label: 'Цвет', mode: 'b-form-input', type: 'color', cols: 6 },
                glyph_name: { name: 'glyph_name', label: 'Иконка', mode: 'b-form-select', cols: 6, options: [
                   'fas fa-circle', 'fas fa-tree', 'fas fa-water', 'fas fa-train', 'fas fa-bus'
                ], },
                caption: { name: 'caption', label: 'Заголовок для объекта на карте', mode: 'b-form-input', type: 'text' },
                descr: { name: 'descr', label: 'Описание', mode: 'b-form-textarea' },
                tn_parent: { name: 'tn_parent', visible: false },
            },
            values: {
                layer_type: 'A',
                color: '#396dd5',
                glyph_name: 'fas fa-circle',
            }
        },
        uploadObjectsForm: {
            name: 'uploadObjectsForm',
            title: 'Импорт объектов',
            action: 'api/v1/layers/geo_object_upload/',
            submit: 'Загрузить',
            inputs: {
                info: { name: 'info', label: 'Подсказка', mode: 'info-input' },
                map_info_file: { name: 'map_info_file', label: 'Файл с данными для импорта', mode: 'b-form-file', placeholder: 'Выбрать файл для импорта' },
                title: { name: 'title', visible: false },
                layer_type: { name: 'layer_type', visible: false },
                id_layer: { name: 'id_layer', visible: false },
            },
            values: {}
        },
    }
    },
    computed: {
        layersTreeData: {
            get () { return this.$store.state.layersTreeData },
            set (value) { this.$store.commit('setLayersTreeData', value) }
        },
    },
    watch: {
    },
    methods: {
        toggleSidePanel(panel) {
            this.$store.dispatch('toggleSidePanel', panel);
        },
        addRootLayer() {
            this.layerForm.title = 'Добавление корневого слоя';
            this.layerForm.submit = 'Добавить';
            delete this.layerForm.values.tn_parent;
            this.layerForm.inputs.info.visible = false;
            this.$refs.layerForm.show();
        },
        addSubLayer(parentLayer) {
            this.layerForm.title = 'Добавление вложенного слоя';
            this.layerForm.submit = 'Добавить';
            this.layerForm.values.tn_parent = parentLayer.id;
            this.layerForm.inputs.info.visible = true;
            this.layerForm.inputs.info.label = 'Слой будет добавлен в родительский слой: "' + parentLayer.name + '"';
            this.$refs.layerForm.show();
        },
        uploadObjects(layer) {
            this.uploadObjectsForm.values.id_layer = layer.id;
            this.uploadObjectsForm.values.layer_type = layer.layer_type;
            this.uploadObjectsForm.values.title = layer.name;
            this.uploadObjectsForm.inputs.info.label = 'Объекты будут загружены в слой: "' + layer.name + '"';
            this.$refs.uploadObjectsForm.show();
        },
        editLayer(layer) {
            this.layerForm.title = 'Редактирование слоя';
            this.layerForm.submit = 'Изменить';
            this.$refs.layerForm.show(layer);
        },
        onAction(event) {
            if (event.action.name === 'deleteLayer') {
                this.$bvModal.msgBoxConfirm('Вы действительно хотите удалить слой "'+ event.item.node.name +'"?', {
                    title: 'Подтверждение удаления',
                    buttonSize: 'sm',
                    okVariant: 'danger',
                    okTitle: 'Удалить',
                    cancelTitle: 'Отменить',
                    footerClass: 'p-2',
                    hideHeaderClose: false,
                    centered: true
                })
                .then(value => {
                    if (value) this.deleteLayer(event.item.node.id);
                })
            }
            else if (event.action.name === 'addSubLayer') {
                this.addSubLayer(event.item.node);
            }
            else if (event.action.name === 'uploadObjects') {
                this.uploadObjects(event.item.node);
            }
            else if (event.action.name === 'editLayer') {
                this.editLayer(event.item.node);
            }
        },
        async deleteLayer(layerId) {
            await this.$axios
                .$delete('api/v1/layers/geo_layer/' + layerId)
                .catch(error => { console.log(error) });
            this.$emit('update-layers');
        }
    }
}
</script>
