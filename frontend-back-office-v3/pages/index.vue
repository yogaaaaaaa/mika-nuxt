<template>
  <div id="main" style="margin-top: 30px">
    <v-card class="pa-3">
      <div class="title font-weight-light text--blue">
        <v-icon color="blue">dashboard</v-icon>Dashboard
      </div>
    </v-card>
  </div>
</template>

<script>
export default {
  middleware: "auth"
};
</script>

<style scoped>
.main {
  padding: 2em;
}
</style>
