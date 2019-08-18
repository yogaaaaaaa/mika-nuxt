<template>
  <div class="agent-marketing">
    <main-title :text="'List Agents'" :icon="'assignment_ind'" :show="false"/>
    <v-card style="padding: 2em">
      <table-agent
        :agents="agents"
        :filter="filterAgent"
        :totalPage="totalPage"
        :api="apiAgent"
        :loading="loading"
      />
    </v-card>
    <button-add @dialog="form = !form" v-if="checkRoles(`adminMarketing`)"/>
    <v-dialog v-model="form" width="700">
      <form-agent @close="form = false" @refresh="getAgents()" :outlet="outlet"/>
    </v-dialog>
  </div>
</template>

<script>
import tableAgent from "~/components/table/agents.vue";
import formAgent from "~/components/form/agent.vue";
import addButton from "~/components/add.vue";
import mainTitle from "~/components/mainTitle.vue";
import { mapGetters, mapState } from "vuex";
import { role, filterHeader } from "~/mixins";

export default {
  layout: "default-layout",
  middleware: "auth",
  components: {
    "table-agent": tableAgent,
    "form-agent": formAgent,
    "button-add": addButton,
    "main-title": mainTitle
  },
  mixins: [role, filterHeader],
  data() {
    return {
      agents: [],
      form: false,
      outlet: {},
      totalPage: 1,
      loading: true
    };
  },
  mounted() {
    this.getAgents();
  },
  computed: {
    ...mapGetters(["loggedInUser"]),
    ...mapState(["apiAgent"])
  },
  methods: {
    async getAgents() {
      await this.$axios
        .$get(`/api/back_office/agents?get_count=1`)
        .then(r => {
          this.agents = r.data;
          this.totalPage = r.meta.totalPage;
          this.loading = false;
          this.$store.commit(
            "setApiAgent",
            `/api/back_office/agents?get_count=1&page=`
          );
        })
        .catch(e => console.log(e));
    }
  }
};
</script>

<style>
</style>
