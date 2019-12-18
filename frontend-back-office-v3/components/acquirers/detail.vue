<template>
  <v-card class="mt-6" flat>
    <formAdd
      :form-field="formField"
      :initial-data="initialData"
      :sm6="true"
      :permission-role="permissionRole"
      @onSubmit="submit"
      @archive="archive"
      @unarchived="unarchived"
    />
  </v-card>
</template>

<script>
import { formAdd } from '~/components/commons'
import formField from './formField'
import { catchError, toArchive } from '~/mixins'

export default {
  components: {
    formAdd,
  },
  mixins: [catchError, toArchive],
  data() {
    return {
      formField: formField,
      permissionRole: 'adminMarketing',
      url: `/back_office/acquirers`,
      initialData: {},
    }
  },
  computed: {
    currentEdit() {
      return this.$store.state.currentEdit
    },
  },
  mounted() {
    this.populateInitialData()
  },
  methods: {
    async submit(data) {
      try {
        const response = await this.$axios.$put(
          `${this.url}/${this.$route.params.id}`,
          data
        )
        if (response.status !== 'ent-406') {
          this.$store.commit('currentEdit', response.data)
          this.showSnackbar('success', `Data successfuly edited`)
        }
      } catch (e) {
        this.catchError(e)
      }
    },
    populateInitialData() {
      if (this.currentEdit) {
        this.initialData = {
          id: this.currentEdit.id,
          name: this.currentEdit.name,
          description: this.currentEdit.description,
          minimumAmount: this.currentEdit.minimumAmount,
          maximumAmount: this.currentEdit.maximumAmount,
          processFee: this.currentEdit.processFee,
          shareAcquirer: this.currentEdit.shareAcquirer,
          shareMerchant: this.currentEdit.shareMerchant,
          shareMerchantWithPartner: this.currentEdit.shareMerchantWithPartner,
          sharePartner: this.currentEdit.sharePartner,
          directSettlement: this.currentEdit.directSettlement,
          gateway: this.currentEdit.gateway,
          hidden: this.currentEdit.hidden,
          merchantId: this.currentEdit.merchantId,
          acquirerConfigId: this.currentEdit.acquirerConfigId,
          acquirerTypeId: this.currentEdit.acquirerTypeId,
          createdAt: this.currentEdit.createdAt,
          updatedAt: this.currentEdit.updatedAt,
          archivedAt: this.currentEdit.archivedAt,
          acquirerConfigName: this.currentEdit.acquirerConfig.name,
          acquirerTypeName: this.currentEdit.acquirerType.name,
          merchantName: this.currentEdit.merchant.name,
        }
      }
    },
  },
}
</script>

<style></style>
