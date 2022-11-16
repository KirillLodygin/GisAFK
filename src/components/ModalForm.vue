<template>
    <b-modal v-model="visible" centered :title="schema.title || 'Заголовок окна'">
        <b-form v-if="schema.inputs">
            <div class="form-row">
                <div v-for="input in schema.inputs" :key="input.name" :class="'col-' + (input.cols ? input.cols : '12')">
                    <div v-if="input.visible == null || input.visible" class="form-group">
                        <div v-if="input.mode === 'info-input'">
                            <i class="fas fa-info-circle"></i> {{ input.label }}
                        </div>
                        <template v-else>
                            <label :for="inputId(input)">{{ input.label + (input.required ? ' *' : '') }}</label>
                            <component :is="input.mode" :id="inputId(input)" :type="input.type" :input="input" :state="states[input.name]" :schema="schema" :options="input.options" :placeholder="input.placeholder" v-model="values[input.name]"></component>
                            <b-form-invalid-feedback :id="inputId(input)+'-feedback'" :state="states[input.name]">{{ errors[input.name] }}</b-form-invalid-feedback>
                        </template>                        
                    </div>
                </div>
            </div>     
        </b-form>
        <template #modal-footer>
            <b-button type="button" variant="secondary" @click="close()">{{ schema.cancel || 'Отмена' }}</b-button>
            <b-button type="submit" variant="primary" :disabled="checking" @click="send()">
                {{ schema.submit || 'Отправить' }}
                <i v-if="checking" class="fas fa-spinner fa-spin"></i>
            </b-button>
        </template>
    </b-modal>
 </template>
 
 <script>
 export default {
    name: 'ModalForm',
    props: {
        schema: { type: Object, required: true },
    },
    data() {
    return {
        obj: null,
        visible: false,
        checking: false,
        values: {},
        states: {},
        errors: {},
        formError: null
    }
    },
    computed: {
    },
    watch: {
    },
    mounted() {
        
    },
    methods: {
        inputId(input) {
            return this.schema.name + '-' + input.name;
        },
        show(obj) {
            this.resetFields();
            this.obj = obj;
            if (obj) this.setObject(obj);
            this.visible = true;
        },
        close() {
            this.visible = false;
        },
        resetFields() {            
            const self = this;
            this.values = {};
            if (this.schema.inputs) {
                Object.keys(this.schema.inputs).forEach(name => {
                    self.$set(self.states, name, null);
                    self.$set(self.errors, name, '');
                    if (name in self.schema.values)
                        self.$set(self.values, name, self.schema.values[name])
                });
            }
        },
        setObject(obj) {
            const self = this;
            Object.keys(this.schema.inputs).forEach(name => {
                if (name in obj) 
                    self.values[name] = obj[name];
            });
        },
        async send() {                        
            const self = this;                
            this.checking = true;
            
            const formData = new FormData();            
            Object.keys(this.schema.inputs).forEach(name => {
                if (name in self.values && self.values[name] == null)
                    formData.append(name, '')
                else if (name in self.values)
                    formData.append(name, self.values[name]);
                self.states[name] = null;
            });
            
            var response;
            if (this.obj) {
                response = await this.$axios
                    .$put(this.schema.action + this.obj.id + '/', formData)
                    .catch(error => this.catchError(error));
            }
            else {
                response = await this.$axios
                    .$post(this.schema.action, formData)
                    .catch(error => this.catchError(error));
            }
            
            if (response) {
                self.checking = false;
                self.close();
                self.$emit('success');
            }
        },
        catchError(error) {
            const self = this;
            this.checking = false;
            if (error.response.data) {
                Object.keys(this.schema.inputs).forEach(name => {
                    if(name in error.response.data) {
                        self.states[name] = false;
                        self.errors[name] = error.response.data[name].join('; ');
                    }
                }); 
            }
            else {
            // self.errorModal.text = error; self.$bvModal.show('errorModal'); 
            }
        }
    }
 }
 </script>