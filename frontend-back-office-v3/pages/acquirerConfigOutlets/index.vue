<template>
  <div>
    <pageTitle :title="`${$changeCase.titleCase(resource)} List`" icon="account_balance"></pageTitle>
    <v-card card flat>
      <v-card-title>
        <tableHeader
          :filter="headers"
          :btn-add-text="btnAddText"
          :permission-role="permissionRole"
          :show-add-btn="showAddBtn"
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
        show-expand
      >
        <template
          v-slot:item.createdAt="{ item }"
        >{{ $moment(item.createdAt).format('YYYY-MM-DD') }}</template>
        <template v-slot:item.archivedAt="{ item }" class="text-center">
          <div v-if="item.archivedAt">{{ $moment(item.archivedAt).format('YYYY-MM-DD') }}</div>
          <span v-else>-</span>
        </template>
        <template v-slot:expanded-item="{ headers }">
          <td :colspan="headers.length">{{items.config}}</td>
        </template>
      </v-data-table>
    </v-card>
    <v-dialog v-model="modalAddForm">
      <dform :form-field="formField" @onClose="modalAddForm = false" @onSubmit="submit"></dform>
    </v-dialog>
  </div>
</template>

<script>
import { catchError, tableMixin } from '~/mixins'
import debounce from 'lodash/debounce'
import { tableHeader, pageTitle } from '~/components/commons'
import dform from '~/components/acquirers/dform'
import formField from '~/components/acquirerConfigOutlets/formField'

export default {
  components: {
    tableHeader,
    dform,
    pageTitle,
  },
  mixins: [catchError, tableMixin],
  data() {
    return {
      resource: 'acquirerConfigOutlet',
      url: '/back_office/acquirer_config_outlets',
      btnAddText: 'Add Acquirer',
      headers: [
        {
          text: 'Name',
          align: 'left',
          sortable: true,
          value: 'name',
        },
        {
          text: 'outlet Name',
          align: 'left',
          sortable: true,
          value: 'outlet.name',
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
      ],
      dataToDownload: [],
      modalAddForm: false,
      permissionRole: 'adminMarketing',
      showAddBtn: false,
      formField: formField,
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
        `Mika Acquirer Config Outlets Report ${this.$moment(new Date()).format(
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
