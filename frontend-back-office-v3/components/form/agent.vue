<template>
  <div id="agent">
    <v-card>
      <v-card-title class="grey lighten-4 py-4 title blue--text">
        Create Agent
        <v-spacer/>
        <v-icon @click="close">close</v-icon>
      </v-card-title>
      <v-form @submit.prevent="postAgent" class="pa-3">
        <v-card-text>
          <v-text-field v-model="name" label="Name" name="name" v-validate="'required'"/>
          <span class="message-form">{{ errors.first('name') }}</span>
          <v-select :items="item" v-model="boundedToTerminal" label="Bounded to Terminal"/>
          <v-text-field v-model="email" label="Email" name="email" v-validate="'email|required'"/>
          <span class="message-form">{{ errors.first('email') }}</span>
          <v-text-field
            v-model="username"
            label="Username"
            name="username"
            v-validate="'required'"
          />
          <span class="message-form">{{ errors.first('username') }}</span>
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            name="password"
            v-validate="'required'"
          />
          <span class="message-form">{{ errors.first('password') }}</span>
          <v-text-field v-model="outlet.name" label="Outlet Name" readonly/>
        </v-card-text>
        <v-card-actions>
          <v-btn type="submit">Submit</v-btn>
          <v-btn>Reset</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import { exit } from "~/mixins";

export default {
  props: {
    outlet: {
      type: Object,
      default: () => ({
        params: value
      })
    }
  },
  mixins: [exit],
  data() {
    return {
      name: "",
      email: "",
      username: "",
      password: "",
      description: "",
      generalLocationLong: "",
      generalLocationRadiusMeter: "",
      boundedToTerminal: false,
      outletName: "",
      outletId: "",
      merchantItems: [],
      outletItems: [],
      merchantId: "",
      item: ["true", "false"],
      outlets: []
    };
  },
  methods: {
    async postAgent() {
      await this.$validator.validateAll().then(() => {
        if (!this.errors.any()) {
          this.$axios
            .$post("/api/back_office/agents", {
              email: this.email,
              name: this.name,
              boundedToTerminal: this.boundedToTerminal,
              outletId: this.outlet.id,
              user: {
                username: this.username,
                password: this.password
              },
              merchantId: this.outlet.merchantId
            })
            .then(response => {
              alert(response.message);
              this.refresh();
              this.close();
            })
            .catch(e => {
              console.log(e);
              alert(e.message);
            });
        }
      });
    }
  }
};
</script>

<style>
</style>
