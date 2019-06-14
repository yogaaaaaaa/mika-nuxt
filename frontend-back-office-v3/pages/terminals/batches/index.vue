<template>
  <div id="list-terminal-batch">
    <sub-title :text="'List Terminal Batch'" :icon="'system_update'" />
    <v-card class="pa-4">
      <table-terminal-batch :batch="terminalBatch" />
      <download :data="terminalBatch" :filter="filterTerminalBatch" />
    </v-card>
  </div>
</template>

<script>
import subTitle from "~/components/subtitle.vue";
import terminalBatchTable from "~/components/table/logistic/terminalBatch.vue";
import download from "~/components/download.vue";
import { filterHeader } from "~/mixins";

export default {
  layout: "default-layout",
  components: {
    "sub-title":subTitle,
    "table-terminal-batch": terminalBatchTable,
    "download": download
  },
  mixins: [filterHeader],
  data() {
    return {
      terminalBatch: []
    }
  },
  mounted() {

  },
  methods: {
    async getTerminalBatches() {
      await this.$axios.$get(
        `/api/back_office/terminal_batches`
      ).then( response => {
        this.terminalBatchTable = response.data
      }).catch( e => console.log(e) )
    }
  }
}
</script>

<style>

</style>
