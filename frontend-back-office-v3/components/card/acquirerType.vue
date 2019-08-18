<template>
  <div id="card-acquirer-type">
    <v-card>
      <v-card-title class="grey lighten-4 title blue--text">
        Edit Acquirer Type
        <v-spacer/>
        <v-icon @click="close">close</v-icon>
      </v-card-title>
      <v-form @submit.prevent="putAcquirerType()" class="pa-4">
        <v-card-text>
          <v-text-field v-model="name" label="Name"/>
          <div class="picker">Chart Color</div>
          <v-flex>
            <v-layout wrap>
              <chrome-picker v-model="chartColor" width="50%" class="mr-3"/>
              <v-text-field v-model="chartColor.hex" class="mt-4"/>
            </v-layout>
          </v-flex>
          <v-text-field v-model="typeClass" label="Class" class="mt-4"/>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn type="submit">Submit</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import { exit } from "~/mixins";
import { Chrome } from "vue-color";
import { mapState } from "vuex";

export default {
  components: {
    "chrome-picker": Chrome
  },
  mixins: [exit],
  watch: {
    acquirerType: {
      immediate: true,
      handler() {
        this.name = this.acquirerType.name;
        this.typeClass = this.acquirerType.class;
        this.chartColor = { hex: this.acquirerType.chartColor };
        this.merchantId = this.acquirerType.merchantId;
      }
    }
  },
  data() {
    return {
      chartColor: "",
      name: "",
      typeClass: "",
      handler: "",
      merchantId: ""
    };
  },
  computed: {
    ...mapState(["acquirerType"])
  },
  methods: {
    async putAcquirerType() {
      if (!this.chartColor.hex) {
        this.chartColor = { hex: this.acquirerType.chartColor };
      }
      await this.$axios
        .$put(`/api/back_office/acquirer_types/${this.$route.params.id}`, {
          name: this.name,
          class: this.typeClass,
          chartColor: this.chartColor.hex
        })
        .then(r => {
          this.refresh();
          this.close();
        })
        .catch(e => alert(e));
    }
  }
};
</script>

<style>
.picker {
  color: gray;
  font-size: 16px;
  margin-bottom: 5px;
}
</style>
