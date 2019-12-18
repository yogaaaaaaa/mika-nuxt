<template>
  <div class="page-title">
    <v-icon class="mr-2">{{ icon }}</v-icon>
    <h3 class="title">{{ title }}</h3>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.page-title {
  display: flex;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 20px;
}
</style>
