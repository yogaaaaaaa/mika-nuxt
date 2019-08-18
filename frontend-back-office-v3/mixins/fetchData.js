export default {
  data() {
    return {
      merchants: []
    };
  },
  methods: {
    async getMerchants() {
      await this.$axios.$get(`/api/back_office/merchants`).then(r => {
        this.merchants = r.data;
      });
    }
  }
};
