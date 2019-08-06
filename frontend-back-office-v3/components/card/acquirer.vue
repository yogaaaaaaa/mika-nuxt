<template>
  <div class="acquirer-card">
    <v-card>
      <v-card-title class="grey lighten-4 py-4 title blue--text">
        Edit Acquirer
        <v-spacer/>
        <v-icon @click="close">close</v-icon>
      </v-card-title>
      <v-form @submit.prevent="putAcquirer()">
        <v-card-text>
          <v-text-field v-model="edit.id" label="Id"/>
          <v-text-field v-model="edit.name" label="Name"/>
          <v-text-field v-model="edit.maxiumumAmount" label="Maximum Amount"/>
          <v-text-field v-model="edit.minimumAmount" label="Minimum Amount"/>
          <v-text-field v-model="edit.shareMerchant" label="Share Merchant"/>
          <v-text-field
            v-model="edit.shareMerchantWithPartner"
            label="Share Merchant with Partner"
          />
          <v-text-field v-model="edit.sharePartner" label="Share Partner"/>
          <v-select label="Direct Settlement"></v-select>
          <v-select label="Gateway" v-model="edit.gateway"/>
          <v-select label="Hidden" v-model="edit.hidden"/>
          <v-text-field v-model="edit.merchantId" label="Merchant Name"/>
          <v-text-field v-model="edit.acquirerConfigId" label="Acquirer Config Id"/>
          <v-text-field v-model="edit.acquirerTypeId" label="Acquirer Type Id"/>
          <v-text-field v-model="edit.createdAt" label="Created At"/>
          <v-text-field v-model="edit.updatedAt" label="Updated At"/>
        </v-card-text>
        <v-card-actions>
          <v-btn type="submit" color="yellow">Submit</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import { exit } from "~/mixins";
import { mapState } from "vuex";

export default {
  props: {
    // acquirer: {
    //   type: Object,
    //   default: () => ({
    //     params: value
    //   })
    // }
  },
  mixins: [exit],
  watch: {
    acquirer: {
      immediate: true,
      handler() {
        this.edit.id = this.acquirer.id;
        this.edit.name = this.acquirer.name;
        this.edit.maximumAmount = this.acquirer.maximumAmount;
        this.edit.minimumAmount = this.acquirer.minimumAmount;
        this.edit.sharemerchant = this.acquirer.sharemerchant;
        this.edit.shareMerchantWithPartner = this.acquirer.shareMerchantWithPartner;
        this.edit.sharePartner = this.acquirer.sharePartner;
        this.edit.directSettlement = this.acquirer.directSettlement;
        this.edit.gateway = this.acquirer.gateway;
        this.edit.hidden = this.acquirer.hidden;
        // this.edit.merchantId = this.merchant.name;
        this.edit.acquirerConfigId = this.acquirer.acquirerConfigId;
        this.edit.acquirerTypeId = this.acquirer.acquirerTypeId;
      }
    }
  },
  data() {
    return {
      edit: {}
    };
  },
  computed: {
    ...mapState(["acquirer", "merchant"])
  },
  methods: {
    async putAcquirer() {
      await this.$axios
        .$put(`/api/back_office/acquirers/${this.$route.params.id}`, {
          name: this.edit.name,
          maximumAmount: this.edit.maximumAmount,
          minimumAmount: this.edit.minimumAmount,
          sharemerchant: this.edit.sharemerchant,
          shareMerchantWithPartner: this.edit.shareMerchantWithPartner,
          sharePartner: this.edit.sharePartner,
          directSettlement: this.edit.directSettlement,
          gateway: this.edit.gateway,
          hidden: this.edit.hidden,
          acquirerTypeId: this.edit.acquirerTypeId,
          acquirerConfigId: this.edit.acquirerConfigId
        })
        .then(r => {
          this.refresh();
          this.close();
        })
        .catch(e => alert(e));
    }
  }
};
</script>

<style>
</style>
