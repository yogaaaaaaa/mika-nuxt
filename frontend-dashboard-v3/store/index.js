export const state = () => ({
  sidebar: false,
  snackbar: false,
  snackbarText: "",
  snackbarColor: "error"
});

export const mutations = {
  toggleSidebar(state) {
    state.sidebar = !state.sidebar;
  },
  snackbar(state, val) {
    state.snackbar = val;
  },
  snackbarText(state, val) {
    state.snackbarText = val;
  },
  snackbarColor(state, val) {
    state.snackbarColor = val;
  }
};

export const actions = {};

export const getters = {};
