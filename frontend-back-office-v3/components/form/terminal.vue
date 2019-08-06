<template>
  <div class="terminal">
    <v-card>
      <v-card-title class="grey lighten-4 py-4 title blue--text">
        Create Terminal
        <v-spacer/>
        <v-icon @click="close">close</v-icon>
      </v-card-title>
      <v-form @submit.prevent="postTerminal" class="pa-3">
        <v-card-text>
          <v-text-field v-model="name" label="Name"/>
          <v-text-field v-model="terminal" label="Terminal"/>
          <v-text-field v-model="serialNumber" label="Serial Number"/>
          <v-text-field v-model="imei" label="Imei"/>
          <v-text-field v-model="terminalStatus" label="Terminal Status"/>
          <v-text-field v-model="terminalModelId" label="Terminal Model Id"/>
          <v-text-field v-model="terminalBatchId" label="Terminal Batch Id"/>
        </v-card-text>
        <v-btn type="submit">Submit</v-btn>
        <v-btn>Reset</v-btn>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import { exit } from "~/mixins";

export default {
  mixins: [exit],
  data() {
    return {
      name: "",
      terminal: "",
      description: "",
      serialNumber: "",
      imei: "",
      terminalStatus: "",
      terminalModelId: "",
      terminalBatchId: "",
      merchantId: ""
    };
  },
  methods: {
    async postTerminal() {
      await this.$validator.validateAll().then(() => {
        this.$axios
          .$post("/api/back_office/terminals", {
            name: this.name,
            terminal: this.terminal,
            description: this.description,
            serialNumber: this.serialNumber,
            imei: this.imei,
            terminalStatus: this.terminalStatus,
            terminalModelId: this.terminalModelId,
            terminalBatchId: this.terminalBatchId,
            merchantId: this.merchantId
          })
          .then(response => {
            alert(response.message);
            this.refresh();
            this.close();
          })
          .catch(error => {
            alert(error);
          });
      });
    }
  }
};
</script>

<style>
</style>
