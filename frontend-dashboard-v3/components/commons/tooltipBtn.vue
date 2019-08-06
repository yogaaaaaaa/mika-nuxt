<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on }">
      <v-btn color="primary" v-on="on" dark>
        <span v-if="title !== ''">{{ title }}</span>
        <v-icon v-if="icon !== ''">{{ icon }}</v-icon>
      </v-btn>
    </template>
    <span>{{ tooltipText }}</span>
  </v-tooltip>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: false,
      default: ""
    },
    icon: {
      type: String,
      required: false,
      default: ""
    },
    tooltipText: {
      type: String,
      required: false,
      default: ""
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
