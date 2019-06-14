<template>
  <div id="transaction-page">
    <sub-title :text="'List Transaction'" :icon="'confirmation_number'"/>
    <v-card class="pa-3">
      <table-transaction :transactions="transactions"/>
      <download :data="transactions" :filter="filterTransaction"/>
    </v-card>
  </div>
</template>

<script>
import transactionTable from "~/components/table/transactions.vue";
import subTitle from "~/components/subtitle.vue";
import download from "~/components/download.vue";
import { filterHeader } from "~/mixins";

export default {
  layout: "marketing-layouut",
  middleware: "auth",
  components: {
    "table-transaction": transactionTable,
    "sub-title": subTitle,
    download: download
  },
  mixins: [filterHeader],
  data() {
    return {
      transactions: []
    };
  },
  mounted() {
    this.getMerchants();
  },
  methods: {
    async getMerchants() {
      await this.$axios
        .get("/api/back_office/transactions?page=1")
        .then(r => {
          this.transactions = r.data.data;
        })
        .catch(e => console.log(e));
    }
  }
};
</script>

<style>
</style>
