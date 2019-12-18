<template>
  <div>
    <div class="breadcrumbs-wrapper">
      <v-breadcrumbs>
        <v-breadcrumbs-item to="/" exact>
          Dashboard
          <span class="ml-3">/</span>
        </v-breadcrumbs-item>
        <v-breadcrumbs-item to="/admins" exact>
          Admin
          <span class="ml-3">/</span>
        </v-breadcrumbs-item>
        <v-breadcrumbs-item>{{ admin.name }}</v-breadcrumbs-item>
      </v-breadcrumbs>
    </div>
    <v-tabs>
      <v-tab href="#detail">Detail</v-tab>
      <v-tab href="#roles">Roles</v-tab>
      <v-tab href="#reset" v-if="checkRoles(permissionRole)">Reset</v-tab>
      <v-tab-item :id="'detail'">
        <detail/>
      </v-tab-item>
      <v-tab-item :id="'roles'">
        <roles/>
      </v-tab-item>
      <v-tab-item :id="'reset'">
        <reset :url-reset-password="urlResetPassword" :url-login-attempt="urlLoginAttempt"/>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import { catchError, checkRoles } from '~/mixins'
import detail from '~/components/admins/detail'
import roles from '~/components/admins/roles'
import { reset } from '~/components/commons'

export default {
  components: { detail, roles, reset },
  mixins: [catchError, checkRoles],
  data() {
    return {
      urlResetPassword: `/back_office/admins/${this.$route.params.id}/reset_password`,
      urlLoginAttempt: `/back_office/admins/${this.$route.params.id}`,
      permissionRole: 'adminHead',
    }
  },
  computed: {
    admin() {
      return this.$store.state.currentEdit
    },
  },
  async fetch({ store, params, redirect, $axios }) {
    try {
      let resp = await $axios.$get('/back_office/admins/' + params.id)
      store.commit('currentEdit', resp.data)
    } catch (e) {
      if (process.client) this.catchError(e)
      else {
        redirect('/')
      }
    }
  },
}
</script>

<style></style>
