<template>
  <div class="outlet-marketing">
    <main-title :text="'List Outlets'" :icon="'store'" :show="false"/>
    <v-card style="padding:2em">
      <table-outlet :outlets="outlets" :filter="filterOutlet" :api="apiOutlet" :loading="loading"/>
    </v-card>
    <button-add @dialog="form = !form" v-if="checkRoles(`adminMarketing`)"/>
    <v-dialog v-model="form" width="700">
      <!-- <form-outlet @close="dialog = false"/> -->
    </v-dialog>
  </div>
</template>

<script>
import tableOutlet from "~/components/table/outlets.vue";
import formOutlet from "~/components/form/outlet.vue";
import addButton from "~/components/add.vue";
import mainTitle from "~/components/mainTitle.vue";
import { mapGetters, mapState } from "vuex";
import { role, filterHeader } from "~/mixins";

export default {
  layout: "default-layout",
  middleware: "auth",
  components: {
    "table-outlet": tableOutlet,
    "form-outlet": formOutlet,
    "button-add": addButton,
    "main-title": mainTitle
  },
  mixins: [role, filterHeader],
  data() {
    return {
      outlets: [],
      form: false,
      totalPage: "",
      loading: true
    };
  },
  mounted() {
    this.getOultes();
  },
  computed: {
    ...mapGetters(["loggedInUser"]),
    ...mapState(["apiOutlet"])
  },
  methods: {
    async getOultes() {
      await this.$axios
        .$get(`/api/back_office/outlets?get_count=1`)
        .then(r => {
          this.outlets = r.data;
          this.totalPage = r.meta.ofPage;
          this.$store.commit(
            "setApiOutlet",
            `/api/back_office/outlets?get_count=1&page=`
          );
          this.loading = false;
        })
        .catch(e => alert(e));
    }
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
