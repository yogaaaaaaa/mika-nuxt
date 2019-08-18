<template>
  <v-app>
    <v-app-bar app flat color="primary" dark>
      <v-toolbar-title>
        <v-img src="/img/logo_horizontal_putih.png" width="100px"></v-img>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-menu offset-y>
          <template v-slot:activator="{ on }">
            <v-btn dark v-on="on" text>{{ user.name }}</v-btn>
          </template>
          <v-list>
            <v-list-item @click="showChangePasswordForm = true">
              <v-list-item-title>Change Password</v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item @click="showConfirm = true">
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-toolbar-items>
    </v-app-bar>
    <v-container>
      <v-content>
        <no-ssr>
          <nuxt />
          <snackbar></snackbar>
          <change-password-form
            :show="showChangePasswordForm"
            @onClose="showChangePasswordForm = false"
          />
          <confirmDialog
            title="Logout"
            :show="showConfirm"
            @onClose="showConfirm = false"
            @onConfirm="logout"
          ></confirmDialog>
        </no-ssr>
      </v-content>
    </v-container>
  </v-app>
</template>

<script>
import {
  snackbar,
  changePasswordForm,
  confirmDialog
} from "@/components/commons";
export default {
  components: { snackbar, changePasswordForm, confirmDialog },
  data() {
    return {
      showChangePasswordForm: false,
      showConfirm: false
    };
  },
  methods: {
    async logout() {
      await this.$auth.logout();
      this.$router.push("/login");
    }
  },
  computed: {
    user() {
      return this.$store.state.auth.user;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
