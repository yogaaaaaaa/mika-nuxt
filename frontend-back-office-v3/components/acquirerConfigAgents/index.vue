<template>
  <div>
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
        <template
          v-slot:item.createdAt="{ item }"
        >{{ $moment(item.createdAt).format('YYYY-MM-DD') }}</template>
        <template v-slot:item.archivedAt="{ item }" class="text-center">
          <div v-if="item.archivedAt">{{ $moment(item.archivedAt).format('YYYY-MM-DD') }}</div>
          <span v-else>-</span>
        </template>
        <template v-slot:expanded-item="{ headers }">
          <td :colspan="headers.length">
            <v-btn></v-btn>
          </td>
        </template>
        <template v-slot:item.details="{ item }">
          <v-tooltip left>
            <template v-slot:activator="{ on }">
              <v-icon color="primary" dark v-on="on" @click="toDetail(item.id)">pageview</v-icon>
            </template>
            <span>View Detail</span>
          </v-tooltip>
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
        <v-card-text class="mt-5">
          <formAdd
            :form-field="formField"
            :sm6="true"
            :permission-role="permissionRole"
            @close="modalAddForm = false"
            @onSubmit="submit"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { catchError, tableMixin } from '~/mixins'
import debounce from 'lodash/debounce'
import { tableHeader, formAdd } from '~/components/commons'
import formField from './formField'

export default {
  components: {
    tableHeader,
    formAdd,
  },
  mixins: [catchError, tableMixin],
  props: {
    conditionalUrl: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    return {
      resource: 'acquirerConfigAgent',
      url: '/back_office/acquirer_config_agents/',
      btnAddText: 'Add Acquirer',
      headers: [
        {
          text: 'Acquirer Config Name',
          align: 'left',
          sortable: true,
          value: 'acquirerConfig.name',
        },
        {
          text: 'Acquirer Terminal TID',
          align: 'left',
          sortable: true,
          value: 'acquirerTerminal.tid',
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
    downloadCsv() {
      this.generateDownload(this.items)
      this.csvExport(
        `${this.$changeCase.titleCase(this.resource)}s`,
        this.dataToDownload
      )
    },
    generateDownload(data) {
      data.map(d => {
        this.dataToDownload.push({
          id: d.id,
          name: d.name,
          description: d.description,
          config: d.config,
          handler: d.handler,
          sandbox: d.sandbox,
          merchantId: d.merchantId,
          acquirerConfigKvs: d.acquirerConfigKvs,
          created_at: this.$moment(d.created_at).format('YYYY-MM-DD HH:mm:ss'),
          updated_at: this.$moment(d.updated_at).format('YYYY-MM-DD HH:mm:ss'),
          description: d.description ? d.description : '',
        })
      })
    },
    async submit(data) {
      try {
        const postData = {
          acquirerConfigId: data.formData.acquirerConfigId,
          agentId: data.formData.agentId,
          acquirerTerminalId: data.formData.acquirerTerminalId,
          latestSettleBatchId: data.formData.latestSettleBatchId,
          batchNumberCounter: data.formData.batchNumberCounter,
          config: data.config ? data.config : {},
          description: data.formData.description,
        }
        const response = await this.$axios.$post(this.url, data)
        this.items.unshift(response.data)
        this.showSnackbar('success', `${this.btnAddText} success`)
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
