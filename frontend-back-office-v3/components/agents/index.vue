<template>
  <div class="mt-4">
    <v-card card flat>
      <v-card-title>
        <tableHeader
          :filter="headers"
          :btn-add-text="btnAddText"
          :show-add-btn="showAddBtn"
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
        <template v-slot:item.createdAt="{ item }">{{
          $moment(item.createdAt).format('YYYY-MM-DD')
        }}</template>
        <template v-slot:item.archivedAt="{ item }" class="text-center">
          <div v-if="item.archivedAt">
            {{ $moment(item.archivedAt).format('YYYY-MM-DD') }}
          </div>
          <span v-else>-</span>
        </template>
      </v-data-table>
    </v-card>
    <v-dialog v-model="modalAddForm" width="600" persistent>
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
            :permission-role="permissionRole"
            @close="modalAddForm = false"
            @onSubmit="submit"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
    <dialogPassword
      :user="newAgent"
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
    showAddBtn: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      url: '/back_office/agents',
      titlePage: 'Agent List',
      iconPage: 'person',
      btnAddText: 'Add Merchant Agent',
      headers: [
        { text: 'Name', value: 'name', sortable: false },
        { text: 'Username', value: 'user.username', sortable: false },
        { text: 'Created At', value: 'createdAt' },
        { text: 'Archived At', value: 'archivedAt' },
      ],
      dataToDownload: [],
      modalAddForm: false,
      formField: formField,
      frontendUrl: `/agents`,
      permissionRole: 'adminMarketing',
      newAgent: '',
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
    const index = this.formField.findIndex(d => d.key === 'outletId')
    if (index != -1) {
      let outletIdIndex = this.formField[index]
      outletIdIndex.value = this.$route.params.id
      this.formField.splice(index, 1, outletIdIndex)
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
          created_at: this.$moment(d.created_at).format('YYYY-MM-DD HH:mm:ss'),
          updated_at: this.$moment(d.updated_at).format('YYYY-MM-DD HH:mm:ss'),
        })
      })
    },
    async submit(data) {
      try {
        const postData = {
          name: data.name,
          generalLocationLong: data.generalLocationLong,
          generalLocationLat: data.generalLocationLat,
          description: data.description,
          outletId: data.outletId,
          user: {
            username: data.username,
            password: data.password,
          },
        }
        const response = await this.$axios.$post(this.url, postData)
        this.items.unshift(response.data)
        this.newAgent = response.data.name
        this.password = response.data.user.password
        this.passwordDialog = true
        if (response.status === 'ent-201') {
          this.$store.commit('currentEdit', response.data)
          this.showSnackbar('success', response.message)
        }
      } catch (e) {
        console.log('error')
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
