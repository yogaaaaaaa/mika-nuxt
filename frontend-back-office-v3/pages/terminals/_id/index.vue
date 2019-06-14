<template>
  <div id="terminal-detail">
    <main-title
      :text="'Detail Terminal'"
      :icon="'system_update'"
      :items="items"
    />
    <card-terminal class="mb-4"/>
    <sub-title 
      :text="'List Transactions'"
      :icon="'confirmation_number'"
      id="transactionList"
    />
    <v-card class="pa-3 mt-1">
      <table-transaction :transactions="transactions" />
      <download :data="transactions" />
    </v-card>
  </div>
</template>

<script>
import terminalCard from "~/components/card/terminal.vue";
import transactionTable from "~/components/table/transactions.vue";
import download from "~/components/download.vue";
import mainTitle from "~/components/mainTitle.vue";
import subTitle from "~/components/subtitle.vue";

export default {
  layout: "default-layout",
  components: {
    "card-terminal": terminalCard,
    "table-transaction": transactionTable,
    "download": download,
    "main-title": mainTitle,
    "sub-title": subTitle
  },
  data() {
    return {
      transactions: [],
      items: [
        { title: "List Transactions", to: "#transactionList" }
      ],
      terminal: "",
      totalTransaction: ""
    }
  },
  mounted() {

  },
  methods: {
    async getDetailTerminal() {
      await this.$axios.$get(
        `/api/back_office/terminals/${this.$route.params.id}`
      ).then( r => {
        this.terminal = r.data
      }).catch( e => console.log(e))
    },
    async getTransactionTerminal() {
      await this.$axios.$get(
        `/api/back_office/transactions?get_count=1&f[terminalId]=f,1`
      ).then( r => {
        this.transactions = r.data
        this.totalTransaction = r.meta.totalCount
      }).catch( e => console.log(e))
    }
  }

}
</script>

<style>

</style>
