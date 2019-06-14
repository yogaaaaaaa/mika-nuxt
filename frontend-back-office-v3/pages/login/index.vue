<template>
  <no-ssr id="login">
    <v-content class="pa-4">
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs10 sm8 md4>
            <v-card class="pa-4">
              <v-card-title>
                <div class="logo">
                  <!-- <v-img src="/logo-crop.png" style="width:100px;"/> -->
                </div>
              </v-card-title>
              <v-form @submit.prevent="login">
                <v-text-field prepend-icon="person" label="Username" v-model="username" box/>
                <v-text-field
                  prepend-icon="lock"
                  label="Password"
                  type="password"
                  v-model="password"
                  box
                />
                <div style="margin-bottom: 40px">
                  <v-btn class="right" type="submit">Login</v-btn>
                </div>
              </v-form>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </no-ssr>
</template>

<script>
// import cookie from "js-cookie";
import { mapGetters, mapState } from "vuex";

export default {
  layout: "login-layout",
  middleware: "guest",
  data() {
    return {
      username: "",
      password: "",
      info: ""
    };
  },
  computed: {
    ...mapGetters(["isAuthenticated", "loggedInUser"])
  },
  methods: {
    async login() {
      try {
        this.info = await this.$auth
          .loginWith("local", {
            data: {
              username: this.username,
              password: this.password
            }
          })
          .then(r => {
            console.log("isi info", this.info);
          });
      } catch (e) {
        console.log("error login ", e);
      }
    }
  }
};
</script>

<style>
html {
  background-color: #c8e3e1;
}
.logo {
  text-align: center;
  align-content: center;
  align-items: center;
  align-self: center;
}
</style>
