<template>
  <div id="add-small-button">
    <v-tooltip left >
      <v-btn
        slot="activator"
        fab
        dark
        small
        color="blue darken-4"
        @click="dialog()"
        class="elevation-0"
      >
        <v-icon>add</v-icon>
      </v-btn>
      <span>{{ text }}</span>
    </v-tooltip>
  </div>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      required: true
    }
  },
  methods: {
    dialog: function() {
      this.$emit("dialog")
    }
  }
}
</script>

<style>
#add-small-button {
  position: absolute;
  bottom: 0;
  right: 10px;
  margin-bottom: 10px;
}
</style>
