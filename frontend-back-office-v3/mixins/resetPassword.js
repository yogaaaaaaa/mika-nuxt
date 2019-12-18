export default {
  data() {
    return {
      resetPassword: '',
      showDialogPassword: false,
    }
  },
  methods: {
    async setPassword() {
      try {
        const resp = await this.$axios.$post(`${this.urlResetPassword}`)
        this.resetPassword = resp.data.password
        this.showDialogPassword = true
        if (resp.status == 'auth-204') {
          this.showSnackbar('success', resp.message)
        }
        if (resp.status == 'auth-304') {
          this.showSnackbar('failed', resp.message)
        }
      } catch (e) {
        this.showSnackbar('warning', e.message)
      }
    },
    copied() {
      this.showSnackbar('success', 'Copied !')
    },
  },
}
