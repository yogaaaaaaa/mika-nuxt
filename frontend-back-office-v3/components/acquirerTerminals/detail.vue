<template>
  <v-card class="mt-6" flat>
    <dform
      :form-field="formField"
      :initial-data="initialData"
      :sm6="true"
      :permission-role="permissionRole"
      @onSubmit="submit"
      @archive="archive"
      @unarchived="unarchived"
      class="elevation-0"
    />
    <!-- <div v-if="currentEdit.config" class="px-3">
      <h4 class="mb-4">Config</h4>
      <div v-for="(data, index) in configKeys" :key="index">
        <v-text-field
          :label="configKeys[index]"
          v-model="configValues[index]"
          v-if="configValues[index].length < 100"
        />
        <v-textarea :label="configKeys[index]" v-model="configValues[index]" v-else auto-grow/>
      </div>
    </div>-->
  </v-card>
</template>

<script>
import dform from '~/components/acquirerTerminals/dform'
import formField from './formField'
import { catchError, toArchive } from '~/mixins'

export default {
  components: {
    dform,
  },
  mixins: [catchError, toArchive],
  data() {
    return {
      formField: formField,
      permissionRole: 'adminMarketing',
      url: `/back_office/acquirer_terminals`,
      initialData: {},
      configKeys: [],
      configValues: [],
    }
  },
  computed: {
    currentEdit() {
      return this.$store.state.currentEdit
    },
  },
  mounted() {
    this.populateInitialData()
  },
  methods: {
    prettier(value) {
      return JSON.stringify(value, undefined, '\t')
    },
    async submit(data) {
      data.config = JSON.parse(data.config)
      try {
        const postData = {
          name: data.name,
          mid: data.mid,
          tid: data.tid,
          acquirerTerminalCommonId: data.acquirerTerminalCommonId,
          type: data.type,
          config: data.config,
          description: data.description,
        }
        const response = await this.$axios.$put(
          `${this.url}/${this.$route.params.id}`,
          postData
        )
        if (response.status !== 'ent-406') {
          response.data.config = this.prettier(response.data.config)
          this.$store.commit('currentEdit', response.data)
          this.showSnackbar('success', `Data successfuly edited`)
        }
      } catch (e) {
        this.catchError(e)
      }
    },
    populateInitialData() {
      if (this.currentEdit) {
        this.initialData = {
          id: this.currentEdit.id,
          name: this.currentEdit.name ? this.currentEdit.name : '-',
          mid: this.currentEdit.mid,
          tid: this.currentEdit.tid,
          acquirerTerminalCommonId: this.currentEdit.acquirerTerminalCommonId,
          traceNumberCounter: this.currentEdit.traceNumberCounter,
          type: this.currentEdit.type,
          config: this.prettier(this.currentEdit.config),
          createdAt: this.currentEdit.createdAt,
          archivedAt: this.currentEdit.archivedAt,
        }
      }
    },
  },
}
</script>

<style></style>
