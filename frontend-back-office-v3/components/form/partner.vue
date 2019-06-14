<template>
  <div class="partner">
    <v-card>
      <v-card-title class="grey lighten-4 py-4 title blue--text">
        Create Partner
        <v-spacer />
        <v-icon @click="close">close</v-icon>
      </v-card-title>
      <v-form @submit.prevent="postPartner">
        <v-card-text>
          <v-text-field 
            v-model="name"
            label="Name"
          />
          <v-text-field
            v-model="email"
            label="Email"
          />
          <v-text-field
            v-model="website"
            label="Website"
          />
          <v-text-field
            v-model="phoneNumber"
            label="Phone Number"
          />
          <v-text-field
            v-model="bankName"
            label="Bank Name"
          />
          <v-text-field
            v-model="bankBranchName"
            label="Bank Branch Name"
          />
          <v-text-field
            v-model="bankAccountName"
            label="Bank Account Name"
          />
          <v-text-field
            v-model="bankAccountNumber"
            label="Bank Account Number"
          />
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
  mixin: [exit],
  data() {
    return {
      name: "",
      description: "",
      email: "",
      website: "",
      phoneNumber: "",
      bankName: "",
      bankBranchName: "",
      bankAccountName: "",
      bankAccountNumber: ""
    }
  },
  methods: {
    async postPartner() {
      await this.$validate.validateAll().then(() => {
        this.$axios.$post("/marketing/partner", {
          name: this.name,
          description: this.description,
          email: this.email,
          website: this.website,
          phoneNumber: this.phoneNumber,
          bankName: this.bankName,
          bankBranchName: this.bankBranchName,
          bankAccountName: this.bankAccountName,
          bankAccountNumber: this.bankAccountNumber
        }).then(response => {
          alert (response)
        }).catch(error => {
          alert(error)
        })
      })
    }
  }
}
</script>

<style>

</style>
