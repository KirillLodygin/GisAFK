<template>
  <transition name="fade">
    <b-row v-if="isProfile" class="p-lg-5">
      <b-row offset-md="2" class="w-100 block-wrap profile-block">
        <b-card :title="profileHeadTitle" class="p-2 w-25 block-view">
          <b-form @submit.prevent>
            <profile-input :fields="fields" @getNewRole="createNewButtonsGroup" />
            <div class="buttons-block">
              <form-button
                v-for="button in buttons"
                :key="button.title"
                :title="button.title"
                :disabled="button.disabled"
                :show="button.show"
                class="list-item"
                @onButtonClick="onButtonClick"
              />
            </div>
          </b-form>
        </b-card>
      </b-row>
      <transition name="fade">
        <b-row v-if="tableShow" offset-md="2" class="w-75 block-wrap table-block">
          <ReportingTable @onButtonClick="onButtonClick" />
        </b-row>
      </transition>
    </b-row>
  </transition>
</template>

<script>
import FormButton from '~/components/Form/FormButton'
import ProfileInput from '~/components/Form/ProfileInput'
import { applicationState } from '@/constants/defaultValues'
import { PROFILE_BUTTONS } from '~/constants/profileConstants'
import { REPORTING_TABLE_BUTTONS } from '~/constants/reportingTableConstants'
import ReportingTable from '@/components/ReportingTable/ReportingTable'

export default {
  name: 'ProfileItem',
  components: { FormButton, ProfileInput, ReportingTable },
  props: {
    isProfile: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    const { profileEntities } = applicationState
    const { profileFields, profileButtons, profileHeadTitle } = profileEntities

    return {
      fields: profileFields,
      buttons: profileButtons,
      profileHeadTitle,
      tableShow: false,
    }
  },
  methods: {
    createNewButtonsGroup(newRole) {
      if (newRole === 'a') {
        this.buttons[0].disabled = false
        this.buttons[0].show = true
      } else {
        this.buttons[0].disabled = true
        this.buttons[0].show = false
      }
    },

    onButtonClick(title) {
      if (title === PROFILE_BUTTONS.close) {
        this.buttons[0].disabled = true
        this.buttons[0].show = false
        this.$emit('closeProfile')
      }

      if (title === PROFILE_BUTTONS.showTable) {
        this.tableShow = true
      }

      if (title === REPORTING_TABLE_BUTTONS.close) {
        this.tableShow = false
      }
    },
  },
}
</script>

<style scoped>
.block-view {
  box-shadow: 0 8px 20px 0;
}

.block-wrap {
  position: fixed;
}

.profile-block {
  z-index: 1000;
}

.table-block {
  z-index: 1020;
  top: 70px;
  left: 310px;
}

.buttons-block {
  text-align: right;
}

.list-item {
  margin-right: 10px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.7s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
