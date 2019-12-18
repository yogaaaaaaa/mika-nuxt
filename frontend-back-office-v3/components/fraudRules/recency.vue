<template>
  <div class="px-3 py-3">
    <formAdd
      :form-field="formField"
      :permission-role="permissionRole"
      save-btn-text="Update"
      save-btn-icon="save"
      :props-data="{ merchants }"
      :initial-data="recency"
      @onSubmit="recencySubmit"
    ></formAdd>
  </div>
</template>

<script>
import formAdd from '../commons/formAdd'
import formField from './formField'
import { catchError } from '~/mixins'

export default {
  components: { formAdd },
  mixins: [catchError],

  data() {
    return {
      formField: formField.recency,
      permissionRole: 'adminMarketing',
      form: {},
      merchants: [],
    }
  },
  computed: {
    recency() {
      const data = {}
      const currentEdit = this.$store.state.currentEdit
      const id_merchant = parseInt(currentEdit.id_merchant)
      const recency = currentEdit.recency
      data.id_merchant = id_merchant
      Object.keys(recency).map(key => {
        Object.keys(recency[key]).map(k => {
          if (!data[`${key}.${k}`]) data[`${key}.${k}`] = recency[key][k]
        })
      })
      return data
    },
  },
  mounted() {
    this.getMerchants()
  },
  methods: {
    async getMerchants() {
      try {
        const resp = await this.$axios.$get(
          '/back_office/merchants?per_page=50&order_by=name&order=asc'
        )
        resp.data.map(r =>
          this.merchants.push({
            value: r.id,
            text: r.name,
          })
        )
      } catch (e) {
        this.catchError(e)
      }
    },
    async recencySubmit(data) {
      try {
        this.$store.commit('globalLoading', true)

        delete data['createdAt']
        this.form.id_merchant = data.id_merchant.toString()
        delete data['id_merchant']
        let result = {}
        Object.keys(data).map(key => {
          const splitKey = key.split('.')
          if (!result[splitKey[0]]) result[splitKey[0]] = {}
          if (!result[splitKey[0]][splitKey[1]])
            result[splitKey[0]][splitKey[1]] = {}
          result[splitKey[0]][splitKey[1]] = parseInt(data[key])
        })
        this.form.recency = result
        const resp = await this.$axios.$put(
          '/back_office/fraud-detections/rules/' + this.form.id_merchant,
          this.form
        )
        this.$store.commit('currentEdit', resp.data)
        this.$store.commit('globalLoading', false)
        this.showSnackbar('success', 'Recency rule updated')
      } catch (e) {
        this.$store.commit('globalLoading', false)

        this.catchError(e)
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
