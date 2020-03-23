<template>
  <div>
    <div class="breadcrumbs-wrapper">
      <v-breadcrumbs>
        <v-breadcrumbs-item to="/" exact>Dashboard</v-breadcrumbs-item>
        <v-breadcrumbs-item to="/merchants" exact>Merchants</v-breadcrumbs-item>
        <v-breadcrumbs-item>Detail</v-breadcrumbs-item>
      </v-breadcrumbs>
    </div>
    <v-tabs v-model="tab">
      <v-tab v-for="t in tabItem" :key="t.text" :href="`#${t.to}`">{{ t.text }}</v-tab>
      <v-tab-item value="#detail-merchant">
        <detail/>
      </v-tab-item>

      <v-tab-item value="#outlet-list">
        <tableOutlet :conditional-url="outletUrl" :current-edit="currentEdit"/>
      </v-tab-item>

      <v-tab-item value="#agent-list">
        <tableAgent :conditional-url="agentUrl"/>
      </v-tab-item>

      <v-tab-item value="#acquirer-list">
        <tableAcquirer :conditional-url="acquirerUrl"/>
      </v-tab-item>

      <v-tab-item value="#transaction-list">
        <tableTransaction :conditional-url="transactionUrl"/>
      </v-tab-item>

      <v-tab-item value="#merchant-staff-list">
        <tableMerchantStaff :conditional-url="merchantStaffUrl"/>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import detail from '~/components/merchants/detail'
import { catchError } from '~/mixins'
import tableOutlet from '~/components/outlets'
import tableAgent from '~/components/agents'
import tableAcquirer from '~/components/acquirers'
import tableTransaction from '~/components/transactions'
import tableMerchantStaff from '~/components/merchantStaffs'

export default {
  components: {
    detail,
    tableOutlet,
    tableAgent,
    tableAcquirer,
    tableTransaction,
    tableMerchantStaff,
  },
  mixins: [catchError],
  data() {
    return {
      tabItem: [
        { text: 'Merchant Detail', to: '#detail-merchant' },
        { text: 'Outlet List', to: '#outlet-list' },
        { text: 'Agent List', to: '#agent-list' },
        { text: 'Acquirer List', to: '#acquirer-list' },
        { text: 'Transaction List', to: '#transaction-list' },
        { text: 'Merchant Staff List', to: '#merchant-staff-list' },
      ],
      tab: null,
      url: '/back_office/merchants',
      outletUrl: `&f[merchantId]=eq,${this.$route.params.id}`,
      agentUrl: `&f[outlet.merchantId]=eq,${this.$route.params.id}`,
      acquirerUrl: `&f[merchantId]=eq,${this.$route.params.id}`,
      transactionUrl: `&f[agent.outlet.merchantId]=eq,${this.$route.params.id}`,
      merchantStaffUrl: `f[merchantId]=eq,${this.$route.params.id}`,
      headerOutlets: [
        { text: 'Name', value: 'name' },
        { text: 'Business Type', value: 'businessType' },
        { text: 'Created At', value: 'createdAt', sortable: true },
        { text: 'Updated At', value: 'updatedAt', sortable: true },
      ],
      btnAddTextOutlet: 'Add Outlet',
      modalAddOutlet: false,
    }
  },
  computed: {
    currentEdit() {
      return this.$store.state.currentEdit
    },
  },
  async fetch({ store, params, redirect, $axios }) {
    try {
      let resp = await $axios.$get('/back_office/merchants/' + params.id)
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
