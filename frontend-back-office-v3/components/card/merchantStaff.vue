<template>
  <div class="merchant-staff-card">
    <v-card>
      <v-card-title></v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field v-model="staff.id" label="Id" />
          <v-text-field v-model="staff.name" label="Name" />
          <v-text-field v-model="username" label="Username" />
          <v-text-field v-model="staff.email" label="Email" />
          <v-text-field 
            v-model="staff.idCardNumber" 
            label="Id Card Number" 
          />
          <v-text-field v-model="staff.idCardType" label="Id Card Type" />
          <v-text-field v-model="staff.phoneNumber" label="Phone Number" />
          <v-text-field v-model="staff.occupation" label="Occupation" />  
          <v-text-field v-model="staff.merchantId" label="Merchant Name" />
          <v-text-field v-model="staff.createdAt" label="Created At" />
          <v-text-field v-model="staff.updatedAt" label="Updated At" />
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  props: {
    staff: {
      type: Object,
      default: () => ({
        params: value
      })
    },
    username: {
      type: String,
      required: true
    }
  }
}
</script>

<style>

</style>
