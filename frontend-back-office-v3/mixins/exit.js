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
    },
    archive: function(params) {
      let archiveConfirm = confirm(
        `Are you sure want to archive this`,
        params,
        `?`
      );
      if (archiveConfirm == true) {
        this.$emit("archive");
      }
    }
  }
};
