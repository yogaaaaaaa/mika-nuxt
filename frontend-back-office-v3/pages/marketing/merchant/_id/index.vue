<template>
  <div id="merchant-detail">
    <div class="tab">
      <v-tabs v-model="activeTab">
        <v-tab v-for="tab in tabItem" :key="tab.text" :to="tab.to">
          {{ tab.text }}
        </v-tab>
          
        <v-tab-item id="detail-merchant">
          <main-title 
            :text="'Detail Merchant'"
            :icon="'domain'"
            :items="items"
          />
          <v-container fluid class="mb-3 pa-0">
            <v-layout row wrap d-flex class="elevation-2">
              <card-top :total="totalOutlet" :title="'Total Outlet'"/>
              <card-top :total="totalAgent" :title="'Total Agent'" />
              <card-top :total="'2568'" :title="'Total Transaction'" />
            </v-layout>
          </v-container>
          <card-merchant class="mb-4" />
        </v-tab-item>
        <v-tab-item id="list-outlet">
          <sub-title :text="'List Outlets'" :icon="'store'" id="outletList" />
          <v-card class="pa-3 mt-1">
            <table-outlet :outlets="outlets" />
            <download :data="outlets" />
            <button-add-small :text="'Add Outlet'" @dialog="dialogOutlet = !dialogOutlet"/>
          </v-card>
          <v-dialog v-model="dialogOutlet" width="700">
            <form-outlet @close="dialogOutlet = false" />
          </v-dialog>
        </v-tab-item>
      </v-tabs>
    </div>
    <!-- <main-title 
      :text="'Detail Merchant'"
      :icon="'domain'"
      :items="items"
    />
    <v-container fluid class="mb-3 pa-0">
      <v-layout row wrap d-flex class="elevation-2">
        <card-top :total="totalOutlet" :title="'Total Outlet'"/>
        <card-top :total="totalAgent" :title="'Total Agent'" />
        <card-top :total="'2568'" :title="'Total Transaction'" />
      </v-layout>
    </v-container>
    <card-merchant class="mb-4" />
    <sub-title :text="'List Outlets'" :icon="'store'" id="outletList" />
    <v-card class="pa-3 mt-1">
      <table-outlet :outlets="outlets" />
      <download :data="outlets" />
      <button-add-small :text="'Add Outlet'" @dialog="dialogOutlet = !dialogOutlet"/>
    </v-card>
    <v-dialog v-model="dialogOutlet" width="700">
      <form-outlet @close="dialogOutlet = false" />
    </v-dialog>
    <sub-title 
      :text="'List Agents'" 
      :icon="'assignment_ind'" 
      id="agentList"
    />
    <v-card class="pa-3 mt-1">
      <table-agent :agents="agents" />
      <download :data="agents"  :filter="filterAgent"/>
    </v-card>
    <sub-title
      :text="'List Merchant Staff'"
      :icon="'person'"
      id="merchantStaffList"
    />
    <v-card class="pa-3 mt-1">
      <table-merchant-staff :merchantStaff="merchantStaff" />
      <download :data="merchantStaff" :filter="filterMerchantStaff"/>
      <button-add-small 
        :text="'Add Merchant Staff'" 
        @dialog="dialogMerchantStaff = !dialogMerchantStaff" 
      />
    </v-card>
    <v-dialog v-model="dialogMerchantStaff" width="700">
      <form-merchant-staff @close="dialogMerchantStaff = false" />
    </v-dialog>
    <sub-title 
      :text="'List Terminal'" 
      :icon="'system_update'" 
      id="terminalList"
    />
    <v-card class="pa-3 mt-1">
      <table-terminal :terminals="terminals" />
      <download :data="terminals" />
    </v-card>
    <sub-title 
      :text="'List Acquirer'" 
      :icon="'device_hub'" 
      id="acquirerList"
    />
    <v-card class="pa-3 mt-1">
      <table-acquirer :acquirers="acquirers" />
      <download :data="acquirers"/>
    </v-card>
    <sub-title 
      :text="'List Transaction'" 
      :icon="'confirmation_number'" 
      id="transactionList"
    />
    <v-card class="pa-3 mt-1">
      <table-transaction :transactions="transactions" />
      <download :data="transactions" />
    </v-card> -->
  </div>
</template>

