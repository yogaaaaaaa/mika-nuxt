<template>
  <div id="detail-admin">
    <sub-title :text="'List Admin'" :icon="'contacts'"/>
    <card-admin :admin="admin" :username="username"/>
  </div>
</template>

<script>
import adminCard from "~/components/card/admin.vue";
import subTitle from "~/components/subtitle.vue";

export default {
  layout: "default-layout",
  middleware: "auth",
  components: {
    "sub-title": subTitle,
    "card-admin": adminCard
  },
  data() {
    return {
      admin: {},
      username: ""
    };
  },
  mounted() {
    this.getAdmin();
  },
  methods: {
    async getAdmin() {
      await this.$axios
        .$get(`/api/back_office/admins/${this.$route.params.id}`)
        .then(response => {
          this.admin = response.data;
          this.username = this.admin.user.username;
        });
    }
  }
};
</script>

<style>
</style>
