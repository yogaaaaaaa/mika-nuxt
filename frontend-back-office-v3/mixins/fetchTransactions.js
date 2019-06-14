export default {
  data() {
    return {
      dialog: false,
      loading: false,
      page: [10, 20, 30, { text: "All", value: -1 }],
      search: "",
      draft: "",
      transactions: [],
      transaction: "",
      transactionTerminal: "",
      transactionMerchant: "",
      transactionStatus: "",
      transactionPerTerminal: [],
      transactionLatest: "",
      transactionLatestPaymentGateway: "",
      transactionPGType: "",
      transactionPerMerchant: [],
      transactionPerOutlet: [],
      transactionPerAgent: [],
      transactionPerAcquirer: []
    };
  },
  methods: {
    async getTransactions() {
      this.loading = true;
    },
    async getDetailTransaction() {
      this.loading = true;
    },
    async getTransactionPerTerminal() {
      await this.$axios.$get(
        `/api/back_office/transactions?get_count=1&f[terminalId]=eq,${this.$route.params.id}`
      ).then( response => {
        this.transactionPerTerminal = response.data.data
      }).catch( e => console.log(e) )
    },
    async getTransactionPerMerchant() {
      await this.$axios.$get(
        `/api/back_office/transactions?get_count=1&f[agent.outlet.merchantId]=eq,${this.$route.params.id}`
      ).then( response => {
        this.transactionPerMerchant = response.data.data
      }).catch( e => console.log(e) )
    },
    async getTransactionPerOutlet() {
      await this.$axios.$get(
        `/api/back_office/transactions?get_count=1&f[agent.outletId]=eq,${this.$route.params.id}`
      ).then( response => {
        this.transactionPerOutlet = response.data.data  
      }).catch( e => console.log(e) )
    },
    async getTransactionPerAgent() {
      await this.$axios.$get(
        `/api/back_office/transactions?get_count=1&f[agentId]=eq,${this.$route.params.id}`
      ).then( response => {
        this.transactionPerAgent = response.data.data
      }).catch( e => console.log(e) )
    },
    async getTransactionPerAcquirer() {
      await this.$axios.$get(
        `/api/back_office/transactions?get_count=1&f[acquirerId]=eq,${this.$route.params.id}`
      ).then( response => {
        this.transactionPerAcquirer = response.data.data
      }).catch( e => console.log(e))
    },
  }
};
