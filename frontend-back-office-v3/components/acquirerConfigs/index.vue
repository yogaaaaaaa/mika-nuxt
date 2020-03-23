<template>
  <div>
    <v-card card flat>
      <v-card-title>
        <tableHeader
          :filter="headers"
          :btn-add-text="btnAddText"
          :permission-role="permissionRole"
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
      </v-data-table>
    </v-card>
    <v-dialog v-model="modalAddForm" width="600">
      <dform :show-toolbar="showToolbar" @onClose="modalAddForm = false" @onSubmit="submit"></dform>
    </v-dialog>
  </div>
</template>

<script>
import { catchError, tableMixin } from '~/mixins'
import debounce from 'lodash/debounce'
import { tableHeader, formAdd } from '~/components/commons'
import formField from './formField'
import dform from './dform'

export default {
  components: {
    tableHeader,
    dform,
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
      resource: 'acquirerConfigs',
      url: '/back_office/acquirer_configs',
      btnAddText: 'Add Acquirer Config',
      headers: [
        {
          text: 'Name',
          align: 'left',
          sortable: true,
          value: 'name',
        },
        {
          text: 'Merchant Id',
          align: 'left',
          value: 'merchantId',
        },
        {
          text: 'Created At',
          align: 'center',
          sortable: true,
          value: 'createdAt',
        },
        {
          text: 'Archived At',
          align: 'center',
          sortable: true,
          value: 'archivedAt',
        },
      ],
      dataToDownload: [],
      modalAddForm: false,
      permissionRole: 'adminMarketing',
      formField: formField,
      showToolbar: true,
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
        this.generateDownload(this.items)
        this.loading = false
      } catch (e) {
        this.catchError(e)
      }
    },
    downloadCsv() {
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
        })
      })
    },
    async submit(data) {
      try {
        // data.config = JSON.parse(`{ ${data.config.replace(/\s+/g, '')} }`)
        const config = data.config
        const postData = {
          name: data.formData.name,
          handler: data.formData.handler,
          description: data.formData.description,
          merchantId: data.formData.merchantId ? data.merchantId : undefined,
          config: data.config,
          imageReceipt: data.image,
        }
        const response = await this.$axios.$post(this.url, postData)
        this.items.unshift(response.data)
        this.showSnackbar('success', `${this.btnAddText} success`)
      } catch (e) {
        this.catchError(e)
      }
    },
    toDetail(id) {
      this.$router.push(`/${this.resource}/${id}`)
    },
  },
}
</script>

<style></style>
