<template>
  <div id="terminal-proqurement-form">
    <v-card>
      <v-card-title class="grey lighten-4 py-4 title blue--text">
        Create Terminal Proqurement
        <v-spacer />
        <v-icon @click="close" >close</v-icon>
      </v-card-title>
      <v-form @submit.prevent="postTerminalProqurement" class="pa-3">
        <v-card-text>
          <v-text-field 
            v-model="name"
            label="Name"
          />
          <v-text-field 
            v-model="description"
            label="Description"
          />
          <v-text-field
            v-model="proqurementStatus"
            label="Proqurement Status"
          />
          <v-select
            :items="terminalModelName"
            item-text="name"
            item-value="id"
            v-model="terminalModelId"
            label="Terminal Model Name"
          />
          <v-text-field
            v-model="terminalCount"
            label="Terminal Count"
          />
          <v-select 
            :items="terminalDistributorName"
            item-text="name"
            item-value="id"
            v-model="terminalDistributorId"
            label="Terminal Distributor Name"
          />
          <v-select 
            :items="terminalBatchName"
            item-text="name"
            item-value="id"
            v-model="terminalBatchId"
            label="Terminal Batch Name"
          />
          <v-select
            :items="adminName"
            item-text="name"
            item-value="id"
            v-model="adminId"
            label="Admin Id"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn type="submit">Submit</v-btn>
          <v-btn>Reset</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import { exit } from "~/mixins"

export default {
  mixins: [exit],
  data() {
    return {
      name: "",
      description: "",
      proqurementStatus: "",
      terminalModelId: "",
      terminalModelName: [],
      terminalCount: "",
      terminalDistributorId: "",
      terminalDistributorName: [],
      terminalBatchId: "",
      terminalBatchName: [],
      adminId: "",
      adminName: [],
    }
  }
}
</script>

<style>

</style>
