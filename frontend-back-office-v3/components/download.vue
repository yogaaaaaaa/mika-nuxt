<template>
  <div id="download">
    <v-btn color="yellow" @click="toCSV(data);">
      <v-icon left dark> save_alt </v-icon>
      Download CSV
    </v-btn>
  </div>
</template>

<script>
import { toCSV } from "~/mixins";

export default {
  mixins: [toCSV],
  props: {
    data: {
      type: Array,
      required: true
    },
    filter: {
      type: Array,
      default: null
    }
  }
};
</script>
