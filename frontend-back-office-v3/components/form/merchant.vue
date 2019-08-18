<template>
  <div v-show="show" persistent>
    <v-card>
      <v-card-title class="grey lighten-4 py-4 title blue--text">
        Create Merchant
        <v-spacer/>
        <v-icon @click="close">close</v-icon>
      </v-card-title>
      <v-form @submit.prevent="postMerchant" class="pa-3">
        <v-card-text>
          <v-text-field v-model="name" label="Name" name="name" v-validate="'required'"/>
          <span class="message-form">{{ errors.first('name') }}</span>
          <v-textarea label="Description" id="description" rows="3"/>
          <v-text-field
            v-model="shortName"
            label="Short Name"
            name="short-name"
            v-validate="'required'"
          />
          <span class="message-form">{{ errors.first('short-name') }}</span>
          <v-text-field v-model="email" label="Email" name="email" v-validate="'email|required'"/>
          <span class="message-form">{{ errors.first('email') }}</span>
          <v-text-field v-model="website" label="Website"/>
          <v-text-field v-model="phoneNumber" label="Phone Number"/>
          <v-text-field v-model="bankName" label="Bank Name"/>
          <v-text-field v-model="bankBranchName" label="Bank Branch Name"/>
          <v-text-field v-model="bankAccountName" label="Bank Account Name"/>
          <v-text-field v-model="bankAccountNumber" label="Bank Account Number"/>
          <v-text-field v-model="ownerName" label="Owner Name" name="name" v-validate="'required'"/>
          <span class="message-form">{{ errors.first('name') }}</span>
          <v-text-field
            v-model="ownerEmail"
            label="Owner Email"
            name="email"
            v-validate="'email|required'"
          />
          <span class="message-form">{{ errors.first('email') }}</span>
          <v-text-field v-model="ownerOccupation" label="Owner Occupation"/>
          <v-text-field v-model="ownerIdCardNumber" label="Owner Id Card Number"/>
          <v-text-field v-model="ownerIdCardType" label="Owner Id Card Type"/>
          <v-text-field v-model="ownerTaxCardNumber" label="Owner Tax Card Number"/>
        </v-card-text>
        <v-card-actions>
          <v-btn type="submit">Submit</v-btn>
          <v-btn @click="reset">Reset</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import { exit } from "~/mixins";

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
      idAlias: "",
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
      userId: "",
      ownerName: "",
      ownerOccupation: "",
      ownerEmail: "",
      ownerPhoneNumber: "",
      ownerIdCardNumber: "",
      ownerIdCardType: "",
      ownerTaxCardNumber: "",
      info: ""
    };
  },
  methods: {
    async postMerchant() {
      console.log("form merchant");
      await this.$validator
        .validateAll()
        .then(() => {
          if (!this.errors.any()) {
            this.$axios
              .$post(`/api/back_office/merchants`, {
                name: this.name,
                shortName: this.shortName,
                description: this.description,
                companyForm: this.companyForm,
                email: this.email,
                website: this.website,
                phoneNumber: this.phoneNumber,
                taxCardNumber: this.idTaxCard,
                bankName: this.bankName,
                bankBranchName: this.bankBranchName,
                bankAccountName: this.bankAccountName,
                bankAccountNumber: this.bankAccountNumber,
                ownerName: this.ownerName,
                ownerOccupation: this.ownerOccupation,
                ownerEmail: this.ownerEmail,
                ownerPhoneNumber: this.phoneNumber,
                ownerIdCardNumber: this.owerIdCardNumber,
                ownerIdCardType: this.ownerIdCardType,
                ownerTaxcardNumber: this.ownerTaxCardNumber
              })
              .then(response => {
                alert(response.message);
                this.refresh();
                this.close();
              })
              .catch(e => {
                alert(e.response.data.message);
              });
          }
        })
        .catch(e => alert(e));
    },
    reset() {
      this.name = "";
      this.email = "";
      this.website = "";
    }
  }
};
</script>

<style>
</style>
