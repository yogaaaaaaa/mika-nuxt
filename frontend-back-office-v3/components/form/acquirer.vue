<template>
  <div id="acquirer-form">
    <v-card>
      <v-card-title class="grey lighten-4 py-4 title blue--text">
        Create Acquirer
        <v-spacer/>
        <v-icon @click="close">close</v-icon>
      </v-card-title>
      <v-stepper v-model="step">
        <!-- <v-stepper-step step="1" complete>Basic Information</v-stepper-step> -->
        <v-stepper-content step="1">
          <v-text-field v-model="name" label="Name"/>
          <v-text-field v-model="description" label="Description"/>
          <v-text-field v-model="maximumAmount" label="Maximum Ampunt"/>
          <v-text-field v-model="minimumAmount" label="Minimum Amount"/>
          <v-text-field v-model="shareAcquirer" label="Share Acquirer"/>
          <v-text-field v-model="shareMerchant" label="Shate Merchant"/>
          <!-- <v-tex-field></v-tex-field> -->
          <v-spacer/>
          <v-btn @click="step = 2">Next</v-btn>
        </v-stepper-content>
        <!-- <v-stepper-step step="2" style="background-color: yellow">Config</v-stepper-step> -->
        <v-stepper-content step="2">
          <v-select
            :items="aConfig"
            item-text="name"
            item-value="id"
            v-model="acquirerConfigId"
            label="Acquirer Config Name"
          />
          <v-select
            :items="acquirerType"
            item-text="name"
            item-value="id"
            v-model="acquirerTypeId"
            label="Acquirer Type Name"
          />
          <v-btn @click="step = 1">Previous</v-btn>
          <v-btn @click="postAcquirer()">Submit</v-btn>
        </v-stepper-content>
        <v-stepper-content step="3"></v-stepper-content>
      </v-stepper>
    </v-card>
  </div>
</template>

<script>
import { exit } from "~/mixins";

export default {
  props: {
    aConfig: {
      type: Array,
      default: () => []
    },
    merchants: {
      type: Array,
      default: () => []
    },
    acquirerType: {
      type: Array,
      default: () => []
    },
    merchant: {
      type: Object,
      default: () => ({})
    }
  },
  mixins: [exit],
  data() {
    return {
      name: "",
      description: "",
      minimumAmount: null,
      maximumAmount: null,
      shareAcquirer: null,
      shareMerchant: null,
      shareMerchantWPartner: null,
      sharePartner: null,
      directSettlement: false,
      gateway: false,
      hidden: false,
      merchantId: "",
      merchantName: [],
      acquirerConfigId: {},
      acquirerConfigName: [],
      acquirerTypeId: "",
      acquirerTypeName: [],
      step: "1"
    };
  },
  methods: {
    checkConfig() {
      console.log(this.acquirerConfigId);
    },
    async postAcquirer() {
      await console.log("acquirer config", this.acquirerConfigId);
      await this.$validator.validateAll().then(() => {
        if (!this.errors.any()) {
          this.$axios
            .$post("/api/back_office/acquirers", {
              name: this.name,
              description: this.description,
              minimumAmount: this.minimumAmount,
              maximumAmount: this.maximumAmount,
              shareAcquirer: this.shareAcquirer,
              shareMerchant: this.shareMerchant,
              shareMerchantWPartner: this.shareMerchantWPartner,
              sharePartner: this.sharePartner,
              directSettlement: this.directSettlement,
              gateway: this.gateway,
              hidden: this.gateway,
              merchantId: this.merchant.id,
              acquirerConfigId: this.acquirerConfigId,
              acquirerTypeId: this.acquirerTypeId
            })
            .then(response => {
              alert(response.message);
              this.refresh();
              this.close();
            })
            .catch(error => {
              alert(error);
            });
        }
      });
    }
  }
};
</script>

<style>
.switch {
  color: gray;
  font-size: 16px;
  margin-top: 10px;
}
</style>
