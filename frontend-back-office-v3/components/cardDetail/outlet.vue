<template>
  <div>
    <v-card class="pa-4">
      <v-card-text>
        <v-flex>
          <v-layout wrap class="mb-3">
            <h3>
              {{ outlet.name }}
              <v-divider/>
            </h3>
          </v-layout>
          <v-spacer/>
          <v-layout wrap>
            <div style="width: 35%">Outlet Name</div>
            <span>:</span>
            <div class="ml-1">{{ outlet.name }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Merchant Name</div>
            <span>:</span>
            <div class="ml-1" style="margin-top: -12px">
              <v-tooltip right>
                <v-btn
                  slot="activator"
                  round
                  flat
                  style="margin-left: -15px;"
                  class="tbl"
                  @click="toDetailMerchant(merchant.id);"
                >{{ merchant.name }}</v-btn>
                <span>View detail</span>
              </v-tooltip>
              <!-- <div v-if="merchant == undefined" style="margin-top: 12px">-</div> -->
              <!-- <div style="margin-top: 12px" v-else>{{ merchant.id }}</div> -->
            </div>
          </v-layout>
          <v-layout wrap style="margin-top: -12px">
            <div style="width: 35%">Status</div>
            <span>:</span>
            <div class="ml-1" v-if="outlet.status">{{ outlet.status }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout>
            <div style="width: 35%">Email</div>
            <span>:</span>
            <div class="ml-1" v-if="outlet.email">{{ outlet.email }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout>
            <div style="width: 35%">Website</div>
            <span>:</span>
            <div class="ml-1" v-if="outlet.website">{{ outlet.website }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout>
            <div style="width: 35%">Phone Number</div>
            <span>:</span>
            <div class="ml-1" v-if="outlet.phoneNumber">{{ outlet.phoneNumber }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout>
            <div style="width: 35%">Ownership Type</div>
            <span>:</span>
            <div class="ml-1" v-if="outlet.ownershipType">{{ outlet.ownershipType }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout>
            <div style="width: 35%">Rent Start Date</div>
            <span>:</span>
            <div class="ml-1" v-if="outlet.rentStartDate">{{ formatDate(outlet.rentStartDate) }}</div>
            <div class="ml-1" v-else>- {{outlet.rentStartDate}}</div>
          </v-layout>
          <v-layout>
            <div style="width: 35%">Rent Duration Month</div>
            <span>:</span>
            <div class="ml-1" v-if="outlet.rentDurationMonth">{{ outlet.rentDurationMonth }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout>
            <div style="width: 35%">Other Payment System</div>
            <span>:</span>
            <div class="ml-1" v-if="outlet.otherPaymentSystem">{{ outlet.otherPaymentSystem }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Created At</div>
            <span>:</span>
            <div class="ml-1">{{ formatDate(outlet.createdAt) }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Updated At</div>
            <span>:</span>
            <div class="ml-1">{{ formatDate(outlet.updatedAt) }}</div>
          </v-layout>
        </v-flex>
      </v-card-text>
      <v-card-actions v-if="checkRoles(`adminMarketing`)">
        <v-spacer/>
        <v-btn color="yellow" @click="edit()">Edit</v-btn>
        <v-btn color="red" @click="archive" dark>Archive</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import { toDetail, timeFormat, exit, role } from "~/mixins";
import { mapGetters } from "vuex";

export default {
  props: {
    outlet: {
      type: Object,
      default: () => ({})
    },
    merchant: {
      type: Object,
      default: () => ({})
    }
  },
  mixins: [toDetail, timeFormat, exit, role],
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
