<template>
  <div>
    <sub-title :text="'List Terminal'" :icon="'system_update'" />
    <v-card class="pa-3 mt-1">
      <table-terminal :terminals="terminals" />
      <download :data="terminals" :filter="filterTerminal" />
    </v-card>
  </div>
</template>

<script>
import subTitle from "~/components/subtitle.vue";
import terminalTable from "~/components/table/terminals.vue";
import download from "~/components/download.vue";
import { filterHeader } from "~/mixins"

export default {
  props: {
    terminals: {
      type: Array,
      required: true
    }
  },
  components: {
    "sub-title": subTitle,
    "table-terminal": terminalTable,
    "download": download,
  },
  mixins: [filterHeader]
}
</script>

<style>

</style>
