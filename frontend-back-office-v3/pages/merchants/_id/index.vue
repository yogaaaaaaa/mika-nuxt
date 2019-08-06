<template>
  <div class="mt-4">
    <v-tabs class="tabs" v-model="activeTab" slider-color="yellow">
      <v-tab v-for="tab in tabItem" :key="tab.text" :to="tab.to" ripple>{{ tab.text }}</v-tab>
      <v-tab-item value="detail-merchant">
        <sub-title :text="'Detail Merchant'" :icon="'domain'" :name="merchant.name"/>
        <v-container fluid class="mb-3 pa-0">
          <v-layout row wrap d-flex class="elevation-2">
            <card-top :total="totalOutlet" :title="'Total Outlet'" :loading="loadingCardOutlet"/>
            <card-top :total="totalAgent" :title="'Total Agent'" :loading="loadingCardAgent"/>
            <card-top
              :total="totalTransaction"
              :title="'Total Transaction'"
              :loading="loadingCardTransaction"
            />
          </v-layout>
        </v-container>
        <v-container text-xs-center v-if="loadingMerchant">
          <v-flex>
            <v-progress-circular :size="60" color="blue" indeterminate/>
          </v-flex>
        </v-container>
        <detail-merchant
          :merchant="merchant"
          @dialog="dialogMerchant = true"
          v-if="!loadingMerchant"
          @archive="archive()"
        />
        <v-dialog v-model="dialogMerchant" width="700">
          <card-merchant @close="dialogMerchant = false" @refresh="getMerchant()"/>
        </v-dialog>
      </v-tab-item>
      <v-tab-item value="list-outlet">
        <sub-title :text="'List Outlets'" :icon="'store'" :name="merchant.name"/>
        <v-card class="pa-3 mt-1">
          <table-outlet
            :outlets="outlets"
            :totalPage="pageOutlet"
            :api="apiOutlet"
            :filter="filterOutlet"
            :loading="loadingOutlet"
          />
          <button-add-small
            class="mt-2"
            :text="'Add Outlet'"
            @dialog="dialogOutlet = !dialogOutlet"
            v-if="checkRoles(`adminMarketing`)"
          />
        </v-card>
        <v-dialog v-model="dialogOutlet" width="700">
          <form-outlet
            @close="dialogOutlet = false"
            @refresh="getOutletMerchant()"
            :merchant="merchant"
          />
        </v-dialog>
      </v-tab-item>
      <v-tab-item value="list-agent">
        <sub-title :text="'List Agents'" :icon="'assignment_ind'" :name="merchant.name"/>
        <v-card class="pa-3 mt-1">
          <table-agent
            :agents="agents"
            :api="apiAgent"
            :filter="filterAgent"
            :loading="loadingAgent"
          />
        </v-card>
      </v-tab-item>
      <v-tab-item value="list-acquirer">
        <sub-title :text="'List Acquirer'" :icon="'device_hub'" :name="merchant.name"/>
        <v-card class="pa-3 mt-1">
          <table-acquirer
            :acquirers="acquirers"
            :api="apiAcquirer"
            :filter="filterAcquirer"
            :totalPage="pageAcquirer"
            :loading="loadingAcquirer"
          />
          <button-add-small
            class="mt-2"
            :text="'Add Acquirer'"
            @dialog="dialogAcquirer = !dialogAcquirer"
            v-if="checkRoles(`adminMarketing`)"
          />
        </v-card>
        <v-dialog v-model="dialogAcquirer" width="700">
          <form-acquirer
            @close="dialogAcquirer = false"
            @refresh="getAcquirerMerchant()"
            :merchant="merchant"
            :aConfig="acquirerConfig"
            :acquirerType="acquirerType"
          />
        </v-dialog>
      </v-tab-item>
      <v-tab-item value="list-transaction">
        <sub-title :text="'List Transaction'" :icon="'confirmation_number'" :name="merchant.name"/>
        <v-card class="pa-4 mt-1">
          <table-transaction
            :api="apiTransaction"
            :params="params"
            :filter="filterTransaction"
            :totalPage="pageTransaction"
            :loading="loadingTransaction"
          />
        </v-card>
      </v-tab-item>
      <v-tab-item value="list-merchant-staff">
        <sub-title :text="'List Merchant Staff'" :icon="'person'" :name="merchant.name"/>
        <v-card class="mt-1" style="padding: 3em">
          <table-merchant-staff
            :merchantStaff="merchantStaff"
            :api="apiMerchantStaff"
            :filter="filterMerchantStaff"
            :totalPage="pageStaff"
            :loading="loadingStaff"
          />
          <button-add-small
            class="mt-2"
            :text="'Add Merchant Staff'"
            @dialog="dialogMerchantStaff = !dialogMerchantStaff"
            v-if="checkRoles(`adminMarketing`)"
          />
        </v-card>
        <v-dialog v-model="dialogMerchantStaff" width="700">
          <form-merchant-staff
            @close="dialogMerchantStaff = false"
            @refresh="getStaffMerchant()"
            :merchant="merchant"
          />
        </v-dialog>
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
import merchantStaffTable from "~/components/table/merchantStaff.vue";
import transactionTable from "~/components/table/transactions.vue";
import subTitle from "~/components/subtitle.vue";
import mainTitle from "~/components/mainTitle.vue";
import topCard from "~/components/card/top.vue";
import addSmallButton from "~/components/addSmall.vue";
import outletForm from "~/components/form/outlet.vue";
import merchantStaffForm from "~/components/form/merchantStaff.vue";
import acquirerForm from "~/components/form/acquirer.vue";
import { filterHeader, role } from "~/mixins";
import transactionList from "~/components/list/transactions.vue";
import { mapGetters, mapState } from "vuex";
import detailMerchant from "~/components/cardDetail/merchant.vue";

