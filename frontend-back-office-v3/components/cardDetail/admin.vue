<template>
  <div id="detail-admin">
    <v-card>
      <v-card-text class="pa-4">
        <v-flex>
          <v-layout wrap>
            <div style="width: 35%">Name</div>
            <span>:</span>
            <div class="ml-1">{{ admin.name }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Email</div>
            <span>:</span>
            <div class="ml-1" v-if="admin.email">{{ admin.email }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Username</div>
            <span>:</span>
            <div class="ml-1">{{ user.username }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Roles</div>
            <span>:</span>
            <div class="ml-1" v-for="role in user.userRoles" :key="role">{{ role }},</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Created At</div>
            <span>:</span>
            <div class="ml-1">{{ formatDate(admin.createdAt) }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Updated At</div>
            <span>:</span>
            <div class="ml-1">{{ formatDate(admin.updatedAt) }}</div>
          </v-layout>
        </v-flex>
      </v-card-text>
      <v-card-actions v-if="checkRoles(`adminHead`)" class="pa-4">
        <v-spacer/>
        <v-btn color="yellow" @click="dialog()">Edit</v-btn>
        <v-btn color="red" @click="archive()" dark>Archive</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import { timeFormat, role, exit } from "~/mixins";
import { mapGetters } from "vuex";

export default {
  props: {
    admin: {
      type: Object,
      required: true
    },
    user: {
      type: Object,
      default: () => ({})
    },
    roles: {
      type: Array,
      default: () => []
    }
  },
  mixins: [timeFormat, role, exit],
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
