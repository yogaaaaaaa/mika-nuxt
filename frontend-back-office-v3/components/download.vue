<template>
  <div id="download">
    <v-btn @click="toCSV(data);" class="blue--text elevation-5">
      <v-icon left dark>save_alt</v-icon>Download per Page as CSV
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
