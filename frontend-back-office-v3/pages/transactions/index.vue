<template>
  <div class="mt-4">
    <v-card card flat>
      <v-card-title>
        <tableHeader
          :filter="headers"
          :btn-add-text="btnAddText"
          :show-add-btn="showAddBtn"
          :show-archive-btn="showArchiveBtn"
          :filter-values="filterValues"
          @showForm="modalAddForm = !modalAddForm"
          @applyFilter="populateData"
          @selectedFilterBy="handelSelectedFilterBy"
          @downloadCsv="downloadCsv"
        />
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="items"
        :options.sync="options"
        :server-items-length="totalCount"
        :loading="loading"
        :footer-props="footerProps"
        :fixed-header="true"
        class="elevation-0 pa-2"
      >
        <template v-slot:item.id="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <span v-on="on">
                <a
                  class="d-inline-block text-truncate"
                  style="max-width: 100px;"
                  @click="toDetail(item.id)"
                >{{ item.id }}</a>
              </span>
            </template>
            <span>{{ item.id }}</span>
          </v-tooltip>
        </template>
        <template v-slot:item.idAlias="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <span v-on="on">
                <a
                  class="d-inline-block text-truncate"
                  style="max-width: 100px;"
                  @click="toDetail(item.id)"
                >{{ item.idAlias }}</a>
              </span>
            </template>
            <span>{{ item.idAlias }}</span>
          </v-tooltip>
        </template>
        <template v-slot:item.amount="{ item }">
          <span
            style="font-family: Roboto"
          >{{ item.amount | currency('', 0, { thousandsSeparator: '.' }) }}</span>
        </template>
        <template v-slot:item.status="{ item }">
          <v-btn
            :color="colorStatus(item.status)"
            rounded
            dark
            small
            class="elevation-0 text-lowercase"
          >{{ item.status }}</v-btn>
        </template>
        <template v-slot:item.updatedAt="{ item }">
          {{
          $moment(item.updatedAt).format('YYYY-MM-DD, HH:mm:ss')
          }}
        </template>
      </v-data-table>
    </v-card>
    <v-dialog v-model="modalAddForm" fullscreen hide-overlay>
      <v-card>
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>{{ btnAddText }}</v-toolbar-title>
          <v-spacer/>
          <v-btn icon dark @click="modalAddForm = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { catchError, tableMixin } from '~/mixins'
import debounce from 'lodash/debounce'
import { tableHeader } from '~/components/commons'
import Filters from 'vue2-filters'
const allowedLinks = ['acquirers', 'status']
import includes from 'lodash/includes'

export default {
  components: {
    tableHeader,
  },
  mixins: [catchError, tableMixin, Filters],
  data() {
    return {
      url: '/back_office/transactions',
      btnAddText: 'Add Transaction',
      headers: [
        { text: 'Id', value: 'id' },
        { text: 'Id Alias', value: 'idAlias' },
        { text: 'Amount', value: 'amount', align: 'right', width: '120px' },
        { text: 'Status', value: 'status', align: 'center', sortable: false },
        {
          text: 'Merchant Name',
          value: 'agent.outlet.merchant.name',
          sortable: false,
        },
        { text: 'Agent Name', value: 'agent.name', sortable: false },
        {
          text: 'Acquirer',
          value: 'acquirer.acquirerType.name',
          sortable: false,
        },
        { text: 'Date', value: 'updatedAt' },
      ],
      dataToDownload: [],
      modalAddForm: false,
      showAddBtn: false,
      showArchiveBtn: false,
      color: '',
      filterValues: [],
      filterSelectable: [
        { text: 'Status', value: 'status' },
        { text: 'Acquirer', value: 'acquirer.acquirerType.name' },
      ],
    }
  },
  watch: {
    options: {
      handler: debounce(function() {
        this.populateData()
      }, 500),
      deep: true,
    },
  },
  mounted() {
    this.options.sortBy = ['updatedAt']
    this.$store.dispatch('clearFilter')
    this.populateData()
  },
  methods: {
    async populateData() {
      try {
        this.loading = true
        const queries = this.getQueries()
        const response = await this.$axios.$get(this.url + queries)
        this.totalCount = response.meta ? response.meta.totalCount : 0
        this.items = response.data
        this.loading = false
      } catch (e) {
        this.catchError(e)
      }
    },
    downloadCsv() {
      this.generateDownload(this.items)
      this.csvExport(
        `Mika Transaction Report ${this.$moment().format(
          'YYYY-MM-DD_HH:mm:ss'
        )}`,
        this.dataToDownload
      )
      this.dataToDownload = []
    },
    generateDownload(data) {
      data.map(d => {
        this.dataToDownload.push({
          id: d.id,
          idAlias: d.idAlias,
          amount: d.amount,
          status: d.status,
          token: d.token,
          tokenType: d.tokenType,
          userToken: d.userToken,
          userTokenType: d.userTokenType,
          customerReference: d.customerReference,
          customerReferenceName: d.customerReferenceName,
          referenceNumber: d.referenceNumber,
          referenceNumberName: d.referenceNumberName,
          cardApprovalCode: d.cardApprovalCode,
          cardNetwork: d.cardNetwork,
          cardIssuer: d.cardIssuer,
          cardPanMasked: d.cardPanMasked,
          cardType: d.cardType,
          locationLong: d.locationLong,
          locationLat: d.locationLat,
          ipAddress: d.ipAddress,
          agentName: d.agent.name,
          outletName: d.agent.outlet.name,
          acquirerName: d.acquirer.name,
          acquirerType: d.acquirer.acquirerType.class,
          created_at: this.$moment(d.created_at).format('YYYY-MM-DD HH:mm:ss'),
          updated_at: this.$moment(d.updated_at).format('YYYY-MM-DD HH:mm:ss'),
        })
      })
    },
    toDetail(id) {
      this.$router.push(`/transactions/${id}`)
    },
    colorStatus(status) {
      if (status == 'success') {
        return (this.color = 'success')
      }
      if (status == 'failed') {
        return (this.color = 'error')
      }
      if (status == 'canceled') {
        return (this.color = 'primary')
      } else {
        return (this.color = 'warning')
      }
    },
    async getFilterValues(val) {
      this.filterValues = []
      let filters = []
      let filterKey = []
      if (this.filterSelectable.length > 0) {
        this.filterSelectable.map(f => {
          if (val === f.text) filterKey = f.value
        })
        if (filterKey === 'status') {
          filters = this.items.map(i => {
            return { text: i[filterKey], value: i[filterKey] }
          })
          filters = Array.from(new Set(filters.map(a => a.value))).map(value =>
            filters.find(a => a.value == value)
          )
        } else {
          filters = await this.getTransactionFilter(filterKey)
        }
      }
    },
    getTransactionFilter(f) {
      let data = []
      if (includes(allowedLinks, f)) {
        data = this.getData(f)
      }
      return data
    },
    handelSelectedFilterBy(val) {
      this.selectedFilterBy = val
    },
  },
}
</script>

<style></style>
