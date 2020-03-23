<template>
  <v-card class="mt-6" flat>
    <dform
      :initial-data="initialData"
      :permission-role="permissionRole"
      :btn-show-archive="btnShowArchive"
      @onSubmit="submit"
      @archive="archive"
      @unarchive="unarchived"
    ></dform>
  </v-card>
</template>

<script>
import formField from './formField'
import { catchError, toArchive } from '~/mixins'
import dform from './dform'

export default {
  components: {
    dform,
  },
  mixins: [catchError, toArchive],
  data() {
    return {
      formField: formField,
      url: `/back_office/card_iins`,
      initialData: {},
      permissionRole: 'adminMarketing',
      btnShowArchive: true,
    }
  },
  computed: {
    currentEdit() {
      return this.$store.state.currentEdit
    },
  },
  watch: {
    currentEdit() {
      this.populateInitialData()
    },
  },
  mounted() {
    this.populateInitialData()
  },
  methods: {
    async submit(data) {
      try {
        const postData = {
          name: data.name,
          pattern: data.pattern,
          priority: data.priority,
          cardTypeId: data.cardTypeId,
          cardSchemeId: data.cardSchemeId,
          cardIssuerId: data.cardIssuerId,
          description: data.description,
        }
        console.log('isi post data', postData)
        const response = await this.$axios.$put(
          `${this.url}/${this.$route.params.id}`,
          postData
        )
        if (response.status !== 'ent-406') {
          this.$store.commit('currentEdit', response.data)
          this.showSnackbar('success', `Data successfuly edited`)
        }
      } catch (e) {
        this.catchError(e)
      }
    },
    populateInitialData() {
      if (this.currentEdit) {
        this.initialData = {
          id: this.currentEdit.id,
          name: this.currentEdit.name ? this.currentEdit.name : '',
          pattern: this.currentEdit.pattern,
          priority: this.currentEdit.priority,
          validation: this.currentEdit.validation,
          cardTypeId: this.currentEdit.cardTypeId,
          cardSchemeId: this.currentEdit.cardSchemeId,
          cardIssuerId: this.currentEdit.cardIssuerId,
          description: this.currentEdit.description,
          createdAt: this.currentEdit.createdAt,
          archivedAt: this.currentEdit.archivedAt
            ? this.currentEdit.archivedAt
            : null,
        }
      }
    },
  },
}
</script>

<style></style>
