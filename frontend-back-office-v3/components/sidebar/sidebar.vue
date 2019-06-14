<template>
  <div id="side-menu">
    <v-navigation-drawer
      :mini-variant="miniVariant"
      v-model="drawer"
      width="260"
      dark
      persistent
      fixed
      app
    >
      <v-toolbar flat class="transparent" dense>
        <v-list :class="{ 'list-border-bottom': miniVariant }" class="pt-1 mb-1">
          <v-list-tile>
            <v-list-tile-content v-if="!miniVariant" style="margin-left: 50px">
              <a href="/">
                <v-img src="/mika-logo.png" style="width:100px;"/>
              </a>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-btn icon @click.stop="miniVariant = !miniVariant;">
                <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'"/>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-toolbar>
      <v-divider/>
      <v-list :class="{ 'list-border-bottom': miniVariant }" dense>
        <template v-for="item in items">
          <v-tooltip :disabled="!miniVariant" :key="item._text" right>
            <v-list-tile
              slot="activator"
              :key="item.icon"
              :to="item.to"
              exact
              active-class="yellow--text"
            >
              <v-list-tile-action v-if="!miniVariant" class="ml-3">
                <v-icon v-html="item.icon"/>
              </v-list-tile-action>
              <v-list-tile-action v-if="miniVariant">
                <v-icon v-html="item.icon"/>
              </v-list-tile-action>
              <v-list-tile-content style="margin-left: -10px">
                <v-list-tile-title v-text="item.text"/>
              </v-list-tile-content>
            </v-list-tile>
            <span v-text="item.text"/>
            <!-- <v-list-group
              v-if="item.children"
              v-model="item.model"
              :prepend-icon="item.model ? item.icon : item['icon+alt']"
              append-icon
            >
              <v-list-tile slot="activator">
                <v-list-tile-content>
                  <v-list-tile-title>
                    {{ item.text }}
                  </v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile
                v-for="(child, i) in item.children" 
                :key="i"
                @click="child.to"
              >
                <v-list-tile-action v-if="child.icon">
                  <v-icon>{{ child.icon }}</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title>
                    {{ child.text }}
                  </v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list-group>-->
          </v-tooltip>
        </template>
      </v-list>
      <v-list-tile class="logout" @click="logout">
        <v-list-tile-action class="ml-3" v-if="!miniVariant">
          <v-icon>logout</v-icon>
        </v-list-tile-action>
        <v-list-tile-action v-if="miniVariant">
          <v-icon>logout</v-icon>
        </v-list-tile-action>
        <v-list-tile-content style="margin-left: -10px">
          <v-list-tile-title>Logout</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-navigation-drawer>
    <v-toolbar app flat dense style="background-color: rgb(248, 248, 248)">
      <v-toolbar-side-icon class="hidden-lg-and-up" @click.stop="drawer = !drawer;"/>
      <div class="hidden-lg-and-up mb-3">
        <a href="/admin">
          <v-img :src="`/mika-blue.png`" style="width:120px; margin-top: 10px;"/>
        </a>
      </div>
    </v-toolbar>
  </div>
</template>

<script>
import adminbutton from "~/components/admin.vue";
import { logout } from "~/mixins";
import { mapGetters, mapState } from "vuex";

export default {
  props: {
    items: {
      type: Array,
      required: true
    }
  },
  mixins: [logout],
  components: {
    "admin-button": adminbutton
  },
  data() {
    return {
      miniVariant: false,
      dialog: false,
      drawer: null,
      message: "hello"
    };
  },
  computed: {
    ...mapGetters(["isAuthenticated", "loggedInUser"])
  },
  methods: {
    dialogConfirm() {
      console.log("button logout");
    }
  }
};
</script>

<style>
</style>
