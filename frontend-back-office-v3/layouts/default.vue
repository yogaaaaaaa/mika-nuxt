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
          <div v-else :key="item.text">
            <v-list-item
              v-if="checkRoles(item.role) || item.role == 'default'"
              :key="item.text"
              :to="item.to"
              link
            >
              <v-list-item-action>
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{ item.text }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </div>
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
      :show="confirmationLogout"
      :title="logoutTitle"
      :color="logoutColor"
      :text="confirmationLogoutText"
      @onClose="confirmationLogout = false"
      @onConfirm="logout"
    />
    <changePasswordForm
      :show="showChangePasswordForm"
      @onClose="showChangePasswordForm = false"
      :text="changePasswordText"
    />
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
import { checkRoles } from '~/mixins'

export default {
  components: {
    snackbar,
    // confirmationBox,
    confirmation,
    changePasswordForm,
  },
  mixins: [checkRoles],
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
        {
          icon: 'supervisor_account',
          text: 'Admins',
          to: '/admins',
          role: 'default',
        },
        {
          icon: 'domain',
          text: 'Merchants',
          to: '/merchants',
          role: 'default',
        },
        { icon: 'store', text: 'Outlets', to: '/outlets', role: 'default' },
        {
          icon: 'account_balance',
          text: 'Acquirers',
          role: 'default',
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
            {
              text: 'Acquirer Config Agents',
              to: '/acquirerConfigAgents',
            },
            {
              text: 'Acquirer Config Outlets',
              to: '/acquirerConfigOutlets',
            },
            {
              text: 'Acquirer Terminals',
              to: '/acquirerTerminals',
            },
            {
              text: 'Acquirer Terminal Commons',
              to: '/acquirerTerminalCommons',
            },
          ],
        },
        { icon: 'person', text: 'Agents', to: '/agents', role: 'default' },
        {
          icon: 'confirmation_number',
          text: 'Transactions',
          to: '/transactions',
          role: 'default',
        },
        {
          icon: 'home',
          text: 'Acquirer Companies',
          to: '/acquirerCompanies',
          role: 'default',
        },
        {
          icon: 'keyboard_arrow_down',
          text: 'Terminal',
          role: 'default',
          children: [
            // {
            //   text: 'Procurement',
            //   to: '/',
            // },
            {
              text: 'Batches',
              to: '/terminalModels',
            },
            // {
            //   text: 'Inventory',
            //   to: '/inventories',
            // },
            // {
            //   text: 'Deliveries',
            //   to: '/deliveries',
            // },
            // {
            //   text: 'Tickets',
            //   to: '/tickets',
            // },
          ],
        },
        {
          icon: 'credit_card',
          text: 'Cards',
          role: 'default',
          children: [
            {
              text: 'Card IIN',
              to: '/cardIins',
            },
            {
              text: 'Card Types',
              to: '/cardTypes',
            },
            {
              text: 'Card Issuer',
              to: '/cardIssuers',
            },
            {
              text: 'Card Scheme',
              to: '/cardSchemes',
            },
          ],
        },
        {
          icon: 'bug_report',
          text: 'Fraud Rules',
          to: '/fraudRules',
          role: 'adminMarketing',
        },
        {
          icon: 'supervisor_account',
          text: 'Audits',
          to: '/audits',
          role: 'adminHead',
        },
      ],
      logoutTitle: 'Logout ?',
      logoutColor: 'warning',
    }
  },
  computed: {
    user() {
      return this.$store.state.auth.user
    },
    ...mapState(['login']),
  },
  beforeMounted() {
    this.$store.dispatch('clearFilter')
  },
  mounted() {
    this.$store.commit('login', true)
    if (this.user.user.lastPasswordChangeAt == null) {
      this.checkPassword()
    }
  },
  methods: {
    async logout() {
      await this.$auth.logout()
      this.$router.push('/login')
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

<style scoped>
.v-list-item__title {
  font-size: 0.9rem;
}
</style>

