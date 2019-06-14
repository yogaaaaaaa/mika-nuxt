<template>
  <div id="merchant-marketing">
    <main-title
      :text="'List Merchant'"
      :icon="'domain'"
      :show="false"
    />
    <v-card class="main pa-3">
      <table-merchant :merchants="merchants" />
      <download :data="dataContoh" :filter="filterTransaction" />
    </v-card>
    <button-add @dialog="form = !form" />
    <v-dialog v-model="form" width="700">
      <form-merchant 
        :show="form" 
        @close="form = false"
      />
    </v-dialog>
    <v-btn @click="getMerchants()">merchant</v-btn>
  </div>
</template>

<script>
import tableMerchant from "~/components/table/merchants.vue";
import download from "~/components/download.vue";
import formMerchant from "~/components/form/merchant.vue";
import addButton from "~/components/add.vue";
import mainTitle from "~/components/mainTitle.vue";
import transactionTable from "~/components/table/transactions.vue";
import { filterHeader } from "~/mixins";
import outletTable from "~/components/table/outlets.vue";

export default {
  layout: "marketing-layout",
  // middleware: "auth",
  components: {
    "table-merchant": tableMerchant,
    "download": download,
    "form-merchant": formMerchant,
    "button-add": addButton,
    "main-title": mainTitle,
    "table-transaction": transactionTable,
    "table-outlet": outletTable
  },
  mixins:[filterHeader],
  data() {
    return {
      merchants: [
        { 
          name: "Lotte Indonesia", 
          shortName: "Lotte", 
          description: "",
          companyForm: "LI",
          email: "lotte@indonesia.com",
          website: "lotte-indonesia.com",
          phoneNumber: "(021)6662998",
          idTaxCard: "",
          scannedTaxResource: "",
          bankName: "BRI",
          bankBranchName: "Sudirman",
          bankAccountName: "Maman Utomo",
          bankAccountNumber: "0987-8976639-8763528-7",
          scannedBankStatementresourceId: "",
          scannedSkmenkumhamResourceId: "",
          scannedSiupResourceId: "",
          scannedSkdpResourceId: "",
          partnerId: "",
          userId: "",
          ownerName: "Manutomo"
        }
      ],
      form: false,
      dataContoh: [],
      cth: []
    }
  },
  mounted() {
    this.getMerchants()
  },
  methods: {
    async getMerchants() {
      await this.$axios.get("api/back_office/merchants").then(
        r => {
          this.merchants = r.data.data
        }
      ).catch(e => console.log(e))
    }
  }
}
</script>

<style>

</style>
