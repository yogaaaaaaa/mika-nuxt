<template>
  <v-card class="mt-6" flat>
    <formAdd
      :form-field="formField"
      :sm6="true"
      :initial-data="initialData"
      :permission-role="permissionRole"
      @onSubmit="submit"
      @archive="archive"
      @unarchived="unarchived"
    />
  </v-card>
</template>

<script>
import { formAdd } from '../commons'
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
      url: `/back_office/acquirer_staffs`,
      initialData: {},
      permissionRole: 'adminMarketing',
      acquirerCompanyId: `${this.$route.params.id}`,
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
          email: data.email,
          phoneNumber: data.phoneNumber,
          description: data.description,
          user: {
            username: data.username,
          },
        }
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
          name: this.currentEdit.name,
          username: this.currentEdit.user ? this.currentEdit.user.username : '',
          email: this.currentEdit.email,
          phoneNumber: this.currentEdit.phoneNumber,
          acquirerCompanyId: this.currentEdit.acquirerCompanyId,
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
