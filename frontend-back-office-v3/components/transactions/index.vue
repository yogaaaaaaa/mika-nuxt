<template>
  <div class="mt-4">
    <v-card card flat>
      <v-card-title>
        <tableHeader
          :filter="headers"
          :btn-add-text="btnAddText"
          :show-add-btn="showAddBtn"
          :show-archive-btn="showArchiveBtn"
          @showForm="modalAddForm = !modalAddForm"
          @applyFilter="populateData"
          @downloadCsv="downloadCsv"
        />
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="items"
        :options.sync="options"
        :server-items-length="totalCount"
        :loading="loading"
        class="elevation-0 pa-2 align-self-center"
        :footer-props="footerProps"
      >
        <template v-slot:item.id="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <span v-on="on">
                <a
                  class="d-inline-block text-truncate"
                  style="max-width: 100px;"
                  @click="toDetail(item.id)"
                  >{{ item.id }}</a
                >
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
                  >{{ item.id }}</a
                >
              </span>
            </template>
            <span>{{ item.idAlias }}</span>
          </v-tooltip>
        </template>
        <template v-slot:item.amount="{ item }">
          <span style="font-family: Roboto">
            {{ item.amount | currency('', 0, { thousandsSeparator: ',' }) }}
          </span>
        </template>
        <template v-slot:item.status="{ item }">
          <v-btn
            :color="colorStatus(item.status)"
            outlined
            rounded
            small
            class="elevation-0"
            >{{ item.status }}</v-btn
          >
        </template>
        <template v-slot:item.updatedAt="{ item }">{{
          $moment(item.updatedAt).format('YYYY-MM-DD, HH:mm:ss')
        }}</template>
      </v-data-table>
    </v-card>
    <v-dialog v-model="modalAddForm" fullscreen hide-overlay>
      <v-card>
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>{{ btnAddText }}</v-toolbar-title>
          <v-spacer />
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
import { tableHeader } from '../commons'
import Filters from 'vue2-filters'

export default {
  components: {
    tableHeader,
  },
  mixins: [catchError, tableMixin, Filters],
  props: {
    conditionalUrl: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    return {
      url: '/back_office/transactions',
      titlePage: 'Transaction List',
      iconPage: 'confirmation_number',
      btnAddText: 'Add Transaction',
      showAddBtn: false,
      headers: [
        { text: 'Id', value: 'id', sortable: false },
        { text: 'Id Alias', value: 'idAlias' },
        { text: 'Amount', value: 'amount', align: 'right' },
        {
          text: 'Status',
          value: 'status',
          align: 'center',
          sortable: false,
        },
        {
          text: 'Acquirer',
          value: 'acquirer.acquirerType.name',
          sortable: false,
        },
        { text: 'Date', value: 'updatedAt' },
      ],
      dataToDownload: [],
      modalAddForm: false,
      frontendUrl: `/transactions`,
      showArchiveBtn: false,
      color: '',
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
        const response = await this.$axios.$get(
          this.url + queries + this.conditionalUrl
        )
        this.totalCount = response.meta ? response.meta.totalCount : 0
        this.items = response.data
        this.loading = false
      } catch (e) {
        this.catchError(e)
      }
    },
    toDetail(id) {
      this.$router.push(`${this.frontendUrl}/${id}`)
    },
    downloadCsv() {
      this.generateDownload(this.items)
      this.csvExport(
        `Mika Transaction Report ${this.$moment(new Date()).format(
          'YYYY-MM-DD HH:mm:ss'
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
          acquirerType: d.acquirer.acquirerType.name,
          created_at: this.$moment(d.created_at).format('YYYY-MM-DD HH:mm:ss'),
          updated_at: this.$moment(d.updated_at).format('YYYY-MM-DD HH:mm:ss'),
        })
      })
    },
    colorStatus(status) {
      if (status == 'success') {
        return (this.color = 'success')
      }
      if (status == 'failed') {
        return (this.color = 'red')
      }
      if (status == 'canceled') {
        return (this.color = 'primary')
      }
      if (status == 'expired') {
        return (this.color = 'warning')
      }
      if (status == 'refunded') {
        return (this.color = 'black')
      }
    },
  },
}
</script>

<style>
.page-title {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
</style>
