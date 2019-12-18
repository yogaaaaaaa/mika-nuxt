<template>
  <div class="mt-4">
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
        :footer-props="footerProps"
        :loading="loading"
        class="elevation-0 pa-2"
      >
        <template v-slot:item.name="{ item }">
          <a @click="toDetail(item.id)">{{ item.name }}</a>
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
    <dialogPassword
      :user="newUser"
      :password="password"
      :show="passwordDialog"
      @onCopy="copied"
      @onClose="passwordDialog = false"
    />
  </div>
</template>

<script>
import { catchError, tableMixin } from '~/mixins'
import debounce from 'lodash/debounce'
import { tableHeader, formAdd, dialogPassword } from '../commons'
import formField from './formField'

export default {
  components: {
    tableHeader,
    formAdd,
    dialogPassword,
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
      url: '/back_office/merchant_staffs',
      titlePage: 'Merchant Staff List',
      iconPage: 'perm_contact_calendar',
      btnAddText: 'Add Merchant Staff',
      headers: [
        { text: 'Name', value: 'name', sortable: false },
        { text: 'Id Card Number', value: 'idCardNumber', sortable: false },
        { text: 'Id Card Type', value: 'idCardType', sortable: false },
        { text: 'Created At', value: 'createdAt' },
        { text: 'Archived At', value: 'archivedAt' },
      ],
      dataToDownload: [],
      modalAddForm: false,
      formField: formField,
      frontendUrl: `/merchantStaffs`,
      permissionRole: 'adminMarketing',
      newUser: '',
      password: '',
      passwordDialog: false,
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
        this.generateDownload(this.items)
        this.loading = false
      } catch (e) {
        this.catchError(e)
      }
    },
    toDetail(id) {
      this.$router.push(`${this.frontendUrl}/${id}`)
    },
    downloadCsv() {
      this.csvExport(this.titlePage, this.dataToDownload)
    },
    generateDownload(data) {
      data.map(d => {
        this.dataToDownload.push({
          id: d.id,
          name: d.name,
          username: d.user.username,
          email: d.email,
          idCardNumber: d.idCardNumber,
          idCardType: d.idCardType,
          occupation: d.occupation,
          phoneNumber: d.phoneNumber,
          streetAddress: d.streetAddress,
          locacity: d.locacity,
          district: d.district,
          city: d.city,
          province: d.province,
          postalCode: d.postalCode,
          merchantId: d.merchantId,
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
          email: data.email,
          idCardNumber: data.idCardNumber,
          idCardType: data.idCardType,
          locationLong: data.locationLong,
          locationLat: data.locationLat,
          occupation: data.occupation,
          streetAddress: data.streetAddress,
          locality: data.locality,
          district: data.district,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode,
          phoneNumber: data.phoneNumber,
          merchantId: this.$route.params.id,
          user: {
            username: data.username,
          },
        }
        const response = await this.$axios.$post(`${this.url}/`, postData)
        this.items.unshift(response.data)
        this.newUser = response.data.name
        this.password = response.data.user.password
        this.passwordDialog = true
        if (response.status === 'ent-201') {
          this.$store.commit('currentEdit', response.data)
          this.showSnackbar('success', response.message)
        }
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
