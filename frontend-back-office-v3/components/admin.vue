<template>
    <div id="list-admin">
      <v-speed-dial
        v-model="fab"
        :top="true"
        :right="true"
        :left="false"
        :bottom="false"
        :direction="direction"
        :transition="transition"
        fixed
      >
        <v-btn 
          v-model="fab"
          slot="activator"
          class="yellow accent-2"
          fab
          small
          hover
        >
          <v-icon>toys</v-icon>
          <v-icon>close</v-icon>
        </v-btn>
        <v-tooltip v-for="adm in admins" :key="adm.text" bottom>
          <v-btn 
            @click="toDetail(adm.to)"
            slot="activator"
            fab
            small
          >
            <v-icon>{{ adm.icon }}</v-icon>
          </v-btn>
          <span>{{ adm.text }}</span>
        </v-tooltip>
      </v-speed-dial>
  </div>
</template>

<script>
export default {
  data() {
    return {
      fab: false,
      direction: "left",
      transition: 'slide-y-reverse-transition',
      co1: "yellow",
      callce: "/callCenter",
      admins: [
        { icon: "call", text: "Call Center", to: "/callCenter", color: "yellow lighten-1" },
        { icon: "local_atm", text: "Finance", to: "/finance", color: "yellow lighten-2" },
        { icon: "perm_contact_calendar", text: "HR", to: "/hr", color: "yellow lighten-3" },
        { icon: "class", text: "Logistic", to: "/logistic", color: "yellow lighten-4" },
        { icon: "group", text: "Marketing", to: "/marketing", color: "yellow lighten-5" }
      ]
    }
  },
  methods: {
    toDetail(name) {
      return this.$router.push(name)
    }
  }
}
</script>

<style scoped>
#list-admin {
  margin-top: 4em;
}
</style>

