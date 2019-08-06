<template>
  <div>
    <v-tooltip :top="tooltipTop" :bottom="tooltipBottom">
      <template v-slot:activator="{ on }">
        <v-btn
          v-on="on"
          :color="color"
          :text="text"
          :block="block"
          :outlined="outline"
          :icon="iconMode"
          :title="title"
          :tooltip-text="tooltipText"
          :dark="dark"
          :loading="loading"
          :disabled="disabled"
          :small="smallBtn"
          @click="onClick"
        >
          <v-icon v-if="icon != ''">{{ icon }}</v-icon>
          <span v-if="title">{{ title }}</span>
        </v-btn>
      </template>
      <span v-if="tooltipText">{{ tooltipText }}</span>
    </v-tooltip>
  </div>
</template>

<script>
export default {
  props: {
    color: {
      type: String,
      required: false,
      default: "secondary"
    },
    icon: {
      type: String,
      required: false,
      default: ""
    },
    tooltipText: {
      type: String,
      required: false,
      default: ""
    },
    title: {
      type: String,
      required: false,
      default: ""
    },
    text: {
      type: Boolean,
      required: false,
      default: false
    },
    block: {
      type: Boolean,
      required: false,
      default: false
    },
    outline: {
      type: Boolean,
      required: false,
      default: false
    },
    iconMode: {
      type: Boolean,
      required: false,
      default: false
    },
    dark: {
      type: Boolean,
      required: false,
      default: false
    },
    loading: {
      type: Boolean,
      required: false,
      default: false
    },
    tooltipTop: {
      type: Boolean,
      required: false,
      default: false
    },
    tooltipBottom: {
      type: Boolean,
      required: false,
      default: false
    },
    smallBtn: {
      type: Boolean,
      required: false,
      default: false
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  methods: {
    onClick() {
      this.$emit("onClick");
    }
  }
};
</script>

<style scoped>
</style>
