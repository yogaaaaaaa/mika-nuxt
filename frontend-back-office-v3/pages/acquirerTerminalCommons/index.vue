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
      >
        <template v-slot:item.name="{ item }">
          <a @click="toDetail(item.id)">{{ item.name }}</a>
        </template>
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
      </v-data-table>
    </v-card>
    <v-dialog v-model="modalAddForm" width="600">
      <dform
        :show-toolbar="modalAddForm"
        :permission-role="permissionRole"
        @onClose="modalAddForm = false"
        @onSubmit="submit"
      />
    </v-dialog>
  </div>
</template>

<script>
import { tableHeader, pageTitle } from '~/components/commons'
import debounce from 'lodash/debounce'
import { catchError, tableMixin } from '~/mixins'
import dform from '~/components/acquirerTerminalCommons/dform'

export default {
  components: {
    tableHeader,
    pageTitle,
    dform,
  },
  mixins: [catchError, tableMixin],
  data() {
    return {
      resource: 'acquirerTerminalCommon',
      url: '/back_office/acquirer_terminal_commons',
      // items: [],
      showAddbtn: false,
      headers: [
        { text: 'Name', align: 'left', value: 'name' },
        {
          text: 'Acquirer Company',
          align: 'left',
          value: 'acquirerCompany.name',
        },
        { text: 'Created At', align: 'left', value: 'createdAt' },
        { text: 'Archived At', align: 'left', value: 'archivedAt' },
      ],
      btnAddText: 'Add Acquirer Terminal Common',
      permissionRole: 'adminMarketing',
      showAddBtn: true,
      dataToDownload: [],
      modalAddForm: false,
    }
  },
  watch: {
    options: {
      handler: debounce(function() {
        this.populateData()
      }, 500),
    },
  },
  mounted() {
    this.populateData()
  },
  methods: {
    prettier(value) {
      return JSON.stringify(value, undefined, '\t')
    },
    async populateData() {
      try {
        this.loading = true
        const queries = this.getQueries()
        const response = await this.$axios.$get(this.url + queries)
        this.totalCount = response.meta ? response.meta.totalCount : 0
        this.items = response.data
        console.log(this.items[0])
        this.loading = false
      } catch (e) {
        this.catchError(e)
      }
    },
    downloadCsv() {
      this.generateDownload(this.items)
      this.csvExport(
        `${this.$changeCase.titleCase(this.resource)}s report ${this.$moment(
          new Date()
        ).format('YYYY-MM-DD HH:mm:ss')}`,
        this.dataToDownload
      )
    },
    generateDownload(data) {
      data.map(d => {
        this.dataToDownload.push({
          name: d.name,
          description: d.description,
          acquirerCompanyName: d.acquirerCompany.name,
          config: this.prettier(d.config),
          created_at: this.$moment(d.created_at).format('YYYY-MM-DD HH:mm:ss'),
          archived_at: this.$moment(d.archived_at).format(
            'YYYY-MM-DD HH:mm:ss'
          ),
        })
      })
    },
    async submit(data) {
      try {
        data.config = JSON.parse(JSON.stringify(data.config))
        const postData = {
          name: data.formData.name,
          acquirerCompanyId: data.formData.acquirerCompanyId,
          description: data.formData.description,
          config: data.config,
        }
        const response = await this.$axios.$post(this.url, postData)
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

<style>
</style>
