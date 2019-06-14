<template>
  <div id="merchant-marketing">
    <main-title :text="'List Merchant'" :icon="'domain'" :show="false"/>
    <v-card class="main pa-3">
      <table-merchant :merchants="merchants"/>
      <download :data="dataContoh" :filter="filterTransaction"/>
    </v-card>
    <button-add v-if="checkRoles(`adminMarketing`)" @dialog="form = !form"/>
    <v-dialog v-model="form" width="700">
      <form-merchant :show="form" @close="form = false"/>
    </v-dialog>
  </div>
</template>

<script>
import tableMerchant from "~/components/table/merchants.vue";
import download from "~/components/download.vue";
import formMerchant from "~/components/form/merchant.vue";
import addButton from "~/components/add.vue";
import mainTitle from "~/components/mainTitle.vue";
import transactionTable from "~/components/table/transactions.vue";
import { filterHeader, role } from "~/mixins";
import outletTable from "~/components/table/outlets.vue";
import { mapGetters } from "vuex";

export default {
  middleware: "auth",
  components: {
    "table-merchant": tableMerchant,
    download: download,
    "form-merchant": formMerchant,
    "button-add": addButton,
    "main-title": mainTitle,
    "table-transaction": transactionTable,
    "table-outlet": outletTable
  },
  mixins: [filterHeader, role],
  data() {
    return {
      merchants: [],
      form: false,
      dataContoh: [],
      cth: []
    };
  },
  computed: {
    ...mapGetters(["isAuthenticated", "loggedInUser"])
  },
  mounted() {
    this.getMerchants();
    this.checkRoles();
  },
  methods: {
    async getMerchants() {
      await this.$axios
        .get("api/back_office/merchants")
        .then(r => {
          this.merchants = r.data.data;
        })
        .catch(e => console.log(e));
    }
  }
};
</script>

<style>
</style>
