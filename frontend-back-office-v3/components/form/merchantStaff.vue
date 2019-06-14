<template>
  <div id="merchant-staff">
    <v-card>
      <v-card-title class="grey lighten-4 py-4 title blue--text">
        Create Merchant Staff
        <v-spacer />
        <v-icon @click="close">close</v-icon>
      </v-card-title>
      <v-form @submit.prevent="postMerchantStaff" class="pa-3">
        <v-card-text>
          <v-text-field
            v-model="name"
            label="Name"
          />
          <v-text-field
            v-model="idCardNumber"
            label="Id Card Number"
          />
          <v-text-field
            v-model="idCardType"
            label="Id Card Type"
          />
          <v-text-field
            v-model="phoneNumber"
            label="Phone Number"
          />
          <v-text-field
            v-model="email"
            label="Email"
          />
          <v-text-field
            v-model="occupation"
            label="Occupation"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn>Create</v-btn>
          <v-btn>Reset</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import { exit } from "~/mixins";

export default {
  mixins: [exit],
  data() {
    return {
      name: "",
      email: "",
      username: "",
      description: "",
      idCardNumber: "",
      idCardType: "",
      phoneNumber: "",
      occupation: "",
      userId: "",
      merchantId: "",
      merchantName: ""
    }
  },
  methods: {
    async postMerchantStaff() {
      await this.$validate.validateAll().then(() => {
        if(!this.errors.any()) {
          this.$axios.$post("/marketing/merchant_staff", {
            name: this.name,
            email: this.email,
            username: this.username,
            description: this.description,
            idCardNumber: this.idCardNumber,
            idCardType: this.idCardType,
            phoneNumber: this.phoneNumber,
            occupation: this.occupation,
            merchantId: merchantId
          })
        }
      })
    }
  }
}
</script>

<style>

</style>
