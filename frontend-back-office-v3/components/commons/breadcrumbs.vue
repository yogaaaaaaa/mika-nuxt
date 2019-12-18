<template>
  <div class="breadcrumbs-wrapper">
    <v-breadcrumbs>
      <v-breadcrumbs-item
        v-for="crumb in crumbs"
        :key="crumb.text"
        :to="crumb.to"
        >{{ crumb.text }}</v-breadcrumbs-item
      >
    </v-breadcrumbs>
  </div>
</template>

<script>
export default {
  props: {
    crumbs: {
      type: Array,
      required: true,
    },
  },
}
</script>

<style lang="scss" scoped></style>
