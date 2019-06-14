<template>
  <div id="acquirer-table" style="margin:2em">
    <v-data-table :headers="acquirerHeader" :items="acquirers" item-key="name">
      <template slot="items" slot-scope="props">
        <td>
          <v-tooltip bottom>
            <v-btn
              slot="activator"
              round
              flat
              style="margin-left: -15px;"
              class="tbl"
              @click="toDetailAcquirer(props.item.id);"
            >{{ props.item.name }}</v-btn>
            <span>View detail</span>
          </v-tooltip>
        </td>
        <td>{{ props.item.minimumAmount }}</td>
        <td>{{ props.item.maximumAmount }}</td>
        <td>{{ props.item.shareAcquirer }}</td>
        <td>{{ props.item.shareMerchant }}</td>
        <td>{{ props.item.shareMerchantPartner }}</td>
        <td>{{ props.item.sharePartner }}</td>
        <td>{{ props.item.merchantId }}</td>
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
    acquirers: {
      type: Array,
      required: true
    }
  },
  mixins: [toDetail, timeFormat],
  data() {
    return {
      acquirerHeader: [
        { text: "Name", value: "name", sortable: false },
        { text: "Minimum Amount", value: "minimumAmount", sortable: true },
        { text: "Maximum Amount", value: "maximumAmount", sortable: true },
        { text: "Share Acquirer", value: "shareAcquirer", sortable: true },
        { text: "Share Merchant", value: "shareMerchant", sortable: true },
        {
          text: "Share Merchant with Partner",
          value: "shareMerchantPartner",
          sortable: true
        },
        { text: "Share Partner", value: "sharePartner", sortable: true },
        { text: "Merchant Name", value: "merchantName", sortable: false },
        { text: "Created At", value: "createdAt", sortable: true },
        { text: "Updated At", value: "updatedAt", sortable: true }
      ]
    };
  }
};
</script>

<style>
</style>
