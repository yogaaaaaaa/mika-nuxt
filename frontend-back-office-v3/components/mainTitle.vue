<template>
  <div id="main-title">
    <div class="headline font-weight-light blue--text mb-2 mt-4">
      <v-icon color="blue" medium>{{ icon }}</v-icon>
      {{ text }}
      <v-menu
        v-model="menu"
        v-show="show"
        :close-on-content-click="false"
        :nudge-width="100"
        offset-x
      >
        <template slot="activator">
          <v-btn
            color="blue"
            flat
            round
            icon
          >
            <v-icon>keyboard_arrow_right</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-tile v-for="item in items" :key="item.title" @click="$vuetify.goTo(item.to, options )">
            <v-list-tile-title>{{ item.title }}</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </div>    
  </div>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    items: {
      type: Array,
      default: function() { return [] }
    },
    show: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      options: {
        duration: 1000,
        offset: 0,
        easing: "easeOutCubic"
      },
      menu: ""
    }
  }
}
</script>
