<template>
  <div id="acquirer-Type-table">
    <v-data-table :headers="acquirerTypeHeader" :items="acquirerType" item-key="name">
      <template slot="item" slot-scope="props">
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
        <td>{{ props.item.chartColor }}</td>
        <td>{{ formatDate(props.item.createdAt) }}</td>
        <td>{{ formatDate(props.item.updatedAt) }}</td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { toDetail, timeFormat } from "~/mixins";

export default {
  props: {
    acquirerType: {
      type: Array,
      required: true
    }
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
      ]
    };
  }
};
</script>

<style>
</style>
