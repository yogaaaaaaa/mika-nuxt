<template>
  <div id="detail-transaction">
    <sub-title :text="'Detail Transaction'" :icon="'confirmation_number'"/>
    <v-container text-xs-center v-if="loadingTransaction">
      <v-flex>
        <v-progress-circular :size="60" color="blue" indeterminate/>
      </v-flex>
    </v-container>
    <detail-transaction
      :agent="agent"
      :transaction="transaction"
      :outlet="outlet"
      :merchant="merchant"
      :acquirer="acquirer"
      class="mb-2"
      v-if="!loadingTransaction"
    />
    <!-- <card-transaction
      :transaction="transaction"
      :agent="agent"
      :outlet="outlet"
      :acquirer="acquirer"
      :acquirerType="acquirerType"
    />-->
  </div>
</template>

<script>
import transactionCard from "~/components/card/transaction.vue";
import subTitle from "~/components/subtitle.vue";
import transactionDetail from "~/components/cardDetail/transaction.vue";
import { fetchSingleData } from "~/mixins";

export default {
  layout: "default-layout",
  // middleware: "auth",
  components: {
    "sub-title": subTitle,
    "card-transaction": transactionCard,
    "detail-transaction": transactionDetail
  },
  mixins: [fetchSingleData],
  data() {
    return {
      transaction: {},
      outlet: {},
      agent: {},
      acquirer: {},
      acquirerType: {},
      loadingTransaction: true
    };
  },
  mounted() {
    this.getTransaction();
  },
  methods: {
    async getTransaction() {
      await this.$axios
        .$get(`/api/back_office/transactions/${this.$route.params.id}`)
        .then(response => {
          console.log("response ", response.data);
          this.transaction = response.data;
          this.agent = this.transaction.agent;
          this.outlet = this.agent.outlet;
          this.acquirer = this.transaction.acquirer;
          this.acquirerType = this.acquirer.acquirerType;
          this.getMerchant(this.outlet.merchantId);
          this.loadingTransaction = false;
        })
        .catch(e => console.log(e));
    }
  }
};
</script>

<style>
</style>
