<template>
  <div>
    <b-modal id="tableCalc" centered size="xxl" title="Оценка стоимости объекта" 
      @ok="showSerialCorr">
      <b-table bordered sticky-header="calc(100% - 16px)" responsive :fields="fields" :items="items">
      </b-table>
    </b-modal>
    <b-modal id="tableSerialCorr" centered size="xxl" title="Первая группа элементов сравнения (последовательные корректировки)" 
      @ok="showFreeCorr">
      <b-table bordered sticky-header="calc(100% - 16px)" responsive :fields="fields" :items="firstItems">
        <template #cell()="data">
          <template v-if="(data.field.key==='number')">{{ data.value }}</template>
          <template v-else-if="(data.item.factor==='Корректировка') && ((data.field.label==='Объект оценки') || (data.field.key==='factor'))">
            <div class="font-italic">{{ data.value }}</div>
          </template>
          <template v-else-if="(data.field.key!=='factor') && (data.item.factor==='Корректировка')">
            <b-form-input v-model="data.item[data.field.key]" type="number" style="width:75px" min="0" max="100" 
              @change.native="reCalcPriceSerialCorr({ value: $event.target.value, factor_num: data.item.factor_num, field_name: data.field.key })">
            </b-form-input>
          </template>
          <template v-else-if="data.item.factor==='Скорректированная стоимость'">
            <div class="font-weight-bold">{{ data.item[data.field.key] }}</div>
          </template>
          <template v-else>{{ data.value }}</template>
        </template>>
      </b-table>
    </b-modal>
    <b-modal id="tableFreeCorr" centered size="xxl" title="Вторая группа элементов сравнения (независимые корректировки)" 
      @ok="showSummary">
      <b-table bordered sticky-header="calc(100% - 16px)" responsive :fields="fields" :items="secondItems">
        <template #cell()="data">
          <template v-if="(data.field.key==='number')">{{ data.value }}</template>
          <template v-else-if="(data.item.factor==='Корректировка') && ((data.field.label==='Объект оценки') || (data.field.key==='factor'))">
            <div class="font-italic">{{ data.value }}</div>
          </template>
          <template v-else-if="(data.field.key!=='factor') && (data.item.factor==='Корректировка')">
            <b-form-input type="number" style="width:75px" min="0" max="100" v-model="data.item[data.field.key]" 
              @change.native="reCalcPriceFreeCorr({ value: $event.target.value, factor_num: data.item.factor_num, field_name: data.field.key })">
            </b-form-input>
          </template>
          <template v-else-if="(data.item.factor==='Скорректированная стоимость') || (data.item.factor==='Скорректированная стоимость после первого этапа')">
            <div class="font-weight-bold">{{ data.item[data.field.key] }}</div>
          </template>
        <template v-else>{{ data.value }}</template>
      </template>
    </b-table>
    </b-modal>
    <b-modal id="tableSummary" centered size="xxl" title="Взвешивание объектов-аналогов, выведение стоимости объекта оценки">
      <b-table bordered sticky-header="calc(100% - 16px)" responsive :fields="fields" :items="thirdItems">
        <template #cell()="data">
          <template>{{ data.value }}</template>
        </template>
      </b-table>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'CalcTable',

  props: {
    objectEvaluation: { type: Object, required: true },
    analogues: { type: Array, required: true },
    tableFields: { type: Object, required: true },
  },

  data() {
    return {
      aim: this.objectEvaluation,
      analogs: this.analogues,
      scheme: this.tableCalcFields,
      // tableAimAndAnalogs: this.showTableCalculation,

      fields: [],
      items: [],

      serialCorr: {
        price_offer: {
          type: 'float',
          label: 'Цена предложения'
        },

        rights: {
          type: 'string',
          label: 'Состав передаваемых прав на объект недвижимости'
        },

        fin_cond: {
          type: 'string',
          label: 'Условия финансирования'
        },

        sale_cond: {
          type: 'string',
          label: 'Условия продажи (тип цены - сделка/предложение)'
        },

        period: {
          type: 'string',
          label: 'Период между датами сделок (предложений) и оценки'
        }
      },

      freeCorr: [
        'engeneering_communications',
        'has_encumbrance',
        'metro_distance',
        'layer_type',
        'func_appointment',
        'realty_class',
        'tech_status',
        'walls_material',
        'floor_count',
        'has_elevator',
        'has_lifting_mechanisms',
        'parking_type'
      ],

      freeCorrForLandPlots: [
        'engeneering_communications',
        'has_encumbrance',
        'has_railways',
        'land_category',
        'land_ussage_rights',
        'object_area',
        'redline_location'
      ],

      secondAddGroupComparisonElementsForLandPlots: {
        inside_city: {
          type: 'string',
          label: 'Расположение в городской черте'
        },

        asphalt_pavement: {
          type: 'string',
          label: 'Наличие асфальтового покрытия'
        },

        relief: {
          type: 'string',
          label: 'Рельеф'
        },

        locations_characteristics: {
          type: 'string',
          label: 'Характеристики расположения'
        }
      },

      thirdGroupComparisonElements: {
        corr_price: {
          type: 'string',
          label: 'Скорректированная стоимость'
        },

        absolute_sum: {
          type: 'string',
          label: 'Сумма абсолютных величин корректировок'
        },

        coefficient: {
          type: 'string',
          label: 'Коэффициент соответствия объекту оценки'
        },

        weigth_analogue: {
          type: 'string',
          label: 'Вес объекта-аналога с учетом коэффициента соответствия'
        },

        weighted_price: {
          type: 'string',
          label: 'Средневзвешенная величина рыночной стоимости'
        }
      },

      firstItems: [],
      secondItems: [],
      thirdItems: [],      
    }
  },

  methods: {
    reCalcPriceSerialCorr(e) {
      this.firstItems[(e.factor_num - 1) * 3 - 1][e.field_name] = e.value
      for (var i = e.factor_num; i < 6; i++) {
        this.firstItems[(i - 1) * 3][e.field_name] = ((1 + this.firstItems[(i - 1) * 3 - 1][e.field_name] / 100) * this.firstItems[i * 3 - 6][e.field_name]).toFixed(2)
      }
    },

    reCalcPriceFreeCorr(e) {
      this.secondItems[e.factor_num * 2 - 2][e.field_name] = e.value
      let sum = 0.0
      for (var i = 0; i < (this.secondItems.length - 2) / 2; i++) {
        sum = sum + 1 * this.secondItems[(i + 2) * 2 - 2][e.field_name]
      }
      this.secondItems[this.secondItems.length - 1][e.field_name] = (this.secondItems[0][e.field_name] * (1 + sum / 100)).toFixed(2)
    },

    getAddress(addressValues, addressFields) {
       try {
        var addressText = [];
        for (const key in addressFields) {
          if ((addressValues[key]) && (addressValues[key] !== '') && (key !== 'id') && key !== 'raw') addressText.push(addressFields[key].label + ' ' + addressValues[key])
        }
        if (addressText.length > 0) {
          return addressText.join(', ')
        } else
        {
          return addressValues.raw
        }
      } catch(error) { console.log(error) }
    },
    
    setObjectItem(item, parameter, key, object) {
      item['Object' + object.pk] = object[key]
      if (parameter.type === 'boolean') {
        if (object[key] === 'true') {
          item['Object' + object.pk] = 'Да'
        } else {
          item['Object' + object.pk] = 'Нет'
        }
      }
      if (parameter.type === 'choice') {
        const choices = parameter.choices
        choices.forEach(choice => {
          if (object[key] === choice.value) {
            item['Object' + object.pk] = choice.display_name
          }
        })
      }
      if (key === 'address') {
        item['Object' + object.pk] = this.getAddress(object[key], parameter.children)
      }
    },

    setObjectItems(scheme, stage) {
      this.items = []
      this.fields = []

      this.fields.push({
        key: 'number',
        label: 'N'
      })

      this.fields.push({
        key: 'factor',
        label: 'Наименование показателя'
      })

      this.fields.push({
        key: 'Object' + this.aim.pk,
        label: 'Объект оценки'
      })

      for (var i = 0; i < this.analogs.length; i++) {
        this.fields.push({
          key: 'Object' + this.analogs[i].pk,
          label: 'Аналог ' + (i + 1)
        })
      }

      let number = 0; let item = {}
      for (const key in scheme) {
        const parameter = scheme[key]
        if (((key !== 'pk') && (parameter.type !== 'nested object')) && (parameter.type !== 'field') || (key === 'address')) {
          item = {}

          number++
          item.number = number
          item.factor_num = ''
          item.factor = parameter.label

          this.setObjectItem(item, parameter, key, this.aim);

          this.analogs.forEach(analog => {
            this.setObjectItem(item, parameter, key, analog);
          })

          this.items.push(item)

          if (((stage === 1) || (stage === 2)) && (key !== 'price_offer')) {
            // Дополнительные строки, если перешли в расчетную таблицу
            item = {}

            item.number = ''
            item.factor_num = number
            item.factor = 'Корректировка'

            item['Object' + this.aim.pk] = '0.00'

            for (i = 0; i < this.analogs.length; i++) {
              item['Object' + this.analogs[i].pk] = '0.00'
            }
            this.items.push(item)

            if (stage === 1) {
              item = {}

              item.number = ''
              item.factor_num = number
              item.factor = 'Скорректированная стоимость'

              item['Object' + this.aim.pk] = this.aim.price_offer

              for (i = 0; i < this.analogs.length; i++) {
                item['Object' + this.analogs[i].pk] = this.analogs[i].price_offer
              }
              this.items.push(item)
            }
          }
        }
      }

      if (stage === 2) {
        item = {}

        item.number = ''
        item.factor_num = number
        item.factor = 'Скорректированная стоимость'

        item['Object' + this.aim.pk] = this.aim.price_offer

        for (i = 0; i < this.analogs.length; i++) {
          item['Object' + this.analogs[i].pk] = this.analogs[i].price_offer
        }
        this.items.push(item)
      }
    },

    showSerialCorr () {
      // this.tableAimAndAnalogs = false
      this.firstItems = []

      if ((this.aim) && (this.analogs.length > 0)) {
        let priceOffer = 0;
        let objectArea = 1.0
        this.aim.object_area > 0 ? objectArea = this.aim.object_area : objectArea = 1.0
        if (this.aim.ads_type === 'R') {
          priceOffer = this.aim.price_rent / objectArea
        }
        if (this.aim.ads_type === 'S') {
          priceOffer = this.aim.price_sale / objectArea
        }

        this.aim.price_offer = priceOffer.toFixed(2)
        this.aim.rights = 'Право собственности'
        this.aim.fin_cond = 'Типичные'
        this.aim.sale_cond = 'Сделка'
        this.aim.period = 'Январь 2022'

        for (var i = 0; i < this.analogs.length; i++) {
          this.analogs[i].object_area > 0 ? objectArea = this.analogs[i].object_area : objectArea = 1.0
          if (this.analogs[i].ads_type === 'R') {
            priceOffer = this.analogs[i].price_rent / objectArea
          }
          if (this.analogs[i].ads_type === 'S') {
            priceOffer = this.analogs[i].price_sale / objectArea
          }

          this.analogs[i].price_offer = priceOffer.toFixed(2)
          this.analogs[i].rights = 'Право собственности'
          this.analogs[i].fin_cond = 'Типичные'
          this.analogs[i].sale_cond = 'Предложение'
          this.analogs[i].period = 'Декабрь 2021'
        }

        this.setObjectItems(this.serialCorr, 1)
        this.firstItems = this.items
        this.$bvModal.show('tableSerialCorr')
      }
    },

    showFreeCorr() {
      this.secondItems = []

      if ((this.aim) && (this.analogs.length > 0)) {
        this.aim.price_offer = this.firstItems[this.firstItems.length - 1]['Object'+this.aim.pk]

        for (var i = 0; i < this.analogs.length; i++) {
          this.analogs[i].price_offer = this.firstItems[this.firstItems.length - 1]['Object'+this.analogs[i].pk]
        }

        const schema = {}
        schema.price_offer = {
          type: 'float',
          label: 'Скорректированная стоимость после первого этапа'
        }
        this.freeCorrForLandPlots.forEach(parameter => {
          schema[parameter] = {
            type: this.scheme[parameter].type,
            label: this.scheme[parameter].label
          }
          if (this.scheme[parameter].type === 'choice') {
            schema[parameter].choices = this.scheme[parameter].choices
          }
        })
        for (const param in this.secondAddGroupComparisonElementsForLandPlots) {
          schema[param] = {
            type: this.secondAddGroupComparisonElementsForLandPlots[param].type,
            label: this.secondAddGroupComparisonElementsForLandPlots[param].label
          }
        }
        this.aim.inside_city = 'Да'
        this.aim.asphalt_pavement = 'Да'
        this.aim.relief = 'Равнина'
        this.aim.locations_characteristics = 'Обычные'

        for (var j = 0; j < this.analogs.length; j++) {
          this.analogs[j].inside_city = 'Да'
          this.analogs[j].asphalt_pavement = 'Да'
          this.analogs[j].relief = 'Равнина'
          this.analogs[j].locations_characteristics = 'Обычные'
        }
        this.setObjectItems(schema, 2)
        this.secondItems = this.items
        this.$bvModal.show('tableFreeCorr')
      }
    },

    showSummary() {
      this.thirdItems = []

      if ((this.aim) && (this.analogs.length > 0)) {
        let coef = 0.0
        for (var i = 0; i < this.analogs.length; i++) {
          let sum = 0.0

          for (var j = 2; j < 6; j++) {
            sum = sum + 1 * this.firstItems[(j - 1) * 3 - 1]['Object' + this.analogs[i].pk]
          }
          for (var k = 0; k < (this.secondItems.length - 2) / 2; k++) {
            sum = sum + 1 * this.secondItems[(k + 2) * 2 - 2]['Object' + this.analogs[i].pk]
          }

          if (sum === 0) sum = 100

          coef = coef + (1 / (sum / 100))
        
          this.analogs[i].absolute_sum = sum
          this.analogs[i].coefficient = (1 / (sum / 100))
          this.analogs[i].corr_price = this.secondItems[this.secondItems.length - 1]['Object'+this.analogs[i].pk]
        }
        let weightedPrice = 0.0
        for (var m = 0; m < this.analogs.length; m++) {
          this.analogs[m].weigth_analogue = ((this.analogs[m].coefficient / coef) * 100)
          weightedPrice = weightedPrice + (this.analogs[m].coefficient / coef) * this.secondItems[this.secondItems.length - 1]['Object'+this.analogs[m].pk]
        }
        this.aim.weighted_price = weightedPrice.toFixed(2)

        this.setObjectItems(this.thirdGroupComparisonElements, 3)
        this.thirdItems = this.items
        this.$bvModal.show('tableSummary')
      }
    }
  },
    computed: {
    },

    watch: {
      objectEvaluation(newObjectEvaluation) {
        this.aim = newObjectEvaluation
      },

      analogues(newAnalogues) {
        this.analogs = newAnalogues
      },

      tableFields(newTableFields) {
        this.scheme = newTableFields
      },
    },

    beforeUpdate() {
    },

    beforeDestroy() {
     
    },
    
    mounted() {
    }
}
</script>

<style>

.modal-dialog, .modal-content {
  height: 90%;
}

.modal-body {
  max-height: calc(100% - 120px);
}

.modal-xxl { 
  max-width: 90% !important;
  width: 90% !important;
}
</style>