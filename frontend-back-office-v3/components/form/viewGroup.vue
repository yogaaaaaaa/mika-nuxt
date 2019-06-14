<template>
  <div class="view-group">
    <v-form @submit.prevent="postViewGroup">
      <v-text-field v-model="name" label="Name" />
      <v-text-field v-model="slug" label="Slug" />
      <v-text-field v-model="merchantId" label="Merchant Id">
    </v-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: "",
      description: "",
      slug: "",
      merchantId: ""
    }
  },
  methods: {
    async postViewGroup() {
      await this.$validate.validateAll().then(() => {
        this.$axios.$post("/marketing/view_group", {
          name: this.name,
          description: this.description,
          slug: this.slug,
          merchantId: this.merchantId
        })
      }).then(response => {
        alert(response)
      }).catch(error => {
        alert(error)
      })
    }
  }
}
</script>

<style>

</style>
