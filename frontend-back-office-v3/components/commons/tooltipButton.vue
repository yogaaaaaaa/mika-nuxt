<template>
  <v-tooltip top>
    <template v-slot:activator="{ on }">
      <v-btn
        color="primary"
        dark
        icon
        :disabled="disabled"
        v-on="on"
        @click="onClick"
      >
        <v-icon>{{ icon }}</v-icon>
      </v-btn>
    </template>
    <span>{{ tooltipText }}</span>
  </v-tooltip>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      required: true,
    },
    tooltipText: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  methods: {
    onClick() {
      this.$emit('onClick')
    },
  },
}
</script>

<style></style>
