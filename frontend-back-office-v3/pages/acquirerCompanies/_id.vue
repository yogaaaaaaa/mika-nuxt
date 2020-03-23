<template>
  <div>
    <div class="breadcrumbs-wrapper">
      <v-breadcrumbs>
        <v-breadcrumbs-item to="/" exact>
          Dashboard
          <span class="ml-3">/</span>
        </v-breadcrumbs-item>
        <v-breadcrumbs-item to="/acquirerCompanies" exact>
          Acquirer Companies
          <span class="ml-3">/</span>
        </v-breadcrumbs-item>
        <v-breadcrumbs-item>{{ currentEdit.name }}</v-breadcrumbs-item>
      </v-breadcrumbs>
    </div>
    <v-tabs>
      <v-tab v-for="t in tabItem" :key="t.text" :href="`#${t.to}`">
        {{
        t.text
        }}
      </v-tab>
      <v-tab-item value="#detail">
        <detail/>
      </v-tab-item>
      <v-tab-item value="#staff-list">
        <tableAcquirerStaff :conditional-url="staffConditionalUrl" class="mt-6"/>
      </v-tab-item>
      <v-tab-item value="#acquirer-list">
        <tableAcquirer
          :conditional-url="staffConditionalUrl"
          :show-add-btn="showAddBtnAcquirer"
          :acquirer-company-id="acquirerCompanyId"
          class="mt-6"
        />
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import { catchError } from '~/mixins'
import detail from '~/components/acquirerCompanies/detail'
import tableAcquirerStaff from '~/components/acquirerStaffs'
import tableAcquirer from '~/components/acquirers'

export default {
  components: { detail, tableAcquirerStaff, tableAcquirer },
  mixins: [catchError],
  data() {
    return {
      tabItem: [
        { text: 'Detail', to: '#detail' },
        { text: 'Acquirer Staff List', to: '#staff-list' },
        { text: 'Acquirer List', to: '#acquirer-list' },
      ],
      staffConditionalUrl: `f[acquirerCompanyId]=eq,${this.$route.params.id}`,
      showAddBtnAcquirer: true,
      acquirerCompanyId: `${this.$route.params.id}`,
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
        '/back_office/acquirer_companies/' + params.id
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
