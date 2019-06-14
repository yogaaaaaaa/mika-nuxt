<template>
  <div class="acquirer-card">
    <v-card>
      <v-card-title></v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field v-model="acquirer.id" label="Id"  />
          <v-text-field v-model="acquirer.name" label="Name" />
          <v-text-field v-model="acquirer.maxiumumAmount" label="Maximum Amount" />
          <v-text-field v-model="acquirer.minimumAmount" label="Minimum Amount" />
          <v-text-field v-model="acquirer.shareMerchant" label="Share Merchant" />
          <v-text-field 
            v-model="acquirer.shareMerchantWithPartner" 
            label="Share Merchant with Partner" 
          />
          <v-text-field v-model="acquirer.sharePartner" label="Share Partner" />
          <v-select label="Direct Settlement"></v-select>
          <v-select label="Gateway"></v-select>
          <v-select label="Hidden"></v-select>
          <v-text-field v-model="acquirer.merchantId" label="Merchant Name" />
          <v-text-field 
            v-model="acquirer.acquirerConfigId" 
            label="Acquirer Config Id" 
          />
          <v-text-field 
            v-model="acquirer.acquirerTypeId" 
            label="Acquirer Type Id" 
          />
          <v-text-field v-model="acquirer.createdAt" label="Created At" />
          <v-text-field v-model="acquirer.updatedAt" label="Updated At" />
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  props: {
    acquirer: {
      type: Object,
      default: () => ({
        params: value
      })
    }
  }
}
</script>

<style>

</style>
