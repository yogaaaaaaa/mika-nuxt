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
          this.$store.commit("snackbarText", error.response.data.message);
          this.$store.commit("snackbar", true);
        }
      } else if (error.request) {
        console.log("request");
        this.$store.commit("snackbarText", "Network Error");
        this.$store.commit("snackbar", true);
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
        this.$store.commit("snackbarText", error.message);
        this.$store.commit("snackbar", true);
      }
    }
  }
};
