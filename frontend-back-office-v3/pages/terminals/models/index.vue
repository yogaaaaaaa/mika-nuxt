<template>
  <div id="terminal-model">
    <sub-title :text="'List Terminal Model'" :icon="'system_update'" />
    <v-card class="pa-4">
      <table-model-terminal :models="terminalModels" />
      <download :data="terminalModels" />
    </v-card>
  </div>
</template>

<script>
import terminalModelTable from "~/components/table/logistic/terminalModel.vue";
import subTitle from "~/components/subtitle.vue";
import download from "~/components/download.vue";
import { filterHeader } from "~/mixins"

export default {
  layout: "default-layout",
  components: {
    "table-model-terminal": terminalModelTable,
    "sub-title": subTitle,
    "download": download
  },
  mixins: [filterHeader],
  data() {
    return {
      terminalModels: []
    }
  },
  mounted() {
    this.getTerminalModels();
  },
  methods: {
    async getTerminalModels() {
      await this.$axios.$get(
        `/api/back_office/terminal_models`
      ).then( response => {
        this.terminalModels = response.data
      }).catch( e => console.log(e) )
    }
  }
}
</script>

<style>

</style>
