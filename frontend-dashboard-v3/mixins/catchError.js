export default {
  methods: {
    catchError(error) {
      if (error.response) {
        /*
         * The request was made and the server responded with a
         * status code that falls out of the range of 2xx
         */
        console.log("response");
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        if (error.response.status === 400 || error.response.status === 403) {
          this.showSnackbar("error", error.response.data.message);
        }
        if (error.response.status === 401) {
          this.showSnackbar("error", error.response.data.message);
          this.logout();
        }
      } else if (error.request) {
        console.log("request");
        this.showSnackbar("error", "Network Error");

        /*
         * The request was made but no response was received, `error.request`
         * is an instance of XMLHttpRequest in the browser and an instance
         * of http.ClientRequest in Node.js
         */
        console.log(error.request);
      } else {
        console.log("message");
        // Something happened in setting up the request and triggered an Error
        console.log("Error", error.message);
        this.showSnackbar("error", error.message);
      }
    },
    logout() {
      this.$auth.logout();
      this.$router.push("/login");
    },
    showSnackbar(type, message) {
      this.$store.commit("snackbarColor", type);
      this.$store.commit("snackbarText", message);
      this.$store.commit("snackbar", true);
    }
  }
};
