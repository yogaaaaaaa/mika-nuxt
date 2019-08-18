<template>
  <div id="acquirer-table" style="margin:2em">
    <v-container text-xs-center v-if="loading">
      <v-flex>
        <v-progress-circular :size="60" color="blue" indeterminate/>
      </v-flex>
    </v-container>
    <div v-if="!loading">
      <v-data-table :headers="acquirerHeader" :items="acquirers" item-key="name" hide-actions>
        <template slot="items" slot-scope="props">
          <td>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                round
                flat
                style="margin-left: -15px;"
                class="tbl"
                @click="toDetailAcquirer(props.item.id);"
              >{{ props.item.name }}</v-btn>
              <span>View detail</span>
            </v-tooltip>
          </td>
          <td>{{ props.item.minimumAmount }}</td>
          <td>{{ props.item.maximumAmount }}</td>
          <td>{{ props.item.shareAcquirer }}</td>
          <td>{{ props.item.shareMerchant }}</td>
          <td>{{ props.item.shareMerchantPartner }}</td>
          <td>{{ props.item.sharePartner }}</td>
          <td>{{ props.item.acquirerType.name }}</td>
          <td>{{ formatDate(props.item.createdAt) }}</td>
          <td>{{ formatDate(props.item.updatedAt) }}</td>
        </template>
      </v-data-table>
      <div class="text-xs-center pt-2">
        <v-pagination v-model="page" :length="totalPage" :total-visible="9" color="blue" dark/>
      </div>
      <v-layout class="mt-3">
        <download-all :api="api" :totalPage="totalPage" :filter="filter"/>
        <v-spacer/>
        <download :data="acquirers" :filter="filter" v-if="totalPage > 1"/>
      </v-layout>
    </div>
  </div>
</template>

<script>
import downloadAll from "~/components/downloadAll.vue";
import { toDetail, timeFormat } from "~/mixins";
import download from "~/components/download.vue";

export default {
  props: {
    acquirers: {
      type: Array,
      required: true
    },
    api: {
      type: String,
      required: true
    },
    filter: {
      type: Array,
      required: true
    },
    totalPage: {
      type: Number,
      default: 1
    },
    loading: {
      type: Boolean,
      default: true
    }
  },
  components: {
    "download-all": downloadAll,
    download: download
  },
  mixins: [toDetail, timeFormat],
  data() {
    return {
      acquirerHeader: [
        { text: "Name", value: "name", sortable: false },
        { text: "Minimum Amount", value: "minimumAmount", sortable: true },
        { text: "Maximum Amount", value: "maximumAmount", sortable: true },
        { text: "Share Acquirer", value: "shareAcquirer", sortable: true },
        { text: "Share Merchant", value: "shareMerchant", sortable: true },
        {
          text: "Share Merchant with Partner",
          value: "shareMerchantPartner",
          sortable: true
        },
        { text: "Share Partner", value: "sharePartner", sortable: true },
        { text: "Acquirer Type", value: "acquirerType", sortable: false },
        { text: "Created At", value: "createdAt", sortable: true },
        { text: "Updated At", value: "updatedAt", sortable: true }
      ],
      page: 1
    };
  }
};
</script>

<style>
</style>
