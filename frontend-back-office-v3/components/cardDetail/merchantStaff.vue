<template>
  <div>
    <v-flex>
      <v-card class="pa-4">
        <v-card-text>
          <v-flex>
            <v-layout wrap class="mb-4">
              <h3>{{ staff.name }}</h3>
            </v-layout>
            <v-layout wrap>
              <div style="width: 35%">Id</div>
              <span>:</span>
              <div class="ml-1">{{ staff.id }}</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 35%">Name</div>
              <span>:</span>
              <div class="ml-1">{{ staff.name }}</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 35%">Id Card Number</div>
              <span>:</span>
              <div class="ml-1">{{ staff.idCardNumber }}</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 35%">Id Card Type</div>
              <span>:</span>
              <div class="ml-1">{{ staff.idCardType }}</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 35%">Email</div>
              <span>:</span>
              <div class="ml-1">{{ staff.email }}</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 35%">Occupation</div>
              <span>:</span>
              <div class="ml-1">{{ staff.occupation }}</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 35%">Street Address</div>
              <span>:</span>
              <div class="ml-1" v-if="staff.streetAddress">{{ staff.streetAddress }}</div>
              <div v-else class="ml-1">-</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 35%">Locacity</div>
              <span>:</span>
              <div class="ml-1" v-if="staff.locacity">{{ staff.locacity }}</div>
              <div v-else class="ml-1">-</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 35%">District</div>
              <span>:</span>
              <div class="ml-1" v-if="staff.district">{{ staff.district }}</div>
              <div class="ml-1" v-else>-</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 35%">City</div>
              <span>:</span>
              <div class="ml-1" v-if="staff.city">{{ staff.city }}</div>
              <div class="ml-1" v-else>-</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 35%">Province</div>
              <span>:</span>
              <div class="ml-1" v-if="staff.province">{{ staff.province }}</div>
              <div class="ml-1" v-else>-</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 35%">Postal Code</div>
              <span>:</span>
              <div class="ml-1" v-if="staff.postalCode">{{ staff.postalCode }}</div>
              <div class="ml-1" v-else>-</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 35%">Phone Number</div>
              <span>:</span>
              <div class="ml-1" v-if="staff.phoneNumber">{{ staff.phoneNumber }}</div>
              <div class="ml-1" v-else>-</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 35%">Username</div>
              <span>:</span>
              <div class="ml-1">{{ username }}</div>
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
              </div>
            </v-layout>
            <v-layout wrap style="margin-top: -12px">
              <div style="width: 35%">Created At</div>
              <span>:</span>
              <div class="ml-1">{{ formatDate(staff.createdAt) }}</div>
            </v-layout>
            <v-layout wrap>
              <div style="width: 35%">Updated At</div>
              <span>:</span>
              <div class="ml-1">{{ formatDate(staff.updatedAt) }}</div>
            </v-layout>
          </v-flex>
        </v-card-text>
        <v-card-actions v-if="checkRoles(`adminMarketing`)">
          <v-spacer/>
          <v-btn color="yellow" @click="edit()">Edit</v-btn>
          <v-btn color="red" @click="archive(merchant.name)" dark>Archive</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </div>
</template>

<script>
import { toDetail, timeFormat, exit, role } from "~/mixins";
import { mapGetters } from "vuex";

export default {
  props: {
    staff: {
      type: Object,
      default: () => ({})
    },
    username: {
      type: String,
      default: ""
    },
    merchant: {
      type: Object,
      default: () => ({})
    }
  },
  mixins: [toDetail, timeFormat, exit, role],
  computed: {
    ...mapGetters(["loggedInUser"])
  }
};
</script>

<style>
</style>
