<template>
  <div id="merchant-staff">
    <main-title :text="'Merchant Staff'" :icon="'person'" :show="false"/>
    <v-card class="pa-4">
      <table-merchant-staff
        :merchantStaff="merchantStaffs"
        :api="api"
        :filter="filterMerchantStaff"
        :totalPage="totalPage"
        :loading="loadingStaff"
      />
    </v-card>
    <button-add @dialog="form = !form"/>
    <v-dialog v-model="form" width="700">
      <form-merchant-staff @close="form = false"/>
    </v-dialog>
  </div>
</template>

<script>
import tableMerchantStaff from "~/components/table/merchantStaff.vue";
import addButton from "~/components/add.vue";
import merchantStaffForm from "~/components/form/merchantStaff.vue";
import mainTitle from "~/components/mainTitle.vue";
import { filterHeader } from "~/mixins";
import { mapState } from "vuex";

export default {
  layout: "default-layout",
  middleware: "auth",
  components: {
    "table-merchant-staff": tableMerchantStaff,
    "button-add": addButton,
    "form-merchant-staff": merchantStaffForm,
    "main-title": mainTitle
  },
  mixins: [filterHeader],
  data() {
    return {
      form: false,
      merchantStaffs: [],
      totalPage: 1,
      loadingStaff: true
    };
  },
  mounted() {
    this.getMerchantStaff();
  },
  computed: {
    ...mapState(["api"])
  },
  methods: {
    async getMerchantStaff() {
      await this.$axios
        .$get(`/api/back_office/merchant_staffs?get_count=1`)
        .then(r => {
          this.merchantStaffs = r.data;
          this.totalPage = r.meta.ofPages;
          this.loadingStaff = false;
          this.$store.commit(
            "setApi",
            `/api/back_office/merchant_staffs?get_count=1&page=`
          );
        });
    }
  }
};
</script>
