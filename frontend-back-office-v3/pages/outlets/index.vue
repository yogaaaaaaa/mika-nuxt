<template>
  <div class="outlet-marketing">
    <main-title :text="'List Outlets'" :icon="'store'" :show="false"/>
    <v-card style="padding:2em">
      <table-outlet :outlets="outlets"/>
      <download :data="outlets"/>
    </v-card>
    <button-add @dialog="form = !form" v-if="checkRoles(`adminMarketing`)"/>
    <v-dialog v-model="form" width="700">
      <form-outlet @close="dialog = false"/>
    </v-dialog>
  </div>
</template>

<script>
import tableOutlet from "~/components/table/outlets.vue";
import download from "~/components/download.vue";
import formOutlet from "~/components/form/outlet.vue";
import addButton from "~/components/add.vue";
import mainTitle from "~/components/mainTitle.vue";
import { mapGetters } from "vuex";
import { role } from "~/mixins";

export default {
  layout: "default-layout",
  middleware: "auth",
  components: {
    "table-outlet": tableOutlet,
    download: download,
    "form-outlet": formOutlet,
    "button-add": addButton,
    "main-title": mainTitle
  },
  mixins: [role],
  data() {
    return {
      outlets: [],
      form: false
    };
  },
  computed: {
    ...mapGetters(["loggedInUser"])
  }
};
</script>

<style>
.float {
  position: fixed;
  bottom: 0;
  left: 10px;
  margin-bottom: 10px;
}
</style>
