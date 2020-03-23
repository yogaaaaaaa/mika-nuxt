<template>
  <v-card class="mt-6" flat>
    <formAdd
      :form-field="formField"
      :sm6="true"
      :initial-data="currentEdit"
      :permission-role="permissionRole"
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
      url: `/back_office/merchants`,
    }
  },
  computed: {
    currentEdit() {
      return this.$store.state.currentEdit
    },
  },
  methods: {
    async submit(data) {
      try {
        const postData = {
          name: data.name,
          companyForm: data.companyForm,
          email: data.email,
          website: data.website,
          phoneNumber: data.phoneNumber,
          taxCardNumer: data.taxCardNumber,
          bankName: data.bankName,
          bankBranchName: data.bankBranchName,
          bankaAccountName: data.bankAccountName,
          ownerName: data.ownerName,
          ownerEmail: data.ownerEmail,
          ownerPhoneNumber: data.ownerPhoneNumber,
          ownerIdCardNumber: data.ownerIdCardNumber,
          ownerIdCardType: data.ownerIdCardType,
          ownerTaxCardNumber: data.ownerTaxCardNumber,
          description: data.description,
          logo: data.logo,
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
    async archive() {
      try {
        const response = await this.$axios.$put(
          `${this.url}/${this.$route.params.id}`,
          {
            archivedAt: true,
          }
        )
        if (response.status !== 'ent-406') {
          this.$store.commit('currentEdit', response.data)
          this.showSnackbar('success', `Data successfuly archived`)
        }
        this.$router.push('/merchants')
      } catch (e) {
        this.catchError(e)
      }
    },
  },
}
</script>

<style></style>
