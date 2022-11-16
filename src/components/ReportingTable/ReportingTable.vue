<template>
  <b-card :title="reportingTableHeadTitle" class="p-1 mr-lg-5 mr-5 w-100 block-view">
    <div class="inside-block p-3">
      <div v-if="showIntroTable">
        <reporting-table-drop-downs
          :pricing-parameter-meaning="pricingParameter.meaning"
          :pricing-parameter-title="pricingParameter.title"
          :information-sources-meaning="reportingTableSourceDropDown.meaning"
          :information-sources-title="reportingTableSourceDropDown.title"
          :information-sources-id="reportingTableSourceDropDown.id"
          :reporting-table-types-id="reportingTableTypesDropDown.id"
          :reporting-table-types-meaning="reportingTableTypesDropDown.meaning"
          :reporting-table-types-title="reportingTableTypesDropDown.title"
          :name-unique-meaning="uniqueName.meaning"
          :name-unique-title="uniqueName.title"
          :name-unique-id="uniqueName.id"
          :pricing-parameter-id="pricingParameter.id"
          @getSourceNewValue="getNewSource"
          @getNewPricingParameter="getNewPricingParameter"
          @getNewType="getNewType"
          @getTableNameUnique="getTableNameUnique"
        />
        <reporting-table-intro :reporting-table-intro="reportingTableIntro" />
      </div>
      <div v-if="showTableBody" class='w-100'>
        <reporting-table-body :meaning="tableForShow.meaning" :table-title="tableForShow.title" />
      </div>
      <div class="mt-5 buttons-block">
        <form-button
          v-for="button in reportingTableButtons"
          :key="button.title"
          :title="button.title"
          :show="button.show"
          class="buttons-item"
          @onButtonClick="onButtonClick"
        />
      </div>
    </div>
  </b-card>
</template>

<script>
import ReportingTableDropDowns from '@/components/ReportingTable/ReportingTableDropDowns'
import FormButton from '@/components/Form/FormButton'
import ReportingTableIntro from '@/components/ReportingTable/ReportingTableIntro'
import ReportingTableBody from '@/components/ReportingTable/ReportingTableBody'
import { applicationState } from '@/constants/defaultValues'
import { REPORTING_TABLE_BUTTONS, REPORTING_TABLE } from '@/constants/reportingTableConstants'

