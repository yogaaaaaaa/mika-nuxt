<template>
  <div>
    <sub-title :text="'Detail Acquirer Type'" :icon="'device_hub'"/>
    <v-container text-xs-center v-if="loadingAcquirerType">
      <v-flex>
        <v-progress-circular :size="60" color="blue" indeterminate/>
      </v-flex>
    </v-container>
    <detail-acquirer-type
      :acquirerType="acquirerType"
      v-if="!loadingAcquirerType"
      @edit="formEdit = true"
      @archive="archive()"
    />
    <v-dialog v-model="formEdit" width="700">
      <card-acquirer-type
        :type="acquirerType"
        @refresh="getAcquirertype()"
        @close="formEdit = false"
      />
    </v-dialog>
  </div>
</template>

<script>
import subTitle from "~/components/subtitle.vue";
import acquirerTypeDetail from "~/components/cardDetail/acquirerType.vue";
import typeCard from "~/components/card/acquirerType.vue";

export default {
  components: {
    "sub-title": subTitle,
    "detail-acquirer-type": acquirerTypeDetail,
    "card-acquirer-type": typeCard
  },
  data() {
    return {
      acquirerType: {},
      formEdit: false,
      loadingAcquirerType: true
    };
  },
  mounted() {
    this.getAcquirertype();
  },
  methods: {
    async getAcquirertype() {
      await this.$axios
        .$get(`/api/back_office/acquirer_types/${this.$route.params.id}`)
        .then(r => {
          this.acquirerType = r.data;
          this.loadingAcquirerType = false;
          this.$store.commit("setAcquirerType", this.acquirerType);
        });
    },
    async archive() {
      await this.$axios
        .$put(`/api/back_office/acquirer_types/${this.$route.params.id}`, {
          archivedAt: true
        })
        .then(r => {
          this.$router.go(-1);
        })
        .catch(e => console.log(e));
    }
  }
};
</script>

<style>
</style>
