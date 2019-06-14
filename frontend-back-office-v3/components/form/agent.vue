<template>
  <div id="agent">
    <v-card>
      <v-card-title class="grey lighten-4 py-4 title blue--text">
        Create Agent
        <v-spacer />
        <v-icon @click="close">close</v-icon>
      </v-card-title> 
      <v-form @submit.prevent="postAgent" class="pa-3">
        <v-card-text>
          <v-text-field v-model="name" label="Name" />
          <v-select
            :items="item" 
            v-model="boundedToTerminal" 
            label="Bounded to Terminal" 
          />
          <v-text-field 
            v-model="email" 
            label="Email" 
            name="email" 
            v-validate="'email'" 
          />
          <v-text-field v-model="username" label="Username" />
          <v-text-field v-model="outletName" label="Outlet Name" />
          <v-select />
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
import { exit } from "~/mixins"

export default {
  mixins: [exit],
  data() {
    return {
      name: "",
      email: "",
      username: "",
      description: "",
      generalLocationLong: "",
      generalLocationRadiusMeter: "",
      boundedToTerminal: false,
      outletName: "",
      outletId: "",
      merchantItems: [],
      outletItems: [
        {  }
      ],
      merchantId: "",
      item: ['true', 'false']
    }
  },
  methods: {
    async postAgent() {
      await this.$validate.validateAll().then(() => {
        if(!this.errors.any()) {
          this.$axios.$post("/marketing/agents", {
            email: this.email,
            username: this.username,
            name: this.name,
            boundedToTerminal: this.boundedToTerminal,
            outletId: this.outletId,
            merchantId: this.merchantId
          })
        }
      })
    }
  }
}
</script>

<style>

</style>
