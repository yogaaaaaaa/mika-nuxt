<template>
  <div>
    <div class="breadcrumbs-wrapper">
      <v-breadcrumbs>
        <v-breadcrumbs-item to="/" exact>
          Dashboard
          <span class="ml-3">/</span>
        </v-breadcrumbs-item>
        <v-breadcrumbs-item to="/Outlet" exact>
          Outlets
          <span class="ml-3">/</span>
        </v-breadcrumbs-item>
        <v-breadcrumbs-item exact>{{ currentEdit.name }}</v-breadcrumbs-item>
      </v-breadcrumbs>
    </div>
    <v-tabs v-model="tabPage">
      <v-tab v-for="tab in tabItem" :key="tab.text" :href="`#${tab.to}`">
        {{
        tab.text
        }}
      </v-tab>
      <v-tab-item value="#detail-outlet">
        <div class="page-title mt-4">
          <v-container fluid>
            <v-layout row wrap>
              <v-icon class="mr-2">store</v-icon>
              <h2>Outlet Detail</h2>
            </v-layout>
          </v-container>
        </div>
        <detail/>
      </v-tab-item>

      <v-tab-item value="#agent-list">
        <tableAgent :conditional-url="conditionalUrl" :show-add-btn="showAddAgentBtn"/>
      </v-tab-item>

      <v-tab-item value="#transaction-list">
        <tableTransaction :conditional-url="transactionUrl"/>
      </v-tab-item>
      <v-tab-item value="#acquirer-config">
        <tableAcquirerConfig :conditional-url="conditionalUrl"/>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import detail from '~/components/outlets/detail'
import tableAgent from '~/components/agents'
import tableTransaction from '~/components/transactions'
import tableAcquirerConfig from '~/components/acquirerConfigOutlets'
import { catchError } from '~/mixins'
import { mapState } from 'vuex'

export default {
  components: {
    detail,
    tableAgent,
    tableTransaction,
    tableAcquirerConfig,
  },
  mixins: [catchError],
  data() {
    return {
      tabItem: [
        { text: 'Outlet Detail', to: '#detail-outlet' },
        { text: 'Agent List', to: '#agent-list' },
        { text: 'Transaction List', to: '#transaction-list' },
        { text: 'Acquirer Config', to: '#acquirer-config' },
      ],
      tabPage: null,
      transactionUrl: `f[agent.outletId]=eq,${this.$route.params.id}`,
      showAddAgentBtn: true,
      conditionalUrl: `f[outletId]=eq,${this.$route.params.id}`,
    }
  },
  async fetch({ store, params, redirect, $axios }) {
    try {
      let resp = await $axios.$get('/back_office/outlets/' + params.id)
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
