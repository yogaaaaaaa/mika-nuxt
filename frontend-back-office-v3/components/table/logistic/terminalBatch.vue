<template>
  <div id="terminal-batch-table">
    <v-data-table
      :headers="terminalBatchHeader"
      :items="batch"
      item-key="name"
    >
      <template slot="item" slot-scope="props">
        <td>
          <v-tooltip bottom>
            <v-btn
              slot="activator"
              round
              flat
              style="margin-left: -15px;"
              class="tbl"
              @click="toDetailTerminalBatch(props.item.id);"
            >
              {{ props.item.name }}
            </v-btn>
            <span>View detail</span>
          </v-tooltip>
        </td>
        <td>{{ formatDate(props.item.dateArrived) }}</td>
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
    batch: {
      type: Array,
      required: true
    }
  },
  mixins: [toDetail, timeFormat],
  data() {
    return {
      terminalBatchHeader: [
        { text: "Name", value: "name" },
        { text: "Batch Status", value: "batchStatus" },
        { text: "Date Arrived", value: "dateArrived" },
        { text: "Created At", value: "createdAt" },
        { text: "Updated At", value: "updatedAt" }
      ]
    }
  }
}
</script>

<style>

</style>
