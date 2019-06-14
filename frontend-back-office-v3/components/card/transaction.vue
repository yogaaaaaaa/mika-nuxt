<template>
  <div id="card-transaction">
    <v-card>
      <v-card-text>
        <v-form>
          <v-text-field v-model="transaction.idAlias" label="Id Alias" />
          <v-text-field v-model="transaction.amount" label="Amount" />
          <v-text-field v-model="transaction.status" label="Status" />
          <v-text-field v-model="agent.name" label="Agent Name" />
          <v-text-field v-model="outlet.name" label="Outlet Name" />
          <v-text-field v-model="acquirer.name" label="Acquirer Name" />
          <v-text-field v-model="acquirerType.name" label="Acquirer Type Name" />
          <v-text-field v-model="transaction.createdAt" label="Created At" />
          <v-text-field v-model="transaction.updatedAt" label="Updated At" />
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  props: {
    transaction: {
      type: Object,
      default: () => ({
        params: value
      })
    },
    agent: {
      type: Object,
      default: () => ({
        params: value
      })
    },
    outlet: {
      type: Object,
      default: () => ({
        params: value
      })
    },
    acquirer: {
      type: Object,
      default: () => ({
        params: value
      })
    },
    acquirerType: {
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
