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
        />
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="items"
        :options.sync="options"
        :server-items-length="totalCount"
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
        <template v-slot:item.archivedAt="{ item }">
          <div v-if="item.archivedAt">{{ $moment(item.archivedAt).format('YYYY-MM-DD') }}</div>
          <div v-else>-</div>
        </template>
      </v-data-table>
    </v-card>
    <v-dialog v-model="modalAddForm" width="600" persistent>
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
            :with-top-toolbar="false"
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
import { tableHeader, formAdd } from '~/components/commons'
import formField from '~/components/acquirerStaffs/formField'
import dialogPassword from '~/components/commons/dialogPassword'

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
      resource: 'acquirerStaffs',
      url: '/back_office/acquirer_staffs',
      btnAddText: 'Add Acquirer Staff',
      headers: [
        {
          text: 'Name',
          align: 'left',
          sortable: true,
          value: 'name',
        },
        {
          text: 'Username',
          align: 'left',
          sortable: true,
          value: 'user.username',
        },
        {
          text: 'Acquirer Company Id',
          value: 'acquirerCompanyId',
        },
        {
          text: 'Register at',
          align: 'left',
          sortable: true,
          value: 'createdAt',
        },
        {
          text: 'Archived at',
          sortable: true,
          value: 'archivedAt',
        },
      ],
      dataToDownload: [],
      modalAddForm: false,
      formField: formField,
      permissionRole: 'adminMarketing',
      passwordDialog: false,
      password: '',
      newUser: '',
      acquirerCompanyId: `${this.$route.params.id}`,
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
    this.populateData()
    this.$store.dispatch('clearFilter')
    this.getRoles()
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
    async getRoles() {
      try {
        const resp = await this.$axios
          .$get('/utilities/auth_props')
          .then(res => res.data)
        this.roles = Object.values(resp.userRoleTypes)
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
          name: d.name,
          username: d.user.username,
          email: d.email,
          phoneNumber: d.phoneNumber,
          acquirerCompanyId: d.acquirerCompanyId,
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
          email: data.email,
          phoneNumber: data.phoneNumber,
          description: data.description,
          acquirerCompanyId: this.acquirerCompanyId,
          user: {
            username: data.username,
          },
        }
        const response = await this.$axios.$post(this.url, postData)
        this.items.unshift(response.data)
        this.newUser = response.data.name
        this.password = response.data.user.password
        this.passwordDialog = true
        this.showSnackbar('success', `${this.btnAddText} success`)
      } catch (e) {
        this.catchError(e)
      }
    },
    toDetail(id) {
      this.$router.push(`/${this.resource}/${id}`)
    },
    copied() {
      this.showSnackbar('success', 'Copied !')
    },
  },
}
</script>

<style></style>
