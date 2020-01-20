<template>
  <v-app dark>
    <v-navigation-drawer v-model="drawer" fixed app>
      <v-toolbar flat color="primary" dark>
        <v-toolbar-title>
          <v-img src="/img/logo_horizontal_putih.png" width="100px"/>
        </v-toolbar-title>
      </v-toolbar>

      <v-list>
        <template v-for="item in items">
          <!-- <v-row v-if="item.heading" :key="item.heading" align="center">
            <v-col cols="6">
              <v-subheader v-if="item.heading">{{ item.heading }}</v-subheader>
            </v-col>
            <v-col cols="6" class="text-center">
              <a href="#!" class="body-2 black--text">EDIT</a>
            </v-col>
          </v-row>-->
          <v-list-group v-if="item.children" :key="item.text" v-model="item.model" append-icon>
            <template v-slot:activator>
              <v-list-item class="pa-0" :to="item.to">
                <v-list-item-action>
                  <v-icon>{{ item.icon }}</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>{{ item.text }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
            <v-list-item
              v-for="(child, i) in item.children"
              :key="i"
              :to="child.to"
              link
              append-icon
              class="pl-8"
            >
              <v-list-item-action v-if="child.icon" class="ml-8 pa-0">
                <v-icon>{{ child.icon }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title class="pl-0">{{ child.text }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
          <v-list-item v-else :key="item.text" :to="item.to" link>
            <v-list-item-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ item.text }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" fixed app flat color="primary" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"/>
      <v-toolbar-title v-if="!drawer">
        <v-img src="/img/logo_horizontal_putih.png" width="100px"/>
      </v-toolbar-title>
      <v-spacer/>
      <v-toolbar-items>
        <v-menu offset-y>
          <template v-slot:activator="{ on }">
            <v-btn dark text v-on="on">{{ user.name }}</v-btn>
          </template>
          <v-list>
            <v-list-item @click="showChangePasswordForm = true">
              <v-list-item-title>
                <v-icon>lock_open</v-icon>
                <span class="ml-3">Change Password</span>
              </v-list-item-title>
            </v-list-item>
            <v-divider/>
            <v-list-item @click="confirmationLogout = true">
              <v-list-item-title>
                <v-icon>exit_to_app</v-icon>
                <span class="ml-3">Logout</span>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-toolbar-items>
    </v-app-bar>
    <v-content>
      <v-container fluid>
        <client-only>
          <nuxt/>
        </client-only>
      </v-container>
    </v-content>
    <snackbar/>
    <!-- <confirmation-box v-if="login == false" @onConfirm="logout" /> -->
    <confirmation
      :confirm-show="confirmationLogout"
      :confirm-title="logoutTitle"
      :confirm-color="logoutColor"
      :confirm-text="confirmationLogoutText"
      @onClose="confirmationLogout = false"
      @onConfirm="logout"
    />
    <changePasswordForm
      :show="showChangePasswordForm"
      @onClose="showChangePasswordForm = false"
      :text="changePasswordText"
    />
    <changePasswordForm :show="showChangePasswordForm" @onClose="showChangePasswordForm = false"/>
  </v-app>
</template>

<script>
import {
  snackbar,
  // confirmationBox,
  changePasswordForm,
} from '~/components/commons'
import confirmation from '~/components/commons/confirmation'
import { mapState } from 'vuex'

export default {
  components: {
    snackbar,
    // confirmationBox,
    confirmation,
    changePasswordForm,
  },
  data() {
    return {
      clipped: false,
      drawer: true,
      fixed: true,
      showChangePasswordForm: false,
      confirmationLogout: false,
      confirmationLogoutText: 'Are you want to logout ?',
      changePasswordText:
        'Demi keamanan dan kenyamanan, silahkan ganti password anda!',
      items: [
        { icon: "supervisor_account", text: "Admins", to: "/admins" },
        { icon: "domain", text: "Merchants", to: "/merchants" },
        { icon: "store", text: "Outlets", to: "/outlets" },
        {
          icon: 'account_balance',
          text: 'Acquirers',
          // to: '/acquirers',
          children: [
            {
              text: 'List Acquirer',
              to: '/acquirers',
            },
            {
              text: 'Acquirer Types',
              to: '/acquirerTypes',
            },
            {
              text: 'Acquirer Configs',
              to: '/acquirerConfigs',
            },
            // {
            //   text: 'Acquirer Config Agents',
            //   to: '/acquirerConfigAgents',
            // },
            // {
            //   text: 'Acquirer Config Outlets',
            //   to: '/acquirerConfigOutlets',
            // },
            {
              text: 'Acquirer Terminals',
              to: '/acquirerTerminals',
            },
          ],
        },
        { icon: "person", text: "Agents", to: "/agents" },
        {
          icon: "confirmation_number",
          text: "Transactions",
          to: "/transactions"
        },
        {
          icon: 'home',
          text: 'Acquirer Companies',
          to: '/acquirerCompanies',
        },
        // {
        //   icon: 'people_outline',
        //   text: 'Partners',
        //   to: '/partners',
        // },
        {
          icon: 'keyboard_arrow_down',
          text: 'Terminal',
          // to: '/terminalModels',
          children: [
            {
              icon: 'delete',
              text: 'Procurement',
              to: '/',
            },
            {
              icon: 'add',
              text: 'Batches',
              to: '/terminalModels',
            },
            {
              text: 'Inventory',
              to: '/inventories',
            },
            {
              text: 'Deliveries',
              to: '/deliveries',
            },
            {
              text: 'Tickets',
              to: '/tickets',
            },
          ],
        },
        // {
        //   icon: 'credit_card',
        //   text: 'Cards',
        //   children: [
        //     {
        //       text: 'Card IIN',
        //       to: '/cards/iins',
        //     },
        //     {
        //       text: 'Card Types',
        //       to: '/cards/types',
        //     },
        //     {
        //       text: 'Card Issuer',
        //       to: '/cards/issuers',
        //     },
        //     {
        //       text: 'Card Scheme',
        //       to: '/cards/schemes',
        //     },
        //   ],
        // },
        {
          icon: 'bug_report',
          text: 'Fraud Rules',
          to: '/fraudRules',
        },
      ],
      logoutTitle: 'Logout ?',
      logoutColor: 'warning',
    }
  },
  computed: {
    user() {
      return this.$store.state.auth.user;
    },
    ...mapState(["login"])
  },
  beforeMounted() {
    this.$store.dispatch("clearFilter");
  },
  mounted() {
    this.$store.commit('login', true)
    if (this.user.user.lastPasswordChangeAt == null) {
      console.log('last password')
      this.checkPassword()
    }
    console.log('user', this.user)
  },
  methods: {
    async logout() {
      await this.$auth.logout();
      this.$router.push("/login");
    },
    showConfirm() {
      this.confirmationLogout = true
    },
    checkPassword() {
      this.showChangePasswordForm = true
    },
  },
}
</script>
