import changeCase from "change-case";
import moment from "moment";

export default {
  data: () => ({
    items: [],
    total: 0,
    loading: false,
    options: {
      getCount: 1,
      itemsPerPage: 10,
      sortBy: ["createdAt"],
      sortDesc: [true]
    },
    footerProps: {
      itemsPerPageOptions: [10, 25, 50, 100]
    },
    filterBy: [],
    selectedFilterBy: null,

    operator: null,
    filterValues: [],
    filterValue: null,
    date: null
  }),
  methods: {
    catchError(e) {
      console.log(e);
      const status = e.response.status;
      if (status && status === 401) {
        this.$auth.logout();
        this.$router.push("/login");
      }
    },
    getQueries() {
      let query = "?";
      this.options.perPage = this.options.itemsPerPage;
      this.options.orderBy = this.options.sortBy[0];
      this.options.order = this.options.sortDesc[0] ? "desc" : "asc";
      for (let key in this.options) {
        if (this.options.hasOwnProperty(key) && this.options[key] != null) {
          query += `${changeCase.snakeCase(key)}=${this.options[key]}&`;
        }
      }
      if (this.selectedFilterBy && this.filterValue) {
        query += `f[${this.selectedFilterBy.value}]=${this.operator.value},${
          this.filterValue.value ? this.filterValue.value : this.filterValue
        }&`;
      }
      if (this.date && this.date.length > 0) {
        query += `f[createdAt]=gte,${this.date[0].toISOString()}&f[createdAt]=lte,${this.date[1].toISOString()}&`;
      }
      return query;
    },
    dateFilter(date) {
      return moment(date).format("dddd, MMMM Do YYYY, h:mm:ss a");
    },
    setFilterBy() {
      this.headers.map(h => {
        if (h.value !== "createdAt") {
          this.filterBy.push({
            value: h.filterAs ? h.filterAs : h.value,
            text: h.text
          });
        }
      });
    },
    handelSelectedFilterBy(val) {
      this.selectedFilterBy = val;
    },
    handleOperatorChange(val) {
      this.operator = val;
    },
    handleFilterValueChange(val) {
      this.filterValue = val;
    },
    handleDateChange(d) {
      this.date = d;
    },
    getFilterValues(val) {
      this.filterValues = [];
      let filters = [];
      let filterKey = null;
      if (this.filterSelectable.length > 0) {
        this.filterSelectable.map(f => {
          if (val === f.key) filterKey = f.value;
        });
        if (filterKey) {
          filters = this.items.map(i => {
            if (typeof i[filterKey] !== "object")
              return { text: i[filterKey], value: i[filterKey] };
            return { text: i[filterKey].name, value: i[filterKey].id };
          });
          filters = Array.from(new Set(filters.map(a => a.value))).map(value =>
            filters.find(a => a.value === value)
          );
        }
      }
      this.filterValues = filters;
    },
    clearFilter() {
      this.filterValues = [];
      this.selectedFilterBy = null;
      this.filterValue = null;
      this.date = null;
      this.populateTable();
    }
  }
};
