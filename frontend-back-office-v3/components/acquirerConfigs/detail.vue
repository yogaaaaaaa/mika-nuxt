<template>
  <v-card class="mt-6" flat>
    <dform
      :initial-data="initialData"
      :show="showDetail"
      :permission-role="permissionRole"
      @onClose="showDetail = false"
      @onSubmit="submit"
      @archive="archive"
      @unarchive="unarchived"
    ></dform>
  </v-card>
</template>

<script>
import dform from './dform'
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
      url: `/back_office/acquirer_configs`,
      initialData: {},
      configKeys: [],
      configValues: [],
      showDetail: true,
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
      try {
        data.config = JSON.parse(JSON.stringify(data.config))
        const postData = {
          name: data.name,
          description: data.description,
          config: data.config,
          handler: data.handler,
          sandbox: data.sandbox,
          merchantId: data.merchantId,
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
          name: this.currentEdit.name,
          description: this.currentEdit.description,
          // config: this.prettier(this.currentEdit.config),
          config: this.currentEdit.config,
          handler: this.currentEdit.handler,
          sandbox: this.currentEdit.sandbox,
          merchantId: this.currentEdit.merchantId,
          createdAt: this.currentEdit.createdAt,
          archivedAt: this.currentEdit.archivedAt,
        }
        this.configKeys = Object.keys(this.currentEdit.config)
        this.configValues = Object.values(this.currentEdit.config)
      }
    },
  },
}
</script>

<style></style>