export default {
  layout: "default-layout",
  middleware: "auth",
  components: {
    "card-merchant": cardMerchant,
    "table-outlet": outletTable,
    "table-agent": agentTable,
    "table-terminal": terminalTable,
    "table-acquirer": acquirerTable,
    "table-merchant-staff": merchantStaffTable,
    "sub-title": subTitle,
    "main-title": mainTitle,
    "card-top": topCard,
    "button-add-small": addSmallButton,
    "form-outlet": outletForm,
    "form-merchant-staff": merchantStaffForm,
    "form-acquirer": acquirerForm,
    "list-transactions": transactionList,
    "detail-merchant": detailMerchant,
    "table-transaction": transactionTable
  },
  mixins: [filterHeader, role],
  data() {
    return {
      outlets: [],
      agents: [],
      merchantStaff: [],
      terminals: [],
      acquirers: [],
      acquirerType: [],
      acquirerConfig: [],
      transactions: [],
      dialogOutlet: false,
      dialogMerchantStaff: false,
      dialogAcquirer: false,
      dialogMerchant: false,
      menu: false,
      totalOutlet: 0,
      totalAgent: 0,
      totalTransaction: 0,
      pageOutlet: 1,
      pageAgent: 1,
      pageTransaction: 1,
      pageStaff: 1,
      pageAcquirer: 1,
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
      ],
      merchant: {},
      merchantId: "",
      params: `&f[agent.outlet.merchantId]=eq,${this.$route.params.id}`,
      loadingCardOutlet: true,
      loadingCardAgent: true,
      loadingCardTransaction: true,
      loadingMerchant: true,
      loadingOutlet: true,
      loadingAgent: true,
      loadingTerminal: true,
      loadingTransaction: true,
      loadingStaff: true,
      loadingAcquirer: true,
      loadingPartner: true
    };
  },
  mounted() {
    this.getOutletMerchant();
    this.getAgentMerchant();
    this.getStaffMerchant();
    this.getAcquirerMerchant();
    this.getTransactionMerchant();
    this.getMerchant();
    this.getAcquirerConfig();
    this.getAcquirerType();
  },
  computed: {
    ...mapGetters(["loggedInUser"]),
    ...mapState([
      "apiOutlet",
      "apiAgent",
      "apiTransaction",
      "apiMerchantStaff",
      "apiAcquirer"
    ])
  },
  methods: {
    async getMerchant() {
      await this.$axios
        .$get(`/api/back_office/merchants/${this.$route.params.id}`)
        .then(response => {
          this.merchant = response.data;
          try {
            this.$store.commit("setMerchant", this.merchant);
          } catch (e) {
            console.log("error commit ", e);
          }
          this.loadingMerchant = false;
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
          if (r.meta) {
            this.totalOutlet = r.meta.totalCount;
            this.pageOutlet = r.meta.ofPages;
            this.$store.commit(
              "setApiOutlet",
              `/api/back_office/outlets?get_count=1&f[merchantId]=eq,${
                this.$route.params.id
              }&page=`
            );
          }
          this.loadingCardOutlet = false;
          this.outlets = r.data;
          this.loadingOutlet = false;
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
          if (r.meta) {
            this.totalAgent = r.meta.totalCount;
            this.pageAgent = r.meta.ofPages;
          }
          this.loadingCardAgent = false;
          this.agents = r.data;
          this.$store.commit(
            "setApiAgent",
            `/api/back_office/agents?get_count=1&f[outlet.merchantId]=eq,${
              this.$route.params.id
            }&page=`
          );
          this.loadingAgent = false;
        })
        .catch(e => console.log(e));
    },
    async getStaffMerchant() {
      await this.$axios
        .$get(
          `/api/back_office/merchant_staffs?get_count=1&f[merchantId]=eq,${
            this.$route.params.id
          }`
        )
        .then(r => {
          this.merchantStaff = r.data;
          if (r.meta) {
            this.pageStaff = r.meta.ofPages;
          }
          this.$store.commit(
            "setApiMerchantStaff",
            `/api/back_office/merchant_staffs?get_count=1&f[merchantId]=eq,${
              this.$route.params.id
            }&page=`
          );
          this.loadingStaff = false;
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
          if (r.meta) {
            this.totalTransaction = r.meta.totalCount;
            this.pageTransaction = r.meta.ofPages;
            console.log("page ", this.pageTransaction);
          }
          this.loadingCardTransaction = false;
          this.$store.commit(
            "setApiTransaction",
            `/api/back_office/transactions?get_count=1&f[agent.outlet.merchantId]=eq,${
              this.$route.params.id
            }&page=`
          );
          this.loadingTransaction = false;
        })
        .catch(e => console.log(e));
    },
    async getTerminalMerchant() {
      await this.$axios
        .$get(`/api/back_office/terminals`)
        .then(r => {
          this.terminals = r.data;
          this.loadingTerminal = false;
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
          if (r.meta) {
            this.pageAcquirer = r.meta.ofPages;
          }
          this.$store.commit(
            "setApiAcquirer",
            `/api/back_office/acquirers?get_count=1&f[merchantId]=eq,${
              this.$route.params.id
            }&page=`
          );
          this.loadingAcquirer = false;
        })
        .catch(e => console.log(e));
    },
    async getAcquirerConfig() {
      this.acquirerConfig = await this.$axios
        .$get(`/api/back_office/acquirer_configs`)
        .then(r => r.data)
        .catch(e => alert(e));
    },
    async getAcquirerType() {
      this.acquirerType = await this.$axios
        .$get(`/api/back_office/acquirer_types`)
        .then(r => r.data)
        .catch(e => console.log(e));
    },
    async archive() {
      await this.$axios
        .$put(`/api/back_office/merchants/${this.$route.params.id}`, {
          archivedAt: true
        })
        .then(r => {
          this.$route.go(-1);
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
