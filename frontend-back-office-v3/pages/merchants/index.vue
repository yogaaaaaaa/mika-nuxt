<template>
  <div id="merchant-marketing">
    <main-title :text="'List Merchant'" :icon="'domain'" :show="false"/>
    <v-card class="main pa-3">
      <table-merchant
        :loading="loading"
        :merchants="merchants"
        :totalPage="totalPage"
        :page="page"
        :filter="filterMerchant"
        :allMerchant="allMerchant"
      />
    </v-card>
    <button-add v-if="checkRoles(`adminMarketing`)" @dialog="form = !form"/>
    <v-dialog v-model="form" width="700">
      <form-merchant :show="form" @close="form = false" @refresh="getMerchants()"/>
    </v-dialog>
  </div>
</template>

<script>
import tableMerchant from "~/components/table/merchants.vue";
import formMerchant from "~/components/form/merchant.vue";
import addButton from "~/components/add.vue";
import mainTitle from "~/components/mainTitle.vue";
import transactionTable from "~/components/table/transactions.vue";
import { filterHeader, role } from "~/mixins";
import outletTable from "~/components/table/outlets.vue";
import { mapGetters, mapState } from "vuex";

export default {
  middleware: "auth",
  components: {
    "table-merchant": tableMerchant,
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
      merchantNames: [],
      totalPage: 1,
      page: 1,
      allMerchant: [],
      loading: true
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
        .$get("api/back_office/merchants?get_count=1")
        .then(r => {
          this.merchants = r.data;
          if (r.meta) {
            this.totalPage = r.meta.ofPages;
          }
          this.loading = false;
          this.$store.commit("setMerchants", this.merchants);
          this.$store.commit(
            "setApi",
            `api/back_office/merchants?get_count=1&page=`
          );
        })
        .catch(e => console.log(e));
    }
  }
};
</script>

<style>
</style>
