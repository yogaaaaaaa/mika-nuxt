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
              v-if="field.key === 'agentId'"
              v-model="formData[field.key]"
              v-validate="field.rules"
              :type="field.type"
              :error-messages="errors.collect(field.key)"
              :name="field.key"
              :data-vv-name="field.key"
              :data-vv-as="field.caption"
              :label="field.caption"
              :items="agents"
              :loading="agentLoading"
              :search-input.sync="searchAgent"
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
              v-if="field.key === 'acquirerTerminalId'"
              v-model="formData[field.key]"
              v-validate="field.rules"
              :type="field.type"
              :error-messages="errors.collect(field.key)"
              :name="field.key"
              :data-vv-name="field.key"
              :data-vv-as="field.caption"
              :label="field.caption"
              :items="terminals"
              :loading="terminalLoading"
              :search-input.sync="searchTerminal"
              item-text="tid"
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
        <div v-if="created == false">
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
        </div>
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
    tooltip: tooltipButton,
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
      agentLoading: false,
      searchAgent: '',
      agents: [],
      configLoading: false,
      searchConfig: '',
      configs: [],

      typeLoading: false,
      searchType: '',
      types: [],

      terminalLoading: false,
      searchTerminal: '',
      terminals: [],
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
      edit: false,
    }
  },
  watch: {
    show() {
      this.dialog = this.show
      this.initiateData()
    },
    searchAgent: {
      handler: debounce(function() {
        if (this.agents.length > 0) return
        if (this.agentLoading) return
        if (this.searchAgent == null) this.searchAgent = ''
        this.getAgents()
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
    searchTerminal: {
      handler: debounce(function() {
        if (this.terminals.length > 0) return
        if (this.terminalLoading) return
        if (this.searchTerminal == null) this.searchTerminal = ''
        this.getTerminals()
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
    async getAgents() {
      try {
        this.agentLoading = true
        const search =
          this.searchAgent != '' ? `f[name]=like,%${this.searchAgent}%` : ''
        const url = '/back_office/agents?order_by=name&order=asc&' + search
        const resp = await this.$axios.$get(url)
        this.agentLoading = false
        this.agents = resp.data
      } catch (e) {
        this.agentLoading = false
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
    async getTerminals() {
      try {
        this.terminalLoading = true
        const search =
          this.searchTerminal != ''
            ? `f[name]=like,%${this.searchTerminal}%`
            : ''
        const url =
          '/back_office/acquirer_terminals?order_by=createdAt' + search
        const resp = await this.$axios.$get(url)
        this.terminals = resp.data
        this.terminalLoading = false
      } catch (e) {
        this.terminalLoading = false
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
