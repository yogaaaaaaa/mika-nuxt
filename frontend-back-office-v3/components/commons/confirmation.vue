<template>
  <v-dialog v-model="show" persistent max-width="500">
    <v-card>
      <v-toolbar :color="color" dark flat>
        <v-icon>info</v-icon>
        <span class="title ml-3">{{ title }}</span>
        <v-spacer></v-spacer>
        <v-icon @click="close">close</v-icon>
      </v-toolbar>
      <v-divider/>
      <v-card-text class="mt-5">
        <span class="subtitle">{{ text || 'This action cannot be undo!' }}</span>
      </v-card-text>
      <v-divider/>
      <v-card-actions>
        <div class="flex-grow-1"/>
        <!-- <v-btn :color="confirmColor" text @click="close">Cancel</v-btn> -->
        <v-btn :color="color" @click="confirm">Ok</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: 'primary',
    },
  },
  methods: {
    close() {
      this.$emit('onClose')
    },
    confirm() {
      this.$emit('onConfirm')
    },
  },
}
</script>
