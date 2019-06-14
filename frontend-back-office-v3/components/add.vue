<template>
  <div id="add-button">
    <v-tooltip left>
      <v-btn
        slot="activator"
        fab
        dark
        medium
        color="blue darken-4"
        @click="dialog()"
      >
        <v-icon>add</v-icon>
      </v-btn>
      <span>Add Merchant</span>
    </v-tooltip>
  </div>
</template>

<script>
export default {
  methods: {
    dialog: function() {
      this.$emit("dialog")
    }
  }
}
</script>

<style>
#add-button {
  position: fixed;
  bottom: 0;
  right: 10px;
  margin-bottom: 10px;
}
</style>
