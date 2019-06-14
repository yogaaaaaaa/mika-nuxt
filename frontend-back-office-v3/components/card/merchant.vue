<template>
  <div id="merchant" class="mb-2">
    <v-card class="pa-3">
      <v-card-title></v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field label="Id Alias" v-model="merchant.idAlias"/>
          <v-text-field label="Name" v-model="merchant.name" />
          <v-text-field label="Short Name" v-model="merchant.shortName" />
          <v-text-field label="Status" v-model="merchant.status" />
          <v-text-field label="Company Form" v-model="merchant.companyForm" />
          <v-text-field label="Email" v-model="merchant.email" />
          <v-text-field label="Website" v-model="merchant.website" />
          <v-text-field label="Phone Number" v-model="merchant.phoneNumber" />
          <v-text-field label="Id Tax Card" />
          <v-text-field label="Bank Name" v-model="merchant.bankName" />
          <v-text-field label="Bank Branch Name" v-model="merchant.bankBranchName" />
          <v-text-field label="Bank Account Name" v-model="merchant.bankAccountName" />
          <v-text-field label="Bank Account Number" v-model="merchant.bankAccountNumber" />
          <v-text-field label="Partner Name" v-model="merchant.partnerId" />
          <v-text-field label="Created At" v-model="merchant.createdAt" />
          <v-text-field label="Updated At" v-model="merchant.updatedAt" />
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  props: {
    merchant: {
      type: Object,
      required: true
    }
  }
}
</script>

<style>

</style>
