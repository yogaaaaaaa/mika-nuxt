<template>
  <v-card>
    <v-toolbar color="primary" dark flat class="mb-4">
      <v-toolbar-title>{{ btnAddText }}</v-toolbar-title>
      <v-spacer />
      <v-btn icon dark>
        <v-icon @click="close">close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-data-table
      v-model="itemSelected"
      :headers="headers"
      :items="items"
      item-key="name"
      show-select
    >
      <template v-slot:item.createdAt="{ item }">
        {{ $moment(item.createdAt).format('YYYY-MM-DD') }}
      </template>
      <template v-slot:item.archivedAt="{ item }">
        <div v-if="item.archivedAt">
          {{ $moment(item.archivedAt).format('YYYY-MM-DD') }}
        </div>
        <span v-else>-</span>
      </template>
    </v-data-table>
    <v-toolbar flat>
      <v-spacer />
      <v-btn color="primary" @click="associateOutlets">
        <v-icon left>save</v-icon>Save
      </v-btn>
    </v-toolbar>
  </v-card>
</template>

<script>
import { catchError } from '~/mixins'

export default {
  mixins: [catchError],
  props: {
    headers: {
      type: Array,
      required: true,
    },
    items: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  data() {
    return {
      itemSelected: [],
      url: `/back_office/merchant_staffs/${this.$route.params.id}/unassociated_outlets?`,
      urlAssociate: `/back_office/merchant_staffs/${this.$route.params.id}/associate_outlets`,
      btnAddText: 'Associate Outlet',
    }
  },
  methods: {
    async associateOutlets() {
      try {
        const postData = {
          outletIds: this.itemSelected.map(f => f.id),
        }
        const response = await this.$axios.$post(this.urlAssociate, postData)
        if (response.status === 'ent-210') {
          this.showSnackbar('success', response.message)
          this.itemSelected = []
          this.close()
        }
      } catch (e) {
        this.catchError(e)
      }
    },
    close() {
      this.$emit('onClose')
    },
  },
}
</script>

<style></style>
