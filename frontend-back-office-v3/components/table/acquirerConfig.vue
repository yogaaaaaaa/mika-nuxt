<template>
  <div id="acquirer-config-table" style="margin: 2em">
    <v-container text-xs-center v-if="loading">
      <v-flex>
        <v-progress-circular :size="60" color="blue" indeterminate/>
      </v-flex>
    </v-container>
    <div v-if="!loading">
      <v-data-table
        :headers="acquirerConfigHeader"
        :items="acquirerConfig"
        item-key="name"
        hide-actions
      >
        <template slot="items" slot-scope="props">
          <td>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                round
                flat
                style="margin-left: -15px;"
                class="tbl"
                @click="toDetailAcquirerConfig(props.item.id);"
              >{{ props.item.name }}</v-btn>
              <span>View detail</span>
            </v-tooltip>
          </td>
          <td>{{ props.item.handler }}</td>
          <td>{{ props.item.sandbox }}</td>
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
        <download :data="acquirerConfig" :filter="filter" v-if="totalPage > 1"/>
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
    acquirerConfig: {
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
    dowload: download
  },
  mixins: [toDetail, timeFormat],
  data() {
    return {
      acquirerConfigHeader: [
        { text: "Name", value: "name", sortable: false },
        { text: "Handler", value: "handler", sortable: false },
        { text: "Sandbox", value: "sandbox", sortable: false },
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
