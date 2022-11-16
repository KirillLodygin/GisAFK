<template>
  <div>
    <input-string
      :id="fields[0].id"
      v-model="userName"
      :placeholder="fields[0].placeholder"
      :title="fields[0].title"
      :is-readonly="isReadonly"
    />
    <input-string
      :id="fields[1].id"
      v-model="userEmail"
      :placeholder="fields[1].placeholder"
      :title="fields[1].title"
      :is-readonly="isReadonly"
    />
    <profile-drop-down-list :id="fields[2].id" :options="fields[2].meaning" :title="fields[2].title" @getNewRole="getRole" />
  </div>
</template>

<script>
import InputString from '~/components/Form/InputString'
import ProfileDropDownList from '@/components/Form/ProfileDropDownList'
export default {
  name: 'ProfileInput',
  components: { ProfileDropDownList, InputString },
  props: {
    fields: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      userEmail: this.$auth.user.email,
      userName: this.$auth.user.username,
      isReadonly: true
    }
  },
  methods: {
    getRole(newRole) {
      this.$emit('getNewRole', newRole)
    },
  },
}
</script>

<style scoped></style>
