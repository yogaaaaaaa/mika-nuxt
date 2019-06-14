export default {
  methods: {
    close: function() {
      this.$emit("close");
    },
    alert: function() {
      this.$emit("alert");
    },
    refresh: function() {
      this.$emit("refresh");
    }
  }
};
