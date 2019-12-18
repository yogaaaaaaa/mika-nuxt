<template>
  <v-card flat>
    <formTransaction
      :form-field="formField"
      :form-title="formTItle"
      :sm6="true"
      :initial-data="initialData"
    />
  </v-card>
</template>

<script>
import formTransaction from '~/components/transactions/formTransaction'
import formField from './formField'

export default {
  components: {
    formTransaction,
  },
  data() {
    return {
      formField: formField,
      formTItle: 'Transaction Detail',
      initialData: {},
      dataEdit: {},
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
    populateInitialData() {
      if (this.currentEdit) {
        this.initialData = {
          id: this.currentEdit.id,
          idAlias: this.currentEdit.idAlias,
          amount: this.currentEdit.amount,
          status: this.currentEdit.status,
          settlementStatus: this.currentEdit.settlementStatus,
          referenceNumber: this.currentEdit.referenceNumber,
          shareMerchant: this.currentEdit.acquirer.shareMerchant,
          sharePartner: this.currentEdit.acquirer.sharePartner,
          shareAcquirer: this.currentEdit.acquirer.shareAcquirer,
          shareMerchantWithPartner: this.currentEdit.acquirer
            .shareMerchantWithPartner,
          ipAddress: this.currentEdit.ipAddress,
          agentName: this.currentEdit.agent.name,
          outletName: this.currentEdit.agent.outlet.name,
          merchantName: this.currentEdit.agent.outlet.merchant.name,
          acquirerTypeName: this.currentEdit.acquirer.acquirerType.name,
          date: this.currentEdit.updatedAt,
        }
      }
    },
  },
}
</script>

<style></style>
