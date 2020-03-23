<template>
  <v-container grid-list-md>
    <v-layout row wrap>
      <v-flex md3 sm6 xs12>
        <v-select
          :menu-props="{ maxHeight: '400' }"
          v-model="selectedFilterBy"
          :items="filtered"
          item-text="text"
          item-value="value"
          label="Filter by"
        />
      </v-flex>
      <v-flex md3 sm6 xs12>
        <v-select
          v-model="selectedOperator"
          :items="operator"
          :disabled="filterValues.length > 0"
          label="Operator"
        />
      </v-flex>
      <v-flex md3 sm6 xs12>
        <div v-if="filterValues.length > 0">
          <v-autocomplete
            v-model="filterValue"
            :items="filterValues"
            item-text="text"
            item-value="text"
          />
        </div>
        <div v-else>
          <v-text-field v-model="filterValue"/>
        </div>
      </v-flex>
      <v-flex md3 sm6 sx12>
        <date-picker
          v-model="date1"
          :shortcuts="shortcuts"
          :not-after="today"
          range
          lang="eng"
          width="100%"
        />
      </v-flex>
    </v-layout>
    <v-toolbar flat style="margin-top: -25px; margin-bottom: 10px">
      <v-spacer/>
      <tooltip
        v-if="showArchiveBtn && !showUnarchivedBtn"
        icon="archive"
        tooltip-text="Show Archived Data"
        @onClick="archived"
      />
      <tooltip
        v-if="showUnarchivedBtn"
        icon="unarchive"
        tooltip-text="Show Unarchived Data"
        @onClick="unarchived"
      />
      <tooltip icon="cloud_download" tooltip-text="Download as CSV" @onClick="confirmDownload"/>
      <tooltip icon="refresh" tooltip-text="Clear Filter" @onClick="clearFilter"/>
      <tooltip
        icon="check"
        tooltip-text="Apply Filter"
        :disabled="filterValue == '' && date1 === null"
        @onClick="applyFilter"
      />
      <tooltip
        v-if="showAddBtn && checkRoles(permissionRole)"
        icon="add"
        :tooltip-text="btnAddText"
        @onClick="showForm"
      />
    </v-toolbar>
    <v-divider></v-divider>
    <confirmationBox v-if="login == true" @onConfirm="downloadCsv"/>
  </v-container>
</template>

<script>
import { datePickerShortcut, checkRoles } from '~/mixins'
import confirmationBox from './confirmationBox'
import tooltipButton from './tooltipButton'
import { mapState } from 'vuex'

export default {
  components: {
    tooltip: tooltipButton,
    confirmationBox,
  },
  mixins: [datePickerShortcut, checkRoles],
  props: {
    filter: {
      type: Array,
      required: true,
    },
    btnAddText: {
      type: String,
      required: true,
    },
    showAddBtn: {
      type: Boolean,
      required: false,
      default: true,
    },
    showArchiveBtn: {
      type: Boolean,
      required: false,
      default: true,
    },
    permissionRole: {
      type: String,
      default: 'admin',
      required: false,
    },
  },
  data() {
    return {
      selectedFilterBy: '',
      operator: [
        { text: '=', value: 'eq' },
        { text: 'like', value: 'like' },
        { text: '>=', value: 'gte' },
        { text: '<=', value: 'lte' },
      ],
      selectedOperator: { text: 'like', value: 'like' },
      filterValue: '',
      filterArchived: '',
      date1: null,
      shortcuts: [],
      filtered: [],
      showUnarchivedBtn: false,
      filterValues: [],
      today: new Date(),
    }
  },
  computed: {
    ...mapState(['login']),
  },
  watch: {
    selectedFilterBy() {
      if (this.selectedFilterBy !== '') {
        this.onFilterValueChange(this.selectedFilterBy)
      }
    },
    selectedOperator() {
      this.$store.commit('operator', this.selectedOperator)
    },
    filterValue() {
      if (this.filterValue !== '') {
        this.$store.commit('filterValue', this.filterValue)
      }
    },
    date1() {
      this.$store.commit('dateFilter', this.date1)
    },
  },
  mounted() {
    this.shortcuts = this.generateShortcut()
    this.filtered = this.filter.filter(
      f =>
        f.value !== 'updatedAt' &&
        f.value !== 'createdAt' &&
        f.value !== 'archivedAt'
    )
  },
  methods: {
    applyFilter() {
      this.$emit('applyFilter')
    },
    clearFilter() {
      this.selectedFilterBy = ''
      this.selectedOperator = ''
      this.filterValue = ''
      this.filterArchived = null
      this.date1 = null
      this.$store.commit('filterBy', this.selectedFilterBy)
      this.$store.commit('operator', this.operator)
      this.$store.commit('filterValue', this.filterValue)
      this.$store.commit('dateFilter', this.date1)
      this.$store.commit('filterArchived', this.filterArchived)
      this.$emit('applyFilter')
    },
    confirmDownload() {
      this.$store.commit('confirmShow', true)
      this.$store.commit('confirmTitle', 'Export to CSV')
      this.$store.commit('confirmText', 'Are you sure want to export?')
      this.$store.commit('confirmColor', 'primary')
    },
    downloadCsv() {
      this.$emit('downloadCsv')
    },
    showForm() {
      this.$emit('showForm')
    },
    archived() {
      this.$store.commit('filterBy', 'archivedAt')
      this.$store.commit('operator', '')
      this.$store.commit('filterArchived', 'neqnull')
      this.showUnarchivedBtn = true
      this.$emit('archived')
    },
    unarchived() {
      this.$store.commit('filterBy', 'archivedAt')
      this.$store.commit('operator', '')
      this.$store.commit('filterArchived', 'eqnull')
      this.showUnarchivedBtn = false
      this.$emit('unarchived')
    },
    async onFilterValueChange(searchFilter) {
      this.$store.commit('filterBy', searchFilter)
      this.$store.commit('operator', 'like')
      this.filterValues = await this.getTransactionFilter(searchFilter)
    },
    async getTransactionFilter(val) {
      let data = []
      const url = this.generateUrl(val)
      if (url) {
        data = await this.getData(url, val)
      }
      return data
    },
    generateUrl(val) {
      switch (val) {
        case 'status':
          return `/utilities/trx_props`
        case 'acquirer.acquirerType.name':
          return `/back_office/acquirer_types`
      }
    },
    async getData(url, val) {
      try {
        const resp = await this.$axios
          .$get(`${url}?order=asc&order_by=name`)
          .then(res => res.data)
        let data = []
        if (val === 'status') {
          Object.keys(resp.types.transactionStatuses).map(key => {
            data.push({
              value: key,
              text: resp.types.transactionStatuses[key],
            })
          })
        } else {
          resp.map(r => data.push({ value: r.id, text: r.name }))
        }
        return data
      } catch (e) {
        this.catchError(e)
      }
    },
  },
}
</script>

<style></style>
