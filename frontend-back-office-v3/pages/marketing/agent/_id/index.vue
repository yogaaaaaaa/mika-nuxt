<template>
  <div id="agent-detail">
    <main-title
      :text="'Detail Agent'"
      :icon="'assignment_ind'"
      :items="items"
    />
    <card-agent class="mb-4" />
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
import agentCard from "~/components/card/agent.vue";
import download from "~/components/download.vue";
import transactionTable from "~/components/table/transactions.vue";
import mainTitle from "~/components/mainTitle.vue";
import subTitle from "~/components/subtitle.vue";

export default {
  layout: "marketing-layout",
  components: {
    "download": download,
    "card-agent": agentCard,
    "table-transaction": transactionTable,
    "main-title": mainTitle,
    "sub-title": subTitle
  },
  data() {
    return {
      transactions: [],
      items: [
        { text: "List Transactions", to: "#transactionList" }
      ],
      agent: ""
    }
  },
  mounted() {
    this.getTransactionAgent()
  },
  methods: {
    async getDetailAgent() {
      await this.$axios.$get(
        `/api/back_office/agents/${this.$route.params.id}`
      ).then( r => {
        this.agent = r.data
      }).catch( e => console.log(e))
    },
    async getTransactionAgent() {
      await this.$axios.$get(
        `/api/back_office/transactions?get_count=1&f[agentId]=eq,${this.$route.params.id}`
      ).then( r => {
        this.transactions = r.data
      }).catch( e => console.log(e))
    }
  }

}
</script>

<style>

</style>
