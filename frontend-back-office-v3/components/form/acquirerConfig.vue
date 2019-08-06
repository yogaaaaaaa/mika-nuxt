<template>
  <div class="acquirer-config-form">
    <v-card>
      <v-card-title class="grey lighten-4 py-4 title blue--text">
        Create Acquirer Config
        <v-spacer/>
        <v-icon @click="close">close</v-icon>
      </v-card-title>
      <v-form @submit.prevent="postAcquirerConfig">
        <v-card-text>
          <v-text-field v-model="name" label="Name" name="name" v-validate="'required'"/>
          <span class="message-form">{{ errors.first('name') }}</span>
          <v-text-field v-model="description" label="Description"/>
          <v-text-field v-model="handler" label="Handler" name="handler" v-validate="'required'"/>
          <span class="message-form">{{ errors.first('handler') }}</span>
          <v-select v-model="sandbox" :items="items" label="Sandbox"/>
          <v-select
            :items="merchants"
            item-text="name"
            item-value="id"
            v-model="merchantId"
            label="Merchant Name"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn type="submit">Submit</v-btn>
          <v-btn>Reset</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import { exit } from "~/mixins";

export default {
  props: {
    merchants: {
      type: Array,
      default: () => []
    }
  },
  mixins: [exit],
  data() {
    return {
      name: "",
      description: "",
      handler: "",
      sandbox: "",
      merchantId: "",
      merchantName: [],
      items: [true, false]
    };
  },
  methods: {
    // async postAcquirerConfig() {
    //   await this.$validator.validateAll().then(() => {
    //     if (!this.errors.any()) {
    //       console.log("success");
    //     }
    //     return console.log("error validator");
    //   });
    // }
    async postAcquirerConfig() {
      if (!this.merchantId) {
        this.merchantId = null;
      }
      await this.$validator.validateAll().then(() =>
        this.$axios
          .$post("/api/back_office/acquirer_configs", {
            name: this.name,
            description: this.description,
            handler: this.handler,
            sandbox: this.sandbox,
            merchantId: this.merchantId
          })
          .then(response => {
            alert(response.message);
            this.refresh();
            this.close();
          })
          .catch(error => {
            alert(error);
          })
      );
    }
  }
};
</script>

<style>
</style>
