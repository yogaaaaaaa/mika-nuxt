<template>
  <div class="top-card">
    <v-card class="kanan blue--text">
      <v-card-title class="title font-weight-light">{{ title }}</v-card-title>
      <v-card-text class="display-1 font-weight-thin">
        <v-progress-circular :size="35" color="primary" indeterminate v-if="loading"/>
        <div v-if="!loading">
          <div v-if="!total">-</div>
          <div v-else>{{ total }}</div>
        </div>
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
    },
    loading: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      // loading: true
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
