<template>
  <div id="card-acquirer-config">
    <v-card>
      <v-card-text>
        <v-form>
          <v-text-field v-model="config.name" label="Name" />
          <v-text-field v-model="config.handler" label="Handler" />
          <v-select label="Sandbox" />
          <v-text-field v-model="config.merchantId" label="Merchant Name" />
          <v-text-field v-model="config.createdAt" label="Created At" />
          <v-text-field v-model="config.updatedAt" label="Updated At" />
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>

export default {
  props: {
    config: {
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
