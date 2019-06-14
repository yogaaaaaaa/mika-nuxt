<template>
  <div id="table-courier">
    <v-data-table 
      :headers="courierHeader"
      :items="courier"
      :item-key="name"
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
              @click="toDetailCourier(props.item.id);"
            >
              {{ props.item.name }}
            </v-btn>
            <span>View detail</span>
          </v-tooltip>
        </td>
        <td>{{ props.item.description }}</td>
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
    courier: {
      type: String,
      required: true
    }
  },
  mixins: [toDetail, timeFormat],
  data() {
    return {
      courierHeader: []
    }
  },
  methods: {

  }
}
</script>

<style>

</style>
