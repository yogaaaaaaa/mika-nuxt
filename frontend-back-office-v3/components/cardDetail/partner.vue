<template>
  <div class="partner-detail">
    <v-card>
      <v-card-title></v-card-title>
      <v-card-text>
        <v-flex>
          <v-layout wrap>
            <div style="width: 35%">Id</div>
            <span>:</span>
            <div class="ml-1">{{ partner.id }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Name</div>
            <span>:</span>
            <div class="ml-1">{{ partner.name }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Email</div>
            <span>:</span>
            <div class="ml-1">{{ partner.email }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Website</div>
            <span>:</span>
            <div class="ml-1">{{ partner.website }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Street Address</div>
            <span>:</span>
            <div class="ml-1">{{ partner.streetAddress }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Locality</div>
            <span>:</span>
            <div class="ml-1">{{ partner.locality }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">District</div>
            <span>:</span>
            <div class="ml-1">{{ partner.district }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">City</div>
            <span>:</span>
            <div class="ml-1">{{ partner.city }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Province</div>
            <span>:</span>
            <div class="ml-1">{{ partner.province }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Postal Code</div>
            <span>:</span>
            <div class="ml-1">{{ partner.postalCode }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Phone Number</div>
            <span>:</span>
            <div class="ml-1">{{ partner.phoneNumber }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Bank Name</div>
            <span>:</span>
            <div class="ml-1">{{ partner.bankName }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Bank Branch Name</div>
            <span>:</span>
            <div class="ml-1">{{ partner.bankBranchName }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Bank Account Name</div>
            <span>:</span>
            <div class="ml-1">{{ partner.bankAccountName }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Bank Account Number</div>
            <span>:</span>
            <div class="ml-1">{{ partner.bankAccountNumber }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Created At</div>
            <span>:</span>
            <div class="ml-1">{{ partner.createdAt }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Updated At</div>
            <span>:</span>
            <div class="ml-1">{{ partner.updatedAt }}</div>
          </v-layout>
        </v-flex>
      </v-card-text>
      <v-text-actions>
        <v-spacer/>
        <v-btn @click="edit()" color="yellow">Edit</v-btn>
      </v-text-actions>
    </v-card>
  </div>
</template>

<script>
import { exit } from "~/mixins";

export default {
  props: {
    partner: {
      type: Object,
      default: () => ({})
    }
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
