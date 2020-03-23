<template>
  <v-card class="pa-o ma-0 elevation-0">
    <form>
      <v-toolbar dark color="primary" flat v-if="showToolbar">
        <v-toolbar-title>Add Card IIN</v-toolbar-title>
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
      <v-container grid-list-sm class="pa-4">
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
            <v-autocomplete
              v-if="field.key === 'cardTypeId'"
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
            <v-autocomplete
              v-if="field.key === 'cardSchemeId'"
              v-model="formData[field.key]"
              v-validate="field.rules"
              :type="field.type"
              :error-messages="errors.collect(field.key)"
              :name="field.key"
              :data-vv-name="field.key"
              :data-vv-as="field.caption"
              :label="field.caption"
              :items="schemes"
              :loading="schemeLoading"
              :search-input.sync="searchScheme"
              item-text="name"
              item-value="id"
              placeholder="Start typing to Search"
              clearable
            ></v-autocomplete>
            <!-- <v-autocomplete
              v-if="field.key === 'cardIssuerId'"
              v-model="formData[field.key]"
              v-validate="field.rules"
              :type="field.type"
              :error-messages="errors.collect(field.key)"
              :name="field.key"
              :data-vv-name="field.key"
              :data-vv-as="field.caption"
              :label="field.caption"
              :items="issuers"
              :loading="issuerLoading"
              :search-input.sync="searchIssuer"
              item-text="name"
              item-value="id"
              placeholder="Start typing to Search"
              clearable
            ></v-autocomplete>-->

            <v-autocomplete
              v-if="field.key === 'cardIssuerId'"
              v-model="formData[field.key]"
              v-validate="field.rules"
              :type="field.type"
              :error-messages="errors.collect(field.key)"
              :name="field.key"
              :data-vv-name="field.key"
              :data-vv-as="field.caption"
              :items="issuers"
              :loading="issuerLoading"
              :search-input.sync="searchIssuer"
              item-text="name"
              item-value="id"
              placeholder="Start typing to Search"
              :readonly="!isEditing"
              :label="`${field.caption} — ${isEditing ? 'Editable' : 'Readonly'}`"
              persistent-hint
              :clearable="isEditing"
            >
              <template v-slot:append-outer>
                <v-slide-x-reverse-transition mode="out-in">
                  <v-icon
                    :key="`icon-${isEditing}`"
                    :color="isEditing ? 'success' : 'info'"
                    @click="isEditing = !isEditing"
                    v-text="isEditing ? 'mdi-check-outline' : 'mdi-circle-edit-outline'"
                  ></v-icon>
                </v-slide-x-reverse-transition>
              </template>
            </v-autocomplete>

            <v-textarea
              v-if="field.fieldType == 'textarea' && created == false"
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
            <v-text-field
              v-if="field.fieldType == 'date' && created "
              v-model="formData[field.key]"
              v-validate="field.rules"
              :type="field.type"
              :error-messages="errors.collect(field.key)"
              :name="field.key"
              :data-vv-name="field.key"
              :data-vv-as="field.caption"
              :label="field.caption"
              readonly
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
            <v-icon left>archive</v-icon>
            <span class="font-weight-black">Archive</span>
          </v-btn>
          <v-btn
            v-if="dataArchived && created"
            color="warning"
            class="mr-3"
            @click="showUnarchive = true"
          >
            <v-icon left>unarchive</v-icon>
            <span class="font-weight-black">Unarchive</span>
          </v-btn>
        </div>
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
export default {
  $_veeValidate: {
    validator: 'new',
  },
  components: {
    confirmation: confirmation,
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
      default: 'admin',
      required: false,
    },
    btnShowArchive: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      dialog: false,
      formField: formField,
      formData: {},

      typeLoading: false,
      searchType: '',
      types: [],
      schemes: [],
      searchScheme: '',
      schemeLoading: false,

      issuers: [],
      searchIssuer: '',
      issuerLoading: false,

      items: ['true', 'false'],
      created: false,
      edit: false,
      dataArchived: '',
      showArchive: false,
      textArchive: 'Are you sure want to archive this data?',
      titleArchive: 'Archive',
      showUnarchive: false,
      textUnarchive: 'Are you sure want to unarchive this data?',
      titleUnarchive: 'Unarchive',
      isEditing: false,
      model: null,
      states: [],
    }
  },
  watch: {
    showToolbar() {
      this.initiateData()
    },
    searchType: {
      handler: debounce(function() {
        if (this.types.length > 0) return
        if (this.typeLoading) return
        if (this.searchType == null) this.searchType = ''
        this.getTypes()
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
    searchScheme: {
      handler: debounce(function() {
        if (this.schemes.length > 0) return
        if (this.schemeLoading) return
        if (this.searchScheme == null) this.searchScheme = ''
        this.getSchemes()
      }, 500),
    },
    searchIssuer: {
      handler: debounce(function() {
        if (this.isEditing == true && this.issuers.length > 0) this.getIssuers()
        if (this.isEditing == false && this.issuers.length > 0) return
        if (this.issuerLoading) return
        if (this.searchIssuer == null) this.searchIssuer = ''
        this.getIssuers()
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
    prettier(value) {
      return JSON.stringify(value, undefined, '\t')
    },
    initiateData() {
      this.formData.description = this.$faker.sentence()
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
    async getTypes() {
      try {
        this.typeLoading = true
        const search =
          this.searchType != '' ? `f[name]=like,%${this.searchType}%` : ''
        const url = '/back_office/card_types?order_by=name&order=asc&' + search
        const resp = await this.$axios.$get(url)
        this.types = resp.data
        this.typeLoading = false
      } catch (e) {
        this.typeLoading = false
        this.catchError(e)
      }
    },
    async getSchemes() {
      try {
        this.schemeLoading = true
        const search =
          this.searchScheme != '' ? `f[name]=like,%${this.searchScheme}%` : ''
        const url =
          '/back_office/card_schemes?order_by=name&order=asc&' + search
        const resp = await this.$axios.$get(url)
        this.schemes = resp.data
        this.schemeLoading = false
      } catch (e) {
        this.schemeLoading = false
        this.catchError(e)
      }
    },
    async getIssuers() {
      try {
        this.issuerLoading = true
        const search =
          this.searchIssuer != '' ? `f[name]=like,%${this.searchIssuer}%` : ''
        const url = '/back_office/card_issuers?order_by=name&' + search
        const resp = await this.$axios.$get(url)
        this.issuers = resp.data
        this.issuerLoading = false
      } catch (e) {
        this.issuerLoading = false
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
