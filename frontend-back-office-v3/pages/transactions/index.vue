<template>
  <div id="transaction-page">
    <sub-title :text="'List Transaction'" :icon="'confirmation_number'"/>
    <v-card class="pa-3">
      <table-transaction
        :showMerchant="showMerchant"
        :loading="loading"
        :filter="filterTransaction"
        @close="loading = !loading"
      />
    </v-card>
  </div>
</template>

<script>
import transactionTable from "~/components/table/transactions.vue";
import subTitle from "~/components/subtitle.vue";
import { filterHeader, fetchData, setDatePicker } from "~/mixins";
import moment from "moment-mini";

export default {
  layout: "marketing-layouut",
  // middleware: "auth",
  components: {
    "table-transaction": transactionTable,
    "sub-title": subTitle
  },
  mixins: [filterHeader, fetchData, setDatePicker],
  data() {
    return {
      transactions: [],
      page: 1,
      perPage: [30],
      totalPage: 0,
      merchantId: "",
      value1: "",
      totalTransactions: 0,
      showMerchant: true,
      allTransaction: [],
      loading: true
    };
  }
};
</script>

<style>
</style>
