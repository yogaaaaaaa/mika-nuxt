<template>
  <no-ssr>
    <v-app id="inspire">
      <side-menu :items="items" class="admin" />
      <v-content class="back">
        <v-container fluid > 
          <nuxt /> 
        </v-container>
      </v-content>
    </v-app>
  </no-ssr>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import { logout } from "~/mixins"
import adminButton from "~/components/admin.vue";
import sideMenu from "~/components/sidebar/sidebar.vue";

export default {
  props: {
    source: {
      type: String,
      default: ""
    }
  },
  mixins: [logout],
  components: {
    "admin-button": adminButton,
    "side-menu": sideMenu
  },
  data: () => ({
    msgLogout: "Are you sure you want to logout?",
    appName: "Mika",
    fixed: false,
    right: true,
    rightDrawer: false,
    drawer: false,
    tabs: null,
    username: "",
    dialogConfirm: false,
    btnConfirm: "Continue Logout",
    items: [
        { icon: "domain", text: "Merchants", to: "/marketing/merchant" },
        { icon: "person", text: "Merchant Staff", to: "/marketing/merchantStaff" },
        { icon: "system_update", text: "Terminal", to: "/marketing/terminal" },
        { icon: "device_hub", text: "Acquirer", to: "/marketing/acquirer" },
        { icon: "settings_ethernet", text: "Acquirer Config", to: '/marketing/acquirerConfig' }
      ],
  }),
  computed: {
    ...mapGetters(["isAuthenticated", "loggedInUser"])
  },
  async mounted() {
    await this.setUser()
  },
  methods: {
    setUser() {
      this.username = localStorage.username
    }
  }
};
</script>

<style>
.back {
  background-color: rgb(248, 248, 248);
  margin-top: -70px;
}
.logout {
  position: absolute;
  bottom: 0px;
  color: white;
}
.admin {
  margin-bottom: 25px;
}
</style>
