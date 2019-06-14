<template>
  <div id="acquirer-detail" class="pt-4">
    <v-tabs v-model="activeTab" slider-color="yellow">
      <v-tab v-for="tab in tabItem" :key="tab.text" :to="tab.to" ripple>{{ tab.text }}</v-tab>
      <v-tab-item value="detail-acquirer">
        <sub-title :text="'Detail Acquirer'" :icon="'device_hub'"/>
        <v-container fluid class="mb-3 pa-0">
          <v-layout d-flex row wrap>
            <card-top :title="'Total Transaction'" :text="'836'" :total="totalTransaction"/>
          </v-layout>
        </v-container>
        <card-acquirer :acquirer="acquirer"/>
      </v-tab-item>
      <v-tab-item value="list-transaction">
        <sub-title :text="'List Transaction'" :icon="'confirmation_number'"/>
        <v-card class="pa-3">
          <table-transaction :transactions="transactions"/>
          <download :data="transactions" :filter="filterTransaction"/>
        </v-card>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import acquirerCard from "~/components/card/acquirer.vue";
import transactionTable from "~/components/table/transactions.vue";
import download from "~/components/download.vue";
import mainTitile from "~/components/mainTitle.vue";
import subTitle from "~/components/subtitle.vue";
import topCard from "~/components/card/top.vue";
import merchantTable from "~/components/table/merchants.vue";
import { filterHeader } from "~/mixins";

export default {
  layout: "default-layout",
  middleware: "auth",
  components: {
    "card-acquirer": acquirerCard,
    "table-transaction": transactionTable,
    download: download,
    "main-title": mainTitile,
    "sub-title": subTitle,
    "card-top": topCard,
    "table-merchant": merchantTable
  },
  mixins: [filterHeader],
  data() {
    return {
      activeTab: "",
      transactions: [],
      merchants: [],
      items: [{ title: "List Transactions", to: "#transactionList" }],
      acquirer: {},
      totalTransaction: 0,
      tabItem: [
        { text: "Detail Acquirer", to: "#detail-acquirer" },
        { text: "List Transaction", to: "#list-transaction" }
      ]
    };
  },
  mounted() {
    this.getTransactionAcquirer();
    this.getAcquirer();
  },
  methods: {
    async getAcquirer() {
      await this.$axios
        .$get(`/api/back_office/acquirers/${this.$route.params.id}`)
        .then(r => {
          this.acquirer = r.data;
          console.log("isi acquirer", this.acquirer);
        })
        .catch(e => console.log(e));
    },
    async getTransactionAcquirer() {
      await this.$axios
        .$get(
          `/api/back_office/transactions?get_count=1&f[acquirerId]=eq,${
            this.$route.params.id
          }`
        )
        .then(r => {
          this.transactions = r.data;
          this.totalTransaction = r.meta.totalCount;
        });
    }
  }
};
</script>

<style>
</style>
