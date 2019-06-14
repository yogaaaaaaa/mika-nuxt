<template>
  <div style="margin-top: 50px;">
    <v-tabs v-model="activeTab" slider-color="yellow">
      <v-tab v-for="tab in tabItem" :key="tab.text" :to="tab.to" ripple>
        {{ tab.text }}
      </v-tab>
      <v-tab-item value="detail-outlet">
        <sub-title :text="'Detail Outlet'" :icon="'store'" />
        <v-container fluid class="mb-3 pa-0">
          <v-layout row wrap d-flex>
            <card-top :title="'Total Agent'" :total="'6'" />
            <card-top :title="'Total Terminal'" :total="'5'" />
            <card-top :title="'Total Transaction'" :total="'243'" />
          </v-layout>
        </v-container>
        <card-outlet class="mb-4" />
      </v-tab-item>
      <v-tab-item value="list-agent">
        <sub-title :text="'List Agent'" :icon="'assignment_ind'" />
        <v-card class="pa-3">
          <table-agent :agents="agentPerOutlet" />
          <download :data="agentPerOutlet" :filter="filterAgent" />
          <button-add-small @dialog="formAgent = !formAgent" :text="'Add Agent'" />
        </v-card>
      </v-tab-item>
      <v-tab-item value="list-terminal">
        <list-terminals :terminals="terminalPerOutelt" />
      </v-tab-item>
      <v-tab-item value="list-transaction">
        <list-transactions :transactions="transactionPerOutlet" />
      </v-tab-item>
    </v-tabs>
    <v-dialog v-model="formAgent" width="700">
      <form-agent @close="formAgent = false" />
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
import { filterHeader } from "~/mixins";
import terminalList from "~/components/list/terminals.vue";
import agentForm from "~/components/form/agent.vue";
import topCard from "~/components/card/top.vue";

export default {
  layout: "marketing-layout",
  components: {
    "card-outlet": outletDetail,
    "table-agent": agentTable,
    "download": download,
    "sub-title": subTitle,
    "table-terminal": terminalTable,
    "button-add-small": addSmallButton,
    "list-transactions": transactionList,
    "list-terminals": terminalList,
    "form-agent": agentForm,
    "card-top": topCard
  },
  mixins: [filterHeader],
  data() {
    return {
      activeTab: "",
      tabItem: [
        { text: "Detail Outlet", to: "#detail-outlet" },
        { text: "List Agent", to: "#list-agent" },
        { text: "List Terminal", to: "#list-terminal" },
        { text: "List Transactions", to: "#list-transaction" }
      ],
      agentPerOutlet:[],
      transactionPerOutlet: [],
      terminalPerOutelt: [],
      detailOutlet: "",
      formAgent: false
    }
  },
  mounted() {
    this.getTransactionPerOutlet();
    this.getAgentPerOutlet();
  },
  methods: {
    async getTransactionPerOutlet() {
      await this.$axios.$get(
        `/api/back_office/transactions?get_count=1&f[agent.outletId]=eq,${this.$route.params.id}`
      ).then( response => {
        this.transactionPerOutlet = response.data  
      }).catch( e => console.log(e) )
    },
    async getAgentPerOutlet() {
      await this.$axios.$get(
        `/api/back_office/agents?get_count=1&f[outletId]=eq,${this.$route.params.id}`
      ).then( response => {
        this.agentPerOutlet = response.data
      }).catch( e => console.log(e) )
    }
  }
}
</script>

<style>

</style>
