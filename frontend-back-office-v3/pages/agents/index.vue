<template>
  <div class="agent-marketing">
    <main-title :text="'List Agents'" :icon="'assignment_ind'" :show="false"/>
    <v-card style="padding: 2em">
      <table-agent :agents="agents"/>
      <download :data="agents"/>
    </v-card>
    <button-add @dialog="form = !form" v-if="checkRoles(`adminMarketing`)"/>
    <v-dialog v-model="form" width="700">
      <form-agent @close="form = false"/>
    </v-dialog>
  </div>
</template>

<script>
import tableAgent from "~/components/table/agents.vue";
import download from "~/components/download.vue";
import formAgent from "~/components/form/agent.vue";
import addButton from "~/components/add.vue";
import mainTitle from "~/components/mainTitle.vue";
import { mapGetters } from "vuex";
import { role } from "~/mixins";

export default {
  layout: "default-layout",
  middleware: "auth",
  components: {
    "table-agent": tableAgent,
    download: download,
    "form-agent": formAgent,
    "button-add": addButton,
    "main-title": mainTitle
  },
  mixins: [role],
  data() {
    return {
      agents: [],
      form: false
    };
  },
  mounted() {
    this.getAgents();
  },
  computed: {
    ...mapGetters(["loggedInUser"])
  },
  methods: {
    async getAgents() {
      await this.$axios
        .$get(`/api/back_office/agents`)
        .then(r => {
          this.agents = r.data;
        })
        .catch(e => console.log(e));
    }
  }
};
</script>

<style>
</style>
