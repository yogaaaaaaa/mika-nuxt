<template>
  <div>
    <v-snackbar v-model="snackOpen" top color="error">
      {{ snackbarText }}
      <v-btn text @click="close">Close</v-btn>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  data() {
    return {
      snackOpen: false
    };
  },
  watch: {
    snackbar() {
      this.snackOpen = this.snackbar;
    },
    snackOpen() {
      this.$store.commit("snackbar", this.snackOpen);
    }
  },
  computed: {
    snackbarText() {
      return this.$store.state.snackbarText;
    },
    snackbar() {
      return this.$store.state.snackbar;
    }
  },
  methods: {
    close() {
      this.$store.commit("snackbar", false);
    }
  }
};
</script>

