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
import formField from './formFieldEdit'
import { catchError, toArchive } from '~/mixins'

export default {
  components: {
    formAdd,
  },
  mixins: [catchError, toArchive],
  data() {
    return {
      formField: formField,
      url: `/back_office/merchant_staffs`,
      initialData: {},
      permissionRole: 'adminMarketing',
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
          description: data.description,
          email: data.email,
          idCardNumber: data.idCardNumber,
          idCardType: data.idCardType,
          locationLong: data.locationLong,
          locationLat: data.locationLat,
          occupation: data.occupation,
          streetAddress: data.streetAddress,
          locality: data.locality,
          district: data.district,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode,
          phoneNumber: data.phoneNumber,
          merchantId: data.merchantId,
          user: {
            username: data.username,
            password: data.password,
          },
        }
        const response = await this.$axios.$put(
          `${this.url}/${this.currentEdit.id}`,
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
          idCardNumber: this.currentEdit.idCardNumber,
          idCardType: this.currentEdit.idCardType,
          description: this.currentEdit.description,
          locationLong: this.currentEdit.locationLong,
          locationLat: this.currentEdit.locationLat,
          occupation: this.currentEdit.occupation,
          streetAddress: this.currentEdit.streetAddress,
          locality: this.currentEdit.locality,
          district: this.currentEdit.district,
          city: this.currentEdit.city,
          province: this.currentEdit.province,
          postalCode: this.currentEdit.postalCode,
          phoneNumber: this.currentEdit.phoneNumber,
          merchantId: this.currentEdit.merchantId,
          createdAt: this.currentEdit.createdAt,
          archivedAt: this.currentEdit.archivedAt,
        }
      }
    },
  },
}
</script>

<style></style>