export default {
  name: 'ReportingTable',
  components: { ReportingTableDropDowns, FormButton, ReportingTableIntro, ReportingTableBody },

  data() {
    const { reportingTable, reportingTableIntro, tableForReport, tableForProgram } = applicationState
    const {
      reportingTableHeadTitle,
      reportingTableButtons,
      reportingTableSourceDropDown,
      reportingTableTypesDropDown,
      reportingTablePricingDropDown,
      reportingTableNameUnique,
    } = reportingTable
    const selectedType = ''
    const selectedSource = ''
    const selectedPricingParameter = ''

    return {
      reportingTableHeadTitle,
      reportingTableButtons,
      reportingTableSourceDropDown,
      reportingTableTypesDropDown,
      reportingTableTypesDictionary: [],
      pricingParameter: reportingTablePricingDropDown,
      uniqueName: reportingTableNameUnique,
      reportingTableIntro,
      showIntroTable: true,
      showTableBody: false,
      referenceBookGroupList: [],
      newReferenceBookGroupList: [],
      selectedType,
      selectedSource,
      selectedPricingParameter,
      tableForReport,
      tableForProgram,
      tableForShow: {},
    }
  },
  mounted() {
    this.getReportingTableStructure()
    this.getReferenceBookGroupList()
  },
  methods: {
    async getReportingTableStructure() {
      if (this.reportingTableTypesDictionary.length === 0) {
        const { data, status } = await this.$store.dispatch('getReportingTableStructure')
        if (status !== 200) {
          // TODO-Кирилл: тут нужно реализовать обработчик для отображения экрана ошибки. Пока будем выводить сообщение в консоль
          console.log('ERROR!')
        }

        const { actions } = data
        const dataForReportingTableTypesDropDown = actions.POST.type.choices.map((item) => ({
          text: item.display_name,
          value: item.value,
        }))
        this.reportingTableTypesDictionary = this.reportingTableTypesDictionary.concat(
          dataForReportingTableTypesDropDown,
        )

        this.reportingTableTypesDropDown.meaning = this.reportingTableTypesDropDown.meaning.slice(0, 1)
        this.reportingTableTypesDictionary.forEach((item) =>
          this.reportingTableTypesDropDown.meaning.push({ text: item.text, value: item.text, disabled: false }),
        )
      }
    },

    async getReferenceBookGroupList() {
      if (this.referenceBookGroupList.length === 0) {
        const { data, status } = await this.$store.dispatch('getReferenceBookGroupList')
        if (status !== 200) {
          // TODO-Кирилл: тут нужно реализовать обработчик для отображения экрана ошибки. Пока будем выводить сообщение в консоль
          console.log('ERROR!')
        }

        if (this.reportingTableSourceDropDown.meaning.length === 1) {
          const sources = []
          data.forEach((item) => {
            if (!sources.includes(item.source)) {
              sources.push(item.source)
            }
          })
          sources.forEach((item) => {
            this.reportingTableSourceDropDown.meaning.push({ value: item, text: item })
          })
        }

        this.referenceBookGroupList = this.referenceBookGroupList.concat(data)
      }
    },

    onButtonClick(title) {
      if (title === REPORTING_TABLE_BUTTONS.close) {
        this.reportingTableButtons.forEach((item) => {
          if (item.title !== REPORTING_TABLE_BUTTONS.close) {
            item.show = false
            item.disabled = true
          }
        })
        this.reportingTableIntro.forEach((item) => {
          item.value = ''
        })

        this.$emit('onButtonClick', title)
      }
      if (title === REPORTING_TABLE_BUTTONS.tableToReport) {
        this.reportingTableButtons.forEach((item) => {
          if (item.title === REPORTING_TABLE_BUTTONS.tableToReport) {
            item.show = false
          }
          if (item.title === REPORTING_TABLE_BUTTONS.tableForProgram) {
            item.show = false
          }
          if (item.title === REPORTING_TABLE_BUTTONS.back) {
            item.show = true
          }
        })
        this.tableForShow = this.tableForReport
        this.showIntroTable = false
        this.showTableBody = true
      }
      if (title === REPORTING_TABLE_BUTTONS.tableForProgram) {
        this.reportingTableButtons.forEach((item) => {
          if (item.title === REPORTING_TABLE_BUTTONS.tableToReport) {
            item.show = false
          }
          if (item.title === REPORTING_TABLE_BUTTONS.tableForProgram) {
            item.show = false
          }
          if (item.title === REPORTING_TABLE_BUTTONS.back) {
            item.show = true
          }
        })
        this.tableForShow = this.tableForProgram
        this.showIntroTable = false
        this.showTableBody = true
      }
      if (title === REPORTING_TABLE_BUTTONS.back) {
        this.reportingTableButtons.forEach((item) => {
          if (item.title === REPORTING_TABLE_BUTTONS.back) {
            item.show = false
          }
          if (item.title === REPORTING_TABLE_BUTTONS.tableToReport) {
            item.show = true
          }
          if (item.title === REPORTING_TABLE_BUTTONS.tableForProgram) {
            item.show = true
          }
          this.showIntroTable = true
          this.showTableBody = false
        })
      }
    },

    getNewType(value) {
      if (value) {
        const desiredObject = this.reportingTableTypesDictionary.filter((item) => item.text === value)[0]
        const type = desiredObject.text
        this.selectedType = desiredObject.value
        this.reportingTableIntro.forEach((item) => {
          if (item.name === REPORTING_TABLE.type) {
            item.value = type
          }
          if (item.name !== REPORTING_TABLE.type) {
            item.value = ''
          }
        })

        this.newReferenceBookGroupList = this.referenceBookGroupList.filter((item) => item.type === this.selectedType)
        const sources = []
        this.newReferenceBookGroupList.forEach((item) => {
          if (!sources.includes(item.source)) {
            sources.push(item.source)
          }
        })
        this.reportingTableSourceDropDown.meaning = this.reportingTableSourceDropDown.meaning.slice(0, 1)
        sources.forEach((item) => this.reportingTableSourceDropDown.meaning.push({ value: item, text: item }))

        this.reportingTableButtons.forEach((item) => {
          if (item.title !== REPORTING_TABLE_BUTTONS.close) {
            item.show = false
            item.disabled = true
          }
        })
      }
    },

    getNewSource(value) {
      if (value) {
        this.selectedSource = value
        this.newReferenceBookGroupList = this.referenceBookGroupList
          .filter((item) => item.type === this.selectedType)
          .filter((item) => item.source === this.selectedSource)

        this.reportingTableIntro.forEach((item) => {
          if (item.name === REPORTING_TABLE.source) {
            item.value = value
          }
          if (item.name !== REPORTING_TABLE.type && item.name !== REPORTING_TABLE.source) {
            item.value = ''
          }
        })

        const pricingParams = []
        this.newReferenceBookGroupList.forEach((item) => {
          if (!pricingParams.includes(item.param_name)) {
            pricingParams.push(item.param_name)
          }
        })
        this.pricingParameter.meaning = this.pricingParameter.meaning.slice(0, 1)
        pricingParams.forEach((item) => this.pricingParameter.meaning.push({ value: item, text: item }))
      }
    },

    getNewPricingParameter(value) {
      if (value) {
        this.selectedPricingParameter = value
        this.reportingTableIntro.forEach((item) => {
          if (item.name === REPORTING_TABLE.paramName) {
            item.value = value
          }
        })

        this.newReferenceBookGroupList = this.referenceBookGroupList
          .filter((item) => item.type === this.selectedType)
          .filter((item) => item.source === this.selectedSource)
          .filter((item) => item[REPORTING_TABLE.paramName] === this.selectedPricingParameter)
        const uniqueNames = []
        this.newReferenceBookGroupList.forEach((item) => {
          if (!uniqueNames.includes(item[REPORTING_TABLE.nameUnique])) {
            uniqueNames.push(item[REPORTING_TABLE.nameUnique])
          }
        })
        this.uniqueName.meaning = this.uniqueName.meaning.slice(0, 1)
        uniqueNames.forEach((item) => this.uniqueName.meaning.push({ value: item, text: item }))

        this.reportingTableIntro.forEach((item) => {
          if (item.name === REPORTING_TABLE.paramName) {
            item.value = value
          }
          if (
            item.name !== REPORTING_TABLE.type &&
            item.name !== REPORTING_TABLE.source &&
            item.name !== REPORTING_TABLE.paramName
          ) {
            item.value = ''
          }
        })
      }
    },

    getTableNameUnique(value) {
      if (value) {
        this.newReferenceBookGroupList = this.referenceBookGroupList
          .filter((item) => item.type === this.selectedType)
          .filter((item) => item.source === this.selectedSource)
          .filter((item) => item[REPORTING_TABLE.paramName] === this.selectedPricingParameter)
          .filter((item) => item[REPORTING_TABLE.nameUnique] === value)
        this.getNewTableForIntro()
      }
    },

    getNewTableForIntro() {
      const newReferenceBookGroupObject = this.newReferenceBookGroupList[0]

      this.getReferenceBookListForReport(newReferenceBookGroupObject.id)
      this.getReferenceBookListForProgram(newReferenceBookGroupObject.id)

      this.reportingTableIntro.forEach((item) => {
        if (!item.value) {
          item.value = newReferenceBookGroupObject[item.name]
          if (item.name === REPORTING_TABLE.dateBegin || item.name === REPORTING_TABLE.dateEnd) {
            item.value = item.value.slice(0, 10)
          }
        }
      })

      this.reportingTableButtons.forEach((item) => {
        if (item.title === REPORTING_TABLE_BUTTONS.tableToReport && this.tableForReport.meaning.length > 0) {
          item.show = true
        }
        if (item.title === REPORTING_TABLE_BUTTONS.tableForProgram && this.tableForProgram.meaning.length > 0) {
          item.show = true
        }
      })
    },

    async getReferenceBookListForReport(ID) {
      const { data, status } = await this.$axios.get(`/api/v1/order/reference_books/?group=${ID}&type=R`)
      if (status !== 200) {
        // TODO-Кирилл: тут нужно реализовать обработчик для отображения экрана ошибки. Пока будем выводить сообщение в консоль
        console.log('ERROR!')
      }

      this.tableForReport.meaning = [].concat(data)
      this.reportingTableButtons.forEach((item) => {
        if (item.title === REPORTING_TABLE_BUTTONS.tableToReport && this.tableForReport.meaning.length > 0) {
          item.show = true
        }
      })
    },

    async getReferenceBookListForProgram(ID) {
      const { data, status } = await this.$axios.get(`/api/v1/order/reference_books/?group=${ID}&type=P`)
      if (status !== 200) {
        // TODO-Кирилл: тут нужно реализовать обработчик для отображения экрана ошибки. Пока будем выводить сообщение в консоль
        console.log('ERROR!')
      }

      this.tableForProgram.meaning = [].concat(data)
      this.reportingTableButtons.forEach((item) => {
        if (item.title === REPORTING_TABLE_BUTTONS.tableForProgram && this.tableForProgram.meaning.length > 0) {
          item.show = true
        }
      })
    },
  },
}
</script>

<style scoped>
.block-view {
  box-shadow: 0 8px 20px 0;
}

.inside-block {
  overflow-y: auto;
  height: 650px;
}

.buttons-block {
  text-align: right;
  padding-bottom: 30px;
}

.buttons-item {
  margin-left: 10px;
}
</style>
