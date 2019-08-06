<template>
  <div id="merchant-staff">
    <v-card>
      <v-card-title class="grey lighten-4 py-4 title blue--text">
        Create Merchant Staff
        <v-spacer/>
        <v-icon @click="close">close</v-icon>
      </v-card-title>
      <v-form @submit.prevent="postMerchantStaff" class="pa-3">
        <v-card-text>
          <v-text-field v-model="name" label="Name" name="name" v-validate="'required'"/>
          <span class="message-form">{{ errors.first('name') }}</span>
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
          <v-text-field v-model="idCardNumber" label="Id Card Number"/>
          <v-text-field v-model="idCardType" label="Id Card Type"/>
          <v-text-field v-model="phoneNumber" label="Phone Number"/>
          <v-text-field v-model="email" label="Email" name="email" v-validate="'email|required'"/>
          <span class="message-form">{{ errors.first('email') }}</span>
          <v-text-field v-model="occupation" label="Occupation"/>
          <v-text-field v-model="streetAddress" label="Street Address"/>
          <v-text-field v-model="locacity" label="Locacity"/>
          <v-text-field v-model="district" label="Distric"/>
          <v-text-field v-model="city" label="City"/>
          <v-text-field v-model="province" label="Province"/>
          <v-text-field v-model="postalCode" label="Postal Code"/>
          <v-text-field v-model="merchant.name" label="Merchant Name" readonly/>
        </v-card-text>
        <v-card-actions>
          <v-btn type="submit">Create</v-btn>
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
    merchant: {
      type: Object,
      default: () => ({})
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
      idCardNumber: "",
      idCardType: "",
      phoneNumber: "",
      occupation: "",
      streetAddress: "",
      locacity: "",
      district: "",
      city: "",
      province: "",
      postalCode: "",
      userId: "",
      merchantId: "",
      merchantName: ""
    };
  },
  methods: {
    async postMerchantStaff() {
      console.log("username", this.username);
      await this.$validator.validateAll().then(() => {
        if (!this.errors.any()) {
          this.$axios
            .$post("/api/back_office/merchant_staffs", {
              name: this.name,
              email: this.email,
              description: this.description,
              idCardNumber: this.idCardNumber,
              idCardType: this.idCardType,
              occupation: this.occupation,
              streetAddress: this.streetAddress,
              locacity: this.locacity,
              district: this.district,
              city: this.city,
              province: this.province,
              postalCode: this.postalCode,
              phoneNumber: this.phoneNumber,
              occupation: this.occupation,
              merchantId: this.merchant.id,
              user: {
                username: this.username,
                password: this.password
              }
            })
            .then(response => {
              alert(response.message);
              this.refresh();
              this.close();
            })
            .catch(e => alert(e));
        }
      });
    }
  }
};
</script>

<style>
</style>
