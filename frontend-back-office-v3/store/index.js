export const state = () => ({
  token: null,
  merchants: [],
  transactions: [],
  totalPage: "",
  api: "",
  apiOutlet: "",
  apiAgent: "",
  apiTransaction: "",
  apiMerchantStaff: "",
  apiAcquirer: "",
  admin: "",
  user: "",
  merchant: "",
  outlet: "",
  agent: "",
  acquirerType: "",
  acquirer: ""
});

export const mutations = {
  setToken(state, token) {
    state.token = token;
  },
  setMerchants(state, merchants) {
    console.log("isi mutation");
    state.merchants = merchants;
  },
  setMerchant(state, merchant) {
    console.log("store merchant", merchant);
    state.merchant = merchant;
  },
  setOutlet(state, outlet) {
    state.outlet = outlet;
  },
  setTransactions(state, transactions) {
    console.log("store transactions");
    state.transactions = transactions;
  },
  setAcquirerType(state, acquirerType) {
    state.acquirerType = acquirerType;
  },
  setAcquirer(state, acquirer) {
    console.log("store acquirer", acquirer);
    state.acquirer = acquirer;
  },
  setApi(state, api) {
    console.log("store api ", api);
    state.api = api;
  },
  setApiOutlet(state, apiOutlet) {
    state.apiOutlet = apiOutlet;
  },
  setApiAgent(state, apiAgent) {
    state.apiAgent = apiAgent;
  },
  setApiTransaction(state, apiTransaction) {
    state.apiTransaction = apiTransaction;
  },
  setApiMerchantStaff(state, apiMerchantStaff) {
    state.apiMerchantStaff = apiMerchantStaff;
  },
  setApiAcquirer(state, apiAcquirer) {
    state.apiAcquirer = apiAcquirer;
  },
  setAdmin(state, admin) {
    state.admin = admin;
  },
  setAgent(state, agent) {
    state.agent = agent;
  },
  setUser(state, user) {
    state.user = user;
  }
};

export const getters = {
  isAuthenticated(state) {
    console.log("isauthenticated", state.auth.loggedIn);
    return state.auth.loggedIn;
  },
  loggedInUser(state) {
    console.log(state.auth.user);
    return state.auth.user;
  }
};
