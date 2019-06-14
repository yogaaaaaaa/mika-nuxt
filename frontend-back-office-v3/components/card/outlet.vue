<template>
  <div class="outlet">
    <v-card>
      <v-card-title></v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field v-model="outlet.idAlias" label="Id Alias" />
          <v-text-field v-model="outlet.name" label="Name" />
          <v-text-field v-model="outlet.status" label="Status" />
          <v-text-field v-model="outlet.email" label="Email" />
          <v-text-field v-model="outlet.website" label="Website" />
          <v-text-field v-model="outlet.phoneNumber" label="Phone Number" />
          <v-text-field v-model="outlet.ownershipType" label="Ownership Type" />
          <v-date-picker 
            :reactive="true"
            v-model="outlet.rentStartDate"
            label="Rent Start Date"
            color="blue lighten-1"
          />
          <v-text-field 
            v-model="outlet.rentDurationMonth" 
            label="Rent Duration Month" 
          />
          <v-text-field 
            v-model="outlet.otherPaymentSystem" 
            label="Other Payment System" 
          />
          <v-text-field v-model="outlet.businessType" label="Business Type" />
          <v-text-field 
            v-model="outlet.businessDurationMonth" 
            label="Business Duration Month" 
          />
          <v-text-field 
            v-model="outlet.businessMonthlyTurnover" 
            label="Business Monthly Turnover" 
          />
          <v-text-field 
            v-model="outlet.merchantId" 
            label="Merchant Name" 
          />
          <v-text-field v-model="outlet.createdAt" label="Created At" />
          <v-text-field v-model="outlet.updatedAt" label="Updated At" />
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  props: {
    outlet: {
      type: Object,
      default: () => ({
        params1: value
      })
    }
  },
  data() {
    return {
      rentStartDate: ""
    }
  }
}
</script>

<style>

</style>
