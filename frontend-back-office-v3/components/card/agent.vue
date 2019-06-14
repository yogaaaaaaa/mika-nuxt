<template>
  <div class="agent">
    <v-card>
      <v-card-title></v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field label="Name" v-model="agent.name" />
          <v-select label="Bounded to Terminal" />
          <v-text-field label="Username" v-model="username" />
          <v-text-field label="Outlet Name" v-model="outlet.name" />
          <v-text-field label="Merchant Name" v-model="outlet.merchantId"/>
          <v-text-field label="Created At" v-model="agent.createdAt" />
          <v-text-field label="Updated At" v-model="agent.updatedAt" />
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  props: {
    agent: {
      type: Object,
      default: () => ({
        params: value
      })
    },
    outlet: {
      type: Object,
      default: () => ({
        params1: value
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
