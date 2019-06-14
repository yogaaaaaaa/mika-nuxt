<template>
  <div class="merchant-staff-table">
    <v-data-table :headers="merchantStaffHeader" :items="merchantStaff" item-key="name">
      <template slot="items" slot-scope="props">
        <td>
          <v-tooltip bottom>
            <v-btn
              slot="activator"
              round
              flat
              style="margin-left: -15px;"
              class="tbl"
              @click="toDetailMerchantStaff(props.item.id);"
            >{{ props.item.name }}</v-btn>
            <span>View detail</span>
          </v-tooltip>
        </td>
        <td>{{ props.item.idCardNumber }}</td>
        <td>{{ props.item.idCardType }}</td>
        <td>{{ props.item.phoneNumber }}</td>
        <td>{{ props.item.email }}</td>
        <td>{{ props.item.occupation }}</td>
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
    merchantStaff: {
      type: Array,
      required: true
    }
  },
  mixins: [toDetail, timeFormat],
  data() {
    return {
      merchantStaffHeader: [
        { text: "Name", value: "name", sortable: false },
        { text: "Id Card Number", value: "id_card_number", sortable: false },
        { text: "Id Card Type", value: "id_card_type", sortable: false },
        { text: "Phone Number", value: "phone_number", sortable: false },
        { text: "Email", value: "email", sortable: false },
        { text: "Occupation", value: "occupation", sortable: false },
        { text: "Created At", value: "created_at", sortable: true },
        { text: "Updated At", value: "updated_at", sortable: true }
      ]
    };
  }
};
</script>

<style>
</style>
