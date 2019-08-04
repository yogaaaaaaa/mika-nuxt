<template>
  <v-card-title>
    <v-container grid-list-md>
      <h3 class="subtitle-1">Column Filter</h3>
      <v-layout row wrap>
        <v-flex md3 sm6 xs12>
          <v-combobox v-model="selectedFilterBy" :items="filterBy" label="Filter by"></v-combobox>
        </v-flex>
        <v-flex md3 sm6 xs12>
          <v-combobox v-model="operator" :items="operators" label="Operator"></v-combobox>
        </v-flex>
        <v-flex md3 sm6 xs12>
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
        <v-flex md3 sm6 xs12>
          <date-picker v-model="date1" range :shortcuts="shortcuts" lang="en" width="100%"></date-picker>
        </v-flex>
      </v-layout>

      <v-layout row wrap class="mt-3">
        <v-spacer></v-spacer>
        <v-btn :loading="loading" @click="clearFilter" class="mr-3">Clear filter</v-btn>
        <v-btn
          color="primary"
          :disabled="btnDisabled"
          :loading="loading"
          @click="applyFilter"
        >Apply filter</v-btn>
      </v-layout>
    </v-container>
  </v-card-title>
</template>

<script>
import { datePickerShortcut } from "../mixins";
export default {
  mixins: [datePickerShortcut],
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
  data() {
    return {
      selectedFilterBy: null,
      operator: null,
      filterValue: null,
      operators: [
        { text: "=", value: "eq" },
        { text: "<=", value: "lte" },
        { text: ">=", value: "gte" }
      ],
      date1: null,
      shortcuts: [],
      btnDisabled: true
    };
  },
  watch: {
    selectedFilterBy() {
      if (this.selectedFilterBy) this.btnDisabled = false;
      this.filterValue = null;
      this.$emit("selectedFilterBy", this.selectedFilterBy);
    },
    operator() {
      this.$emit("operatorChange", this.operator);
    },
    filterValue() {
      this.$emit("filterValueChange", this.filterValue);
    },
    date1() {
      if (this.date1) this.btnDisabled = false;
      this.$emit("dateChange", this.date1);
    }
  },
  mounted() {
    this.shortcuts = this.generateShortcut();
    this.operator = this.operators[0];
  },
  methods: {
    checkFilterDisabled() {
      return true;
    },
    clearFilter() {
      this.$emit("clearFilter");
    },
    applyFilter() {
      this.$emit("applyFilter");
    },
    clearFilter() {
      this.filterValue = null;
      this.selectedFilterBy = null;
      this.operator = this.operators[0];
      this.date1 = null;
      this.btnDisabled = true;
      this.$emit("clearFilter");
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
