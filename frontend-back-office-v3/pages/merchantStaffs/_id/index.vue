<template>
  <div id="merchant-staff-detail">
    <main-title :text="'Detail Merchant Staff'" :icon="'person'" :show="false"/>
    <card-merchant-staff :staff="merchantStaff" :username="username"/>
  </div>
</template>

<script>
import mainTitle from "~/components/mainTitle.vue";
import merchantStaffCard from "~/components/card/merchantStaff.vue";

export default {
  layout: "default-layout",
  middleware: "auth",
  components: {
    "main-title": mainTitle,
    "card-merchant-staff": merchantStaffCard
  },
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
        })
        .catch(e => console.log(e));
    }
  }
};
</script>

<style>
</style>
