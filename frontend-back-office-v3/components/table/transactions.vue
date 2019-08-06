<template>
  <div id="transaction-table" style="margin:2em">
    <v-container text-xs-center v-if="loading">
      <v-flex>
        <v-progress-circular :size="60" color="blue" indeterminate/>
      </v-flex>
    </v-container>
    <div v-if="!loading">
      <v-form @submit.prevent="filterTransactions(page)">
        <v-layout wrap class="mb-4">
          <v-flex xs12 md10 class="pr-2">
            <v-layout>
              <date-picker
                class="pl-2 pt-3 mr-3"
                v-model="value1"
                range
                lang="en"
                width="50%"
                :not-after="max"
                :shortcuts="shortcuts"
              />
              <v-select
                :items="merchants"
                item-text="name"
                item-value="id"
                v-model="merchantId"
                label="Merchant Name"
                class="ml-3"
                v-if="showMerchant"
              />
            </v-layout>
          </v-flex>
          <v-spacer/>
          <v-btn class="mt-2 search-btn" type="submit">Search</v-btn>
        </v-layout>
      </v-form>
      <!-- <v-progress-circular :size="50" color="primary" indeterminate v-show="loading"/> -->
      <v-data-table
        :headers="transactionHeader"
        :items="transactions"
        :rows-per-page-items="perPage"
        item-key="name"
        :pagination.sync="pagination"
        :total-items="totalTransactions"
        hide-actions
      >
        <template slot="items" slot-scope="props">
          <td>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                round
                flat
                style="margin-left: -15px;"
                class="tbl"
                @click="toDetailTransaction(props.item.id);"
              >{{ props.item.idAlias }}</v-btn>
              <span>View detail</span>
            </v-tooltip>
          </td>
          <td>{{ toCurrency(props.item.amount) }}</td>
          <td>{{ props.item.status }}</td>
          <td>{{ props.item.acquirer.name }}</td>
          <td>{{ props.item.agent.name }}</td>
          <td>{{ formatDate(props.item.createdAt) }}</td>
          <td>{{ formatDate(props.item.updatedAt) }}</td>
        </template>
      </v-data-table>
      <div class="text-xs-center pt-2">
        <v-pagination v-model="page" :length="pages" :total-visible="9" color="blue" dark/>
      </div>
      <v-layout class="mt-3">
        <download-all :api="apiTransaction" :filter="filter" :totalPage="pages"/>
        <v-spacer/>
        <download :data="transactions" :filter="filter" v-if="pages > 1"/>
      </v-layout>
    </div>
  </div>
</template>

<script>
import {
  toDetail,
  timeFormat,
  setDatePicker,
  fetchData,
  toCSV,
  filterHeader,
  exit
} from "~/mixins";
import { mapState } from "vuex";
import download from "~/components/download.vue";
import downloadAll from "~/components/downloadAll";

export default {
  props: {
    showMerchant: {
      type: Boolean,
      default: false
    },
    api: {
      type: String,
      default: ""
    },
    filter: {
      type: Array,
      required: true
    },
    params: {
      type: String,
      default: undefined
    },
    totalPage: {
      type: Number,
      default: 1
    }
  },
  components: {
    download: download,
    "download-all": downloadAll
  },
  mixins: [
    toDetail,
    timeFormat,
    setDatePicker,
    fetchData,
    toCSV,
    filterHeader,
    exit
  ],
  watch: {
    page: {
      immediate: true,
      handler() {
        this.filterTransactions(
          this.page,
          this.params,
          this.merchantId,
          this.value1
        );
      }
    },
    totalPage: {
      immediate: true,
      handler() {
        this.pages = this.totalPage;
      }
    }
  },
  data() {
    return {
      perPage: [30],
      pagination: {},
      transactionHeader: [
        { text: "Id Alias", value: "id_alias", sortable: true },
        { text: "Amount", value: "amount", sortable: true },
        { text: "Transaction Status", value: "status", sortable: false },
        { text: "Acquirer Name", value: "acquirerName", sortable: false },
        { text: "Agent Id", value: "agentId", sortable: false },
        { text: "Created At", value: "created_at", sortable: true },
        { text: "Updated At", value: "updated_at", sortable: true }
      ],
      page: 1,
      merchantId: 0,
      value1: "",
      totalTransactions: 0,
      transactions: [],
      allTransactions: [],
      contoh: "",
      total: "",
      loading: true,
      pages: 1
    };
  },
  mounted() {
    this.filterTransactions(this.page, this.params);
    this.getMerchants();
  },
  computed: {
    ...mapState(["apiTransaction"])
  },
  methods: {
    updatePage: function() {
      this.$emit("updatePage", this.page);
    },
    disableDays() {
      const tomorrow = new Date(1);
    },
    async getTransactions(page, filter1, ...filter2) {
      await this.$axios
        .$get(
          `/api/back_office/transactions?get_count=1&page=${page}${filter1}${filter2}`
        )
        .then(r => {
          this.loading = true;
          this.transactions = r.data;
          this.totalTransactions = 0;
          this.pages = 0;
          if (r.meta != undefined) {
            this.totalTransactions = r.meta.totalCount;
            this.pages = r.meta.ofPages;
          }
          this.$store.commit(
            "setApiTransaction",
            `/api/back_office/transactions?get_count=1&${filter1}${filter2.toString()}&page=`
          );
          this.loading = false;
        })
        .catch(e => {
          console.log(e);
          this.loading = false;
        });
    },
    filterTransactions(page) {
      // this.loading = true;
      let queries,
        val3 = [];
      let value = "";
      const arrayQueries = Object.entries(this.value1);
      let operation = ["gte", "lte"];
      queries = arrayQueries.map((q, r) => {
        if (this.value1[r] != null) {
          return `&f[createdAt]=${operation[r]},${q[1]}`;
        }
      });
      value = queries.join("");

      if (this.params) {
        val3 = this.params;
      }
      if (this.merchantId) {
        val3 = ["&f[agent.outlet.merchantId]=eq"];
        val3.push(this.merchantId);
      }

      this.loading = false;
      this.getTransactions(page, val3.toString(), value);
    }
  }
};
</script>

<style>
.search-btn {
  position: relative;
  right: 100;
  float: right;
}
</style>
