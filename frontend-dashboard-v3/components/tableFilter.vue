<template>
  <v-card-title>
    <v-container grid-list-md>
      <v-layout row wrap>
        <v-flex md4 sm6 xs12>
          <v-combobox v-model="selectedFilterBy" :items="filterBy" label="Filter by"></v-combobox>
        </v-flex>
        <v-flex md4 sm6 xs12>
          <v-combobox v-model="operator" :items="operators" label="Operator"></v-combobox>
        </v-flex>
        <v-flex md4 sm6 xs12>
          <span v-if="filterValues.length > 0">
            <v-combobox
              v-model="filterValue"
              :items="filterValues"
              label="Filter Value"
              :disabled="filterValues.length === 0"
            ></v-combobox>
          </span>
          <span v-else>
            <v-text-field :disabled="selectedFilterBy === ''" v-model="filterValue"></v-text-field>
          </span>
        </v-flex>
      </v-layout>
      <v-layout row wrap>
        <v-spacer></v-spacer>
        <v-btn :loading="loading" @click="clearFilter" class="mr-3">Clear filter</v-btn>
        <v-btn
          color="primary"
          :disabled="!filterValue"
          :loading="loading"
          @click="applyFilter"
        >Apply filter</v-btn>
      </v-layout>
    </v-container>
  </v-card-title>
</template>

<script>
export default {
  props: {
    filterBy: {
      type: Array,
      required: true
    },

    filterValues: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      required: true
    }
  },
  data: () => ({
    selectedFilterBy: "",
    operator: null,
    filterValue: null,
    operators: [
      { text: "=", value: "eq" },
      { text: "<=", value: "lte" },
      { text: ">=", value: "gte" }
    ]
  }),
  watch: {
    selectedFilterBy() {
      this.filterValue = null;
      this.$emit("selectedFilterBy", this.selectedFilterBy);
    },
    operator() {
      this.$emit("operatorChange", this.operator);
    },
    filterValue() {
      this.$emit("filterValueChange", this.filterValue);
    }
  },
  mounted() {
    this.operator = this.operators[0];
  },
  methods: {
    clearFilter() {
      this.$emit("clearFilter");
    },
    applyFilter() {
      this.$emit("applyFilter");
    },
    clearFilter() {
      this.filterValue = null;
      this.selectedFilterBy = "";
      this.operator = this.operators[0];

      this.$emit("clearFilter");
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
