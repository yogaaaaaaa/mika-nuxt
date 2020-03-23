<template>
  <div>
    <pageTitle
      :title="`${$changeCase.titleCase(resource)} List`"
      icon="supervisor_account"
    ></pageTitle>
    <v-card card flat>
      <v-card-title>
        <v-container fluid>
          <v-row>
            <v-col cols="12" md="3" sm="6">
              <v-checkbox
                label="With No user"
                color="primary"
                v-model="noUser"
              ></v-checkbox>
            </v-col>
            <v-col cols="12" md="3" sm="6">
              <v-checkbox
                label="With audit entity"
                color="primary"
                v-model="withAudit"
              ></v-checkbox>
            </v-col>
            <v-col cols="12" md="3" sm="6">
              <v-text-field
                hide-details
                prepend-inner-icon="search"
                single-line
                v-model="search"
                placeholder="Search ..."
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="3" sm="6">
              <date-picker
                class="mt-3"
                v-model="date1"
                :shortcuts="shortcuts"
                :not-after="today"
                range
                lang="eng"
                width="100%"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="items"
        :options.sync="options"
        :server-items-length="totalCount"
        :loading="loading"
        :footer-props="footerProps"
        class="elevation-0 pa-2"
      >
        <template v-slot:item.event.user.username="{ item }">
          <v-btn color="primary" text @click="toDetail(item.id)">{{
            item.event.user.username ? item.event.user.username : "no-user"
          }}</v-btn>
        </template>
        <template v-slot:item.timestamp="{ item }">{{
          $moment(item.timestamp).format("DD MMM YYYY, HH:mm:ss")
        }}</template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import { catchError, tableMixin } from "~/mixins";
import debounce from "lodash/debounce";
import { pageTitle } from "~/components/commons";
import { datePickerShortcut, checkRoles } from "~/mixins";

export default {
  components: {
    pageTitle
  },
  mixins: [catchError, tableMixin, datePickerShortcut],

  data() {
    return {
      resource: "audit",
      url: "/back_office/audits",
      date1: null,
      dates: [],
      shortcuts: [],
      today: new Date(),
      search: "",
      noUser: false,
      withAudit: false,
      headers: [
        {
          text: "Username",
          align: "left",
          sortable: true,
          value: "event.user.username"
        },
        {
          text: "Type",
          align: "left",
          sortable: true,
          value: "event.type"
        },
        {
          text: "Entity Name",
          align: "left",
          sortable: true,
          value: "event.entityName"
        },
        {
          text: "Status",
          align: "left",
          sortable: true,
          value: "event.status"
        },
        {
          text: "Date",
          align: "left",
          sortable: true,
          value: "timestamp"
        }
      ],
      dataToDownload: [],
      permissionRole: "adminHead",
      showAddBtn: false,
      defaultSort: "timestamp"
    };
  },
  watch: {
    options: {
      handler: debounce(function() {
        this.populateData();
      }, 500),
      deep: true
    },
    search: {
      handler: debounce(function() {
        this.options.page = 1;
        this.populateData();
      }, 500)
    },
    date1() {
      if (this.date1) {
        this.processDates();
      }
    },
    noUser() {
      this.populateData();
    },
    withAudit() {
      this.populateData();
    }
  },
  mounted() {
    this.shortcuts = this.generateShortcut();

    this.options.sortBy = ["timestamp"];
    this.options.sortDesc = [true];
    this.populateData();
  },
  methods: {
    async populateData() {
      try {
        this.loading = true;
        const queries = this.getQueries() + this.getAdditionalQuery();
        const response = await this.$axios.$get(this.url + queries);
        this.totalCount = response.meta ? response.meta.totalCount : 0;
        this.items = response.data;
        this.generateDownload(this.items);
        this.loading = false;
      } catch (e) {
        this.catchError(e);
      }
    },

    getAdditionalQuery() {
      let query = "";
      if (this.search) {
        query += `&search=${this.search}`;
      }
      if (this.dates) {
        query += `&dates=${this.dates}`;
      }
      if (this.noUser) {
        query += `&no_user=1`;
      }
      if (this.withAudit) {
        query += `&with_audit=1`;
      }

      return query;
    },
    processDates() {
      if (this.date1[0] && this.date1[1]) {
        const start = this.$moment(this.date1[0])
          .startOf("day")
          .toISOString();
        const end = this.$moment(this.date1[1])
          .endOf("day")
          .toISOString();
        this.dates = [start, end];
      } else {
        this.date1 = null;
        this.dates = null;
      }
      this.populateData();
    },
    downloadCsv() {
      this.csvExport(
        `${this.$changeCase.titleCase(this.resource)}s`,
        this.dataToDownload
      );
    },
    generateDownload(data) {
      data.map(d => {
        this.dataToDownload.push({
          date: this.$moment(d.timestamp).format("YYYY-MM-DD HH:mm:ss"),
          user: JSON.stringify(d.user),
          event: JSON.stringify(d.event),
          remote: JSON.stringify(d.remote)
        });
      });
    },

    toDetail(id) {
      this.$router.push(`/${this.resource}s/${id}`);
    }
  }
};
</script>

<style scoped>
.v-btn {
  text-transform: none !important;
}
</style>
