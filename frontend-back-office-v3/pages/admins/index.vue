<template>
  <div>
    <pageTitle :title="`${$changeCase.titleCase(resource)} List`" icon="supervisor_account"></pageTitle>
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
            :props-data="{ roles }"
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
import { tableHeader, formAdd, pageTitle } from '~/components/commons'
import formField from '~/components/admins/formField'
import dialogPassword from '~/components/commons/dialogPassword'

export default {
  components: {
    tableHeader,
    formAdd,
    pageTitle,
    dialogPassword,
  },
  mixins: [catchError, tableMixin],
  data() {
    return {
      resource: 'admin',
      url: '/back_office/admins',
      btnAddText: 'Add Admin',
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
          text: 'Email',
          align: 'left',
          sortable: true,
          value: 'email',
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
      roles: [],
      permissionRole: 'adminHead',
      passwordDialog: false,
      password: '',
      newUser: '',
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
        const response = await this.$axios.$get(this.url + queries)
        this.totalCount = response.meta ? response.meta.totalCount : 0
        this.items = response.data
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
        const tmp = Object.values(resp.userRoleTypes)
        this.roles = this.changeCase(tmp)
      } catch (e) {
        this.catchError(e)
      }
    },
    downloadCsv() {
      this.generateDownload(this.items)
      this.csvExport(
        `Mika Admin Report ${this.$moment(new Date()).format(
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
          email: d.email,
          username: d.user.username,
          roles: d.user.userRoles.join(', '),
          description: d.description,
          created_at: this.$moment(d.created_at).format('YYYY-MM-DD HH:mm:ss'),
          updated_at: this.$moment(d.updated_at).format('YYYY-MM-DD HH:mm:ss'),
        })
      })
    },
    async submit(data) {
      try {
        const roles = this.changeCamelCase(data.userRoles)
        const postData = {
          name: data.name,
          email: data.email,
          description: data.description,
          user: {
            username: data.username,
            userRoles: roles,
          },
        }
        const response = await this.$axios.$post(this.url, postData)
        this.items.unshift(response.data)
        this.newUser = response.data.name
        this.password = response.data.user.password
        this.passwordDialog = true
        console.log(response.status)
        if (response.status === 'sys-200') {
          console.log(response)
          this.showSnackbar('success', 'Berhasil menambahkan admin baru')
          // this.showSnackbar('success', `${this.btnAddText} success`)
        }
      } catch (e) {
        this.catchError(e)
      }
    },
    toDetail(id) {
      this.$router.push(`/${this.resource}s/${id}`)
    },
    copied() {
      this.showSnackbar('success', 'Copied !')
    },
    changeCase(value) {
      const val = value.map(x => this.$changeCase.titleCase(x))
      return val
    },
    changeCamelCase(value) {
      const val = value.map(x => this.$changeCase.camelCase(x))
      return val
    },
  },
}
</script>

<style></style>
