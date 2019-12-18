<template>
  <div>
    <div class="page-title">
      <v-container fluid>
        <v-layout row wrap>
          <v-icon class="mr-2">confirmation_number</v-icon>
          <h2>Transaction Detail</h2>
        </v-layout>
      </v-container>
    </div>
    <detail />
  </div>
</template>

<script>
import detail from '~/components/transactions/detail'
import { catchError } from '~/mixins'

export default {
  components: {
    detail,
  },
  mixins: [catchError],
  data() {
    return {}
  },
  async fetch({ store, params, redirect, $axios }) {
    try {
      let resp = await $axios.$get('/back_office/transactions/' + params.id)
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
