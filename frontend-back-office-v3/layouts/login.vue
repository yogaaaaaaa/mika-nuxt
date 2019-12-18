<template>
  <v-app id="inspire">
    <v-content>
      <nuxt />
      <snackbar />
    </v-content>
  </v-app>
</template>

<script>
import snackbar from '~/components/commons/snackbar.vue'

export default {
  components: {
    snackbar: snackbar,
  },
}
</script>
