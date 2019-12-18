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
  </div>
</template>

<script>
import { catchError, tableMixin } from '~/mixins'
import debounce from 'lodash/debounce'
import { tableHeader, pageTitle, formAdd } from '~/components/commons'
import formField from '~/components/terminalModels/formField'

export default {
  components: {
    tableHeader,
    pageTitle,
    formAdd,
  },
  mixins: [catchError, tableMixin],
  data() {
    return {
      resource: 'terminalModel',
      url: '/back_office/terminal_models',
      btnAddText: 'Add Terminal Model',
      headers: [
        {
          text: 'Name',
          align: 'left',
          sortable: true,
          value: 'name',
        },
        {
          text: 'Date',
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
      permissionRole: 'adminSupport',
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
          name: d.name,
          manufacturer: d.manufacturer,
          description: d.description,
          created_at: this.$moment(d.created_at).format('YYYY-MM-DD HH:mm:ss'),
          updated_at: this.$moment(d.updated_at).format('YYYY-MM-DD HH:mm:ss'),
          archived_at: this.$moment(d.archived_at).format(
            'YYYY-MM-DD HH:mm:ss'
          ),
        })
      })
    },
    async submit(data) {
      try {
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
