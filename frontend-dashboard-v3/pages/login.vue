<template>
  <v-container fill-height>
    <v-layout align-center justify-center>
      <v-card min-height="70vh" min-width="60vw">
        <v-layout>
          <v-flex lg6 md6 class="hidden-sm-and-down">
            <v-img
              min-height="70vh"
              src="https://images.pexels.com/photos/87080/space-shuttle-start-discovery-spaceport-87080.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
            ></v-img>
          </v-flex>
          <v-flex lg6 md6 sm12>
            <div class="right-side">
              <h1 class="title text-center mb-5 grey--text">WELCOME TO</h1>
              <v-img
                src="/img/logo_horizontal_biru.png"
                max-height="10vh"
                position="center"
                contain
              ></v-img>
              <v-form class="mt-5">
                <v-text-field
                  rounded
                  prepend-inner-icon="person"
                  outlined
                  placeholder="username"
                  single-line
                  v-model="email"
                  autofocus
                ></v-text-field>
                <v-text-field
                  rounded
                  prepend-inner-icon="lock"
                  outlined
                  single-line
                  placeholder="password"
                  :type="show1 ? 'text' : 'password'"
                  :append-icon="show1 ? 'visibility' : 'visibility_off'"
                  @click:append="show1 = !show1"
                  v-model="password"
                ></v-text-field>
                <div class="mt-2">
                  <v-btn color="primary" rounded block x-large @click="login">Login</v-btn>
                </div>
              </v-form>
            </div>
          </v-flex>
        </v-layout>
      </v-card>
    </v-layout>
    <v-snackbar v-model="snackbar" top color="error">
      {{ text }}
      <v-btn text @click="snackbar = false">Close</v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  layout: "nonav",
  data: () => ({
    show1: false,
    email: "merchantStaff3",
    password: "merchantStaff3",
    snackbar: false,
    text: ""
  }),
  methods: {
    async login() {
      try {
        if (this.email !== "" && this.password !== "") {
          const resp = await this.$auth.loginWith("local", {
            data: {
              username: this.email,
              password: this.password
            }
          });
        }
      } catch (e) {
        console.log("e", e);
        this.text = e.response.data.message;
        this.snackbar = true;
      }
    }
  }
};
</script>
<style lang="scss">
.right-side {
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 70vh;
  justify-content: center;
  /* align-items: center; */
}
</style>

