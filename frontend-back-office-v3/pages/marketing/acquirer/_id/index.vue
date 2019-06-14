<template>
  <div id="payment-provider-detail">
    <main-title 
      :text="'Detail Acquirer'"
      :icon="'device_hub'"
      :items="items"
    />
    <v-container fluid class="mb-3 pa-0">
      <v-layout d-flex row wrap>
        <card-top :title="'Total Merchant'" :text="'6'" />
        <card-top :title="'Total Transaction'" :text="'836'" />
      </v-layout>
    </v-container>
    <card-payment-provider />
    <sub-title 
      :text="'List Transactions'" 
      :icon="'confirmation_number'"
      id="transactionList"
    />
    <v-card class="pa-3 mt-1">
     <table-transaction :transactions="transactions" />
     <download :data="transactions" />
    </v-card>
    <sub-title
      :text="'List Merchant'"
      :icon="'domain'"
      id="'merchantList'"
    />
    <v-card class="pa-3 mt1">
      <table-merchant :merchants="merchants" />
      <download :data="merchants" />
    </v-card>
  </div>
</template>

<script>
import paymentProviderCard from "~/components/card/acquirer.vue";
import transactionTable from "~/components/table/transactions.vue";
import download from "~/components/download.vue";
import mainTitile from "~/components/mainTitle.vue";
import subTitle from "~/components/subtitle.vue";
import topCard from "~/components/card/top.vue";
import merchantTable from "~/components/table/merchants.vue"

export default {
  layout: "marketing-layout",
  components: {
    "card-payment-provider": paymentProviderCard,
    "table-transaction": transactionTable,
    "download": download,
    "main-title": mainTitile,
    "sub-title": subTitle,
    "card-top": topCard,
    "table-merchant": merchantTable
  },
  data() {
    return{
      transactions: [],
      merchants: [],
      items: [
        { title: "List Transactions", to: "#transactionList" }
      ],
      acquirer: "",
      totalTransaction: ""
    }
  },
  mounted() {

  },
  methods: {
    async getDetailAcquirer() {
      await this.$axios.$get(
        `/api/back_office/acquirers/${this.$route.params.id}`
      ).then( r => {
        this.acquirer = r.data
      }).catch( e => console.log(e))
    },
    async getTransactionAcquirer() {
      await this.$axios.$get(
        `/api/back_office/transactions?get_count=1`
      ).then( r => {
        this.transactions = r.data
        this.totalTransaction = r.meta.totalCount
      })
    }
  }
}
</script>

<style>

</style>
