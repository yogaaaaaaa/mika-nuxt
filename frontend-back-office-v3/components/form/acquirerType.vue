<template>
  <div class="acquirer-type">
    <v-form>
      <v-text-field v-model="name" label="Name"/>
      <v-select
        :items="merchantName"
        item-text="name"
        item-value="id"
        v-model="merchantId"
        label="Merchant Name"
      />
      <v-select
        :items="acquirerTypeName"
        item-text="name"
        item-value="id"
        v-model="acquirerTypeId"
        label="Acquirer Name"
      />
    </v-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: "",
      acquirerTypeName: [],
      acquirerTypeId: "",
      merchantName: [],
      merchantId: ""
    };
  },
  methods: {
    async postPaymentProviderType() {
      await this.$validate.validateAll().then(() => {
        this.$axios
          .$post("/marketing/acquirerType", {
            name: this.name,
            class: this.classes,
            description: this.description,
            thumbnail: this.thumbnail,
            thumbnailGray: this.thumbnailGray,
            chartColor: this.chartColor
          })
          .then(response => {
            alert(response);
          })
          .catch(error => {
            alert(error);
          });
      });
    }
  }
};
</script>

<style>
</style>
