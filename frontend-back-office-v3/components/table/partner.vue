<template>
  <div id="partner-table">
    <v-data-table :headers="partnerHeader" :items="partner" item-key="name">
      <template slot="item" slot-scope="props">
        <td>
          <v-tooltip bottom>
            <v-btn
              slot="activator"
              round
              flat
              style="margin-left: -15px;"
              class="tbl"
              @click="toDetailPartner(props.item.id);"
            >{{ props.item.name }}</v-btn>
            <span>View detail</span>
          </v-tooltip>
        </td>
        <td>{{ props.item.email }}</td>
        <td>{{ props.item.website }}</td>
        <td>{{ props.item.city }}</td>
        <td>{{ props.item.phoneNumber }}</td>
        <td>{{ props.item.bankName }}</td>
        <td>{{ props.item.bankBranchName }}</td>
        <td>{{ props.item.bankAccountName }}</td>
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
    partner: {
      type: Array,
      required: true
    }
  },
  mixins: [toDetail, timeFormat],
  data() {
    return {
      partnerHeader: [
        { text: "Name", value: "name", sortable: false },
        { text: "Email", value: "email", sortable: false },
        { text: "Website", value: "website", sortable: false },
        { text: "City", value: "city", sortable: false },
        { text: "Phone Number", value: "phoneNumber" },
        { text: "Bank Name", value: "bankName", sortable: false },
        { text: "Bank Branch Name", value: "bankBranchName", sortable: false },
        {
          text: "Bank Account Name",
          value: "bankAccountName",
          sortable: false
        },
        { text: "Created At", value: "createdAt", sortable: true },
        { text: "Updated At", value: "updatedAt", sortable: true }
      ]
    };
  }
};
</script>

<style>
</style>
