<template>
  <div id="acquirer">
    <main-title :text="'List Acquirer'" :icon="'device_hub'" :show="false"/>
    <v-card class="pa-4">
      <table-acquirer
        :acquirers="acquirers"
        :api="api"
        :filter="filterAcquirer"
        :totalPage="totalPage"
        :loading="loadingAcquirer"
      />
    </v-card>
    <button-add @dialog="form = !form"/>
    <v-dialog v-model="form" width="700">
      <form-acquirer
        @close="form = false"
        @refresh="getAcquirers()"
        :aConfig="acquirerConfigs"
        :acquirerType="acquirerTypes"
      />
    </v-dialog>
  </div>
</template>

<script>
import acquirerTable from "~/components/table/acquirers.vue";
import addButton from "~/components/add.vue";
import acquirerForm from "~/components/form/acquirer.vue";
import mainTitle from "~/components/mainTitle.vue";
import { mapState } from "vuex";
import { filterHeader } from "~/mixins";

export default {
  layout: "default-layout",
  middleware: "auth",
  components: {
    "table-acquirer": acquirerTable,
    "button-add": addButton,
    "form-acquirer": acquirerForm,
    "main-title": mainTitle
  },
  mixins: [filterHeader],
  data() {
    return {
      acquirers: [],
      form: false,
      contoh: [],
      acquirerConfigs: [],
      acquirerTypes: [],
      totalPage: 1,
      loadingAcquirer: true
    };
  },
  mounted() {
    this.getAcquirers();
    this.getAcquirerConfigs();
    this.getAcquirerType();
  },
  computed: {
    ...mapState(["api"])
  },
  methods: {
    async getAcquirers() {
      await this.$axios
        .$get(`/api/back_office/acquirers?get_count=1`)
        .then(r => {
          this.acquirers = r.data;
          this.loadingAcquirer = false;
          this.$store.commit(
            "setApi",
            `/api/back_office/acquirers?get_count=1&page=`
          );
        });
    },
    async getAcquirerConfigs() {
      this.acquirerConfigs = await this.$axios
        .$get(`/api/back_office/acquirer_configs`)
        .then(r => r.data)
        .catch(e => console.log(e));
    },
    async getAcquirerType() {
      this.acquirerTypes = await this.$axios
        .$get(`/api/back_office/acquirer_types`)
        .then(r => r.data)
        .catch(e => console.log(e));
    }
  }
};
</script>

<style>
</style>
