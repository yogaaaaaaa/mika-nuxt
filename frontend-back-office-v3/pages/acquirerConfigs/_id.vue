<template>
  <div>
    <div class="breadcrumbs-wrapper">
      <v-breadcrumbs>
        <v-breadcrumbs-item to="/" exact>
          Dashboard
          <span class="ml-3">/</span>
        </v-breadcrumbs-item>
        <v-breadcrumbs-item to="/acquirerConfigs" exact>
          Acquirer Configs
          <span class="ml-3">/</span>
        </v-breadcrumbs-item>
        <v-breadcrumbs-item to="/acquirerConfigs/" exact>{{ currentEdit.name }}</v-breadcrumbs-item>
      </v-breadcrumbs>
    </div>
    <v-tabs>
      <v-tab href="#detail-acquirer-config">Detail</v-tab>
      <v-tab href="#transaction-list">Transaction List</v-tab>
      <v-tab-item id="detail-acquirer-config">
        <detail/>
      </v-tab-item>
      <v-tab-item :id="'transaction-list'">
        <tableTransaction :conditional-url="transactionUrl"/>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import detail from '~/components/acquirerConfigs/detail'
import tableTransaction from '~/components/transactions'
import { catchError } from '~/mixins'
import { mapState } from 'vuex'

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
  computed: {
    ...mapState(['currentEdit']),
  },
  async fetch({ store, params, redirect, $axios }) {
    try {
      let resp = await $axios.$get('/back_office/acquirer_configs/' + params.id)
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
