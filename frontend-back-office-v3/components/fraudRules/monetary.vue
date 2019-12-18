<template>
  <div v-if="monetary" class="px-3 py-3">
    <div v-for="item in monetary" :key="item.range">
      <h4 class="subtitle mb-3">{{ $changeCase.titleCase(item.range) }}</h4>
      <formAdd
        :form-field="formField"
        :permission-role="permissionRole"
        save-btn-text="Update"
        save-btn-icon="save"
        :initial-data="item"
        sm6
        @onSubmit="submit"
      ></formAdd>
    </div>
  </div>
</template>

<script>
import { catchError } from '~/mixins'
import formField from './formField'
import formAdd from '../commons/formAdd'
import { convertToFormField, revertToDbData, prepareUpdateData } from './helper'
export default {
  components: { formAdd },
  mixins: [catchError],
  data() {
    return {
      formField: formField.monetary,
      permissionRole: 'adminMarketing',
      monetary: null,
    }
  },
  computed: {
    currentEdit() {
      return this.$store.state.currentEdit
    },
  },
  mounted() {
    this.setMonetary()
  },
  methods: {
    setMonetary() {
      if (this.currentEdit) {
        this.monetary = convertToFormField(this.currentEdit.monetary)
      }
    },
    async submit(data) {
      try {
        this.$store.commit('globalLoading', true)
        const result = revertToDbData(data)
        const putData = prepareUpdateData(this.currentEdit, 'monetary', result)
        const resp = await this.$axios.$put(
          `/back_office/fraud-detections/rules/${putData.id_merchant}`,
          putData
        )
        this.$store.commit('currentEdit', resp.data)
        this.showSnackbar('success', 'monetary rule updated')
        this.$store.commit('globalLoading', false)
      } catch (e) {
        this.$store.commit('globalLoading', false)
        this.catchError(e)
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
