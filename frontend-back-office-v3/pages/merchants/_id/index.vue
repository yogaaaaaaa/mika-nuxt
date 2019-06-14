<template>
  <div class="mt-4">
    <v-tabs class="tabs" v-model="activeTab" slider-color="yellow">
      <v-tab v-for="tab in tabItem" :key="tab.text" :to="tab.to" ripple>{{ tab.text }}</v-tab>
      <v-tab-item value="detail-merchant">
        <sub-title :text="'Detail Merchant'" :icon="'domain'"/>
        <v-container fluid class="mb-3 pa-0">
          <v-layout row wrap d-flex class="elevation-2">
            <card-top :total="totalOutlet" :title="'Total Outlet'"/>
            <card-top :total="totalAgent" :title="'Total Agent'"/>
            <card-top :total="totalTransaction" :title="'Total Transaction'"/>
          </v-layout>
        </v-container>
        <card-merchant :merchant="merchant" class="mb-4"/>
      </v-tab-item>
      <v-tab-item value="list-outlet">
        <sub-title :text="'List Outlets'" :icon="'store'"/>
        <v-card class="pa-3 mt-1">
          <table-outlet :outlets="outlets"/>
          <download :data="outlets"/>
          <button-add-small
            :text="'Add Outlet'"
            @dialog="dialogOutlet = !dialogOutlet"
            v-if="checkRoles(`adminMarketing`)"
          />
        </v-card>
        <v-dialog v-model="dialogOutlet" width="700">
          <form-outlet @close="dialogOutlet = false"/>
        </v-dialog>
      </v-tab-item>
      <v-tab-item value="list-agent">
        <sub-title :text="'List Agents'" :icon="'assignment_ind'"/>
        <v-card class="pa-3 mt-1">
          <table-agent :agents="agents"/>
          <download :data="agents" :filter="filterAgent"/>
        </v-card>
      </v-tab-item>
      <v-tab-item value="list-acquirer">
        <sub-title :text="'List Acquirer'" :icon="'device_hub'"/>
        <v-card class="pa-3 mt-1">
          <table-acquirer :acquirers="acquirers"/>
          <download :data="acquirers"/>
        </v-card>
      </v-tab-item>
      <v-tab-item value="list-transaction">
        <list-transactions :transactions="transactions"/>
      </v-tab-item>
      <v-tab-item value="list-merchant-staff">
        <sub-title :text="'List Merchant Staff'" :icon="'person'"/>
        <v-card class="pa-4 mt-1">
          <table-merchant-staff :merchantStaff="merchantStaff"/>
          <download :data="merchantStaff" :filter="filterMerchantStaff"/>
        </v-card>
      </v-tab-item>
      <v-tab-item value="list-partner">
        <sub-title :text="'List Partner'" :icon="'settings_ethernet'"/>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import cardMerchant from "~/components/card/merchant.vue";
import outletTable from "~/components/table/outlets.vue";
import agentTable from "~/components/table/agents.vue";
import terminalTable from "~/components/table/terminals.vue";
import acquirerTable from "~/components/table/acquirers.vue";
import download from "~/components/download.vue";
import subTitle from "~/components/subtitle.vue";
import mainTitle from "~/components/mainTitle.vue";
import topCard from "~/components/card/top.vue";
import addSmallButton from "~/components/addSmall.vue";
import outletForm from "~/components/form/outlet.vue";
import merchantStaffTable from "~/components/table/merchantStaff.vue";
import merchantStaffForm from "~/components/form/merchantStaff.vue";
import { filterHeader, role } from "~/mixins";
import transactionList from "~/components/list/transactions.vue";
import { mapGetters } from "vuex";

export default {
  layout: "default-layout",
  middleware: "auth",
  components: {
    "card-merchant": cardMerchant,
    "table-outlet": outletTable,
    "table-agent": agentTable,
    "table-terminal": terminalTable,
    "table-acquirer": acquirerTable,
    download: download,
    "sub-title": subTitle,
    "main-title": mainTitle,
    "card-top": topCard,
    "button-add-small": addSmallButton,
    "form-outlet": outletForm,
    "table-merchant-staff": merchantStaffTable,
    "form-merchant-staff": merchantStaffForm,
    "list-transactions": transactionList
  },
  mixins: [filterHeader, role],
  data() {
    return {
      merchant: {},
      outlets: [],
      agents: [],
      merchantStaff: [],
      terminals: [],
      acquirers: [],
      transactions: [],
      dialogOutlet: false,
      dialogMerchantStaff: false,
      menu: false,
      totalOutlet: 0,
      totalAgent: 0,
      totalTransaction: 0,
      lodingTotalOutlet: false,
      activeTab: "",
      tabItem: [
        { text: "Detail Merchant", to: "#detail-merchant" },
        { text: "List Outlet", to: "#list-outlet" },
        { text: "List Agent", to: "#list-agent" },
        { text: "List Acquirer", to: "#list-acquirer" },
        { text: "List Transaction", to: "#list-transaction" },
        { text: "List Merchant Staff", to: "#list-merchant-staff" },
        { text: "List Partner", to: "#list-partner" }
      ]
    };
  },
  mounted() {
    this.getOutletMerchant();
    this.getAgentMerchant();
    this.getStaffMerchant();
    this.getAcquirerMerchant();
    this.getTransactionMerchant();
    this.getMerchant();
  },
  computed: {
    ...mapGetters(["loggedInUser"])
  },
  methods: {
    async getMerchant() {
      await this.$axios
        .$get(`/api/back_office/merchants/${this.$route.params.id}`)
        .then(response => {
          this.merchant = response.data;
        })
        .catch(e => console.log(e));
    },
    async getOutletMerchant() {
      await this.$axios
        .$get(
          `/api/back_office/outlets?get_count=1&f[merchantId]=eq,${
            this.$route.params.id
          }`
        )
        .then(r => {
          this.totalOutlet = r.meta.totalCount;
          this.outlets = r.data;
        })
        .catch(e => console.log(e));
    },
    async getAgentMerchant() {
      await this.$axios
        .$get(
          `/api/back_office/agents?get_count=1&f[outlet.merchantId]=eq,${
            this.$route.params.id
          }`
        )
        .then(r => {
          this.totalAgent = r.meta.totalCount;
          this.agents = r.data;
        })
        .catch(e => console.log(e));
    },
    async getStaffMerchant() {
      await this.$axios
        .$get(
          `/api/back_office/merchant_staffs?f[merchantId]=eq,${
            this.$route.params.id
          }`
        )
        .then(r => {
          this.merchantStaff = r.data;
        })
        .catch(e => console.log(e));
    },
    async getTransactionMerchant() {
      await this.$axios
        .$get(
          `/api/back_office/transactions?get_count=1&f[agent.outlet.merchantId]=eq,${
            this.$route.params.id
          }`
        )
        .then(r => {
          this.transactions = r.data;
          this.totalTransaction = r.meta.totalCount;
        })
        .catch(e => console.log(e));
    },
    async getTerminalMerchant() {
      await this.$axios
        .$get(`/api/back_office/terminals`)
        .then(r => {
          this.terminals = r.data;
        })
        .catch(e => console.log(e));
    },
    async getAcquirerMerchant() {
      await this.$axios
        .$get(
          `/api/back_office/acquirers?get_count=1&f[merchantId]=eq,${
            this.$route.params.id
          }`
        )
        .then(r => {
          this.acquirers = r.data;
          console.log(this.acquirers);
        })
        .catch(e => console.log(e));
    }
  }
};
</script>

<style scoped>
.tabs {
  color: rgb(248, 248, 248);
}
</style>
