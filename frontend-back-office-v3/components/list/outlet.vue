<template>
  <div id="list-outlet">
    <v-tab-item value="list-outlet">
      <sub-title :text="'List Outlets'" :icon="'store'" id="outletList" />
      <v-card class="pa-3 mt-1">
        <table-outlet :outlets="outlets" />
        <download :data="outlets" />
        <button-add-small :text="'Add Outlet'" @dialog="dialogOutlet = !dialogOutlet"/>
      </v-card>
      <v-dialog v-model="dialogOutlet" width="700">
        <form-outlet @close="dialogOutlet = false" />
      </v-dialog>
    </v-tab-item>
  </div>
</template>

<script>
import outletTable from "~/components/table/outlets.vue"
import download from "~/components/download.vue"
import addSmallButton from "~/components/addSmall.vue"
import outletForm from "~/components/form/outlet.vue"
import subTitle from "~/components/subtitle.vue"

export default {
  props: {
    outlets: {
      type: Array,
      required: true
    },
    dialogOutlet: {
      type: Boolean,
      default: false
    }
  },
  components: {
    "table-outlet": outletTable,
    "download": download,
    "button-add-small": addSmallButton,
    "form-outlet": outletForm,
    "sub-title": subTitle
  }

}
</script>

<style>

</style>
