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
        <template v-slot:item.minimumAmount="{ item }">
          <span
            style="font-family: Roboto"
          >{{ item.minimumAmount | currency('', 0, { thousandsSeparator: '.' }) }}</span>
        </template>
        <template v-slot:item.maximumAmount="{ item }">
          <span
            style="font-family: Roboto"
          >{{ item.maximumAmount | currency('', 0, { thousandsSeparator: '.' }) }}</span>
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
    <v-dialog v-model="modalAddForm" fullscreen>
      <dform
        :permission-role="permissionRole"
        :form-field="formField"
        :btn-show-archive="btnShowArchive"
        @onClose="modalAddForm = false"
        @onSubmit="submit"
      ></dform>
    </v-dialog>
  </div>
</template>

<script>
import { catchError, tableMixin } from '~/mixins'
import debounce from 'lodash/debounce'
import { tableHeader, pageTitle } from '~/components/commons'
import dform from '~/components/acquirers/dform'
import formField from '~/components/acquirers/formField'

export default {
  components: {
    tableHeader,
    dform,
    pageTitle,
  },
  mixins: [catchError, tableMixin],
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
          align: 'right',
          sortable: true,
          value: 'minimumAmount',
        },
        {
          text: 'Max Amount',
          align: 'right',
          sortable: true,
          value: 'maximumAmount',
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
      showAddBtn: true,
      btnShowArchive: false,
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
        `Mika Acquirer Report ${this.$moment(new Date()).format(
          'YYYY-MM-DD HH:mm:ss'
        )}`,
        this.dataToDownload
      )
      this.dataToDownload = []
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
        const postData = {
          name: data.name,
          description: data.description,
          minimumAmount: data.minimumAmount,
          maximumAmount: data.maximumAmount,
          processFee: data.processFee,
          shareAcquirer: data.shareAcquirer / 100,
          shareMerchant: data.shareMerchant / 100,
          shareMerchantWithPartner: data.shareMerchantWithPartner / 100,
          sharePartner: data.sharePartner / 100,
          directSettlement: data.directSettlement,
          gateway: data.gateway,
          hidden: data.hidden,
          merchantId: data.merchantId,
          acquirerConfigId: data.acquirerConfigId,
          acquirerTypeId: data.acquirerTypeId,
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

<style></style>
