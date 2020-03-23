<template>
  <div>
    <pageTitle title="Fraud Rule List" icon="domain"></pageTitle>
    <v-card card flat>
      <v-card-title>
        <tableHeader
          :filter="headers"
          :btn-add-text="btnAddText"
          :permission-role="permissionRole"
          @showForm="createRule"
          @applyFilter="populateData"
          @downloadCsv="downloadCsv"
          @archived="populateData"
          @unarchived="populateData"
        />
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="items"
        :options.sync="options"
        :server-items-length="totalCount"
        :loading="loading"
        class="elevation-0 pa-2"
        :footer-props="footerProps"
      >
        <template v-slot:item.id="{ item }">
          <a @click="toDetail(item.id_merchant)">
            {{ item.merchant ? item.merchant : item.id_merchant }}
          </a>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import { catchError, tableMixin } from "~/mixins";
import debounce from "lodash/debounce";
import { tableHeader, pageTitle } from "~/components/commons";

export default {
  components: {
    tableHeader,
    pageTitle
  },
  mixins: [catchError, tableMixin],
  data() {
    return {
      url: "/back_office/fraud_detection/merchant_rules",
      btnAddText: "Add Rule",
      headers: [
        {
          text: "Merchant",
          align: "left",
          sortable: true,
          value: "id"
        }
      ],
      dataToDownload: [],
      permissionRole: "adminMarketing"
    };
  },
  watch: {
    options: {
      handler: debounce(function() {
        this.populateData();
      }, 500),
      deep: true
    }
  },
  mounted() {
    this.$store.dispatch("clearFilter");
    this.populateData();
  },
  methods: {
    async populateData() {
      try {
        this.loading = true;
        this.dataToDownload = [];
        const queries = this.getQueries();
        const response = await this.$axios.$get(this.url + queries);
        this.totalCount = response.meta ? response.meta.totalCount : 0;
        this.items = response.data;
        this.generateDownload(this.items);
        this.loading = false;
      } catch (e) {
        this.catchError(e);
      }
    },
    downloadCsv() {
      this.csvExport("FraudRules", this.dataToDownload);
    },
    generateDownload(data) {
      this.dataToDownload = data;
    },
    async submit(data) {
      try {
        const response = await this.$axios.$post(this.url, data);
        this.items.unshift(response.data);
        this.showSnackbar("success", `${this.btnAddText} success`);
      } catch (e) {
        this.catchError(e);
      }
    },
    toDetail(id) {
      this.$router.push(`/fraudRules/${id}`);
    },
    createRule() {
      this.$router.push("/fraudRules/create");
    }
  }
};
</script>

<style></style>
