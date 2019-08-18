<template>
  <div id="breadcrumbs" class="mb-1">
    <v-breadcrumbs divider="/" class="pa-0">
      <v-breadcrumbs-item v-for="item in items" :key="item.text" :href="item.link">{{ item.text }}</v-breadcrumbs-item>
    </v-breadcrumbs>
    <v-spacer/>
  </div>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      required: true
    }
  }
};
</script>
