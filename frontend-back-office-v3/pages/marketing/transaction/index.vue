<template>
  <div id="transaction-page">
    <v-card>
      <table-transaction :transactions="transactions" />
    </v-card>
  </div>
</template>

<script>
import transactionTable from "~/components/table/transactions.vue"

export default {
  layout: "marketing-layouut",
  components: {
    "table-transaction": transactionTable
  },
  data() {
    return {
      transactions:[]
    }
  },
  mounted() {
    this.getMerchants();
  },
  methods: {
    async getMerchants() {
      await this.$axios.get("/api/agent/transactions?page=1").then(
        r => {
          this.transactions = r.data.data
        }
      ).catch(e => console.log(e))
    }
  }
}
</script>

<style>

</style>
