<template>
  <div id="merchant-staff">
    <main-title :text="'Merchant Staff'" :icon="'person'" :show="false"/>
    <v-card class="pa-4">
      <table-merchant-staff :merchantStaff="merchantStaffs"/>
      <download :data="merchantStaffs" :filter="filterMerchantStaff"/>
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
import download from "~/components/download.vue";
import mainTitle from "~/components/mainTitle.vue";
import { filterHeader } from "~/mixins";

export default {
  layout: "default-layout",
  middleware: "auth",
  components: {
    "table-merchant-staff": tableMerchantStaff,
    "button-add": addButton,
    "form-merchant-staff": merchantStaffForm,
    download: download,
    "main-title": mainTitle
  },
  mixins: [filterHeader],
  data() {
    return {
      form: false,
      merchantStaffs: []
    };
  },
  mounted() {
    this.getMerchantStaff();
  },
  methods: {
    async getMerchantStaff() {
      await this.$axios.$get(`/api/back_office/merchant_staffs`).then(r => {
        this.merchantStaffs = r.data;
      });
    }
  }
};
</script>
