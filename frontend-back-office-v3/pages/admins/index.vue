<template>
  <div id="admin">
    <sub-title :text="'List Admin'" :icon="'contacts'"/>
    <v-card class="pa-4 mt-1">
      <table-admin
        :admin="admins"
        :api="api"
        :filter="filterAdmin"
        :totalPage="adminPages"
        :loading="loadingAdmin"
      />
    </v-card>
    <button-add @dialog="form = !form" v-if="checkRoles(`adminHead`)"/>
    <v-dialog v-model="form" width="700">
      <form-admin @close="form = false" @refresh="getAdmins()" :show="form"/>
    </v-dialog>
  </div>
</template>

<script>
import adminTable from "~/components/table/admin.vue";
import breadCrumb from "~/components/breadcrumbs.vue";
import addButton from "~/components/add.vue";
import adminForm from "~/components/form/admin.vue";
import subTitle from "~/components/subtitle.vue";
import { mapGetters, mapState } from "vuex";
import { role, filterHeader } from "~/mixins";

export default {
  layout: "default-layout",
  middleware: "auth",
  components: {
    "table-admin": adminTable,
    "button-add": addButton,
    "form-admin": adminForm,
    "sub-title": subTitle
  },
  mixins: [role, filterHeader],
  data() {
    return {
      form: false,
      admins: [],
      add: [],
      breadcrumb: [
        { text: "Dashboard", link: "/" },
        { text: "Admin List", link: "/admins" }
      ],
      admin: [],
      adminPages: 1,
      loadingAdmin: false
    };
  },
  mounted() {
    this.getAdmins();
  },
  computed: {
    ...mapGetters(["loggedInUser"]),
    ...mapState(["api"])
  },
  methods: {
    async getAdmins() {
      await this.$axios
        .$get(`/api/back_office/admins?get_count=1`)
        .then(response => {
          this.admins = response.data;
          this.adminPages = response.meta.ofPages;
          this.loadingAdmin = false;
          this.$store.commit(
            "setApi",
            `/api/back_office/admins?get_count=1&page`
          );
        })
        .catch(e => console.log(e));
    }
  }
};
</script>

<style>
</style>
