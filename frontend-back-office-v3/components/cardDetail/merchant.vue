<template>
  <div>
    <v-flex>
      <v-card class="pa-4">
        <v-card-text>
          <v-flex>
            <v-layout wrap class="mb-3">
              <h3>
                {{ merchant.name }}
                <v-divider/>
              </h3>
            </v-layout>
            <v-spacer/>
            <v-layout wrap>
              <div style="width: 33%">Id Alias</div>
              <span>:</span>
              <div class="ml-1">{{ merchant.idAlias }}</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 33%">Merchant Name</div>
              <span>:</span>
              <div class="ml-1">{{ merchant.name }}</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 33%">Short Name</div>
              <span>:</span>
              <div class="ml-1">{{ merchant.shortName }}</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 33%">Status</div>
              <span>:</span>
              <div class="ml-1" v-if="merchant.status">{{ merchant.status }}</div>
              <div class="ml-1" v-else>-</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 33%">Company Form</div>
              <span>:</span>
              <div class="ml-1" v-if="merchant.companyForm">{{ merchant.companyForm }}</div>
              <div class="ml-1" v-else>-</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 33%">Email</div>
              <span>:</span>
              <div class="ml-1" v-if="merchant.email">{{ merchant.email }}</div>
              <div class="ml-1" v-else>-</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 33%">Website</div>
              <span>:</span>
              <div class="ml-1" v-if="merchant.website">{{ merchant.website }}</div>
              <div class="ml-1" v-else>-</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 33%">Phone Number</div>
              <span>:</span>
              <div class="ml-1" v-if="merchant.phoneNumber">{{ merchant.phoneNumber }}</div>
              <div class="ml-1" v-else>-</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 33%">Bank Name</div>
              <span>:</span>
              <div class="ml-1" v-if="merchant.bankName">{{ merchant.bankName }}</div>
              <div class="ml-1" v-else>-</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 33%">Bank Account Name</div>
              <span>:</span>
              <div class="ml-1">{{ merchant.bankAccountName }}</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 33%">Bank Account Number</div>
              <span>:</span>
              <div class="ml-1">{{ merchant.bankAccountNumber }}</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 33%">Owner Name</div>
              <span>:</span>
              <div class="ml-1" v-if="merchant.ownerName">{{ merchant.ownerName }}</div>
              <div class="ml-1" v-else>-</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 33%">Owner Email</div>
              <span>:</span>
              <div class="ml-1" v-if="merchant.ownerEmail">{{ merchant.ownerEmail }}</div>
              <div class="ml-1" v-else>-</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 33%">Owner Occupation</div>
              <span>:</span>
              <div class="ml-1" v-if="merchant.ownerOccupation">{{ merchant.ownerOccupation }}</div>
              <div class="ml-1" v-else>-</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 33%">Owner Id Card Number</div>
              <span>:</span>
              <div class="ml-1" v-if="merchant.ownerIdCardNumber">{{ merchant.ownerIdCardNumber }}</div>
              <div class="ml-1" v-else>-</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 33%">Owner Id Card Type</div>
              <span>:</span>
              <div class="ml-1" v-if="merchant.ownerIdCardType">{{ merchant.ownerIdCardType }}</div>
              <div class="ml-1" v-else>-</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 33%">Partner</div>
              <span>:</span>
              <div class="ml-1" v-if="partner.id">{{ partner.id }}</div>
              <div class="ml-1" v-else>-</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 33%">Created At</div>
              <span>:</span>
              <div class="ml-1">{{ formatDate(merchant.createdAt) }}</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 33%">Updated At</div>
              <span>:</span>
              <div class="ml-1">{{ formatDate(merchant.updatedAt) }}</div>
            </v-layout>
          </v-flex>
        </v-card-text>
        <v-card-actions v-if="checkRoles(`adminMarketing`)">
          <v-spacer/>
          <v-btn color="yellow" @click="dialog()">Edit</v-btn>
          <v-btn color="red" @click="archive()" dark>Archive</v-btn>
        </v-card-actions>
        {{ merchant }}
      </v-card>
    </v-flex>
  </div>
</template>

<script>
import { timeFormat, exit, role } from "~/mixins";
import { mapGetters } from "vuex";

export default {
  props: {
    merchant: {
      type: Object,
      default: () => ({
        params: value
      })
    },
    partner: {
      type: Object,
      default: () => ({})
    }
  },
  mixins: [timeFormat, exit, role],
  computed: {
    ...mapGetters(["loggedInUser"])
  },
  methods: {
    dialog: function() {
      this.$emit("dialog");
    }
  }
};
</script>

<style>
</style>
