<template>
  <div id="outlet-form">
    <v-card>
      <v-card-title class="grey lighten-4 py-4 title blue--text">
        Create Outlet
        <v-spacer/>
        <v-icon @click="close">close</v-icon>
      </v-card-title>
      <v-form @submit.prevent="postOutlet" class="pa-3">
        <v-card-text>
          <v-text-field v-model="name" label="Name" name="name" v-validate="'required'"/>
          <span class="message-form">{{ errors.first('name') }}</span>
          <v-text-field v-model="email" label="Email" name="email" v-validate="'email|required'"/>
          <span class="message-form">{{ errors.first('email') }}</span>
          <v-text-field v-model="website" label="Website"/>
          <v-text-field v-model="phoneNumber" label="Phone Number"/>
          <v-text-field v-model="ownershipType" label="Ownership Type"/>
          <div class="date">Rent Start Date</div>
          <v-date-picker
            :reactive="true"
            v-model="rentStartDate"
            label="Rent Start Date"
            color="blue lighten-1"
          />
          <v-text-field v-model="rentDurationMonth" label="Rent Duration Month"/>
          <v-text-field v-model="otherPaymentSystem" label="Other Payment System"/>
          <v-text-field v-model="businessType" label="Business Type"/>
          <v-text-field v-model="businessDurationMonth" label="Business Duration Month"/>
          <v-text-field v-model="businessMonthlyTurnover" label="Business Monthly Turn Over"/>
          <v-text-field v-model="merchant.name" label="Merchant Name" readonly/>
        </v-card-text>
        <v-card-actions>
          <v-btn type="submit" class="mb-3">Submit</v-btn>
          <v-btn class="mb-3">Reset</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import { exit } from "~/mixins";

export default {
  props: {
    merchant: {
      type: Object,
      required: true
    }
  },
  mixins: [exit],
  data() {
    return {
      name: "",
      description: "",
      email: "",
      website: "",
      phoneNumber: "",
      ownershipType: "",
      rentStartDate: null,
      rentDurationMonth: null,
      otherPaymentSystem: "",
      outletPhotoResourceId: "",
      businessType: "",
      businessDurationMonth: null,
      businessMonthlyTurnover: null,
      merchantItems: []
    };
  },
  methods: {
    submit() {
      let merchant = {
        name: this.name,
        email: this.email,
        website: this.website,
        phoneNumber: this.phoneNumber,
        ownershipType: this.ownershipType,
        rentStartDate: this.rentStartDate,
        merchantId: this.merchantId
      };
      console.log(merchant);
    },
    async postOutlet() {
      await this.$validator.validateAll().then(() => {
        if (!this.errors.any()) {
          this.$axios
            .$post("/api/back_office/outlets", {
              name: this.name,
              description: this.description,
              email: this.email,
              website: this.website,
              phoneNumber: this.phoneNumber,
              ownershipType: this.ownershipType,
              rentStartDate: this.rentStartDate,
              rentDurationMonth: this.rentDurationMonth,
              otherPaymentSystem: this.otherPaymentSystem,
              outletPhotoResourceId: this.outletPhotoResourceId,
              businessType: this.businessType,
              businessDurationMonth: this.businessDurationMonth,
              businessMonthlyTurnover: this.businessMonthlyTurnover,
              merchantId: this.merchant.id
            })
            .then(response => {
              alert(response.message);
              this.refresh();
              this.close();
            })
            .catch(error => {
              alert(error.response.data.message);
            });
        }
      });
    }
  }
};
</script>

<style>
.date {
  color: gray;
  font-size: 16px;
  margin-bottom: 5px;
}
</style>
