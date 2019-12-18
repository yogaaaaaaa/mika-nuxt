<template>
  <div>
    <div class="breadcrumbs-wrapper">
      <v-breadcrumbs>
        <v-breadcrumbs-item to="/" exact>
          Dashboard
          <span class="ml-3">/</span>
        </v-breadcrumbs-item>
        <v-breadcrumbs-item to="/acquirerStaffs" exact>Acquirer Staffs</v-breadcrumbs-item>
      </v-breadcrumbs>
    </div>

    <v-tabs>
      <v-tab href="#detail">Detail</v-tab>
      <v-tab href="#reset" v-if="checkRoles(permissionRole)">Reset</v-tab>
      <v-tab-item :id="'detail'">
        <detail/>
      </v-tab-item>
      <v-tab-item :id="'reset'">
        <reset :url-reset-password="urlResetPassword" :url-login-attempt="urlLoginAttempt"/>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import detail from '~/components/acquirerStaffs/detail'
import { reset } from '~/components/commons'
import { catchError, checkRoles } from '~/mixins'

export default {
  components: {
    detail,
    reset,
  },
  mixins: [catchError, checkRoles],
  data() {
    return {
      urlResetPassword: `/back_office/acquirer_staffs/${this.$route.params.id}/reset_password`,
      urlLoginAttempt: `/back_office/acquirer_staffs/${this.$route.params.id}`,
      permissionRole: 'adminMarketing',
    }
  },
  async fetch({ store, params, redirect, $axios }) {
    try {
      let resp = await $axios.$get('/back_office/acquirer_staffs/' + params.id)
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
