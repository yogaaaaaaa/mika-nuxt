export default {
  methods: {
    async putMerchant() {
      try {
        await this.$axios.$put(`/user/${this.$route.params}`, {
          name: this.merchant.name,
          username: this.merchant.username,
          address: this.merchant.address,
          user_type_id: 2
        });
      } catch (e) {
        console.log(e);
      }
    },
    async putTerminal() {
      console.log("isi terminal", this.terminal.fullname);
      try {
        await this.$axios.$put(`/terminal/${this.$route.params.id}`, {
          fullname: this.terminal.fullname,
          username: this.terminal.username,
          imei: this.terminal.imei,
          email: this.terminal.email,
          user_id: this.merchantTerminal.id
        });
      } catch (e) {
        console.log("gagal");
        console.log(e);
      }
    },
    async putPaymentGateway() {
      try {
        await this.$axios.$put(`/payment_gateway/${this.$route.params.id}`, {
          name: this.paymentGateway.name,
          status: this.paymentGateway.status,
          terminal_username: this.paymentGateway.terminalUsername,
          terminal_password: this.paymentGateway.terminalPassword,
          scannable: this.paymentGateway.scannable,
          scanning: this.paymentGateway.scanning,
          minimum_transaction: this.paymentGateway.minimumTransaction
        });
      } catch (e) {
        console.log(e);
      }
    }
  }
};
