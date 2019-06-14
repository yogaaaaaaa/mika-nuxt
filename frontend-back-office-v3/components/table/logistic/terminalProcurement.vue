<template>
  <div id="terminal-proqurement-table">
    <v-data-table
      :headers="terminalProqurementHeader"
      :items="terminalProqurement"
      item-key="name"
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
              @click="toDetailTerminalProqurement(props.item.id);"
            >
              {{ props.item.name }}
            </v-btn>
            <span>View detail</span>
          </v-tooltip>
        </td>
        <td>{{ props.item.proqurementStatus }}</td>
        <td>{{ props.item.terminalModelName }}</td>
        <td>{{ props.item.terminalCount }}</td>
        <td>{{ props.item.terminalDistributorName }}</td>
        <td>{{ props.item.terminalBatchName }}</td>
        <td>{{ props.item.adminName }}</td>
        <td>{{ formatDate(props.item.createdAt) }}</td>
        <td>{{ formatDate(props.item.updatedAt) }}</td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { toDetail, timeFormat } from "~/mixins"
export default {
  props: {
    terminalProqurement: {
      type: Array,
      required: true
    }
  },
  mixins: [toDetail, timeFormat],
  data() {
    return {
      terminalProqurementHeader: [
        { text: "Name", value: "name" },
        { text: "Proqurement Status", value: "proqurementStatus" },
        { text: "Terminal Model Name", value: "terminalModelName" },
        { text: "Terminal Count", value: "terminalCount" },
        { text: "Terminal Distributor Name", value: "terminalDistributorName" },
        { text: "Terminal Batch Name", value: "terminalBatchName" },
        { text: "Admin Name", value: "adminName" },
        { text: "Created At", value: "createdAt" },
        { text: "Updated At", value: "Updated At" }
      ]
    }
  }
}
</script>

<style>

</style>
