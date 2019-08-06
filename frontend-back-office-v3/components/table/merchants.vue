<template>
  <div id="table-merchants" style="margin:2em">
    <v-container text-xs-center v-if="loading">
      <v-flex>
        <v-progress-circular :size="60" color="blue" indeterminate/>
      </v-flex>
    </v-container>
    <div v-if="!loading">
      <v-data-table :headers="merchantHeader" :items="merchants" item-key="name" hide-actions>
        <template slot="items" slot-scope="props">
          <td>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                round
                flat
                style="margin-left: -15px;"
                class="tbl"
                @click="toDetailMerchant(props.item.id);"
              >{{ props.item.name }}</v-btn>
              <span>View detail</span>
            </v-tooltip>
          </td>
          <td>{{ props.item.address }}</td>
          <td>{{ props.item.bankName }}</td>
          <td>{{ formatDate(props.item.createdAt) }}</td>
          <td>{{ formatDate(props.item.updatedAt) }}</td>
        </template>
      </v-data-table>
      <div class="text-xs-center pt-2" v-if="!loading">
        <v-pagination v-model="page" :length="totalPage" :total-visible="9" color="blue" dark/>
      </div>
      <v-layout class="mt-3">
        <download-all :filter="filter" :totalPage="totalPage" :api="api"/>
        <v-spacer/>
        <download :data="merchants" :filter="filter" v-if="totalPage > 1"/>
      </v-layout>
    </div>
  </div>
</template>

<script>
import { toDetail, timeFormat } from "~/mixins";
import downloadAll from "~/components/downloadAll.vue";
import { mapState } from "vuex";
import download from "~/components/download.vue";

export default {
  props: {
    merchants: {
      type: Array,
      required: true
    },
    totalPage: {
      type: Number,
      default: 0
    },
    filter: {
      type: Array,
      required: true
    },
    allMerchant: {
      type: Array,
      required: true
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
      merchantHeader: [
        { text: "Name", value: "name", sortable: false },
        { text: "Address", value: "address", sortable: false },
        { text: "Bank Name", value: "bankName", sortable: false },
        { text: "Created At", value: "createdAt", sortable: true },
        { text: "Updated At", value: "updatedAt", sortable: true }
      ],
      selected: [],
      page: 1
    };
  },
  computed: {
    ...mapState(["api"])
  }
};
</script>

<style>
</style>
