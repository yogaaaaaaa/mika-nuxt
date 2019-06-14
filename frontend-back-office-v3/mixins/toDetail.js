export default {
  methods: {
    toDetailAdmin(id) {
      return this.$router.push(`/admins/${id}`);
    },
    toDetailMerchant(id) {
      return this.$router.push(`/merchants/${id}`);
    },
    toDetailTerminal(id) {
      return this.$router.push(`/terminals/${id}`);
    },
    toDetailOutlet(id) {
      return this.$router.push(`/outlets/${id}`);
    },
    toDetailAgent(id) {
      return this.$router.push(`/agents/${id}`);
    },
    toDetailMerchantStaff(id) {
      return this.$router.push(`/merchantStaffs/${id}`);
    },
    toDetailTransaction(id) {
      return this.$router.push(`/transactions/${id}`);
    },
    toDetailPartner(id) {
      return this.$router.push(`/partner/${id}`);
    },
    toDetailAcquirer(id) {
      return this.$router.push(`/acquirers/${id}`);
    },
    toDetailAcquirerType(id) {
      return this.$router.push(`/acquirerTypes/${id}`);
    },
    toDetailAcquirerConfig(id) {
      return this.$router.push(`/acquirerConfigs/${id}`);
    },
    toDetailTerminalModel(id) {
      return this.$router.push(`/terminals/models/${id}`);
    }
  }
};
