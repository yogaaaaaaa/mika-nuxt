<template>
  <div id="table-terminals" style="margin:2em">
    <v-data-table :headers="terminalHeader" :items="terminals" item-key="name">
      <template slot="items" slot-scope="props">
        <td>{{ props.item.name }}</td>
        <td>{{ props.item.serial_number }}</td>
        <td>{{ props.item.imei }}</td>
        <td>{{ props.item.merchant_name }}</td>
        <td>{{ props.item.created_at }}</td>
        <td>{{ props.item.updated_at }}</td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  props: {
    terminals: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      terminalHeader: [
        { text: "Name", value: "name", sortable: false },
        { text: "Serial Number", value: "serial_number", sortable: true },
        { text: "Imei", value: "imei", sortable: true },
        { text: "Terminal Status", value: "terminal_status", sortable: false },
        { text: "Merchant Name", value: "merchant_name", sortable: false },
        { text: "Created At", value: "created_at", sortable: true },
        { text: "Updated At", value: "updated_at", sortable: true }
      ]
    };
  }
};
</script>

<style>
</style>
