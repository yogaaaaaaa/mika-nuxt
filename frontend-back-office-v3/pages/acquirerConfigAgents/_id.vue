<template>
  <div>
    <div class="breadcrumbs-wrapper">
      <v-breadcrumbs>
        <v-breadcrumbs-item to="/" exact>
          Dashboard
          <span class="ml-3">/</span>
        </v-breadcrumbs-item>
        <v-breadcrumbs-item to="/acquirerConfigAgents" exact>
          Acquirer Config Agent
          <span class="ml-3">/</span>
        </v-breadcrumbs-item>
        <v-breadcrumbs-item exact>{{ currentEdit.name }}</v-breadcrumbs-item>
      </v-breadcrumbs>
    </div>
    <v-tabs>
      <v-tab href="#detail-config-agent">Detail</v-tab>
      <v-tab-item id="detail-config-agent">
        <detail/>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import detail from '~/components/acquirerConfigAgents/detail'
import { catchError } from '~/mixins'

export default {
  components: {
    detail,
  },
  mixins: [catchError],
  data() {
    return {
      transactionUrl: `f[acquirerId]=eq,${this.$route.params.id}`,
    }
  },
  computed: {
    currentEdit() {
      return this.$store.state.currentEdit
    },
  },
  async fetch({ store, params, redirect, $axios }) {
    try {
      let resp = await $axios.$get(
        '/back_office/acquirer_config_agents/' + params.id
      )
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
