<template>
  <div>
    <div class="breadcrumbs-wrapper">
      <v-breadcrumbs>
        <v-breadcrumbs-item to="/" exact>
          Dashboard
          <span class="ml-3">/</span>
        </v-breadcrumbs-item>
        <v-breadcrumbs-item to="/merchants" exact>Merchant</v-breadcrumbs-item>
      </v-breadcrumbs>
    </div>
    <!-- <v-container>
      <detail />
    </v-container>-->

    <v-tabs>
      <v-tab href="#detail">Detail</v-tab>
      <v-tab href="#assign-outlet">Assign Outlet</v-tab>
      <v-tab href="#reset" v-if="checkRoles(permissionRole)">Reset</v-tab>
      <v-tab-item :id="'detail'">
        <detail/>
      </v-tab-item>
      <v-tab-item :id="'assign-outlet'">
        <assignOutlet :merchant-id="merchantId"/>
      </v-tab-item>
      <v-tab-item :id="'reset'">
        <reset :url-reset-password="urlResetPassword" :url-login-attempt="urlLoginAttempt"/>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import detail from '~/components/merchantStaffs/detail'
import assignOutlet from '~/components/merchantStaffs/assignOutlet'
import { catchError, checkRoles } from '~/mixins'
import { reset } from '~/components/commons'

export default {
  components: {
    detail,
    assignOutlet,
    reset,
  },
  mixins: [catchError, checkRoles],
  data() {
    return {
      merchantId: 0,
      urlResetPassword: `/back_office/merchant_staffs/${this.$route.params.id}/reset_password`,
      urlLoginAttempt: `/back_office/merchant_staffs/${this.$route.params.id}`,
      permissionRole: 'adminMarketing',
    }
  },
  async fetch({ store, params, redirect, $axios }) {
    try {
      let resp = await $axios.$get('/back_office/merchant_staffs/' + params.id)
      this.merchantId = resp.data.merchantId
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
