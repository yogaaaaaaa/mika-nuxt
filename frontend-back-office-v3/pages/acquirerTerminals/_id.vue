<template>
  <div>
    <div class="breadcrumbs-wrapper">
      <v-breadcrumbs>
        <v-breadcrumbs-item to="/" exact>
          Dashboard
          <span class="ml-3">/</span>
        </v-breadcrumbs-item>
        <v-breadcrumbs-item to="/acquirerTerminals" exact>
          Acquirer Terminal
          <span class="ml-3">/ {{ currentEdit.tid }}</span>
        </v-breadcrumbs-item>
      </v-breadcrumbs>
    </div>
    <v-tabs>
      <v-tab href="#detail-outlet">Detail</v-tab>
      <v-tab-item id="detail-outlet">
        <detail/>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import detail from '~/components/acquirerTerminals/detail'
import { catchError } from '~/mixins'
import { mapState } from 'vuex'

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
    ...mapState(['currentEdit']),
  },
  async fetch({ store, params, redirect, $axios }) {
    try {
      let resp = await $axios.$get(
        '/back_office/acquirer_terminals/' + params.id
      )
      store.commit('currentEdit', resp.data)
    } catch (e) {
      if (process.client) {
        this.catchError(e)
      } else {
        redirect('/')
      }
    }
  },
}
</script>

<style></style>
