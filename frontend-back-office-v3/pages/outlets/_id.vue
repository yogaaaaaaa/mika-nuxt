<template>
  <v-tabs v-model="tabPage">
    <v-tab v-for="tab in tabItem" :key="tab.text" :href="`#${tab.to}`">{{
      tab.text
    }}</v-tab>
    <v-tab-item value="#detail-outlet">
      <div class="page-title mt-4">
        <v-container fluid>
          <v-layout row wrap>
            <v-icon class="mr-2">store</v-icon>
            <h2>Outlet Detail</h2>
          </v-layout>
        </v-container>
      </div>
      <detail />
    </v-tab-item>

    <v-tab-item value="#agent-list">
      <tableAgent :conditional-url="agentUrl" :show-add-btn="showAddAgentBtn" />
    </v-tab-item>

    <v-tab-item value="#transaction-list">
      <tableTransaction :conditional-url="transactionUrl" />
    </v-tab-item>
  </v-tabs>
</template>

<script>
import detail from '~/components/outlets/detail'
import tableAgent from '~/components/agents'
import tableTransaction from '~/components/transactions'
import { catchError } from '~/mixins'

export default {
  components: {
    detail,
    tableAgent,
    tableTransaction,
  },
  mixins: [catchError],
  data() {
    return {
      tabItem: [
        { text: 'Outlet Detail', to: '#detail-outlet' },
        { text: 'Agent List', to: '#agent-list' },
        { text: 'Transaction List', to: '#transaction-list' },
      ],
      tabPage: null,
      agentUrl: `f[outletId]=eq,${this.$route.params.id}`,
      transactionUrl: `f[agent.outletId]=eq,${this.$route.params.id}`,
      showAddAgentBtn: true,
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
}
</script>

<style></style>
