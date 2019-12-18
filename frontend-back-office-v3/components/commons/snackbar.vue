<template>
  <v-snackbar v-model="snackOpen" top :color="snackbarType">
    <span class="font-weight-black">{{ snackbarText }}</span>
    <!-- <v-btn text @click="close">Tutup</v-btn> -->
    <v-icon @click="close" dark>close</v-icon>
  </v-snackbar>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      snackOpen: false,
    }
  },
  computed: {
    ...mapState(['snackbarShow', 'snackbarType', 'snackbarText']),
  },
  watch: {
    snackbarShow() {
      this.snackOpen = this.snackbarShow
    },
    snackOpen() {
      // this watcher is needed to reflect the snackbarShow state in the store, incase it triggered by the timer
      this.$store.commit('snackbarShow', this.snackOpen)
    },
  },

  methods: {
    close() {
      this.snackOpen = false
    },
  },
}
</script>

<style></style>
