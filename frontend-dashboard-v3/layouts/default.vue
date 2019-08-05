<template>
  <v-app>
    <v-app-bar app flat color="primary" dark>
      <v-toolbar-title>
        <v-img src="/img/logo_horizontal_putih.png" width="100px"></v-img>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text @click="logout">Logout</v-btn>
    </v-app-bar>
    <v-container>
      <v-content>
        <no-ssr>
          <nuxt />
          <snackbar></snackbar>
        </no-ssr>
      </v-content>
    </v-container>
  </v-app>
</template>

<script>
import snackbar from "../components/snackbar";
export default {
  components: { snackbar },
  methods: {
    async logout() {
      await this.$auth.logout();
      this.$router.push("/login");
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
