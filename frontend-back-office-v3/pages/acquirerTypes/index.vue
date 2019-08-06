<template>
  <div id="acquirer-types">
    <sub-title :text="'List Acquirer Type'" :icon="'people'"/>
    <v-card style="padding: 3em">
      <table-acquirer-type
        :acquirerType="acquirerTypes"
        :api="api"
        :filter="filterAcquirerType"
        :totalPage="typePages"
        :loading="loadingAcquirerType"
      />
    </v-card>
    <button-add @dialog="formAcquirerType = !formAcquirerType"/>
    <v-dialog v-model="formAcquirerType" width="700">
      <form-acquirer-type @close="formAcquirerType = false" @refresh="getAcquirerTypes()"/>
    </v-dialog>
  </div>
</template>

<script>
import subTitle from "~/components/subtitle.vue";
import acquirerTypeTable from "~/components/table/acquirerType.vue";
import addButton from "~/components/add.vue";
import acquirerTypeform from "~/components/form/acquirerType.vue";
import { mapState } from "vuex";
import { filterHeader } from "~/mixins";

export default {
  layout: "default",
  components: {
    "sub-title": subTitle,
    "table-acquirer-type": acquirerTypeTable,
    "button-add": addButton,
    "form-acquirer-type": acquirerTypeform
  },
  mixins: [filterHeader],
  data() {
    return {
      acquirerTypes: [],
      formAcquirerType: false,
      color: "",
      typePages: 1,
      loadingAcquirerType: true
    };
  },
  mounted() {
    this.getAcquirerTypes();
  },
  computed: {
    ...mapState(["api"])
  },
  methods: {
    async getAcquirerTypes() {
      await this.$axios
        .$get(`/api/back_office/acquirer_types?get_count=1`)
        .then(r => {
          this.acquirerTypes = r.data;
          this.typePages = r.meta.ofPages;
          this.loadingAcquirerType = false;
          this.$store.commit(
            "setApi",
            `/api/back_office/acquirer_types?get_count=1&page=`
          );
        })
        .catch(e => console.log(e));
    }
  }
};
</script>

<style>
</style>
