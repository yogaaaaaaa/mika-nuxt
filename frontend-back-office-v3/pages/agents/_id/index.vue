<template>
  <div id="agent-detail" style="margin-top:50px">
    <v-tabs v-model="activeTab" slider-color="yellow">
      <v-tab v-for="tab in tabItem" :key="tab.text" :to="tab.to" ripple>{{ tab.text }}</v-tab>
      <v-tab-item value="detail-agent">
        <sub-title :text="'Detail Agent'" :icon="'assignment_ind'"/>
        <v-container text-xs-center v-if="loadingAgent">
          <v-flex>
            <v-progress-circular :size="60" color="blue" indeterminate/>
          </v-flex>
        </v-container>
        <detail-agent
          :agent="agent"
          :username="username"
          :outlet="outlet"
          :merchant="merchant"
          v-if="!loadingAgent"
          @edit="formEdit = true"
          @archive="archive()"
        />
        <v-dialog v-model="formEdit" width="700">
          <card-agent
            :merchant="merchant"
            :outlet="outlet"
            class="mb-4"
            @refresh="getAgent()"
            @close="formEdit = false"
          />
        </v-dialog>
      </v-tab-item>
      <v-tab-item value="list-transaction">
        <sub-title :text="'List Transaction'" :icon="'confirmation_number'"/>
        <v-card class="pa-3 mt-1">
          <table-transaction
            :transactions="transactionPerAgent"
            :filter="filterTransaction"
            :api="apiTransaction"
            :totalPage="transactionPage"
            :params="params"
            :loading="loadingTransaction"
          />
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
import { filterHeader, fetchSingleData } from "~/mixins";
import { mapState } from "vuex";
import detailAgent from "~/components/cardDetail/agent.vue";

export default {
  layout: "default-layout",
  middleware: "auth",
  components: {
    download: download,
    "card-agent": agentCard,
    "table-transaction": transactionTable,
    "main-title": mainTitle,
    "sub-title": subTitle,
    "detail-agent": detailAgent
  },
  mixins: [filterHeader, fetchSingleData],
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
      ],
      merchantAgent: {},
      transactionPage: 1,
      params: `&f[agentId]=eq,${this.$route.params.id}`,
      loadingAgent: true,
      loadingTransaction: true,
      formEdit: false
    };
  },
  mounted() {
    this.getTransactionAgent();
    this.getAgent();
  },
  computed: {
    ...mapState(["apiTransaction"])
  },
  methods: {
    async getAgent() {
      await this.$axios
        .$get(`/api/back_office/agents/${this.$route.params.id}`)
        .then(response => {
          this.agent = response.data;
          this.outletAgent = this.agent.outlet;
          this.getOutlet(this.outletAgent.id);
          this.merchantAgent = this.outletAgent.merchantId;
          this.getMerchant(this.outletAgent.merchantId);
          console.log("merchant ", this.outletAgent.merchantId);
          this.username = this.agent.user.username;
          this.$store.commit("setAgent", this.agent);
          this.$store.commit("setUser", this.agent.user);
          console.log("merchant", this.merchant);
          this.loadingAgent = false;
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
          if (response.meta) {
            this.transactionPage = response.meta.ofPages;
          }
          this.loadingTransaction = false;
          this.$store.commit(
            "setApiTransaction",
            `/api/back_office/transactions?get_count=1&f[agentId]=eq,${
              this.$route.params.id
            }&page=`
          );
        })
        .catch(e => console.log(e));
    },
    async archive() {
      await this.$axios
        .$put(`/api/back_office/agents/${this.$route.params.id}`, {
          archivedAt: true
        })
        .then(r => {
          this.$router.go(-1);
        })
        .catch(e => console.log(e));
    }
  }
};
</script>

<style>
</style>
