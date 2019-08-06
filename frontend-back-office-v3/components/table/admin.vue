<template>
  <div class="admin">
    <v-container text-xs-center v-if="loading">
      <v-flex>
        <v-progress-circular :size="60" color="blue" indeterminate/>
      </v-flex>
    </v-container>
    <div v-if="!loading">
      <v-data-table :headers="adminHeader" :items="admin" item-key="name" hide-actions>
        <template slot="items" slot-scope="props">
          <td>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                round
                flat
                style="margin-left: -15px;"
                class="tbl"
                @click="toDetailAdmin(props.item.id);"
              >{{ props.item.name }}</v-btn>
              <span>View detail</span>
            </v-tooltip>
          </td>
          <td>{{ props.item.user.username }}</td>
          <td>{{ props.item.email }}</td>
          <td>
            <div v-for="role in props.item.user.userRoles" :key="role" chips>{{ role }}</div>
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
        <download :data="admin" :filter="filter" v-if="totalPage > 1"/>
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
    admin: {
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
      adminHeader: [
        { text: "Name", value: "name", sortable: false },
        { text: "Username", value: "username", sortable: false },
        { text: "Email", value: "email", sortable: false },
        { text: "Role", value: "role", sortable: false },
        { text: "Created At", value: "created_at", sortable: true },
        { text: "Updated At", value: "updated_at", sortable: true }
      ],
      page: 1
    };
  }
};
</script>

<style>
</style>
