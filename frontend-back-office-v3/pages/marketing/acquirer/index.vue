<template>
  <div id="acquirer">
    <main-title
      :text="'List Acquirer'"
      :icon="'device_hub'"
      :show="false"
    />
    <v-card class="pa-4">
      <table-acquirer 
        :acquirers="acquirers" 
      />
    </v-card>
    <button-add @dialog="form = !form" />
    <v-dialog v-model="form" width="700">
      <form-acquirer @close="form = false" />
    </v-dialog>
  </div>
</template>

<script>
import acquirerTable from "~/components/table/acquirers.vue";
import addButton from "~/components/add.vue";
import acquirerForm from "~/components/form/acquirer.vue";
import mainTitle from "~/components/mainTitle.vue"

export default {
  layout: "marketing-layout",
  components: {
    "table-acquirer": acquirerTable,
    "button-add": addButton,
    "form-acquirer": acquirerForm,
    "main-title": mainTitle
  },
  data() {
    return {
      acquirers: [],
      form: false,
      contoh: []
    }
  },
  mounted() {
    this.getAcquirers()
  },
  methods: {
    async getAcquirers() {
      await this.$axios.$get(
        `/api/back_office/acquirers`
      ).then( r => {
        this.acquirers = r.data
      })
    }
  }
}
</script>

<style>

</style>
