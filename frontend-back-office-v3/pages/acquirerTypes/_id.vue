<template>
  <div>
    <div class="breadcrumbs-wrapper">
      <v-breadcrumbs>
        <v-breadcrumbs-item to="/" exact>
          Dashboard
          <span class="ml-3">/</span>
        </v-breadcrumbs-item>
        <v-breadcrumbs-item to="/merchants" exact>
          Merhchant
          <span class="ml-3">/</span>
        </v-breadcrumbs-item>
        <v-breadcrumbs-item to="/outlets" exact>Outlet</v-breadcrumbs-item>
      </v-breadcrumbs>
    </div>
    <v-tabs>
      <v-tab href="#detail-outlet">Detail</v-tab>
      <v-tab href="#transaction-list">Transaction List</v-tab>
      <v-tab-item id="detail-outlet">
        <detail />
      </v-tab-item>
      <v-tab-item :id="'transaction-list'">
        <tableTransaction :conditional-url="transactionUrl" />
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import detail from '~/components/acquirerTypes/detail'
import tableTransaction from '~/components/transactions'
import { catchError } from '~/mixins'

export default {
  components: {
    detail,
    tableTransaction,
  },
  mixins: [catchError],
  data() {
    return {
      transactionUrl: `f[acquirerId]=eq,${this.$route.params.id}`,
    }
  },
  async fetch({ store, params, redirect, $axios }) {
    try {
      let resp = await $axios.$get('/back_office/acquirer_types/' + params.id)
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
