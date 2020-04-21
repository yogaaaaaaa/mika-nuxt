<template>
  <v-card class="mt-6" flat>
    <formAdd
      :form-field="formField"
      :initial-data="initialData"
      :permission-role="permissionRole"
      :sm6="true"
      @onSubmit="submit"
      @archive="archive"
      @unarchived="unarchived"
    />
  </v-card>
</template>

<script>
import { formAdd } from '~/components/commons'
import formField from './formField'
import { catchError, toArchive } from '~/mixins'

export default {
  components: {
    formAdd,
  },
  mixins: [catchError, toArchive],
  data() {
    return {
      formField: formField,
      permissionRole: 'adminMarketing',
      url: `/back_office/acquirer_types`,
      initialData: {},
    }
  },
  computed: {
    currentEdit() {
      return this.$store.state.currentEdit
    },
  },
  mounted() {
    this.populateInitialData()
  },
  methods: {
    async submit(data) {
      try {
        const response = await this.$axios.$put(
          `${this.url}/${this.$route.params.id}`,
          data
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
          class: this.currentEdit.class,
          name: this.currentEdit.name,
          description: this.currentEdit.description,
          thumbnail: this.currentEdit.thumbnail,
          thumbnailGray: this.currentEdit.thumbnailGray,
          chartColor: this.currentEdit.chartColor,
          createdAt: this.currentEdit.createdAt,
          archivedAt: this.currentEdit.archivedAt,
        }
      }
    },
  },
}
</script>

<style></style>
