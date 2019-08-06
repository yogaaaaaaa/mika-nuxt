<template>
  <div>
    <v-container text-xs-center v-if="loading">
      <v-flex>
        <v-progress-circular :size="60" color="blue" indeterminate/>
      </v-flex>
    </v-container>
    <div v-if="!loading">
      <v-data-table
        :headers="acquirerTypeHeader"
        :items="acquirerType"
        item-key="name"
        hide-actions
      >
        <template slot="items" slot-scope="props">
          <td>{{ props.item.class }}</td>
          <td>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                round
                flat
                style="margin-left: -15px;"
                class="tbl"
                @click="toDetailAcquirerType(props.item.id);"
              >{{ props.item.name }}</v-btn>
              <span>View detail</span>
            </v-tooltip>
          </td>
          <td>
            <v-card :color="props.item.chartColor">
              <v-card-text/>
            </v-card>
          </td>
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
        <download :data="acquirerType" :filter="filter" v-if="totalPage > 1"/>
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
    acquirerType: {
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
      acquirerTypeHeader: [
        { text: "Class", value: "class", sortable: false },
        { text: "Name", value: "name", sortable: false },
        { text: "Chart Color", value: "chartColor", sortable: false },
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
