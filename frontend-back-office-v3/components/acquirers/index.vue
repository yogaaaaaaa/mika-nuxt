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
      </v-data-table>
    </v-card>
    <v-dialog v-model="modalAddForm">
      <dform
        :initial-data="formField"
        :permission-role="permissionRole"
        @onClose="modalAddForm = false"
        @onSubmit="submit"
      ></dform>
    </v-dialog>
  </div>
</template>

<script>
import { catchError, tableMixin } from '~/mixins'
import debounce from 'lodash/debounce'
import { tableHeader } from '~/components/commons'
import dform from '~/components/acquirers/dform'
import formField from './formField'

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
    showAddBtn: {
      type: Boolean,
      default: false,
    },
    acquirerCompanyId: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    return {
      resource: 'acquirer',
      url: '/back_office/acquirers',
      btnAddText: 'Add Acquirer',
      headers: [
        {
          text: 'Name',
          align: 'left',
          sortable: true,
          value: 'name',
        },
        {
          text: 'Merchant',
          align: 'left',
          sortable: true,
          value: 'merchant.name',
        },
        {
          text: 'Min Amount',
          align: 'left',
          sortable: true,
          value: 'minimumAmount',
        },
        {
          text: 'Max Amount',
          align: 'left',
          sortable: true,
          value: 'maximumAmount',
        },
      ],
      dataToDownload: [],
      modalAddForm: false,
      permissionRole: 'adminMarketing',
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
        `Mika Acquirer Report ${this.$moment(new Date()).format(
          'YYYY-MM-DD HH:mm:ss'
        )}`,
        this.dataToDownload
      )
      this.dataToDownload = {}
    },
    generateDownload(data) {
      data.map(d => {
        this.dataToDownload.push({
          name: d.name,
          description: d.description,
          created_at: this.$moment(d.created_at).format('YYYY-MM-DD HH:mm:ss'),
          updated_at: this.$moment(d.updated_at).format('YYYY-MM-DD HH:mm:ss'),
        })
      })
    },
    async submit(data) {
      try {
        data.shareAcquirer = data.shareAcquirer / 100
        data.shareMerchant = data.shareMerchant / 100
        data.shareMerchantWithPartner = data.shareMerchantWithPartner / 100
        data.sharePartner = data.sharePartner / 100
        data.acquirerCompanyId = this.acquirerCompanyId
        const response = await this.$axios.$post(this.url, data)
        this.items.unshift(response.data)
        if (response.status === 'ent-201') {
          this.$store.commit('currentEdit', response.data)
          this.showSnackbar('success', response.message)
        }
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
