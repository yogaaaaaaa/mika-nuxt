<template>
  <div id="acquirer-config-detail">
    <sub-title :text="'Detail Acquirer Config'" :icon="'settings_ethernet'"/>
    <v-container text-xs-center v-if="loadingAcquirerConfig">
      <v-flex>
        <v-progress-circular :size="60" color="blue" indeterminate/>
      </v-flex>
    </v-container>
    <detail-acquirer-config
      :acquirerConfig="acquirerConfig"
      :merchant="merchant"
      v-if="!loadingAcquirerConfig"
    />
    <!-- <card-acquirer-config :config="acquirerConfig"/> -->
  </div>
</template>

<script>
import acquirerConfigcard from "~/components/card/acquirerConfig.vue";
import subTitle from "~/components/subtitle.vue";
import acquirerDetail from "~/components/cardDetail/acquirerConfig.vue";
import { fetchSingleData } from "~/mixins";

export default {
  layout: "default-layout",
  middleware: "auth",
  components: {
    "card-acquirer-config": acquirerConfigcard,
    "sub-title": subTitle,
    "detail-acquirer-config": acquirerDetail
  },
  mixins: [fetchSingleData],
  data() {
    return {
      acquirerConfig: {},
      loadingAcquirerConfig: true
    };
  },
  mounted() {
    this.getAcquirerConfig();
  },
  methods: {
    async getAcquirerConfig() {
      await this.$axios
        .$get(`/api/back_office/acquirer_configs/${this.$route.params.id}`)
        .then(response => {
          this.acquirerConfig = response.data;
          if (this.acquirerConfig.merchantId) {
            this.getMerchant(this.acquirerConfig.merchantId);
          }
          this.loadingAcquirerConfig = false;
        })
        .catch(e => console.log(e));
    }
  }
};
</script>

<style>
</style>
