<template>
  <div id="acquirer-detail" class="pt-4">
    <v-tabs v-model="activeTab" slider-color="yellow">
      <v-tab v-for="tab in tabItem" :key="tab.text" :to="tab.to" ripple>{{ tab.text }}</v-tab>
      <v-tab-item value="detail-acquirer">
        <sub-title :text="'Detail Acquirer'" :icon="'device_hub'"/>
        <v-container fluid class="mb-3 pa-0">
          <v-layout d-flex row wrap>
            <card-top
              :title="'Total Transaction'"
              :text="'836'"
              :total="totalTransaction"
              :loading="loadingCardTransaction"
            />
          </v-layout>
        </v-container>
        <v-container text-xs-center v-if="loadingAcquirer">
          <v-flex>
            <v-progress-circular :size="60" color="blue" indeterminate/>
          </v-flex>
        </v-container>
        <detail-acquirer
          :acquirer="acquirer"
          :merchant="merchant"
          v-if="!loadingAcquirer"
          @edit="formEdit = true"
        />
        <v-dialog v-model="formEdit">
          <card-acquirer :acquirer="acquirer" @refresh="getAcquirer()" @close="formEdit = false"/>
        </v-dialog>
      </v-tab-item>
      <v-tab-item value="list-transaction">
        <sub-title :text="'List Transaction'" :icon="'confirmation_number'"/>
        <v-card class="pa-3">
          <table-transaction
            :api="apiTransaction"
            :params="params"
            :filter="filterTransaction"
            :totalPage="transactionPage"
            :showMerchant="showMerchant"
          />
        </v-card>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import acquirerCard from "~/components/card/acquirer.vue";
import transactionTable from "~/components/table/transactions.vue";
import mainTitile from "~/components/mainTitle.vue";
import subTitle from "~/components/subtitle.vue";
import topCard from "~/components/card/top.vue";
import merchantTable from "~/components/table/merchants.vue";
import { filterHeader, fetchSingleData } from "~/mixins";
import acquirerDetail from "~/components/cardDetail/acquirer.vue";
import { mapState } from "vuex";

export default {
  layout: "default-layout",
  middleware: "auth",
  components: {
    "card-acquirer": acquirerCard,
    "table-transaction": transactionTable,
    "main-title": mainTitile,
    "sub-title": subTitle,
    "card-top": topCard,
    "table-merchant": merchantTable,
    "detail-acquirer": acquirerDetail
  },
  mixins: [filterHeader, fetchSingleData],
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
      ],
      transactionPage: 1,
      params: `&f[acquirerId]=eq,${this.$route.params.id}`,
      showMerchant: true,
      loadingCardTransaction: true,
      loadingTransaction: true,
      loadingAcquirer: true,
      formEdit: false
    };
  },
  mounted() {
    this.getTransactionAcquirer();
    this.getAcquirer();
  },
  computed: {
    ...mapState(["apiTransaction"])
  },
  methods: {
    async getAcquirer() {
      await this.$axios
        .$get(`/api/back_office/acquirers/${this.$route.params.id}`)
        .then(r => {
          this.acquirer = r.data;
          this.$store.commit("setAcquirer", this.acquirer);
          this.getMerchant(this.acquirer.merchantId);
          // this.$store.commit("setMerchant", this.merchant);
          this.loadingAcquirer = false;
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
          if (r.meta) {
            this.totalTransaction = r.meta.totalCount;
            this.transactionPage = r.meta.ofPage;
          }
          this.loadingCardTransaction = false;
          this.loadingTransaction = false;
          this.$store.commit(
            "setApiTransaction",
            `/api/back_office/transactions?get_count=1&f[acquirerId]=eq,${
              this.$route.params.id
            }&page=`
          );
        });
    }
  }
};
</script>

<style>
</style>
