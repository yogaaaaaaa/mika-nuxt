<template>
  <div id="table-outlets" style="margin:2em">
    <v-data-table :headers="outletHeader" :items="outlets" item-key="name">
      <template slot="items" slot-scope="props">
        <td>
          <v-tooltip bottom>
            <v-btn
              slot="activator"
              round
              flat
              style="margin-left: -15px;"
              class="tbl"
              @click="toDetailOutlet(props.item.id);"
            >{{ props.item.name }}</v-btn>
            <span>View detail</span>
          </v-tooltip>
        </td>
        <td>{{ props.item.merchantId }}</td>
        <td>{{ props.item.email }}</td>
        <td>{{ props.item.website }}</td>
        <td>{{ props.item.streetAddress }}</td>
        <td>{{ props.item.businessDurationMonth }}</td>
        <td>{{ props.item.businessMonthlyTurnover }}</td>
        <td>{{ props.item.businessType }}</td>
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
    outlets: {
      type: Array,
      required: true
    }
  },
  mixins: [toDetail, timeFormat],
  data() {
    return {
      outletHeader: [
        { text: "Name", value: "name", sortable: false },
        { text: "Merchant Name", value: "merchantName", sortable: false },
        { text: "Email", value: "email", sortable: false },
        { text: "Website", value: "website", sortable: false },
        { text: "Address", value: "address", sortable: false },
        { text: "Duration Month", value: "durationMonth", sortable: false },
        { text: "Monthly Turnover", value: "turnover", sortable: true },
        { text: "Business Type", value: "businessType", sortable: false },
        { text: "Created At", value: "createdAt", sortable: true },
        { text: "Updated At", value: "updatedAt", sortable: true }
      ]
    };
  }
};
</script>

<style>
</style>
