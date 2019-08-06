<template>
  <div id="table-outlets" style="margin:2em">
    <v-container text-xs-center v-if="loading">
      <v-flex>
        <v-progress-circular :size="60" color="blue" indeterminate/>
      </v-flex>
    </v-container>
    <div v-if="!loading">
      <v-data-table :headers="outletHeader" :items="outlets" item-key="name" hide-actions>
        <template slot="items" slot-scope="props">
          <td>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                round
                flat
                style="margin-left: -15px;"
                class="tbl"
                @click="toDetailOutlet(props.item.id);"
              >{{ props.item.name }}</v-btn>
              <span>View detail</span>
            </v-tooltip>
          </td>
          <td>{{ props.item.merchantId }}</td>
          <td>{{ props.item.email }}</td>
          <td>{{ props.item.website }}</td>
          <td>{{ props.item.streetAddress }}</td>
          <td>{{ props.item.rentDurationMonth }}</td>
          <td>{{ props.item.businessMonthlyTurnover }}</td>
          <td>{{ props.item.businessType }}</td>
          <td>{{ formatDate(props.item.createdAt) }}</td>
          <td>{{ formatDate(props.item.updatedAt) }}</td>
        </template>
      </v-data-table>
      <div class="text-xs-center pt-2">
        <v-pagination v-model="page" :length="totalPage" :total-visible="9" color="blue" dark/>
      </div>
      <v-layout class="mt-3">
        <download-all :api="api" :filter="filter" :totalPage="totalPage"/>
        <v-spacer/>
        <download :data="outlets" :filter="filter" v-if="totalPage > 1"/>
      </v-layout>
    </div>
  </div>
</template>

<script>
import { toDetail, timeFormat } from "~/mixins";
import downloadAll from "~/components/downloadAll.vue";
import download from "~/components/download.vue";

export default {
  props: {
    outlets: {
      type: Array,
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
    api: {
      type: String,
      default: ""
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
      outletHeader: [
        { text: "Name", value: "name", sortable: false },
        { text: "Merchant Name", value: "merchantName", sortable: false },
        { text: "Email", value: "email", sortable: false },
        { text: "Website", value: "website", sortable: false },
        { text: "Address", value: "address", sortable: false },
        { text: "Duration Month", value: "durationMonth", sortable: false },
        { text: "Monthly Turnover", value: "turnover", sortable: true },
        { text: "Business Type", value: "businessType", sortable: false },
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
