<template>
  <div>
    <v-flex sm7 xs12>
      <v-card class="pa-4">
        <v-flex>
          <v-layout wrap class="mb-3">
            <div style="width: 35%">Name</div>
            <span>:</span>
            <div class="ml-1">{{ acquirerType.name }}</div>
          </v-layout>
          <v-layout wrap v-if="acquirerType.description">
            <div style="width: 35%">Description</div>
            <span>:</span>
            <div class="ml-1">{{ acquirerType.description }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%" class="mt-1">Color Chart</div>
            <span class="mt-1">:</span>
            <v-card :color="acquirerType.chartColor" class="ml-1 mb-1" style="width: 15%;">
              <v-card-text/>
            </v-card>
            <div class="ml-2 mt-1">{{ acquirerType.chartColor }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Class</div>
            <span>:</span>
            <div class="ml-1">{{ acquirerType.class }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Created At</div>
            <span>:</span>
            <div class="ml-1">{{ formatDate(acquirerType.createdAt) }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Updated At</div>
            <span>:</span>
            <div class="ml-1">{{ formatDate(acquirerType.updatedAt) }}</div>
          </v-layout>
        </v-flex>
        <v-card-actions v-if="checkRoles(`adminMarketing`)">
          <v-spacer/>
          <v-btn @click="edit" color="yellow">Edit</v-btn>
          <v-btn color="red" @click="archive()" dark>Archive</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </div>
</template>

<script>
import { timeFormat, exit, role } from "~/mixins";
import { mapGetters } from "vuex";

export default {
  props: {
    acquirerType: {
      type: Object,
      default: () => ({
        params: value
      })
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
