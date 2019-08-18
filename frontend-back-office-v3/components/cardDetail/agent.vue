<template>
  <div>
    <v-card class="pa-4">
      <v-card-text>
        <v-flex>
          <v-layout wrap>
            <div style="width: 35%">Id</div>
            <span>:</span>
            <div class="ml-1">{{ agent.id }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Name</div>
            <span>:</span>
            <div class="ml-1">{{ agent.name }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">General Location Long</div>
            <span>:</span>
            <div class="ml-1" v-if="agent.generalLocationLong">{{ agent.generalLocationLong }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">General Location Lat</div>
            <span>:</span>
            <div class="ml-1" v-if="agent.generalLocationLat">{{ agent.generalLocationLat }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Username</div>
            <span>:</span>
            <div class="ml-1">{{ username }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Outlet Name</div>
            <span>:</span>
            <div class="ml-1" style="margin-top: -12px">
              <v-tooltip right>
                <v-btn
                  slot="activator"
                  round
                  flat
                  style="margin-left: -15px;"
                  class="tbl"
                  @click="toDetailOutlet(outlet.id);"
                >{{ outlet.name }}</v-btn>
                <span>View detail</span>
              </v-tooltip>
            </div>
          </v-layout>
          <v-layout wrap style="margin-top: -12px">
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
            <div class="ml-1">{{ formatDate(agent.createdAt) }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Updated At</div>
            <span>:</span>
            <div class="ml-1">{{ formatDate(agent.updatedAt) }}</div>
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
import { toDetail, timeFormat, exit, role } from "~/mixins";
import { mapGetters } from "vuex";

export default {
  props: {
    agent: {
      type: Object,
      default: () => ({})
    },
    username: {
      type: String,
      default: ""
    },
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

<style scoped>
</style>
