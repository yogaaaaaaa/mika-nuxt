<template>
  <v-card class="mt-6" flat>
    <dform
      :show-toolbar="show"
      :form-field="formField"
      :initial-data="initialData"
      :permission-role="permissionRole"
      :btn-show-archive="btnShowArchive"
      @archive="archive"
      @unarchive="unarchived"
      @onSubmit="submit"
    />
  </v-card>
</template>

<script>
import dform from './dform'
import formFieldEdit from './formFieldEdit'
import { catchError, toArchive } from '~/mixins'

export default {
  components: {
    dform,
  },
  mixins: [catchError, toArchive],
  data() {
    return {
      formField: formFieldEdit,
      permissionRole: 'adminMarketing',
      url: `/back_office/acquirers`,
      initialData: {},
      show: false,
      btnShowArchive: true,
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
