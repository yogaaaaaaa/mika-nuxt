<template>
  <v-dialog v-model="show" width="500" persistent>
    <v-card class="pa-4">
      <v-card-text class="mt-3">
        <!-- Password for -->
        Kata sandi untuk
        <span class="font-weight-black">{{ user }}</span> adalah:
        <v-badge color="white">
          <template v-slot:badge>
            <v-icon
              v-clipboard:copy="password"
              v-clipboard:success="onCopy"
              v-clipboard:error="onError"
              color="blue"
            >file_copy</v-icon>
          </template>
          <span class="font-weight-black mr-1">{{ password }}</span>
        </v-badge>
      </v-card-text>
      <v-card-actions class="pa-0">
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1 text-lowercase" text @click="onClose">Tutup</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    user: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: false,
      default: '',
    },
    show: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  methods: {
    onClose() {
      this.$emit('onClose')
    },
    onCopy() {
      this.$emit('onCopy')
    },
    onError() {
      alert('Failed to copy password')
    },
  },
}
</script>

<style></style>
