<template>
  <v-card class="pa-0 ma-0" flat>
    <form class="pa-0 ma-0">
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
      <v-container grid-list-sm>
        <v-layout wrap>
          <v-flex v-for="field in formField" :key="field.key" :sm6="sm6" xs12>
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
              v-if="field.key === 'merchantId'"
              v-model="formData[field.key]"
              v-validate="field.rules"
              :type="field.type"
              :error-messages="errors.collect(field.key)"
              :name="field.key"
              :data-vv-name="field.key"
              :data-vv-as="field.caption"
              :label="field.caption"
              :items="merchants"
              :loading="merchantLoading"
              :search-input.sync="searchMerchant"
              item-text="name"
              item-value="id"
              placeholder="Start typing to Search"
              clearable
            ></v-autocomplete>

            <v-autocomplete
              v-if="field.key === 'acquirerConfigId'"
              v-model="formData[field.key]"
              v-validate="field.rules"
              :type="field.type"
              :error-messages="errors.collect(field.key)"
              :name="field.key"
              :data-vv-name="field.key"
              :data-vv-as="field.caption"
              :label="field.caption"
              :items="configs"
              :loading="configLoading"
              :search-input.sync="searchConfig"
              item-text="name"
              item-value="id"
              placeholder="Start typing to Search"
              clearable
            ></v-autocomplete>

            <v-autocomplete
              v-if="field.key === 'acquirerTypeId'"
              v-model="formData[field.key]"
              v-validate="field.rules"
              :type="field.type"
              :error-messages="errors.collect(field.key)"
              :name="field.key"
              :data-vv-name="field.key"
              :data-vv-as="field.caption"
              :label="field.caption"
              :items="types"
              :loading="typeLoading"
              :search-input.sync="searchType"
              item-text="name"
              item-value="id"
              placeholder="Start typing to Search"
              clearable
            ></v-autocomplete>

            <v-textarea
              v-if="field.fieldType == 'textarea'"
              v-model="formData[field.key]"
              v-validate="field.rules"
              :type="field.type"
              :error-messages="errors.collect(field.key)"
              :name="field.key"
              :data-vv-name="field.key"
              :data-vv-as="field.caption"
              :label="field.caption"
            />
          </v-flex>
        </v-layout>
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
  <!-- </v-dialog> -->
</template>

<script>
// import formField from './formField'
import { catchError, checkRoles } from '~/mixins'
import debounce from 'lodash/debounce'
import { confirmation } from '~/components/commons'
export default {
  $_veeValidate: {
    validator: 'new',
  },
  components: {
    confirmation,
  },
  mixins: [catchError, checkRoles],
  props: {
    permissionRole: {
      type: String,
      required: false,
      default: 'admin',
    },
    btnShowArchive: {
      type: Boolean,
      required: false,
      default: false,
    },
    initialData: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    showToolbar: {
      type: Boolean,
      required: false,
      default: true,
    },
    formField: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      sm6: true,
      formData: {},
      merchantLoading: false,
      searchMerchant: '',
      merchants: [],

      configLoading: false,
      searchConfig: '',
      configs: [],

      typeLoading: false,
      searchType: '',
      types: [],
      showArchive: false,
      titleArchive: 'Archive',
      textArchive: 'Are you sure want to archive this data?',
      showUnarchive: false,
      titleUnarchive: 'Unarchive',
      textUnarchive: 'Are you sure want to unarchive this data?',
      created: false,
      dataArchived: false,
    }
  },
  watch: {
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
    searchMerchant: {
      handler: debounce(function() {
        if (this.merchants.length > 0) return
        if (this.merchantLoading) return
        if (this.searchMerchant == null) this.searchMerchant = ''
        this.getMerchants()
      }, 500),
    },
    searchConfig: {
      handler: debounce(function() {
        if (this.configs.length > 0) return
        if (this.configLoading) return
        if (this.searchConfig == null) this.searchConfig = ''
        this.getConfigs()
      }, 500),
    },

    searchType: {
      handler: debounce(function() {
        if (this.types.length > 0) return
        if (this.typeLoading) return
        if (this.searchType == null) this.searchType = ''
        this.getTypes()
      }, 500),
    },
  },
  mounted() {
    this.formField.map(f => (this.formData[f.key] = f.value))
    if (Object.keys(this.initialData).length > 0) {
      this.formData = Object.assign({}, this.initialData)
      this.formData.createdAt = this.$moment(this.formData.createdAt).format(
        'YYYY-MM-DD, HH:mm:ss'
      )
      this.created = true
      if (this.formData.archivedAt) {
        this.formData.archivedAt = this.$moment(
          this.formData.archivedAt
        ).format('YYYY-MM-DD, HH:mm:ss')
      }

      this.dataArchived = this.formData.archivedAt
    }
  },
  methods: {
    initiateData() {
      this.formData.minimumAmount = this.$faker.integer({
        min: 1,
        max: 3,
      })
      this.formData.processFee = 200
      this.formData.shareAcquirer = 1
      this.formData.shareMerchant = 98
    },
    async submit() {
      this.$validator.validateAll().then(result => {
        if (result) {
          this.$emit('onSubmit', this.formData)
          this.close()
        }
      })
    },
    close() {
      this.$emit('onClose')
    },
    async getMerchants() {
      try {
        this.merchantLoading = true
        const search =
          this.searchMerchant != ''
            ? `f[name]=like,%${this.searchMerchant}%`
            : ''
        const url = '/back_office/merchants?order_by=name&order=asc&' + search
        const resp = await this.$axios.$get(url)
        this.merchants = resp.data
        this.merchantLoading = false
      } catch (e) {
        this.merchantLoading = false
        this.catchError(e)
      }
    },
    async getConfigs() {
      try {
        this.configLoading = true
        const search =
          this.searchConfig != '' ? `f[name]=like,%${this.searchConfig}%` : ''
        const url =
          '/back_office/acquirer_configs?order_by=name&order=asc&' + search
        const resp = await this.$axios.$get(url)
        this.configs = resp.data
        this.configLoading = false
      } catch (e) {
        this.configLoading = false
        this.catchError(e)
      }
    },
    async getTypes() {
      try {
        this.typeLoading = true
        const search =
          this.searchType != '' ? `f[name]=like,%${this.searchType}%` : ''
        const url =
          '/back_office/acquirer_types?order_by=name&order=asc&' + search
        const resp = await this.$axios.$get(url)
        this.types = resp.data
        this.typeLoading = false
      } catch (e) {
        this.typeLoading = false
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
  },
}
</script>

<style lang="scss" scoped></style>
