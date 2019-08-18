import Cookie from "js-cookie";

export default {
  methods: {
    async logout() {
      let logoutConfirm = confirm("Are you sure want to logout?");
      if (logoutConfirm == true) {
        await this.$auth.logout();
        localStorage.removeItem("auth._token.local");
        Cookie.remove("auth._token.local");
        this.$axios.setHeader("Authorization", null);
        this.$router.push("/login");
      }
    }
  }
};
