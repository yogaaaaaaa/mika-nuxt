<template>
  <v-dialog v-model="confirmShow" persistent max-width="500">
    <v-card>
      <v-toolbar :color="confirmColor" dark flat>
        <v-icon>info</v-icon>
        <span class="title ml-3">{{ confirmTitle }}</span>
        <v-spacer></v-spacer>
        <v-icon @click="close">close</v-icon>
      </v-toolbar>
      <v-divider/>
      <v-card-text class="mt-5">
        <span class="subtitle">{{ confirmText || 'This action cannot be undo!' }}</span>
      </v-card-text>
      <v-divider/>
      <v-card-actions>
        <div class="flex-grow-1"/>
        <!-- <v-btn :color="confirmColor" text @click="close">Cancel</v-btn> -->
        <v-btn :color="confirmColor" @click="confirm">Ok</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    confirmShow: {
      type: Boolean,
      default: false,
    },
    confirmTitle: {
      type: String,
      default: '',
    },
    confirmText: {
      type: String,
      default: '',
    },
    confirmColor: {
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
