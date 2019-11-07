<template>
  <div>
    <pageTitle title="Merchant List" icon="domain"></pageTitle>
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
        <template v-slot:item.createdAt="{ item }">
          {{ $moment(item.createdAt).format('YYYY-MM-DD') }}
        </template>
        <template v-slot:item.archivedAt="{ item }">
          <div v-if="item.archivedAt">
            {{ $moment(item.archivedAt).format('YYYY-MM-DD') }}
          </div>
          <div v-else>-</div>
        </template>
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
        <v-card-text class="mt-5">
          <formAdd
            :form-field="formField"
            :initial-data="fakeData"
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
import { tableHeader, formAdd, pageTitle } from '~/components/commons'
import formField, { fakeData } from '~/components/merchants/formField'

export default {
  components: {
    tableHeader,
    formAdd,
    pageTitle,
  },
  mixins: [catchError, tableMixin],
  data() {
    return {
      url: '/back_office/merchants',
      btnAddText: 'Add Merchant',
      headers: [
        {
          text: 'Name',
          align: 'left',
          sortable: true,
          value: 'name',
        },
        { text: 'Bank Name', value: 'bankName' },
        { text: 'Date Created', value: 'createdAt' },
        { text: 'Archived At', align: 'center', value: 'archivedAt' },
      ],
      dataToDownload: [],
      modalAddForm: false,
      formField: formField,
      fakeData: fakeData,
      permissionRole: 'adminMarketing',
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
    async populateData() {
      try {
        this.loading = true
        this.dataToDownload = []
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
      this.csvExport('Merchants', this.dataToDownload)
    },
    generateDownload(data) {
      data.map(d => {
        this.dataToDownload.push({
          id: d.id,
          name: d.name,
          shortName: d.shortName,
          status: d.status,
          email: d.email,
          website: d.website,
          phoneNumber: d.phoneNumber,
          taxCardNumber: d.taxCardNumber,
          bankName: d.bankName,
          bankBranchName: d.bankBranchName,
          bankAccountName: d.bankAccountName,
          bankAccountNumber: d.bankAccountNumber,
          ownerName: d.ownerName,
          ownerOccupation: d.ownerOccupation,
          ownerPhoneNumber: d.ownerPhoneNumber,
          ownerIdCardNumber: d.ownerIdCardNumber,
          ownerIdCardType: d.ownerIdCardType,
          partnerId: d.partnerId,
          created_at: this.$moment(d.createdAt).format('YYYY-MM-DD HH:mm:ss'),
          updated_at: this.$moment(d.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
          archived_at: this.$moment(d.archivedAt).format('YYYY-MM-DD HH:mm:ss'),
        })
      })
    },
    async submit(data) {
      try {
        const response = await this.$axios.$post(this.url, data)
        this.items.unshift(response.data)
        this.showSnackbar('success', `${this.btnAddText} success`)
      } catch (e) {
        this.catchError(e)
      }
    },
    toDetail(id) {
      this.$router.push(`/merchants/${id}`)
    },
  },
}
</script>

<style></style>
