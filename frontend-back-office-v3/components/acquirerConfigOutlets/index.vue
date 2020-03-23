<template>
  <div class="mt-4">
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
        :footer-props="footerProps"
        :loading="loading"
        class="elevation-0 pa-2"
      >
        <template v-slot:item.acquirerConfig.name="{ item }">
          <a @click="toDetail(item.id)">{{ item.acquirerConfig.name }}</a>
        </template>
        <template v-slot:item.acquirerTerminal="{ item }">
          <a
            @click="toDetail(item.id)"
            v-if="item.acquirerTerminal.name"
          >{{ acquirerTerminal.name }}</a>
          <a @click="toDetail(item.id)">{{ item.acquirerTerminal.tid }}</a>
        </template>
        <template
          v-slot:item.createdAt="{ item }"
        >{{ $moment(item.createdAt).format('YYYY-MM-DD') }}</template>
        <template v-slot:item.archivedAt="{ item }">
          <div v-if="item.archivedAt">{{ $moment(item.archivedAt).format('YYYY-MM-DD') }}</div>
          <span v-else>-</span>
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
import { tableHeader, formAdd } from '../commons'
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
      url: '/back_office/acquirer_config_outlets',
      titlePage: 'Acquirer Config Outlets',
      iconPage: 'transfer_within_a_station',
      btnAddText: 'Add Acquirer Config Outlet',
      headers: [
        {
          text: 'Acquirer Config Name',
          value: 'name',
          sortable: false,
        },
        { text: 'Created At', value: 'createdAt' },
        { text: 'Archived At', value: 'archivedAt' },
      ],
      dataToDownload: [],
      modalAddForm: false,
      formField: formField,
      frontendUrl: `/acquirerConfigOutlets/`,
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
      return JSON.stringify(value, undefined, '\t')
    },
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
        `Mika Acquirer Config Outlets Report ${this.$moment(new Date()).format(
          'YYYY-MM-DD HH:mm:ss'
        )}`,
        this.dataToDownload
      )
    },
    generateDownload(data) {
      data.map(d => {
        this.dataToDownload.push({
          id: d.id,
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
    copied() {
      this.showSnackbar('success', 'Copied !')
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
