<template>
  <div id="table-agents" style="margin: 2em">
    <v-data-table :headers="agentHeader" :items="agents" item-key="name">
      <template slot="items" slot-scope="props">
        <td>
          <v-tooltip bottom>
            <v-btn
              slot="activator"
              round
              flat
              style="margin-left: -15px;"
              class="tbl"
              @click="toDetailAgent(props.item.id);"
            >{{ props.item.name }}</v-btn>
            <span>View detail</span>
          </v-tooltip>
        </td>
        <td>{{ props.item.user }}</td>
        <td>{{ props.item.outletId }}</td>
        <td>{{ formatDate(props.item.createdAt) }}</td>
        <td>{{ formatDate(props.item.updatedAt) }}</td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { timeFormat, toDetail } from "~/mixins";

export default {
  props: {
    agents: {
      type: Array,
      required: true
    }
  },
  mixins: [timeFormat, toDetail],
  data() {
    return {
      agentHeader: [
        { text: "Name", value: "name", sortable: false },
        { text: "Username", value: "username", sortable: false },
        { text: "Outlet Name", value: "outletName" },
        { text: "Created At", value: "createdAt", sortable: true },
        { text: "Updated At", value: "updatedAt", sortable: true }
      ]
    };
  }
};
</script>

<style>
</style>
