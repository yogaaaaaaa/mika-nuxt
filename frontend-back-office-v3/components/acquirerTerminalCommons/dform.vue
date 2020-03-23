<template>
  <v-card>
    <form>
      <v-toolbar dark color="primary" flat v-if="showToolbar">
        <v-toolbar-title>Add Acquirer</v-toolbar-title>
        <div class="flex-grow-1"></div>
        <v-toolbar-items>
          <v-btn dark text @click="close">
            <v-icon>close</v-icon>
          </v-btn>
          <v-btn dark text @click="submit">
            <v-icon>save</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-container grid-list-md>
        <v-layout wrap>
          <v-flex v-for="field in formField" :key="field.key" xs12>
            <v-text-field
              v-if="field.fieldType == 'text'"
              v-model="formData[field.key]"
              v-validate="field.rules"
              :type="field.type"
              :error-messages="errors.collect(field.key)"
              :name="field.key"
              :data-vv-name="field.key"
              :data-vv-as="field.caption"
              :label="field.caption"
            />
            <v-checkbox
              v-if="field.fieldType === 'check'"
              v-model="formData[field.key]"
              :label="field.caption"
              color="primary"
            ></v-checkbox>

            <v-autocomplete
              v-if="field.key === 'acquirerCompanyId'"
              v-model="formData[field.key]"
              v-validate="field.rules"
              :type="field.type"
              :error-messages="errors.collect(field.key)"
              :name="field.key"
              :data-vv-name="field.key"
              :data-vv-as="field.caption"
              :label="field.caption"
              :items="companies"
              :loading="companyLoading"
              :search-input.sync="searchCompany"
              item-text="name"
              item-value="id"
              placeholder="Start typing to Search"
              clearable
            ></v-autocomplete>

            <v-textarea
              v-if="field.fieldType == 'textarea'"
              v-model="formData[field.key]"
              v-validate="field.rules"
              row-height="5"
              auto-grow
              :type="field.type"
              :error-messages="errors.collect(field.key)"
              :name="field.key"
              :data-vv-name="field.key"
              :data-vv-as="field.caption"
              :label="field.caption"
            />
          </v-flex>
        </v-layout>
        <!-- <div v-if="created == false">
          <h4 class="mb-3">
            Config
            <tooltip :icon="'add'" :tooltip-text="'add field config'" @onClick="configFields++"/>
            <tooltip
              v-if="configFields > 1"
              :icon="'remove'"
              :tooltip-text="'remove field config'"
              @onClick="configFields--"
            />
          </h4>
          <div v-for="(item, index) in configFields" :key="item">
            <v-text-field label="Config Key" v-model="configKeys[index]"/>
            <v-text-field label="Config Value" v-model="configValues[index]"/>
          </div>
        </div>
        <div>
          <div v-if="created == true">
            <div v-if="edit == false">
              <div v-for="(data, index) in configKeys" :key="index">
                <v-text-field
                  :label="configKeys[index]"
                  v-model="configValues[index]"
                  v-if="configValues[index].length < 100"
                />
                <v-textarea
                  :label="configKeys[index]"
                  v-model="configValues[index]"
                  v-else
                  auto-grow
                />
              </div>
            </div>
            <v-textarea v-model="formData.config" auto-grow v-if="edit == true"></v-textarea>
          </div>
        </div>-->
      </v-container>
      <v-card-actions v-if="checkRoles(permissionRole)">
        <v-spacer></v-spacer>
        <div v-show="btnShowArchive">
          <v-btn
            v-if="!dataArchived && created"
            color="warning"
            class="mr-3"
            @click="showArchive = true"
          >
            <v-icon>archive</v-icon>
            <span class="font-weight-black">Archive</span>
          </v-btn>
          <v-btn
            v-if="dataArchived && created"
            color="warning"
            class="mr-3"
            @click="showUnarchive = true"
          >
            <v-icon>unarchive</v-icon>
            <span class="font-weight-black">Unarchive</span>
          </v-btn>
        </div>
        <v-btn color="primary" text @click="close" v-if="!created">
          <v-icon>close</v-icon>
        </v-btn>
        <v-btn color="primary" @click="submit">
          <v-icon>save</v-icon>
        </v-btn>
      </v-card-actions>
    </form>
    <confirmation
      :show="showArchive"
      :title="titleArchive"
      :text="textArchive"
      :color="'warning'"
      @onConfirm="archive"
      @onClose="showArchive = false"
    />
    <confirmation
      :show="showUnarchive"
      :title="titleUnarchive"
      :text="textUnarchive"
      :color="'warning'"
      @onConfirm="unarchive"
      @onClose="showUnarchive = false"
    />
  </v-card>
