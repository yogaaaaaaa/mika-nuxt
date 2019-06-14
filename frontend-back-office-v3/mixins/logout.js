export default {
  methods: {
    async logout() {
      console.log("logout berhasil");
      await this.$auth.logout();
      localStorage.username = false;
      this.$axios.setHeader("Authorization", null);
      this.$router.push("/login");
    }
  }
};
