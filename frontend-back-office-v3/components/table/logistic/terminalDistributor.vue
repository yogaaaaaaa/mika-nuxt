<template>
  <div id="terminal-distributor-table">
    <v-data-table
      :headers="distributorHeader"
      :items="distributor"
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
              @click="toDetailTerminalDistributor(props.item.id);"
            >
              {{ props.item.name }}
            </v-btn>
            <span>View detail</span>
          </v-tooltip>
        </td>
        <td>{{ props.item.address }}</td>
        <td>{{ props.item.email }}</td>
        <td>{{ props.item.phoneNumber }}</td>
        <td>{{ formatDate(props.item.createdAt) }}</td>
        <td>{{ formatDate(props.item.updatedAt) }}</td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { toDetail, timeFormat} from "~/mixins"

export default {
  props: {
    distributor: {
      type: Array,
      required: true
    }
  },
  mixins: [toDetail, timeFormat],
  data() {
    return {
      distributorHeader: [
        { text: "Name", value: "name" },
        { text: "Address", value: "address" },
        { text: "Email", value: "email" },
        { text: "Phone Number", value: "phoneNumber" },
        { text: "Created At", value: "createdAt" },
        { text: "Updated At", value: "updatedAt" }
      ]
    }
  }
}
</script>

<style>

</style>
