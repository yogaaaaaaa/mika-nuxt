export const state = () => ({
  sidebar: false,
  snackbarShow: false,
  snackbarText: '',
  snackbarType: '',
  filterValue: null,
  filterBy: null,
  operator: null,
  dateFilter: null,
  confirmTitle: '',
  confirmText: '',
  confirmShow: false,
  confirmColor: 'primary',
  currentEdit: null,
  filterArchived: null,
  login: true,
})

export const mutations = {
  snackbarShow(state, v) {
    state.snackbarShow = v
  },
  snackbarText(state, v) {
    state.snackbarText = v
  },
  snackbarType(state, v) {
    state.snackbarType = v
  },
  filterBy(state, v) {
    state.filterBy = v
  },
  operator(state, v) {
    state.operator = v
  },
  filterValue(state, v) {
    state.filterValue = v
  },
  filterArchived(state, v) {
    state.filterArchived = v
  },
  dateFilter(state, v) {
    state.dateFilter = v
  },
  confirmTitle(state, v) {
    state.confirmTitle = v
  },
  confirmText(state, v) {
    state.confirmText = v
  },
  confirmShow(state, v) {
    state.confirmShow = v
  },
  confirmColor(state, v) {
    state.confirmColor = v
  },
  currentEdit(state, v) {
    state.currentEdit = v
  },
  login(state, v) {
    state.login = v
  },
}

export const actions = {
  showConfirm(context, p) {
    context.commit('confirmShow', p.confirmShow || true)
    context.commit('confirmTitle', p.confirmTitle || '')
    context.commit(
      'confirmText',
      p.confirmText || 'Are you sure want to logout ?'
    )
    context.commit('confirmColor', 'warning')
    context.commit('login', false)
  },
  clearFilter(context) {
    context.commit('filterBy', null)
    context.commit('operator', null)
    context.commit('filterValue', null)
    context.commit('filterArchived', null)
  },
}

export const getters = {}
