<template>
  <dir>
    <sub-title :text="'List Acquirer Config'" :icon="'settings_ethernet'" />
    <v-card class="pa-4 mt-1">
      <table-acquirer-config :acquirerConfig="acquirerConfigs" />
      <download :data="acquirerConfigs" :filter="filterAcquirerConfig" />
    </v-card>
  </dir>
</template>

<script>
import acquirerConfigTable from "~/components/table/acquirerConfig.vue";
import subTitle from "~/components/subtitle.vue";
import download from "~/components/download.vue";
import addButton from "~/components/add.vue";
import { filterHeader } from "~/mixins";

export default {
  layout: "default-layout",
  components: {
    "table-acquirer-config": acquirerConfigTable,
    "sub-title": subTitle,
    "download": download,
    "button-add": addButton
  },
  mixins: [filterHeader],
  data() {
    return {
      acquirerConfigs: []
    }
  },
  mounted() {
    this.getAcquirerConfig()
  },
  methods: {
    async getAcquirerConfig() {
      await this.$axios.$get(
        `/api/back_office/acquirer_configs`
      ).then( response => {
        this.acquirerConfigs = response.data
        console.log(this.acquirerConfigs)
      }).catch( e => console.log(e))
    }
  }
}
</script>

<style>

</style>
