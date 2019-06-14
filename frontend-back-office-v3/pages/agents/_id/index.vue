<template>
  <div id="agent-detail" style="margin-top:50px">
    <v-tabs v-model="activeTab" slider-color="yellow">
      <v-tab v-for="tab in tabItem" :key="tab.text" :to="tab.to" ripple>{{ tab.text }}</v-tab>
      <v-tab-item value="detail-agent">
        <sub-title :text="'Detail Agent'" :icon="'assignment_ind'"/>
        <card-agent :agent="agent" :outlet="outletAgent" :username="username" class="mb-4"/>
      </v-tab-item>
      <v-tab-item value="list-transaction">
        <sub-title :text="'List Transaction'" :icon="'confirmation_number'"/>
        <v-card class="pa-3 mt-1">
          <table-transaction :transactions="transactionPerAgent"/>
          <download :data="transactionPerAgent" :filter="filterTransaction"/>
        </v-card>
      </v-tab-item>
      <v-tab-item value="login-history">
        <sub-title :text="'Login History'" :icon="'history'"/>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import agentCard from "~/components/card/agent.vue";
import download from "~/components/download.vue";
import transactionTable from "~/components/table/transactions.vue";
import mainTitle from "~/components/mainTitle.vue";
import subTitle from "~/components/subtitle.vue";
import { filterHeader } from "~/mixins";

export default {
  layout: "default-layout",
  middleware: "auth",
  components: {
    download: download,
    "card-agent": agentCard,
    "table-transaction": transactionTable,
    "main-title": mainTitle,
    "sub-title": subTitle
  },
  mixins: [filterHeader],
  data() {
    return {
      transactionPerAgent: [],
      items: [{ text: "List Transactions", to: "#transactionList" }],
      agent: {},
      outletAgent: {},
      username: "",
      activeTab: "",
      tabItem: [
        { text: "Detail Agent", to: "#detail-agent" },
        { text: "List Transaction", to: "#list-transaction" },
        { text: "Login History", to: "#login-history" }
      ]
    };
  },
  mounted() {
    this.getTransactionAgent();
    this.getAgent();
  },
  methods: {
    async getAgent() {
      await this.$axios
        .$get(`/api/back_office/agents/${this.$route.params.id}`)
        .then(response => {
          this.agent = response.data;
          this.outletAgent = this.agent.outlet;
          this.username = this.agent.user.username;
        })
        .catch(e => console.log(e));
    },
    async getTransactionAgent() {
      await this.$axios
        .$get(
          `/api/back_office/transactions?get_count=1&f[agentId]=eq,${
            this.$route.params.id
          }`
        )
        .then(response => {
          this.transactionPerAgent = response.data;
        })
        .catch(e => console.log(e));
    }
  }
};
</script>

<style>
</style>
