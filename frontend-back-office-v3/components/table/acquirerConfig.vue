<template>
  <div id="acquirer-config-table" style="margin: 2em">
    <v-data-table :headers="acquirerConfigHeader" :items="acquirerConfig" item-key="name">
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
        <td>{{ props.item.merchantId }}</td>
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
    acquirerConfig: {
      type: Array,
      required: true
    }
  },
  mixins: [toDetail, timeFormat],
  data() {
    return {
      acquirerConfigHeader: [
        { text: "Name", value: "name", sortable: false },
        { text: "Handler", value: "handler", sortable: false },
        { text: "Sandbox", value: "sandbox", sortable: false },
        { text: "Merchant Name", value: "merchantName", sortable: false },
        { text: "Created At", value: "createdAt", sortable: true },
        { text: "Updated At", value: "updatedAt", sortable: true }
      ]
    };
  }
};
</script>

<style>
</style>
