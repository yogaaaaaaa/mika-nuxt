export default {
  methods: {
    checkRoles(params) {
      let userRole = this.user.user.userRoles
      let role = userRole.includes(params)
      return role
    },
  },
  computed: {
    user() {
      return this.$store.state.auth.user
    },
  },
}
