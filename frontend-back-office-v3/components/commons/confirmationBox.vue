<template>
  <v-dialog v-model="confirmShow" persistent max-width="500">
    <v-card>
      <v-toolbar :color="confirmColor" dark flat>
        <v-icon>info</v-icon>
        <span class="title ml-3">{{ confirmTitle }}</span>
      </v-toolbar>
      <v-divider />
      <v-card-text class="mt-5">
        <span class="subtitle">{{
          confirmText || 'This action cannot be un done!'
        }}</span>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <div class="flex-grow-1" />
        <v-btn :color="confirmColor" text @click="close">Cancel</v-btn>
        <v-btn :color="confirmColor" @click="confirm">Ok</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['confirmShow', 'confirmTitle', 'confirmText', 'confirmColor']),
  },
  methods: {
    close() {
      this.$store.commit('confirmShow', false)
      this.$store.commit('confirmTitle', '')
      this.$store.commit('confirmText', '')
      this.$store.commit('confirmColor', 'primary')
    },
    confirm() {
      this.$store.commit('confirmShow', false)
      this.$emit('onConfirm')
    },
  },
}
</script>
