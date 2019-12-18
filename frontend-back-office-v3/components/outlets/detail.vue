<template>
  <v-card class="mt-6" flat>
    <formAdd
      :form-field="formField"
      :initial-data="initialData"
      :sm6="true"
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
      url: `/back_office/outlets`,
      initialData: {},
      permissionRole: 'adminMarketing',
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
        const postData = {
          idAlias: data.idAlias,
          name: data.name,
          status: data.status,
          email: data.email,
          website: data.website,
          phoneNumber: data.phoneNumber,
          locationLat: data.locationLat,
          locationLong: data.locationLong,
          streetAddress: data.streetAddress,
          locality: data.locality,
          district: data.district,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode,
          ownershipType: data.ownershipType,
          rentStartDate: data.rentStartDate,
          rentDurationMonth: data.rentDurationMonth,
          otherPaymentSystem: data.otherPaymentSystem,
          businessType: data.businessType,
          businessDurationMonth: data.businessDurationMonth,
          businessMonthlyTurnover: data.businessMonthlyTurnover,
          merchant: {
            name: data.merchantName,
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
          idAlias: this.currentEdit.idAlias,
          name: this.currentEdit.name,
          status: this.currentEdit.status,
          email: this.currentEdit.email,
          website: this.currentEdit.website,
          phoneNumber: this.currentEdit.phoneNumber,
          locationLat: this.currentEdit.locationLat,
          locationLong: this.currentEdit.locationLong,
          streetAddress: this.currentEdit.streetAddress,
          locality: this.currentEdit.locality,
          district: this.currentEdit.district,
          city: this.currentEdit.city,
          province: this.currentEdit.province,
          postalCode: this.currentEdit.postalCode,
          ownershipType: this.currentEdit.ownershipType,
          rentStartDate: this.currentEdit.rentStartDate,
          rentDurationMonth: this.currentEdit.rentDurationMonth,
          otherPaymentSystem: this.currentEdit.otherPaymentSystem,
          businessType: this.currentEdit.businessType,
          businessDurationMonth: this.currentEdit.businessDurationMonth,
          businessMonthlyTurnover: this.currentEdit.businessMonthlyTurnover,
          merchantId: this.currentEdit.merchantId,
          merchantName: this.currentEdit.merchant.name,
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
