<template>
  <div class="agent">
    <v-card>
      <v-card-title class="grey lighten-4 py-4 title blue--text">
        Edit Agent
        <v-spacer/>
        <v-icon @click="close">close</v-icon>
      </v-card-title>
      <v-form @submit.prevent="putAgent()">
        <v-card-text>
          <v-text-field label="Name" v-model="name"/>
          <v-select label="Bounded to Terminal"/>
          <v-text-field label="General Location Long" v-model="generalLocationLong"/>
          <v-text-field label="Generarl Location Lat" v-model="generalLocationLat"/>
          <v-text-field label="Username" v-model="username"/>
          <v-text-field label="Outlet Name" v-model="outlet.name" readonly/>
          <v-text-field label="Merchant Name" v-model="merchant.name" readonly/>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn type="submit">Submit</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import { exit } from "~/mixins";
import { mapState } from "vuex";

export default {
  props: {
    outlet: {
      type: Object,
      default: () => ({
        params1: value
      })
    },
    merchant: {
      type: Object,
      default: () => ({})
    }
  },
  watch: {
    outlet: {
      immediate: true,
      handler() {
        this.name = this.agent.name;
        this.generalLocationLong = this.agent.generalLocationLong;
        this.generalLocationLat = this.agent.generalLocationLat;
        this.username = this.user.username;
      }
    }
  },
  mixins: [exit],
  data() {
    return {
      name: "",
      generalLocationLong: null,
      generalLocationLat: null,
      username: ""
    };
  },
  computed: {
    ...mapState(["agent", "user"])
  },
  methods: {
    async putAgent() {
      await this.$axios
        .$put(`/api/back_office/agents/${this.$route.params.id}`, {
          name: this.name
          // generalLocationLong: 0,
          // generalLocationLat: 0
        })
        .then(r => {
          console.log("location long", r);
          this.refresh();
          this.close();
        })
        .catch(e => console.log("error ", e));
    }
  }
};
</script>

<style>
</style>
