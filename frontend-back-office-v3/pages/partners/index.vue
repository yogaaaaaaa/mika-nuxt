<template>
  <div class="partner">
    <main-title :text="'List Partner'" :icon="'how_to_reg'" :show="false"/>
    <v-card style="padding: 2em">
      <table-partner :partners="partners" :loading="loading"/>
    </v-card>
    <button-add @dialog="form = !form" v-if="checkRoles(`adminMarketing`)"/>
    <v-dialog v-model="form" width="700">
      <!-- <form-partner @close="form = false"/> -->
    </v-dialog>
  </div>
</template>

<script>
import { exit, role } from "~/mixins";
import { mapGetters } from "vuex";
import mainTitle from "~/components/mainTitle.vue";
import partnerTable from "~/components/table/partner.vue";
import addButton from "~/components/add.vue";
import formPartner from "~/components/form/partner.vue";

export default {
  middleware: "auth",
  components: {
    "table-partner": partnerTable,
    "main-title": mainTitle,
    "button-add": addButton,
    "form-partner": formPartner
  },
  mixins: [exit, role],
  data() {
    return {
      partners: [],
      loading: true,
      dialog: false,
      form: false
    };
  },
  mounted() {
    this.getPartners();
  },
  computed: {
    ...mapGetters(["loggedInUser"])
  },
  methods: {
    getPartners() {
      this.loading = false;
      // await this.$axios
      //   .get(`/api/back_office/partners`)
      //   .then(r => {
      //     this.partners = r.data;
      //     this.loading = false;
      //   })
      //   .catch(e => alert(e.message));
    }
  }
};
</script>

<style>
</style>
