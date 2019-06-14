<template>
  <div id="detail-transaction">
    <sub-title :text="'Detail Transaction'" :icon="'confirmation_number'"/>
    <card-transaction
      :transaction="transaction"
      :agent="agent"
      :outlet="outlet"
      :acquirer="acquirer"
      :acquirerType="acquirerType"
    />
  </div>
</template>

<script>
import transactionCard from "~/components/card/transaction.vue";
import subTitle from "~/components/subtitle.vue";

export default {
  layout: "default-layout",
  middleware: "auth",
  components: {
    "sub-title": subTitle,
    "card-transaction": transactionCard
  },
  data() {
    return {
      transaction: {},
      outlet: {},
      agent: {},
      acquirer: {},
      acquirerType: {}
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
        })
        .catch(e => console.log(e));
    }
  }
};
</script>

<style>
</style>