<script>
import cardMerchant from "~/components/card/merchant.vue";
import outletTable from "~/components/table/outlets.vue";
import agentTable from "~/components/table/agents.vue";
import terminalTable from "~/components/table/terminals.vue";
import acquirerTable from "~/components/table/acquirers.vue";
import transactionTable from "~/components/table/transactions.vue";
import download from "~/components/download.vue";
import subtitle from "~/components/subtitle.vue";
import mainTitle from "~/components/mainTitle.vue";
import topCard from "~/components/card/top.vue";
import addSmallButton from "~/components/addSmall.vue";
import outletForm from "~/components/form/outlet.vue";
import merchantStaffTable from "~/components/table/merchantStaff.vue";
import merchantStaffForm from "~/components/form/merchantStaff.vue";
import { filterHeader } from "~/mixins"

export default {
  layout: "marketing-layout",
  components: {
    "card-merchant": cardMerchant,
    "table-outlet": outletTable,
    "table-agent": agentTable,
    "table-terminal": terminalTable,
    "table-acquirer": acquirerTable,
    "table-transaction": transactionTable,
    "download": download,
    "sub-title": subtitle,
    "main-title": mainTitle,
    "card-top": topCard,
    "button-add-small": addSmallButton,
    "form-outlet": outletForm,
    "table-merchant-staff": merchantStaffTable,
    "form-merchant-staff": merchantStaffForm
  },
  mixins: [filterHeader],
  data() {
    return {
      outlets: [],
      agents: [],
      merchantStaff: [],
      terminals: [],
      acquirers: [],
      transactions: [],
      dialogOutlet: false,
      dialogMerchantStaff: false,
      menu: false,
      totalOutlet: "",
      totalAgent: "",
      totalTransaction: "",
      items: [
        { title: "List Outlet", to: "#outletList" },
        { title: "List Agent", to: "#agentList" },
        { title: "List Merchant Staff", to: "#merchantStaffList" },
        { title: "List Transaction", to: "#transactionList" },
        { title: "List Terminal", to: "#terminalList" },
        { title: "List Acquirer", to: "#acquirerList" }
      ],
      lodingTotalOutlet: false,
      activeTab: "",
      tabItem:[
        { text: "Detail Merchant", to: "#detail-merchant" },
        { text: "List Outlet", to: "#list-outlet" },
        { text: "List Agent", to: "#list-agent" },
        { text: "List Acquirer", to: "#list-acquirer" },
        { text: "List Transaction", to: "#List-transaction" },
        { text: "List Merchant Staff", to: "#list-merchant-staff" }
      ]
    }
  },
  mounted() {
    this.getOutletMerchant()
    this.getAgentMerchant()
    this.getStaffMerchant()
    this.getAcquirerMerchant()
    this.getTransactionMerchant()
  },
  methods: {
    async getOutletMerchant() {
      await this.$axios.$get(
        `/api/back_office/outlets?get_count=1&f[merchantId]=eq,${this.$route.params.id}`
      )
      .then(
        r => {
          this.totalOutlet = r.meta.totalCount
          this.outlets = r.data
          this.lodingTotalOutlet = true
        }
      ).catch(e => console.log(e))
    },
    async getAgentMerchant() {
      await this.$axios.$get(
        `/api/back_office/agents?get_count=1&f[outlet.merchantId]=eq,${this.$route.params.id}`
      )
      .then(
        r => {
          this.totalAgent = r.meta.totalCount
          this.agents = r.data
        }
      ).catch(e => console.log(e))
    },
    async getStaffMerchant() {
      await this.$axios.$get(
        `/api/back_office/merchant_staffs?f[merchantId]=eq,${this.$route.params.id}`
      ).then(
        r => {
          this.merchantStaff = r.data
        }
      ).catch(e => console.log(e))
    },
    async getTransactionMerchant() {
      await this.$axios.$get(
        `/api/back_office/transactions?get_count=1&f[agent.outlet.merchantId]=eq,${this.$route.params.id}`
      ).then(
        r => {
          this.transactions = r.data
        }
      ).catch(e => console.log(e))
    },
    async getTerminalMerchant() {
      await this.$axios.$get(
        `/api/back_office/terminals`
      ).then(
        r => {
          this.terminals = r.data
        }
      ).catch(e => console.log(e))
    },
    async getAcquirerMerchant() {
      await this.$axios.$get(
        `/api/back_office/acquirers?get_count=1&f[merchantId]=eq,${this.$route.params.id}`
      ).then(
        r => {
          this.acquirers = r.data
          console.log(this.acquirers)
        }
      ).catch(e => console.log(e))
    }
  }
}
</script>

<style scoped>
.tab {
  margin-top: 50px;
}
</style>
