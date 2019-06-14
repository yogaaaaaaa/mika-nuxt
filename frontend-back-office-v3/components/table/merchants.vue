<template>
  <div id="table-merchants" style="margin:2em">
    <v-data-table :headers="merchantHeader" :items="merchants" item-key="name">
      <template slot="items" slot-scope="props">
        <td>
          <v-tooltip bottom>
            <v-btn
              slot="activator"
              round
              flat
              style="margin-left: -15px;"
              class="tbl"
              @click="toDetailMerchant(props.item.id);"
            >{{ props.item.name }}</v-btn>
            <span>View detail</span>
          </v-tooltip>
        </td>
        <td>{{ props.item.email }}</td>
        <td>{{ props.item.address }}</td>
        <td>{{ props.item.ownerName }}</td>
        <td>{{ props.item.bankName }}</td>
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
    merchants: {
      type: Array,
      required: true
    }
  },
  mixins: [toDetail, timeFormat],
  data() {
    return {
      merchantHeader: [
        { text: "Name", value: "name", sortable: false },
        { text: "Email", value: "email", sortable: false },
        { text: "Address", value: "address", sortable: false },
        { text: "Owner Name", value: "ownerName", sortable: false },
        { text: "Bank Name", value: "bankName", sortable: false },
        { text: "Created At", value: "createdAt", sortable: true },
        { text: "Updated At", value: "updatedAt", sortable: true }
      ],
      selected: []
    };
  }
};
</script>

<style>
</style>
