<template>
  <v-dialog v-model="dialog" persistent width="500">
    <v-card>
      <v-card-title class="light-blue white--text">Export to CSV</v-card-title>

      <v-divider></v-divider>
      <v-card-text>
        <h3 class="title">Are you sure ?</h3>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="close">No</v-btn>
        <v-btn color="primary" text @click="confirm">Yes</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
      radios: [
        { value: 1, text: "As seen on screen" },
        { value: 2, text: "Custom" }
      ],
      radio: 1
    };
  },
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  watch: {
    show() {
      this.dialog = this.show;
    }
  },
  methods: {
    close() {
      this.$emit("onClose");
    },
    confirm() {
      this.$emit("onConfirm", this.radio);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
