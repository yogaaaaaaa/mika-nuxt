<template>
  <div>
    <v-card class="pa-4">
      <v-card-text>
        <v-flex>
          <v-layout wrap>
            <div style="width: 35%">Id</div>
            <span>:</span>
            <div class="ml-1">{{ acquirer.id }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Name</div>
            <span>:</span>
            <div class="ml-1">{{ acquirer.name }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Minimum Amount</div>
            <span>:</span>
            <div class="ml-1">{{ toCurrency(acquirer.minimumAmount) }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Maximum Amount</div>
            <span>:</span>
            <div class="ml-1" v-if="acquirer.maximumAmount">{{ toCurrency(acquirer.maximumAmount) }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Share Merchant</div>
            <span>:</span>
            <div class="ml-1">{{ acquirer.shareMerchant }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Share Merchant With Partnerr</div>
            <span>:</span>
            <div
              class="ml-1"
              v-if="acquirer.shareMerchantWidthPartner"
            >{{ acquirer.shareMerchantWithPartner }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Share Partner</div>
            <span>:</span>
            <div class="ml-1" v-if="acquirer.sharePartner">{{ acquirer.sharePartner }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Direct Settlement</div>
            <span>:</span>
            <div class="ml-1" v-if="acquirer.directSettlement">{{ acquirer.directSettlement }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Gateway</div>
            <span>:</span>
            <div class="ml-1">{{ acquirer.gateway }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Hidden</div>
            <span>:</span>
            <div class="ml-1">{{ acquirer.hidden }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Merchant Id</div>
            <span>:</span>
            <div class="ml-1">{{ merchant.name }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Acquirer Config</div>
            <span>:</span>
            <div class="ml-1">{{ acquirer.acquirerConfigId }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Acquirer Type</div>
            <span>:</span>
            <div class="ml-1">{{ acquirer.acquirerTypeId }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Created At</div>
            <span>:</span>
            <div class="ml-1">{{ formatDate(acquirer.createdAt) }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Updated At</div>
            <span>:</span>
            <div class="ml-1">{{ formatDate(acquirer.updatedAt) }}</div>
          </v-layout>
        </v-flex>
      </v-card-text>
      <v-card-actions v-if="checkRoles(`adminMarketing`)">
        <v-spacer/>
        <v-btn color="yellow" @click="edit()">Edit</v-btn>
        <v-btn color="red" @click="archive()" dark>Archive</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import { timeFormat, exit, role } from "~/mixins";
import { mapGetters } from "vuex";

export default {
  props: {
    acquirer: {
      type: Object,
      default: () => ({})
    },
    merchant: {
      type: Object,
      default: () => ({})
    }
  },
  mixins: [timeFormat, exit, role],
  computed: {
    ...mapGetters(["loggedInUser"])
  },
  methods: {
    edit: function() {
      this.$emit("edit");
    }
  }
};
</script>

<style>
</style>
