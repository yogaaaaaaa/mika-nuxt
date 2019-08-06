<template>
  <div style="margin-top: 50px">
    <v-tabs v-model="activeTab" slider-color="yellow" class="mt-1">
      <v-tab v-for="tab in tabItem" :key="tab.text" :to="tab.to" ripple>{{ tab.text }}</v-tab>
      <v-tab-item value="detail-partner">
        <sub-title :text="'Detail Partner'" :icon="'how_to_reg'"/>
        <v-container fluid class="mb-3 pa-0">
          <v-layout row wrap d-flex>
            <card-top :total="totalTransaction" :title="'Total Transaction'" :loading="false"/>
          </v-layout>
        </v-container>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import subTitle from "~/components/subtitle.vue";
import partnerDetail from "~/components/cardDetail/partner.vue";
import topCard from "~/components/card/top.vue";

export default {
  middleware: "auth",
  components: {
    "card-top": topCard,
    "detail-partner": partnerDetail,
    "sub-title": subTitle
  },
  data() {
    return {
      partner: {},
      activeTab: "",
      tabItem: [
        { text: "Detail Partner", to: "#detail-partner" },
        { text: "List Transaction", to: "#list-transaction" }
      ],
      transactionPerPartner: [],
      totalTransaction: 0
    };
  },
  methods: {
    async getPartner() {
      await this.$axios
        .get(`/api/back_office/partners/${this.$route.params.id}`)
        .then(r => {
          this.partner = r.data;
        })
        .catch(e => console.log(e.message));
    }
  }
};
</script>

<style>
</style>
