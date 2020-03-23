<template>
  <div>
    <pageTitle :title="`${$changeCase.titleCase(resource)} List`" icon="account_balance"></pageTitle>
    <v-card card flat>
      <v-card-title>
        <tableHeader
          :filter="headers"
          :btn-add-text="btnAddText"
          :permission-role="permissionRole"
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
        :footer-props="footerProps"
        class="elevation-0 pa-2"
      >
        <template
          v-slot:item.createdAt="{ item }"
        >{{ $moment(item.createdAt).format('YYYY-MM-DD') }}</template>
        <template v-slot:item.archivedAt="{ item }" class="text-center">
          <div v-if="item.archivedAt">{{ $moment(item.archivedAt).format('YYYY-MM-DD') }}</div>
          <span v-else>-</span>
        </template>
        <template v-slot:item.details="{ item }">
          <v-tooltip left>
            <template v-slot:activator="{ on }">
              <v-icon color="primary" dark v-on="on" @click="toDetail(item.id)">pageview</v-icon>
            </template>
            <span>View Detail</span>
          </v-tooltip>
        </template>
        <!-- <template v-slot:expanded-item="{ item }">
          <td :colspan="headers.length">
            {{ item.config }}
            <v-btn class="text-lowercase ml-4" color="primary">view details</v-btn>
          </td>
        </template>-->
      </v-data-table>
    </v-card>
    <v-dialog v-model="modalAddForm" width="600">
      <dform
        :permission-role="permissionRole"
        @onClose="modalAddForm = false"
        :show-toolbar="modalAddForm"
        @onSubmit="submit"
      />
    </v-dialog>
  </div>
</template>

<script>
import { catchError, tableMixin } from '~/mixins'
import debounce from 'lodash/debounce'
import { tableHeader, pageTitle } from '~/components/commons'
import dform from '~/components/acquirerConfigAgents/dform'

export default {
  components: {
    tableHeader,
    dform,
    pageTitle,
  },
  mixins: [catchError, tableMixin],
  data() {
    return {
      resource: 'acquirerConfigAgent',
      url: '/back_office/acquirer_config_agents',
      btnAddText: 'Add Acquirer',
      headers: [
        {
          text: 'Acquirer Config Name',
          align: 'left',
          sortable: true,
          value: 'acquirerConfig.name',
        },
        {
          text: 'Agent Name',
          align: 'left',
          sortable: true,
          value: 'agent.name',
        },
        {
          text: 'Acquirer Terminal TID',
          align: 'left',
          sortable: true,
          value: 'acquirerTerminal.tid',
        },
        {
          text: 'Latest Settle Batch Id',
          align: 'left',
          sortable: true,
          value: 'latestSettleBatchId',
        },
        {
          text: 'Batch Number Counter',
          align: 'left',
          sortable: true,
          value: 'batchNumberCounter',
        },
        {
          text: 'Created At',
          sortable: true,
          value: 'createdAt',
        },
        {
          text: 'Archived At',
          sortable: true,
          value: 'archivedAt',
        },
        {
          text: '',
          value: 'details',
        },
      ],
      dataToDownload: [],
      modalAddForm: false,
      permissionRole: 'adminMarketing',
      showAddBtn: false,
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
    prettier(value) {
      return JSON.stringify(value)
    },
    async populateData() {
      try {
        this.loading = true
        const queries = this.getQueries()
        const response = await this.$axios.$get(this.url + queries)
        this.totalCount = response.meta ? response.meta.totalCount : 0
        this.items = response.data
        this.items.map(d => {
          this.items.config = this.prettier(this.items.config)
        })
        this.loading = false
      } catch (e) {
        this.catchError(e)
      }
    },
    downloadCsv() {
      this.generateDownload(this.items)
      this.csvExport(
        `Mika Acquirer Config Agent Report ${this.$moment(new Date()).format(
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
          acquirerConfigId: d.acquirerConfigId,
          acquirerConfigName: d.acquirerConfig.name,
          agentName: d.agent.name,
          acquirerTerminalId: d.acquirerTerminalId,
          acquirerTerminalTid: d.acquirerTerminal.tid,
          latestSettleBatchId: d.latestSettleBatchId,
          batchNumberCounter: d.batchNumberCounter,
          config: d.config,
          created_at: this.$moment(d.created_at).format('YYYY-MM-DD HH:mm:ss'),
          updated_at: this.$moment(d.updated_at).format('YYYY-MM-DD HH:mm:ss'),
        })
      })
    },
    async submit(data) {
      try {
        const postData = {
          acquirerConfigId: data.formData.acquirerConfigId,
          agentId: data.formData.agentId,
          acquirerTerminalId: data.formData.acquirerTerminalId,
          config: data.config ? data.config : {},
        }
        const resp = await this.$axios.$post(this.url, postData)
        this.items.unshift(resp.data)
      } catch (e) {
        this.catchError(e)
      }
    },
    toDetail(id) {
      this.$router.push(`/${this.resource}s/${id}`)
    },
  },
}
</script>

<style></style>
