<template>
  <v-card class="mt-6" flat>
    <dform
      :show-toolbar="show"
      :form-field="formField"
      :initial-data="initialData"
      :permission-role="permissionRole"
      :btn-show-archive="btnShowArchive"
      @archive="archive"
      @unarchive="unarchived"
      @onSubmit="submit"
    />
  </v-card>
</template>

<script>
import dform from './dform'
import formFieldEdit from './formField'
import { catchError, toArchive } from '~/mixins'

export default {
  components: {
    dform,
  },
  mixins: [catchError, toArchive],
  data() {
    return {
      formField: formFieldEdit,
      permissionRole: 'adminMarketing',
      url: `/back_office/acquirer_terminal_commons`,
      initialData: {},
      show: false,
      btnShowArchive: true,
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
    prettier(value) {
      return JSON.stringify(value, undefined, '\t')
    },
    async submit(data) {
      try {
        data.formData.config = JSON.parse(data.formData.config)
        const response = await this.$axios.$put(
          `${this.url}/${this.$route.params.id}`,
          data.formData
        )
        if (response.status !== 'ent-406') {
          response.data.config = this.prettier(response.data.config)
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
          name: this.currentEdit.name,
          acquirerCompanyId: this.currentEdit.acquirerCompanyId,
          // acquirerCompanyName: this.currentEdit.acquirerCompany.name,
          config: this.prettier(this.currentEdit.config),
          description: this.currentEdit.description,
          createdAt: this.currentEdit.createdAt,
          archivedAt: this.currentEdit.archivedAt,
        }
      }
    },
  },
}
</script>

<style></style>