</template>

<script>
import formField from './formField'
import { catchError, checkRoles } from '~/mixins'
import debounce from 'lodash/debounce'
import confirmation from '~/components/commons/confirmation'
import { tooltipButton } from '~/components/commons'
export default {
  $_veeValidate: {
    validator: 'new',
  },
  components: {
    confirmation,
    // tooltip: tooltipButton,
  },
  mixins: [catchError, checkRoles],
  props: {
    showToolbar: {
      type: Boolean,
      required: false,
      default: false,
    },
    initialData: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    permissionRole: {
      type: String,
      required: false,
      default: 'admin',
    },
  },
  data() {
    return {
      dialog: false,
      formField: formField,
      formData: {},

      configLoading: false,
      searchConfig: '',
      configs: [],

      companyLoading: false,
      searchCompany: '',
      companies: [],

      created: false,
      dataArchived: '',
      btnShowArchive: true,
      showArchive: false,
      titleArchive: 'Archive',
      textArchive: 'Are you sure want to archive this data?',
      showUnarchive: false,
      titleUnarchive: 'Unarchive',
      textUnarchive: 'Are you sure want to unarchive this data?',
      configFields: 1,
      configKeys: [],
      configValues: [],
      config: '',
    }
  },
  watch: {
    show() {
      this.dialog = this.show
      this.initiateData()
    },
    searchCompany: {
      handler: debounce(function() {
        if (this.companies.length > 0) return
        if (this.companyLoading) return
        if (this.searchCompany == null) this.searchCompany = ''
        this.getCompanies()
      }, 500),
    },
    initialData() {
      if (Object.keys(this.initialData).length > 0) {
        this.formData = Object.assign({}, this.initialData)
        this.formData.createdAt = this.$moment(this.formData.createdAt).format(
          'YYYY-MM-DD, HH:mm:ss'
        )
        if (this.formData.archivedAt) {
          this.formData.archivedAt = this.$moment(
            this.formData.archivedAt
          ).format('YYYY-MM-DD, HH:mm:ss')
        }
        this.created = true
        this.dataArchived = this.formData.archivedAt
      }
    },
  },
  mounted() {
    this.formField.map(f => (this.formData[f.key] = f.value))
    if (Object.keys(this.initialData).length > 0) {
      this.formData = Object.assign({}, this.initialData)
      this.dataArchived = this.formData.archivedAt
      this.formData.createdAt = this.$moment(this.formData.createdAt).format(
        'YYYY-MM-DD, HH:mm:ss'
      )
      if (this.formData.archivedAt) {
        this.formData.archivedAt = this.$moment(
          this.formData.archivedAt
        ).format('YYYY-MM-DD, HH:mm:ss')
      }
      console.log('formData config', this.initialData.config)
      this.created = true
    }
  },
  methods: {
    initiateData() {
      this.formData.description = this.$faker.sentence()
    },
    async submit() {
      this.$validator.validateAll().then(result => {
        if (result) {
          this.toConfig()
          this.$emit('onSubmit', {
            formData: this.formData,
            config: this.config,
          })
          this.close()
          // this.formData = {}
        }
      })
    },
    close() {
      this.$emit('onClose')
    },
    async getCompanies() {
      try {
        this.companyLoading = true
        const search =
          this.searchCompany != '' ? `f[name]=like,%${this.searchCompany}%` : ''
        const url =
          '/back_office/acquirer_companies?order_by=name&order=asc&' + search
        const resp = await this.$axios.$get(url)
        this.companies = resp.data
        this.companyLoading = false
      } catch (e) {
        this.companyLoading = false
        this.catchError(e)
      }
    },
    archive() {
      this.$emit('archive')
      this.showArchive = false
    },
    unarchive() {
      this.$emit('unarchive')
      this.showUnarchive = false
    },
    toConfig() {
      const config = Object.assign(
        {},
        ...this.configKeys.map((a, b) => ({ [a]: this.configValues[b] }))
      )
      this.config = JSON.parse(JSON.stringify(config))
    },
  },
}
</script>

<style lang="scss" scoped></style>
