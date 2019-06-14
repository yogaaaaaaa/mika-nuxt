<template>
  <div id="list-transactions">
    <sub-title :text="'List Transactions'" :icon="'confirmation_number'" id="transactionsList" />
    <v-card class="pa-3 mt-1">
      <table-transaction :transactions="transactions" />
      <download :data="transactions" :filter="filterTransaction" />
    </v-card>
  </div>
</template>

<script>
import transactionTable from "~/components/table/transactions.vue";
import download from "~/components/download.vue";
import subTitle from "~/components/subtitle.vue";
import { filterHeader } from "~/mixins"

export default {
  props: {
    transactions: {
      type: Array,
      required: true
    }
  },
  mixins: [filterHeader],
  components: {
    "table-transaction": transactionTable,
    "download": download,
    "sub-title": subTitle
  }

}
</script>

<style>

</style>
