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
        <template v-slot:item.name="{ item }">
          <a @click="toDetail(item.id)">{{ item.name }}</a>
        </template>
        <template v-slot:item.createdAt="{ item }">
          {{
          $moment(item.createdAt).format('YYYY-MM-DD')
          }}
        </template>
        <template v-slot:item.archivedAt="{ item }" class="text-center">
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
            :initial-data="initialData"
            :btn-show-archive="btnShowArchive"
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
import { mapState } from 'vuex'

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
    showAddBtn: {
      type: Boolean,
      required: false,
      default: true,
    },
    currentEdit: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
  data() {
    return {
      url: '/back_office/outlets',
      titlePage: 'Outlet List',
      iconPage: 'store',
      btnAddText: 'Add Merchant Outlet',
      headers: [
        { text: 'Name', value: 'name', sortable: false },
        { text: 'Business Type', value: 'businessType', sortable: false },
        { text: 'Created At', value: 'createdAt' },
        { text: 'Archived At', value: 'archivedAt', align: 'center' },
      ],
      dataToDownload: [],
      modalAddForm: false,
      formField: formField,
      frontendUrl: `/outlets`,
      permissionRole: 'adminMarketing',
      initialData: {},
      btnShowArchive: false,
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
    const index = this.formField.findIndex(d => d.key === 'merchantId')
    if (index != -1) {
      let merchantIdIndex = this.formField[index]
      merchantIdIndex.value = this.$route.params.id
      this.formField.splice(index, 1, merchantIdIndex)
    }
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
      this.populateData()
      this.generateDownload(this.items)
      this.csvExport(
        `${this.currentEdit.name} Outlet Report ${this.$moment().format(
          'YYYY-MM-DD_HH:mm:ss'
        )}`,
        this.dataToDownload
      )
    },
    generateDownload(data) {
      data.map(d => {
        this.dataToDownload.push({
          id: d.id,
          name: d.name,
          status: d.status,
          email: d.email,
          website: d.website,
          phoneNumber: d.phoneNumber,
          locationLat: d.locationLat,
          locationLong: d.locationLong,
          streetAddress: d.streetAddress,
          locality: d.locality,
          district: d.district,
          city: d.city,
          province: d.province,
          postalCode: d.postalCode,
          ownershipType: d.ownershipType,
          rentStartDate: d.rentStartDate,
          rentDurationMonth: d.rentDurationMonth,
          otherPaymentSystem: d.otherPaymentSystem,
          businessType: d.businessType,
          businessDurationMonth: d.businessDurationMonth,
          businessMonthlyTurnover: d.businessMonthlyTurnover,
          merchantName: d.merchant.name,
          created_at: this.$moment(d.created_at).format('YYYY-MM-DD HH:mm:ss'),
          updated_at: this.$moment(d.updated_at).format('YYYY-MM-DD HH:mm:ss'),
          archived_at: this.$moment(d.archived_at).format('YYY-MM-DD HH:mm:ss'),
        })
      })
    },
    async submit(data) {
      try {
        const postData = {
          idAlias: data.idAlias,
          name: data.name,
          status: data.status,
          email: data.email,
          website: data.website,
          phoneNumber: data.phoneNumber,
          locationLat: data.locationLat ? data.locationLat : 0,
          locationLong: data.locationLong ? data.locationLong : 0,
          streetAddress: data.streetAddress,
          locality: data.locality,
          district: data.district,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode,
          ownershipType: data.ownershipType,
          rentStartDate: data.rentStartDate,
          rentDurationMonth: data.rentDurationMonth,
          otherPaymentSystem: data.otherPaymentSystem,
          businessType: data.businessType,
          businessDurationMonth: data.businessDurationMonth,
          businessMonthlyTurnover: data.businessMonthlyTurnover,
          merchantId: data.merchantId,
        }
        const response = await this.$axios.$post(this.url, postData)
        this.items.unshift(response.data)
        if (response.status === 'ent-201') {
          this.$store.commit('currentEdit', response.data)
          this.showSnackbar('success', response.message)
        }
      } catch (e) {
        this.catchError(e)
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
