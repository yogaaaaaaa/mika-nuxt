<template>
  <div>
    <div class="title">
      <v-icon class="mb-3">bug_report</v-icon>
      {{ rule.merchant }} Rule
    </div>
    <v-tabs>
      <v-tab href="#recency">Recency</v-tab>
      <v-tab href="#frequency">Frequency</v-tab>
      <v-tab href="#monetary">Monetary</v-tab>
      <v-tab href="#velocity">Velocity</v-tab>
      <v-tab-item id="recency">
        <recency />
      </v-tab-item>
      <v-tab-item id="frequency">
        <frequency />
      </v-tab-item>
      <v-tab-item id="monetary">
        <monetary />
      </v-tab-item>
      <v-tab-item id="velocity">
        <velocity />
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import recency from '~/components/fraudRules/recency'
import frequency from '~/components/fraudRules/frequency'
import monetary from '~/components/fraudRules/monetary'
import velocity from '~/components/fraudRules/velocity'
export default {
  components: { recency, frequency, monetary, velocity },
  computed: {
    rule() {
      return this.$store.state.currentEdit
    },
  },
  async fetch({ store, params, redirect, $axios }) {
    try {
      let resp = await $axios.$get(
        '/back_office/fraud-detections/rules/' + params.id
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

<style lang="scss" scoped></style>
