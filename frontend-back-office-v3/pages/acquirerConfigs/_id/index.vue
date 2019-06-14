<template>
  <div id="acquirer-config-detail">
    <sub-title :text="'Detail Acquirer Config'" :icon="'settings_ethernet'"/>
    <card-acquirer-config :config="acquirerConfig"/>
  </div>
</template>

<script>
import acquirerConfigcard from "~/components/card/acquirerConfig.vue";
import subTitle from "~/components/subtitle.vue";

export default {
  layout: "default-layout",
  middleware: "auth",
  components: {
    "card-acquirer-config": acquirerConfigcard,
    "sub-title": subTitle
  },
  data() {
    return {
      acquirerConfig: {}
    };
  },
  mounted() {
    this.getAcquirerConfig();
  },
  methods: {
    async getAcquirerConfig() {
      await this.$axios
        .$get(`/api/back_office/merchant_staffs/${this.$route.params.id}`)
        .then(response => {
          this.acquirerConfig = response.data;
        })
        .catch(e => console.log(e));
    }
  }
};
</script>

<style>
</style>
