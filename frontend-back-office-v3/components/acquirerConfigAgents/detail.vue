<template>
  <v-card class="mt-6" flat>
    <dform
      :show="show"
      :initial-data="initialData"
      :permission-role="permissionRole"
      @onClose="show = false"
      @onSubmit="submit"
      @archive="archive"
      @unarchive="unarchived"
      width="600"
    ></dform>
  </v-card>
</template>

<script>
import formField from './formField'
import dform from './dform'
import { catchError, toArchive } from '~/mixins'
import debounce from 'lodash/debounce'

export default {
  components: {
    dform,
  },
  mixins: [catchError, toArchive],
  data() {
    return {
      formField: formField,
      permissionRole: 'adminMarketing',
      url: `/back_office/acquirer_config_agents`,
      initialData: {},
      show: true,
    }
  },
  computed: {
    currentEdit() {
      return this.$store.state.currentEdit
    },
  },
  watch: {
    currentEdit() {
      this.populateInitialData()
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
      try {
        data.config = JSON.parse(JSON.stringify(data.config))
        const postData = {
          acquirerConfigId: data.acquirerConfigId,
          agentId: data.agentId,
          acquirerTerminalId: data.acquirerTerminalId,
          batchNumberCounter: data.batchNumberCounter,
          latestSettleBatchId: data.latestSettleBatchId,
          config: data.config,
        }
        const response = await this.$axios.$put(
          `${this.url}/${this.$route.params.id}`,
          postData
        )
        if (response.status !== 'ent-406') {
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
          acquirerConfigName: this.currentEdit.acquirerConfig.name,
          agentName: this.currentEdit.agent.name,
          description: this.currentEdit.description,
          config: this.prettier(this.currentEdit.config),
          latestSettleBatchId: this.currentEdit.latestSettleBatchId,
          batchNumberCounter: this.currentEdit.batchNumberCounter,
          createdAt: this.currentEdit.createdAt,
          archivedAt: this.currentEdit.archivedAt,
          acquirerTerminalId: this.currentEdit.acquirerTerminalId,
          agentId: this.currentEdit.agentId,
          acquirerConfigId: this.currentEdit.acquirerConfigId,
        }
      }
    },
  },
}
</script>

<style></style>
