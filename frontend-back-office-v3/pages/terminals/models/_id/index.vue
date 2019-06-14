<template>
  <div id="detail-terminal-model" class="mt-4">
    <sub-title :text="'Detail Terminal Model'" :icon="'system_update'"/>
    <card-terminal-model :model="terminalModel"/>
  </div>
</template>

<script>
import subTitle from "~/components/subtitle.vue";
import terminalModelCard from "~/components/card/terminalModel.vue";

export default {
  layout: "default-layout",
  components: {
    "sub-title": subTitle,
    "card-terminal-model": terminalModelCard
  },
  data() {
    return {
      terminalModel: ""
    };
  },
  mounted() {
    this.getTerminalModel();
  },
  methods: {
    async getTerminalModel() {
      try {
        this.terminalModel = await this.$axios
          .$get(`/api/back_office/terminal_models/${this.$route.params.id}`)
          .then(res => res.data);
      } catch (e) {
        console.log(e);
      }
    }
  }
};
</script>

<style>
</style>
