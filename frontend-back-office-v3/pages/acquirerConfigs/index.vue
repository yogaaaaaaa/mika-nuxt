<template>
  <div>
    <sub-title :text="'List Acquirer Config'" :icon="'settings_ethernet'"/>
    <v-card class="pa-4 mt-1">
      <table-acquirer-config
        :acquirerConfig="acquirerConfigs"
        :filter="filterAcquirerConfig"
        :api="api"
        :totalPage="configPages"
        :loading="loadingAcquirerConfig"
      />
    </v-card>
    <button-add @dialog="formConfig = !formConfig"/>
    <v-dialog v-model="formConfig" width="700">
      <form-acquirer-config
        :merchants="merchants"
        @close="formConfig = false"
        @refresh="getAcquirerConfig()"
      />
    </v-dialog>
  </div>
</template>

<script>
import acquirerConfigTable from "~/components/table/acquirerConfig.vue";
import subTitle from "~/components/subtitle.vue";
import addButton from "~/components/add.vue";
import { filterHeader, fetchData } from "~/mixins";
import acquirerConfigForm from "~/components/form/acquirerConfig.vue";
import { mapState } from "vuex";

export default {
  layout: "default-layout",
  middleware: "auth",
  components: {
    "table-acquirer-config": acquirerConfigTable,
    "sub-title": subTitle,
    "button-add": addButton,
    "form-acquirer-config": acquirerConfigForm
  },
  mixins: [filterHeader, fetchData],
  data() {
    return {
      acquirerConfigs: [],
      formConfig: false,
      merchants: [],
      configPages: 1,
      loadingAcquirerConfig: true
    };
  },
  mounted() {
    this.getAcquirerConfig();
    this.getMerchants();
  },
  computed: {
    ...mapState(["api"])
  },
  methods: {
    async getAcquirerConfig() {
      await this.$axios
        .$get(`/api/back_office/acquirer_configs`)
        .then(response => {
          this.acquirerConfigs = response.data;
          this.loadingAcquirerConfig = false;
          this.$store.commit(
            "setApi",
            `/api/back_office/acquirer_configs?get_count=1&page=`
          );
        })
        .catch(e => console.log(e));
    }
  }
};
</script>

<style>
</style>
