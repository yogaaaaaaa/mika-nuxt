<template>
  <div v-show="show" persistent>
    <v-card >
      <v-card-title class="grey lighten-4 py-4 title blue--text">
        Create Merchant
        <v-spacer />
        <v-icon @click="close">close</v-icon>
      </v-card-title>
      <v-form @submit.prevent="postMerchant" class="pa-3">
        <v-card-text>
          <v-text-field v-model="name" label="Name" />
          <textarea name="description" id="description" cols="30" rows="10"></textarea>
          <v-text-field v-model="shortName" label="Short Name" />
          <v-text-field v-model="email" label="Email" />
          <v-text-field v-model="website" label="Website" />
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
          <v-btn>Submit</v-btn>
          <v-btn @click="reset">Reset</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import { exit } from "~/mixins"

export default {
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  mixins: [exit],
  data() {
    return {
      name: "",
      shortName: "",
      description: "",
      companyForm: "",
      email: "",
      website: "",
      phoneNumber: "",
      idTaxCard: "",
      scannedTaxCardResourceId: "",
      bankName: "",
      bankBranchName: "",
      bankAccountName: "",
      bankAccountNumber: "",
      scannedBankStatementresourceId: "",
      scannedSkmenkumhamResourceId: "",
      scannedSiupResourceId: "",
      scannedSkdpResourceId: "",
      partnerId: "",
      userId: ""
    }
  },
  methods: {
    async postMerchant() {
      await this.$validate.validateAll().then(() => {
        if(!this.errors.any()) {
          this.$axios.$post("/marketing/merchant", {
            name: this.name,
            shortName: this.shortName,
            description: this.description,
            companyForm: this.companyForm,
            email: this.email,
            website: this.website,
            phoneNumber: this.phoneNumber,
            idTaxCard: this.idTaxCard,
            bankName: this.bankName,
            bankBranchName: this.bankBranchName,
            bankAccountName: this.bankAccountName,
            bankAccountNumber: this.bankAccountNumber,
            partnerId: this.partnerId
          }).then(response => {
            alert(response)
          }).catch(error => {
            alert(error)
          })
        }
      })
    },
    reset() {
      this.name = "";
      this.email = "";
      this.website = ""
    }
  }
}
</script>

<style>

</style>
