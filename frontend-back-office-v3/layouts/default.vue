<template>
  <v-app dark>
    <v-navigation-drawer v-model="drawer" fixed app>
      <v-toolbar flat color="primary" dark>
        <v-toolbar-title>
          <v-img src="/img/logo_horizontal_putih.png" width="100px" />
        </v-toolbar-title>
      </v-toolbar>
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.text" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" fixed app flat color="primary" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title v-if="!drawer">
        <v-img src="/img/logo_horizontal_putih.png" width="100px" />
      </v-toolbar-title>
      <v-spacer />
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
            <v-divider />
            <v-list-item @click="showConfirm">
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
          <nuxt />
        </client-only>
      </v-container>
    </v-content>
    <snackbar />
    <confirmation-box v-if="login == false" @onConfirm="logout" />
    <changePasswordForm
      :show="showChangePasswordForm"
      @onClose="showChangePasswordForm = false"
    />
  </v-app>
</template>

<script>
import {
  snackbar,
  confirmationBox,
  changePasswordForm,
} from '~/components/commons'
import { mapState } from 'vuex'

export default {
  components: {
    snackbar,
    confirmationBox,
    changePasswordForm,
  },
  data() {
    return {
      clipped: false,
      drawer: true,
      fixed: true,
      showChangePasswordForm: false,
      items: [
        { icon: 'supervisor_account', text: 'Admins', to: '/admins' },
        { icon: 'domain', text: 'Merchants', to: '/merchants' },
        { icon: 'store', text: 'Outlets', to: '/outlets' },
        {
          icon: 'account_balance',
          text: 'Acquirers',
          to: '/acquirers',
        },
        { icon: 'person', text: 'Agents', to: '/agents' },
        {
          icon: 'confirmation_number',
          text: 'Transactions',
          to: '/transactions',
        },
      ],
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
  },
  methods: {
    async logout() {
      await this.$auth.logout()
      this.$router.push('/login')
    },
    showConfirm() {
      this.$store.dispatch('showConfirm', { show: true })
    },
  },
}
</script>
