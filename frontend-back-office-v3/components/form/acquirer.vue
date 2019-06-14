<template>
  <div class="acquirer-form">
    <v-card class="pa-0">
      <v-card-title class="grey lighten-4 py-4 title blue--text">
        Create Acquirer
        <v-spacer />
        <v-icon @click="close">close</v-icon>
      </v-card-title>
      <v-form @submit.prevent="postAquirer" class="pa-3">
        <v-card-text>
          <v-text-field
            v-model="name"
            label="Name"
          />
          <v-text-field 
            v-model="description"
            label="Description"
          />
          <v-text-field
            v-model="minimumAmount"
            label="Minimum Amount"
          />
          <v-text-field
            v-model="maximumAmount"
            label="Maximum Amount"
          />
          <v-text-field
            v-model="shareAcquirer"
            label="Share Acquirer"
          />
          <v-text-field
            v-model="shareMerchant"
            label="Share Merchant"
          />
          <v-text-field
            v-model="shareMerchantWPartner"
            label="Share Merchant With Partner"
          />
          <v-text-field
            v-model="sharePartner"
            label="Share Partner"
          />
          <v-layout row>
            <v-flex xs4>
              <div class="switch">Direct Settlement</div>
              <v-switch v-model="directSettlement" :label="`${directSettlement.toString()}`" color="blue"></v-switch>
            </v-flex>
            <v-flex xs4>
              <div class="switch">Gateway</div>
              <v-switch v-model="gateway" :label="`${gateway.toString()}`" color="blue"></v-switch>
            </v-flex>
            <v-flex xs4>
              <div class="switch">Hidden</div>
              <v-switch v-model="hidden" :label="`${hidden.toString()}`" color="blue"></v-switch>
            </v-flex>
          </v-layout>
          <v-select
            :items="merchantName"
            item-text="name"
            item-value="id"
            v-model="merchantId"
            label="Merchant Name"
          />
          <v-select
            :items="acquirerTypeName"
            item-text="name"
            item-value="id"
            v-model="acquirerTypeId"
            label="Acquirer Name"
          />
          <v-select 
            :items="acquirerConfigName"
            item-text="name"
            item-value="id"
            v-model="acquirerConfigId"
            label="Acquirer Config Name"
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
  mixins: [exit],
  data() {
    return {
      name: "",
      description: "",
      minimumAmount: "",
      maximumAmount: "",
      shareAcquirer: "",
      shareMerchant: "",
      shareMerchantWPartner: "",
      sharePartner: "",
      directSettlement: false,
      gateway: false,
      hidden: false,
      merchantId: "",
      merchantName: [],
      acquirerConfigId: "",
      acquirerConfigName: [],
      acquirerTypeId: "",
      acquirerTypeName: []
    }
  },
  methods: {
    async postAcquirer() {
      await this.$axios.post('/marketing/acquirer', {
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
        merchantId: this.merchantId,
        acquirerConfigId: this.acquirerConfigId,
        acquirerTypeId: this.acquirerTypeId
      }).then(response => {
        alert(response)
      }).catch(error => {
        alert(error)
      })
    }
  }
}
</script>

<style>
.switch {
  color: gray;
  font-size: 16px;
  margin-top: 10px;
}
</style>
