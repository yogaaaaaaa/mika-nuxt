<template>
  <div id="transaction-table" style="margin:2em">
    <v-data-table :headers="transactionHeader" :items="transactions" item-key="name">
      <template slot="items" slot-scope="props">
        <td>
          <v-tooltip bottom>
            <v-btn
              slot="activator"
              round
              flat
              style="margin-left: -15px;"
              class="tbl"
              @click="toDetailTransaction(props.item.id);"
            >{{ props.item.idAlias }}</v-btn>
            <span>View detail</span>
          </v-tooltip>
        </td>
        <td>{{ props.item.amount }}</td>
        <td>{{ props.item.status }}</td>
        <td>{{ props.item.settlementStatus }}</td>
        <td>{{ props.item.acquirer.name }}</td>
        <td>{{ props.item.acquirer.acquirerType.name }}</td>
        <td>{{ props.item.agent.name }}</td>
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
    transactions: {
      type: Array,
      required: true
    }
  },
  mixins: [toDetail, timeFormat],
  data() {
    return {
      transactionHeader: [
        { text: "Id Alias", value: "id_alias", sortable: true },
        { text: "Amount", value: "amount", sortable: true },
        { text: "Transaction Status", value: "status", sortable: false },
        {
          text: "Settlement Status",
          value: "settlementStatus",
          sortable: false
        },
        { text: "Acquirer Name", value: "acquirerName", sortable: false },
        {
          text: "Acquirer Type Name",
          value: "acquirerTypeName",
          sortable: false
        },
        { text: "Agent Id", value: "agentId", sortable: false },
        { text: "Created At", value: "created_at", sortable: true },
        { text: "Updated At", value: "updated_at", sortable: true }
      ]
    };
  }
};
</script>

<style>
</style>
