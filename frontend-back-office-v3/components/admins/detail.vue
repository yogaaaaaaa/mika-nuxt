<template>
  <v-card class="mt-6" flat>
    <formAdd
      :form-field="formField"
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
import formField from './formFieldEdit'
import { catchError, toArchive } from '~/mixins'
export default {
  components: {
    formAdd,
  },
  mixins: [catchError, toArchive],
  data() {
    return {
      url: '/back_office/admins',
      formField: formField,
      initialData: {},
      permissionRole: 'adminHead',
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
          description: data.description,
          user: {
            username: data.username,
          },
        }
        const response = await this.$axios.$put(
          `${this.url}/${this.currentEdit.id}`,
          postData
        )
        if (response.status == 'ent-202') {
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
