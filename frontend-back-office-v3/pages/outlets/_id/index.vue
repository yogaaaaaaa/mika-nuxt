<template>
  <div style="margin-top: 50px;">
    <v-tabs v-model="activeTab" slider-color="yellow">
      <v-tab v-for="tab in tabItem" :key="tab.text" :to="tab.to" ripple>{{ tab.text }}</v-tab>
      <v-tab-item value="detail-outlet">
        <sub-title :text="'Detail Outlet'" :icon="'store'"/>
        <v-container fluid class="mb-3 pa-0">
          <v-layout row wrap d-flex>
            <card-top :title="'Total Agent'" :total="totalAgent"/>
            <card-top :title="'Total Terminal'" :total="totalTerminal"/>
            <card-top :title="'Total Transaction'" :total="totalTransaction"/>
          </v-layout>
        </v-container>
        <card-outlet :outlet="outlet" class="mb-4"/>
      </v-tab-item>
      <v-tab-item value="list-agent">
        <sub-title :text="'List Agent'" :icon="'assignment_ind'"/>
        <v-card class="pa-3">
          <table-agent :agents="agentPerOutlet"/>
          <download :data="agentPerOutlet" :filter="filterAgent"/>
          <button-add-small
            @dialog="formAgent = !formAgent"
            :text="'Add Agent'"
            v-if="checkRoles(`adminMarketing`)"
          />
        </v-card>
      </v-tab-item>
      <v-tab-item value="list-terminal">
        <list-terminals :terminals="terminalPerOutelt"/>
      </v-tab-item>
      <v-tab-item value="list-transaction">
        <list-transactions :transactions="transactionPerOutlet"/>
      </v-tab-item>
    </v-tabs>
    <v-dialog v-model="formAgent" width="700">
      <form-agent @close="formAgent = false"/>
    </v-dialog>
  </div>
</template>

<script>
import outletDetail from "~/components/card/outlet.vue";
import agentTable from "~/components/table/agents.vue";
import download from "~/components/download.vue";
import addSmallButton from "~/components/addSmall.vue";
import transactionList from "~/components/list/transactions.vue";
import subTitle from "~/components/subtitle.vue";
import terminalTable from "~/components/table/terminals.vue";
import { filterHeader, role } from "~/mixins";
import terminalList from "~/components/list/terminals.vue";
import agentForm from "~/components/form/agent.vue";
import topCard from "~/components/card/top.vue";
import { mapGetters } from "vuex";

export default {
  layout: "default-layout",
  middleware: "auth",
  components: {
    "card-outlet": outletDetail,
    "table-agent": agentTable,
    download: download,
    "sub-title": subTitle,
    "table-terminal": terminalTable,
    "button-add-small": addSmallButton,
    "list-transactions": transactionList,
    "list-terminals": terminalList,
    "form-agent": agentForm,
    "card-top": topCard
  },
  mixins: [filterHeader, role],
  data() {
    return {
      activeTab: "",
      tabItem: [
        { text: "Detail Outlet", to: "#detail-outlet" },
        { text: "List Agent", to: "#list-agent" },
        { text: "List Terminal", to: "#list-terminal" },
        { text: "List Transactions", to: "#list-transaction" }
      ],
      agentPerOutlet: [],
      transactionPerOutlet: [],
      terminalPerOutelt: [],
      detailOutlet: "",
      formAgent: false,
      outlet: {},
      totalAgent: 0,
      totalTerminal: 0,
      totalTransaction: 0
    };
  },
  mounted() {
    this.getTransactionPerOutlet();
    this.getAgentPerOutlet();
    this.getOutlet();
  },
  computed: {
    ...mapGetters(["loggedInUser"])
  },
  methods: {
    async getOutlet() {
      await this.$axios
        .$get(`/api/back_office/outlets/${this.$route.params.id}`)
        .then(response => {
          this.outlet = response.data;
        })
        .catch(e => console.log(e));
    },
    async getTransactionPerOutlet() {
      await this.$axios
        .$get(
          `/api/back_office/transactions?get_count=1&f[agent.outletId]=eq,${
            this.$route.params.id
          }`
        )
        .then(response => {
          this.transactionPerOutlet = response.data;
          this.totalTransaction = response.meta.totalCount;
        })
        .catch(e => console.log(e));
    },
    async getAgentPerOutlet() {
      await this.$axios
        .$get(
          `/api/back_office/agents?get_count=1&f[outletId]=eq,${
            this.$route.params.id
          }`
        )
        .then(response => {
          this.agentPerOutlet = response.data;
          this.totalAgent = response.meta.totalCount;
        })
        .catch(e => console.log(e));
    }
  }
};
</script>

<style>
</style>
