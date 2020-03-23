<template>
  <div>
    <div class="breadcrumbs-wrapper">
      <v-breadcrumbs>
        <v-breadcrumbs-item to="/" exact>
          Dashboard
          <span class="ml-3">/</span>
        </v-breadcrumbs-item>
        <v-breadcrumbs-item to="/agents" exact>
          Agents
          <span class="ml-3">/</span>
        </v-breadcrumbs-item>
        <v-breadcrumbs-item exact>{{ currentEdit.name }}</v-breadcrumbs-item>
      </v-breadcrumbs>
    </div>
    <v-tabs>
      <v-tab href="#detail-agent">Detail</v-tab>
      <v-tab href="#transaction-list">Transaction List</v-tab>
      <v-tab href="#acquirer-config">Acquirer Config</v-tab>
      <v-tab href="#reset" v-if="checkRoles(permissionRole)">Reset</v-tab>
      <v-tab-item id="detail-agent">
        <detail/>
      </v-tab-item>
      <v-tab-item :id="'transaction-list'">
        <tableTransaction :conditional-url="transactionUrl"/>
      </v-tab-item>
      <v-tab-item :id="'acquirer-config'">
        <tableAcquirerConfigAgent :conditional-url="transactionUrl"/>
      </v-tab-item>
      <v-tab-item :id="'reset'">
        <reset :url-reset-password="urlResetPassword" :url-login-attempt="urlLoginAttempt"/>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import detail from '~/components/agents/detail'
import tableTransaction from '~/components/transactions'
import tableAcquirerConfigAgent from '~/components/acquirerConfigAgents'
import { catchError, checkRoles } from '~/mixins'
import { mapState } from 'vuex'
import { reset } from '~/components/commons'

export default {
  components: {
    detail,
    tableTransaction,
    reset,
    tableAcquirerConfigAgent,
  },
  mixins: [catchError, checkRoles],
  data() {
    return {
      transactionUrl: `f[agentId]=eq,${this.$route.params.id}`,
      urlResetPassword: `/back_office/acquirer_staffs/${this.$route.params.id}/reset_password`,
      urlLoginAttempt: `/back_office/acquirer_staffs/${this.$route.params.id}`,
      permissionRole: 'adminMarketing',
    }
  },
  async fetch({ store, params, redirect, $axios }) {
    try {
      let resp = await $axios.$get('/back_office/agents/' + params.id)
      store.commit('currentEdit', resp.data)
    } catch (e) {
      if (process.client) this.catchError(e)
      else {
        redirect('/')
      }
    }
  },
  computed: {
    ...mapState(['currentEdit']),
  },
}
</script>

<style></style>
