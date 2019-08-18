<template>
  <div>
    <v-card class="pa-4">
      <v-card-text>
        <v-flex>
          <v-layout wrap>
            <div style="width: 35%">Name</div>
            <span>:</span>
            <div class="ml-1">{{ acquirerConfig.name }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Handler</div>
            <span>:</span>
            <div class="ml-1">{{ acquirerConfig.handler }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Sandbox</div>
            <span>:</span>
            <div class="ml-1">{{ acquirerConfig.sandbox }}</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Merchant Name</div>
            <span>:</span>
            <div class="ml-1" v-if="merchant.id">{{ merchant.name }}</div>
            <div class="ml-1" v-else>-</div>
          </v-layout>
          <v-layout wrap>
            <div style="width: 35%">Created At</div>
            <span>:</span>
            <div class="ml-1">{{ formatDate(acquirerConfig.createdAt) }}</div>
          </v-layout>
          <v-layout>
            <div style="width: 35%">Updated At</div>
            <span>:</span>
            <div class="ml-1">{{ formatDate(acquirerConfig.updatedAt) }}</div>
          </v-layout>
        </v-flex>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { timeFormat } from "~/mixins";

export default {
  props: {
    acquirerConfig: {
      type: Object,
      default: () => ({})
    },
    merchant: {
      type: Object,
      default: () => ({})
    }
  },
  mixins: [timeFormat]
};
</script>

<style>
</style>
