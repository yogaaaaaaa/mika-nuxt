export default {
  methods: {
    checkRoles(params) {
      let userRole = this.loggedInUser.user.userRoles;
      let role = userRole.includes(params);
      return role;
    }
  }
};
