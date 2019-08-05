<template>
  <v-app class="blue-grey lighten-5">
    <v-content>
      <nuxt />
      <snackbar></snackbar>
    </v-content>
  </v-app>
</template>

<script>
import snackbar from "../components/snackbar";
export default {
  components: { snackbar }
};
</script>

<style lang="scss" scoped>
</style>
