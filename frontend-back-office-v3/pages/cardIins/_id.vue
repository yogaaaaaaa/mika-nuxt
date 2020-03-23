<template>
  <div>
    <div class="breadcrumbs-wrapper">
      <v-breadcrumbs>
        <v-breadcrumbs-item to="/" exact>
          Dashboard
          <span class="ml-3">/</span>
        </v-breadcrumbs-item>
        <v-breadcrumbs-item to="/cardIins" exact>
          Card IINs
          <span class="ml-3">/</span>
        </v-breadcrumbs-item>
        <v-breadcrumbs-item>{{ currentEdit.name }}</v-breadcrumbs-item>
      </v-breadcrumbs>
    </div>
    <v-tabs>
      <v-tab href="#detail">Detail</v-tab>
      <v-tab-item :id="'detail'">
        <detail/>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import { catchError } from '~/mixins'
import detail from '~/components/cardIins/detail'
export default {
  components: { detail },
  mixins: [catchError],
  data() {
    return {}
  },
  computed: {
    currentEdit() {
      return this.$store.state.currentEdit
    },
  },
  async fetch({ store, params, redirect, $axios }) {
    try {
      let resp = await $axios.$get('/back_office/card_iins/' + params.id)
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
