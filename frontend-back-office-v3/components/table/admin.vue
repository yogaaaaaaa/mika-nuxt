<template>
  <div class="admin">
    <v-data-table :headers="adminHeader" :items="admin" item-key="name">
      <template slot="items" slot-scope="props">
        <td>
          <v-tooltip bottom>
            <v-btn
              slot="activator"
              round
              flat
              style="margin-left: -15px;"
              class="tbl"
              @click="toDetailAdmin(props.item.id);"
            >{{ props.item.name }}</v-btn>
            <span>View detail</span>
          </v-tooltip>
        </td>
        <td>{{ props.item.user.username }}</td>
        <td>{{ props.item.email }}</td>
        <td>{{ props.item.role }}</td>
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
    admin: {
      type: Array,
      required: true
    }
  },
  mixins: [toDetail, timeFormat],
  data() {
    return {
      adminHeader: [
        { text: "Name", value: "name", sortable: false },
        { text: "Username", value: "username", sortable: false },
        { text: "Email", value: "email", sortable: false },
        { text: "Role", value: "role", sortable: false },
        { text: "Created At", value: "created_at", sortable: true },
        { text: "Updated At", value: "updated_at", sortable: true }
      ]
    };
  }
};
</script>

<style>
</style>
