<template>
  <div id="merchant-card">
    <v-card>
      <v-card-title class="grey lighten-4 py-4 title blue--text">
        Edit Merchant
        <v-spacer/>
        <v-icon @click="close">close</v-icon>
      </v-card-title>
      <v-form ref="form" @submit.prevent="putMerchant()">
        <v-card-text>
          <v-text-field label="Name" v-model="name"/>
          <v-text-field label="Short Name" v-model="shortName"/>
          <v-text-field label="Status" v-model="status"/>
          <v-text-field label="Company Form" v-model="companyForm"/>
          <v-text-field label="Email" v-model="email"/>
          <v-text-field label="Website" v-model="website"/>
          <v-text-field label="Phone Number" v-model="phoneNumber"/>
          <v-text-field label="Id Tax Card"/>
          <v-text-field label="Bank Name" v-model="bankName"/>
          <v-text-field label="Bank Branch Name" v-model="bankBranchName"/>
          <v-text-field label="Bank Account Name" v-model="bankAccountName"/>
          <v-text-field label="Bank Account Number" v-model="bankAccountNumber"/>
          <v-text-field label="Owner Name" v-model="ownerName"/>
          <v-text-field label="Owner Email" v-model="ownerEmail"/>
          <v-text-field label="Owner Occupation" v-model="ownerOccupation"/>
          <v-text-field label="Owner Id Card Number" v-model="ownerIdCardNumber"/>
          <v-text-field label="Owner Id Card Type" v-model="ownerIdCardType"/>
          <v-text-field label="Owner Tax Card Number " v-model="ownerTaxCardNumber"/>
          <!-- <v-text-field label="Partner Name" v-model="partnerId"/> -->
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn type="submit" class="mb-2">Submit</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import { exit } from "~/mixins";
import { mapState } from "vuex";

export default {
  mixins: [exit],
  watch: {
    merchant: {
      immediate: true,
      handler() {
        this.name = this.merchant.name;
        this.shortName = this.merchant.shortName;
        this.status = this.merchant.status;
        this.companyForm = this.merchant.companyForm;
        this.email = this.merchant.email;
        this.website = this.merchant.website;
        this.phoneNumber = this.merchant.phoneNumber;
        this.bankName = this.merchant.bankName;
        this.bankBranchName = this.merchant.bankBranchName;
        this.bankAccountName = this.merchant.bankAccountName;
        this.bankAccountNumber = this.merchant.bankAccountNumber;
        this.ownerName = this.merchant.ownerName;
        this.ownerEmail = this.merchant.ownerEmail;
        this.ownerOccupation = this.merchant.ownerOccupation;
        this.ownerIdCardNumber = this.merchant.ownerIdCardNumber;
        this.ownerIdCardType = this.merchant.ownerIdCardType;
        this.ownerTaxCardNumber = this.merchant.ownerTaxCardNumber;
      }
    }
  },
  data() {
    return {
      idAlias: null,
      tempMerchant: {},
      name: "",
      shortName: "",
      status: "",
      companyForm: "",
      email: "",
      website: "",
      phoneNumber: "",
      bankName: "",
      bankBranchName: "",
      bankAccountName: "",
      bankAccountNumber: "",
      ownerName: "",
      ownerEmail: "",
      ownerOccupation: "",
      ownerIdCardNumber: "",
      ownerIdCardType: "",
      ownerTaxCardNumber: ""
    };
  },
  computed: {
    ...mapState(["merchant"])
  },
  methods: {
    async putMerchant() {
      await this.$axios
        .$put(`/api/back_office/merchants/${this.$route.params.id}`, {
          name: this.name,
          shortName: this.shortName,
          status: this.status,
          companyForm: this.companyForm,
          email: this.email,
          website: this.website,
          phoneNumber: this.phoneNumber,
          bankName: this.bankName,
          bankBranchName: this.bankBranchName,
          bankAccountName: this.bankAccountName,
          bankAccountNumber: this.bankAccountNumber,
          ownerName: this.ownerName,
          ownerEmail: this.ownerEmail,
          ownerOccupation: this.ownerOccupation,
          ownerIdCardNumber: this.ownerIdCardNumber,
          ownerIdCardType: this.ownerIdCardType,
          ownerTaxCardNumber: this.ownerTaxCardNumber
        })
        .then(r => {
          this.refresh();
          this.close();
        })
        .catch(e => console.log(e));
    }
  }
};
</script>

<style>
</style>
