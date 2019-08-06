<template>
  <div id="acquirer-type">
    <v-card>
      <v-card-title class="grey lighten-4 py-4 title blue--text">
        Create Acquirer Type
        <v-spacer/>
        <v-icon @close="close">close</v-icon>
      </v-card-title>
      <v-form @submit.prevent="postAcquirerType" class="pa-4">
        <v-card-text>
          <v-text-field v-model="name" label="Name" name="name" v-validate="'required'"/>
          <span class="message-form">{{ errors.first('name') }}</span>
          <v-textarea v-model="description" label="Description"/>
          <div class="picker">Chart Color</div>
          <v-flex>
            <v-layout wrap>
              <chrome-picker v-model="chartColor" width="50%" class="mr-3"/>
              <v-text-field v-model="chartColor.hex" style="margin-top: 4em"/>
            </v-layout>
          </v-flex>
          <v-text-field
            v-model="typeClass"
            label="Class"
            class="mt-4"
            name="class"
            v-validate="'required'"
          />
          <span class="message-form">{{ errors.first('class') }}</span>
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
import { Chrome } from "vue-color";

export default {
  components: {
    "chrome-picker": Chrome
  },
  mixins: [exit],
  data() {
    return {
      name: "",
      acquirerTypeName: [],
      acquirerTypeId: "",
      merchantId: "",
      description: "",
      chartColor: "",
      typeClass: "",
      color: ""
    };
  },
  methods: {
    async postAcquirerType() {
      await this.$validator.validateAll().then(() => {
        if (!this.errors.any()) {
          this.$axios
            .$post("/api/back_office/acquirer_types", {
              name: this.name,
              class: this.typeClass,
              description: this.description,
              thumbnail: this.thumbnail,
              thumbnailGray: this.thumbnailGray,
              chartColor: this.chartColor.hex
            })
            .then(response => {
              alert(response.message);
              this.refresh();
              this.close();
            })
            .catch(error => {
              alert(error);
            });
        }
      });
    }
  }
};
</script>

<style>
.picker {
  color: gray;
  font-size: 16px;
  margin-bottom: 5px;
  margin-top: 10px;
}
</style>
