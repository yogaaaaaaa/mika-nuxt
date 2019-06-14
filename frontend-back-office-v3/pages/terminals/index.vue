<template>
  <div id="terminal-marketing">
    <main-title 
      :text="'List Terminals'"
      :icon="'system_update'"
      :show="false"
    />
    <v-card style="padding: 2em">
      <table-terminal :terminals="terminals" />
      <download :data="terminals" :filter="filterTerminal"/>
    </v-card>
    <button-add @dialog="form = !form" />
    <v-dialog v-model="form" width="700">
      <form-terminal @dialog="form = !form" />
    </v-dialog>
  </div>
</template>

<script>
import tableTerminal from "~/components/table/terminals.vue";
import download from "~/components/download.vue";
import addButton from "~/components/add.vue";
import terminalForm from "~/components/form/terminal.vue";
import mainTitle from "~/components/mainTitle.vue";
import { filterHeader } from "~/mixins"

export default {
  layout: "default-layout",
  components: {
    "table-terminal": tableTerminal,
    "download": download,
    "form-terminal": terminalForm,
    "button-add": addButton,
    "main-title": mainTitle
  },
  mixins: [filterHeader],
  data() {
    return {
      terminals: [
        {
          name: "",
          terminal: "",
          description: "",
          serialNumber: "",
          imei: "",
          terminalStatus: "",
          terminalModelId: "",
          terminalBatchId: "",
          merchantId: ""
        }
      ],
      form: false
    }
  },
  mounted() {
    this.getTerminals()
  },
  methods: {
    async getTerminals() {
      await this.$axios.$get(
        `/api/back_office/terminals`
      ).then( r => {
        this.terminals = r.data
      })
    }
  }
}
</script>

<style>

</style>
