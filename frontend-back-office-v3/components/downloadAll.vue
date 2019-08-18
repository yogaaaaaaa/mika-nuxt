<template>
  <div class="download-all">
    <v-btn color="blue lighten-2" @click="downloadAll();" dark class="elevation-5">
      <v-icon left dark>save_alt</v-icon>Download All as CSV
    </v-btn>
  </div>
</template>

<script>
import { toCSV } from "~/mixins";

export default {
  props: {
    filter: {
      type: Array,
      default: null
    },
    totalPage: {
      type: Number,
      default: 1
    },
    api: {
      type: String,
      default: ""
    }
  },
  mixins: [toCSV],
  data() {
    return {
      allData: []
    };
  },
  methods: {
    async downloadAll() {
      for (let i = 1; i <= this.totalPage; i++) {
        await this.$axios.$get(`${this.api}${i}`).then(r => {
          this.allData.push(r.data);
        });
      }
      this.toCSV(this.allData.flat());
    }
  }
};
</script>

<style>
</style>
