<template>
  <div id="admin">
    <sub-title :text="'List Admin'" :icon="'contacts'"/>
    <v-card class="pa-4 mt-1">
      <table-admin :admin="admins"/>
      <download :data="admins"/>
    </v-card>
    <button-add :dialog="form" v-if="checkRoles(`adminHead`)"/>
    <v-dialog v-model="form" width="700">
      <form-admin @close="form = false"/>
    </v-dialog>
  </div>
</template>

<script>
import adminTable from "~/components/table/admin.vue";
import download from "~/components/download.vue";
import addButton from "~/components/add.vue";
import adminForm from "~/components/form/admin.vue";
import subTitle from "~/components/subtitle.vue";
import { mapGetters } from "vuex";
import { role } from "~/mixins";

export default {
  layout: "default-layout",
  middleware: "auth",
  components: {
    "table-admin": adminTable,
    download: download,
    "button-add": addButton,
    "form-admin": adminForm,
    "sub-title": subTitle
  },
  mixins: [role],
  data() {
    return {
      form: false,
      admins: [],
      add: []
    };
  },
  mounted() {
    this.getAdmins();
  },
  computed: {
    ...mapGetters(["loggedInUser"])
  },
  methods: {
    async getAdmins() {
      await this.$axios
        .$get(`/api/back_office/admins`)
        .then(response => {
          this.admins = response.data;
        })
        .catch(e => console.log(e));
    }
  }
};
</script>

<style>
</style>
