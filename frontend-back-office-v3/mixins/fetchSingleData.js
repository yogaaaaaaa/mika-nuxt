export default {
  data() {
    return {
      merchant: {},
      merchants: [],
      outlet: {}
    };
  },
  methods: {
    async getMerchant(value) {
      this.merchant = await this.$axios
        .$get(`/api/back_office/merchants/${value}`)
        .then(r => r.data)
        .catch(e => console.log(e));
    },
    async getOutlet(value) {
      this.outlet = await this.$axios
        .$get(`/api/back_office/outlets/${value}`)
        .then(r => r.data)
        .catch(e => console.log(e));
    }
  }
};
