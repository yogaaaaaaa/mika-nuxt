<template>
  <div id="partner-table">
    <v-container text-xs-center v-if="loading">
      <v-flex>
        <v-progress-circular :size="60" color="blue" indeterminate/>
      </v-flex>
    </v-container>
    <div v-if="!loading">
      <v-data-table :headers="partnerHeader" :items="partner" item-key="name" hide-actions>
        <template slot="item" slot-scope="props">
          <td>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                round
                flat
                style="margin-left: -15px;"
                class="tbl"
                @click="toDetailPartner(props.item.id);"
              >{{ props.item.name }}</v-btn>
              <span>View detail</span>
            </v-tooltip>
          </td>
          <td>{{ props.item.email }}</td>
          <td>{{ props.item.website }}</td>
          <td>{{ props.item.city }}</td>
          <td>{{ props.item.phoneNumber }}</td>
          <td>{{ props.item.bankName }}</td>
          <td>{{ props.item.bankBranchName }}</td>
          <td>{{ props.item.bankAccountName }}</td>
          <td>{{ formatDate(props.item.createdAt) }}</td>
          <td>{{ formatDate(props.item.updatedAt) }}</td>
        </template>
      </v-data-table>
      <div class="text-xs-center pt-2">
        <v-pagination v-model="page" :length="totalPage" :total-visible="9" color="blue" dark/>
      </div>
      <v-layout class="mt-3">
        <download-all :api="api" :filter="filterPartner" :totalPage="totalPage"/>
        <v-spacer/>
        <download :data="partner" :filter="filterPartner" v-if="totalPage > 1"/>
      </v-layout>
    </div>
  </div>
</template>

<script>
import { toDetail, timeFormat, filterHeader } from "~/mixins";
import download from "~/components/download.vue";
import downloadAll from "~/components/downloadAll.vue";

export default {
  props: {
    partner: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: true
    },
    api: {
      type: String,
      default: ""
    },
    totalPage: {
      type: Number,
      default: 0
    }
  },
  components: {
    download: download,
    "download-all": downloadAll
  },
  mixins: [toDetail, timeFormat, filterHeader],
  data() {
    return {
      partnerHeader: [
        { text: "Name", value: "name", sortable: false },
        { text: "Email", value: "email", sortable: false },
        { text: "Website", value: "website", sortable: false },
        { text: "City", value: "city", sortable: false },
        { text: "Phone Number", value: "phoneNumber" },
        { text: "Bank Name", value: "bankName", sortable: false },
        { text: "Bank Branch Name", value: "bankBranchName", sortable: false },
        {
          text: "Bank Account Name",
          value: "bankAccountName",
          sortable: false
        },
        { text: "Created At", value: "createdAt", sortable: true },
        { text: "Updated At", value: "updatedAt", sortable: true }
      ]
    };
  }
};
</script>

<style>
</style>
