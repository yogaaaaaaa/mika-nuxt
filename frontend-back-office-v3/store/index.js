export const state = () => ({
  token: null
});

export const mutations = {
  setToken(state, token) {
    state.token = token;
  }
};

export const getters = {
  isAuthenticated(state) {
    console.log("isauthenticated", state.auth.loggedIn);
    return state.auth.loggedIn;
  },
  loggedInUser(state) {
    return state.auth.user;
  }
};
