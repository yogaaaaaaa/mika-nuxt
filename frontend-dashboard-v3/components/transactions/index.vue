<template>
  <v-card flat class="mt-5">
    <table-filter
      :filterBy="filterBy"
      @selectedFilterBy="handelSelectedFilterBy"
      @operatorChange="handleOperatorChange"
      :filterValues="filterValues"
      @filterValueChange="handleFilterValueChange"
      @clearFilter="clearFilter"
      @applyFilter="populateTable"
      :loading="loading"
      @dateChange="handleDateChange"
      :data-to-download="dataToDownload"
    />
    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="items"
        :options.sync="options"
        :server-items-length="total"
        :loading="loading"
        :footer-props="footerProps"
      >
        <template v-slot:item.createdAt="{ item }">
          <v-chip>{{ dateFilter(item.createdAt) }}</v-chip>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
import { transaction } from "~/mixins";
import { TRANSACTION_URL } from "~/lib/apis";
import parseDataToDownload from "~/lib/parseDataToDownload";
import debounce from "lodash/debounce";
import tableFilter from "~/components/commons/tableFilter";
export default {
  mixins: [transaction],
  components: { tableFilter },
  data: () => ({
    headers: [
      {
        text: "Agent",
        value: "agent.name",
        sortable: false,
        filterAs: "agentId"
      },
      {
        text: "Acquirer",
        value: "acquirer.name",
        sortable: false,
        filterAs: "acquirerId"
      },
      {
        text: "Outlet",
        value: "agent.outlet.name",
        sortable: false,
        filterAs: "agent.outletId"
      },
      {
        text: "Amount",
        value: "amount"
      },
      {
        text: "Status",
        value: "status"
      },
      {
        text: "Date",
        value: "createdAt"
      }
    ],

    filterSelectable: [
      { key: "agentId", value: "agent" },
      { key: "acquirerId", value: "acquirer" },
      { key: "status", value: "status" },
      { key: "agent.outletId", value: "agent.outlet" }
    ],
    dataToDownload: []
  }),
  mounted() {
    this.populateTable();
    this.setFilterBy();
  },
  watch: {
    options: {
      handler: debounce(function() {
        this.populateTable();
      }, 500),
      deep: true
    },
    selectedFilterBy() {
      if (this.selectedFilterBy) {
        this.getFilterValues(this.selectedFilterBy.value);
      }
    }
  },
  methods: {
    async populateTable() {
      try {
        this.loading = true;
        const { sortBy, descending, page, itemsPerPage } = this.options;
        const queries = this.getQueries();
        const resp = await this.$axios.$get(TRANSACTION_URL + queries);
        let items = resp.data;
        // console.log(items);
        this.total = resp.meta ? resp.meta.totalCount : 0;
        if (this.options.sortBy) {
          items = items.sort((a, b) => {
            const sortA = a[sortBy];
            const sortB = b[sortBy];

            if (descending) {
              if (sortA < sortB) return 1;
              if (sortA > sortB) return -1;
              return 0;
            } else {
              if (sortA < sortB) return -1;
              if (sortA > sortB) return 1;
              return 0;
            }
          });
        }
        this.items = items;
        this.dataToDownload = parseDataToDownload("merchant", items);

        this.loading = false;
      } catch (e) {
        this.catchError(e);
      }
    }
  }
};
</script>

