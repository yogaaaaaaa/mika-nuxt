<template>
  <div class="acquirer-config-form">
    <v-form @submit.prevent="postAcquirerConfig">
      <v-text-field
        v-model="name"
        label="Name"
      />
      <v-text-field
        v-model="description"
        label="Description"
      />
      <v-text-field
        v-model="handler"
        label="Handler"
      />
      <v-select
        v-model="sandbox"
        label="Sandbox"
      />
      <v-select
        :items="merchantName"
        :item-text="name"
        :item-value="id"
        v-model="merchantId"
        label="Merchant Name"
      >
    </v-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: "",
      description: "",
      handler: "",
      sandbox: false,
      merchantId: "",
      merchantName: []
    }
  },
  methods: {
    async postAcquirerConfig() {
      await this.$validate.validateAll().then (() =>
        this.$axios.$post("/marketing/acquirer_config", {
          name: this.name,
          description: this.description,
          handler: this.handler,
          sandbox: this.sandbox,
          merchantId: this.merchantId
        }).then(response => {
          alert(response)
        }).catch(error => {
          alert(error)
        })
      )
    }
  }
}
</script>

<style>

</style>
