<template>
  <div class="top-card">
    <v-card class="kanan blue--text">
      <v-card-title class="title font-weight-light">{{ title }}</v-card-title>
      <v-card-text class="display-1 font-weight-thin">
        <!-- <v-progress-circular :size="50" color="primary" indeterminate v-if="!total"/> -->
        <div v-if="!total">-</div>
        <div v-else>{{ total }}</div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  props: {
    total: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      loading: true
    };
  }
};
</script>

<style scoped>
.kanan {
  text-align: right;
  color: navy;
}
</style>
