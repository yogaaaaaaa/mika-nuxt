<template>
  <div id="terminal-model-table">
    <v-data-table
      :headers="terminalModelHeader"
      :items="models"
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
              @click="toDetailTerminalModel(props.item.id);"
            >
              {{ props.item.name }}
            </v-btn>
            <span>View detail</span>
          </v-tooltip>
        </td>
        <td>{{ props.item.manufacturer }}</td>
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
    models: {
      type: Array,
      required: true
    }
  },
  mixins: [toDetail, timeFormat],
  data() {
    return {
      terminalModelHeader: [
        { text: "Name", value: "name" },
        { text: "Manufacturer", value: "manufacturer" },
        { text: "Created At", value: "createdAt" },
        { text: "Updated At", value: "updatedAt" }
      ]
    }
  }
}
</script>

<style>

</style>
