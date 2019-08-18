<template>
  <div style="margin-top: 50px;">
    <v-tabs v-model="activeTab" slider-color="yellow">
      <v-tab v-for="tab in tabItem" :key="tab.text" :to="tab.to" ripple>{{ tab.text }}</v-tab>
      <v-tab-item value="detail-outlet">
        <sub-title :text="'Detail Outlet'" :icon="'store'"/>
        <v-container fluid class="mb-3 pa-0">
          <v-layout row wrap d-flex>
            <card-top :title="'Total Agent'" :total="totalAgent" :loading="loadingCardAgent"/>
            <card-top
              :title="'Total Terminal'"
              :total="totalTerminal"
              :loading="loadingCardTerminal"
            />
            <card-top
              :title="'Total Transaction'"
              :total="totalTransaction"
              :loading="loadingCardTransaction"
            />
          </v-layout>
        </v-container>
        <v-container text-xs-center v-if="loadingOutlet">
          <v-flex>
            <v-progress-circular :size="60" color="blue" indeterminate/>
          </v-flex>
        </v-container>
        <detail-outlet
          :outlet="outlet"
          :merchant="merchant"
          v-if="!loadingOutlet"
          @edit="formEdit = true"
          @archive="archive()"
        />
        <v-dialog v-model="formEdit" width="700">
          <card-outlet
            :outlet="outlet"
            :merchant="merchant"
            class="mb-4"
            @close="formEdit = false"
            @refresh="getOutlet()"
          />
        </v-dialog>
      </v-tab-item>
      <v-tab-item value="list-agent">
        <sub-title :text="'List Agent'" :icon="'assignment_ind'"/>
        <v-card class="pa-3">
          <table-agent
            :agents="agentPerOutlet"
            :api="apiAgent"
            :filter="filterAgent"
            :totalPage="pageAgent"
            :loading="loadingAgent"
          />
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
        <!-- <list-transactions :transactions="transactionPerOutlet"/> -->
        <sub-title :text="'List Transaction'" :icon="'confirmation_number'" :name="merchant.name"/>
        <v-card class="pa-4 mt-1">
          <table-transaction
            :transaction="transactionPerOutlet"
            :api="apiTransaction"
            :params="params"
            :filter="filterTransaction"
            :totalPage="pageTransaction"
          />
        </v-card>
      </v-tab-item>
    </v-tabs>
    <v-dialog v-model="formAgent" width="700">
      <form-agent @close="formAgent = false" @refresh="getAgentPerOutlet()" :outlet="outlet"/>
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
import { filterHeader, role, fetchSingleData } from "~/mixins";
import terminalList from "~/components/list/terminals.vue";
import agentForm from "~/components/form/agent.vue";
import topCard from "~/components/card/top.vue";
import { mapGetters, mapState } from "vuex";
import detailOutlet from "~/components/cardDetail/outlet.vue";
import transactionTable from "~/components/table/transactions.vue";

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
    "card-top": topCard,
    "detail-outlet": detailOutlet,
    "table-transaction": transactionTable
  },
  mixins: [filterHeader, role, fetchSingleData],
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
      formEdit: false,
      formAgent: false,
      outlet: {},
      totalAgent: 0,
      totalTerminal: 0,
      totalTransaction: 0,
      pageAgent: 1,
      pageTerminal: 1,
      pageTransaction: 1,
      params: `&f[agent.outletId]=eq,${this.$route.params.id}`,
      loadingCardAgent: true,
      loadingCardTransaction: true,
      loadingCardTerminal: true,
      loadingOutlet: true,
      loadingAgent: true,
      loadingTerminal: true,
      loadingTransaction: true
    };
  },
  mounted() {
    this.getTransactionPerOutlet();
    this.getAgentPerOutlet();
    this.getOutlet();
    this.getTerminalPerOutlet();
  },
  computed: {
    ...mapGetters(["loggedInUser"]),
    ...mapState(["apiAgent", "apiTransaction"])
  },
  methods: {
    async getOutlet() {
      await this.$axios
        .$get(`/api/back_office/outlets/${this.$route.params.id}`)
        .then(response => {
          this.outlet = response.data;
          this.getMerchant(this.outlet.merchantId);
          this.loadingOutlet = false;
          this.$store.commit("setOutlet", this.outlet);
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
          if (response.meta) {
            this.totalTransaction = response.meta.totalCount;
            this.pageTransaction = response.meta.ofPages;
            
          }
          this.loadingCardTransaction = false;
          this.loadingTransaction = false;
          this.$store.commit(
            "setApiTransaction",
            `/api/back_office/transactions?get_count=1&f[agent.outletId]=eq,${
              this.$route.params.id
            }&page=`
          );
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
          if (response.meta) {
            this.totalAgent = response.meta.totalCount;
            this.pageAgent = response.meta.ofPages;
          }
          this.loadingCardAgent = false;
          this.agentPerOutlet = response.data;
          this.loadingAgent = false;
          this.$store.commit(
            "setApiAgent",
            `/api/back_office/agents?get_count=1&f[outletId]=eq,${
              this.$route.params.id
            }&page=`
          );
        })
        .catch(e => console.log(e));
    },
    getTerminalPerOutlet() {
      this.loadingCardTerminal = false;
    },
    async archive() {
      await this.$axios
        .$put(`/api/back_office/outlets/${this.$route.params.id}`, {
          archivedAt: true
        })
        .then(r => {
          this.$route.go(-1);
        });
    }
  }
};
</script>

<style>
</style>
