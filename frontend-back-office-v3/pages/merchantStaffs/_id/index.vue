<template>
  <div id="merchant-staff-detail">
    <main-title :text="'Detail Merchant Staff'" :icon="'person'" :show="false"/>
    <detail-merchant-staff
      :staff="merchantStaff"
      :username="username"
      :merchant="merchant"
      class="mb-2"
      @archive="archive()"
    />
    <!-- <card-merchant-staff :staff="merchantStaff" :username="username"/> -->
  </div>
</template>

<script>
import mainTitle from "~/components/mainTitle.vue";
import merchantStaffCard from "~/components/card/merchantStaff.vue";
import { fetchSingleData } from "~/mixins";
import merchantStaffDetail from "~/components/cardDetail/merchantStaff.vue";

export default {
  layout: "default-layout",
  middleware: "auth",
  components: {
    "main-title": mainTitle,
    "card-merchant-staff": merchantStaffCard,
    "detail-merchant-staff": merchantStaffDetail
  },
  mixins: [fetchSingleData],
  data() {
    return {
      merchantStaff: {},
      username: ""
    };
  },
  mounted() {
    this.getMerchantStaff();
  },
  methods: {
    async getMerchantStaff() {
      await this.$axios
        .$get(`/api/back_office/merchant_staffs/${this.$route.params.id}`)
        .then(response => {
          this.merchantStaff = response.data;
          this.username = this.merchantStaff.user.username;
          this.getMerchant(this.merchantStaff.merchantId);
        })
        .catch(e => console.log(e));
    },
    async archive() {
      await this.$axios
        .$put(`/api/back_office/merchant_staffs/${this.$route.params.id}`, {
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
