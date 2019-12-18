<template>
  <div class="mt-6" flat>
    <v-toolbar flat class="mb-3">
      <v-spacer />
      <tooltip icon="add" :tooltip-text="btnAddText" @onClick="openDialog" />
      <tooltip
        icon="remove"
        :tooltip-text="btnRemoveText"
        @onClick="showSelected = !showSelected"
      />
    </v-toolbar>
    <v-data-table
      v-model="itemSelected"
      :headers="headers"
      :items="items"
      item-key="name"
      :show-select="showSelected"
    >
      <template v-slot:item.createdAt="{ item }">{{
        $moment(item.createdAt).format('YYYY-MM-DD')
      }}</template>
      <template v-slot:item.archivedAt="{ item }">
        <div v-if="item.archivedAt">
          {{ $moment(item.archivedAt).format('YYYY-MM-DD') }}
        </div>
        <span v-else>-</span>
      </template>
    </v-data-table>
    <v-toolbar flat>
      <v-spacer />
      <v-btn v-if="showSelected == true" color="primary" @click="dissociate">
        <v-icon left>save</v-icon>Save
      </v-btn>
    </v-toolbar>
    <v-dialog v-model="listOutlet">
      <associateOutlet
        :headers="headers"
        :items="dissociateOutlets"
        @onClose="assignOutlets"
      />
    </v-dialog>
  </div>
</template>

<script>
import { catchError } from '~/mixins'
import { mapState } from 'vuex'
import tooltipButton from '~/components/commons/tooltipButton'
import associateOutlet from './associate'

export default {
  components: {
    tooltip: tooltipButton,
    associateOutlet,
  },
  mixins: [catchError],
  data() {
    return {
      items: [],
      itemSelected: [],
      url: `back_office/merchant_staffs/${this.$route.params.id}/outlets?`,
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Business Type', value: 'businessType', sortable: false },
        { text: 'Created At', value: 'createdAt' },
        { text: 'Archived At', value: 'archivedAt', align: 'center' },
      ],
      urlNonAssociate: `/back_office/merchant_staffs/${this.$route.params.id}/unassociated_outlets`,
      btnAddText: 'Add associate outlet',
      btnRemoveText: 'Dissociate outlet',
      listOutlet: false,
      showSelected: false,
      dissociateOutlets: [],
    }
  },
  computed: {
    ...mapState(['currentEdit']),
  },
  mounted() {
    this.assignOutlets()
  },
  methods: {
    async assignOutlets() {
      try {
        this.loading = true
        const response = await this.$axios.$get(this.url)
        this.items = response.data
        this.loading = false
        this.listOutlet = false
      } catch (e) {
        this.catchError(e)
      }
    },
    async dissociate() {
      try {
        const postData = {
          outletIds: [this.itemSelected.map(f => f.id)],
        }
        const response = await this.$axios.$post(
          `/back_office/merchant_staffs/${this.$route.params.id}/dissociate_outlets`,
          postData
        )
        if (response.status === 'ent-211') {
          this.showSnackbar('success', response.message)
          this.showSelected = false
          this.itemSelected = []
          this.assignOutlets()
        }
      } catch (e) {
        this.catchError(e)
      }
    },
    async populateNonAssociate() {
      try {
        const response = await this.$axios.$get(this.urlNonAssociate)
        this.dissociateOutlets = response.data
        this.$store.commit('nonAssociate', response.data)
      } catch (e) {
        this.catchError(e)
      }
    },
    openDialog() {
      this.listOutlet = true
      this.populateNonAssociate()
    },
  },
}
</script>

<style></style>
