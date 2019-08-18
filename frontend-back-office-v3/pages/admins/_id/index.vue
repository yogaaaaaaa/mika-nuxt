<template>
  <div id="detail-admin">
    <sub-title :text="'Detail Admin Lyndon'" :icon="'contacts'"/>
    <detail-admin
      :admin="admin"
      :user="user"
      :roles="roles"
      @dialog="dialogForm = true"
      @archive="archive()"
    />
    <v-dialog v-model="dialogForm" width="700">
      <card-admin
        :admin="admin"
        :username="username"
        :roles="roles"
        @edit="putAdmin()"
        @close="dialogForm = false"
        @refresh="getAdmin()"
      />
    </v-dialog>
  </div>
</template>

<script>
import adminCard from "~/components/card/admin.vue";
import subTitle from "~/components/subtitle.vue";
import breadCrumbs from "~/components/breadcrumbs.vue";
import adminDetail from "~/components/cardDetail/admin.vue";
import { mapGetters } from "vuex";
import { role } from "~/mixins";

export default {
  layout: "default-layout",
  middleware: "auth",
  components: {
    "sub-title": subTitle,
    "card-admin": adminCard,
    "bread-crumbs": breadCrumbs,
    "detail-admin": adminDetail
  },
  mixins: [role],
  data() {
    return {
      admin: {},
      username: "",
      roles: [],
      breadcrumbs: [
        { text: "Dashboard", link: "/" },
        { text: "List Admin", link: "/admins" },
        { text: "Detail Admin", link: "#" }
      ],
      dialogForm: false,
      user: {}
    };
  },
  mounted() {
    this.getAdmin();
  },
  computed: {
    ...mapGetters(["loggedaInUser"])
  },
  methods: {
    async getAdmin() {
      await this.$axios
        .$get(`/api/back_office/admins/${this.$route.params.id}`)
        .then(response => {
          this.admin = response.data;
          this.user = this.admin.user;
          this.roles = this.admin.user.userRoles;
          this.$store.commit("setAdmin", this.admin);
          this.$store.commit("setUser", this.user);
        });
    },
    async putAdmin() {
      console.log("edit admin");
      console.log(this.admin.name);
      await this.$axios.$put(
        `/api/back_office/admins/${this.$route.params.id}`,
        {
          name: this.admin.name,
          username: this.username,
          email: this.admin.email
        }
      );
    },
    async archive() {
      await this.$axios
        .$put(`/api/back_office/admins/${this.$route.params.id}`, {
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
