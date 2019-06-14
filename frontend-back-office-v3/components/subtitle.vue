<template>
  <div id="sub-title">
    <div class="headline font-weight-light blue--text mb-2 mt-4">
      <v-icon color="blue" medium>{{ icon }}</v-icon>
      {{ text }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      required: true
    },
    icon: {
      type: String
    }
  }
}
</script>

<style>

</style>
