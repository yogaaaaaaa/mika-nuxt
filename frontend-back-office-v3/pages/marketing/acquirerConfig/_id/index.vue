<template>
  <div id="acquirer-config-detail">
    <sub-title :text="'Detail Acquirer Config'" :icon="'settings_ethernet'" />
    <card-acquirer-config />
  </div>
</template>

<script>
import acquirerConfigcard from "~/components/card/acquirerConfig.vue";
import subTitle from "~/components/subtitle.vue";

export default {
  layout: "marketing-layout",
  components: {
    "card-acquirer-config": acquirerConfigcard,
    "sub-title": subTitle
  },
  data() {
    return {
      
    }
  }
}
</script>

<style>

</style>
