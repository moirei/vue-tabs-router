import Vue from 'vue'

export const state = () => ({
  tab: 'index',
  tabs: [
    {
      label: 'Home',
      key: 'index',
      favicon: '/favicon.ico',
      route: { name: 'index' },
      navigation: true,
      closable: false,
    },
  ],
})

export const getters = {
  tabs: (state) => state.tabs,
  tab: (state) => state.tab,
  activeTabDetails: (state) => state.tabs.find((t) => t.key == state.tab),
}

export const mutations = {
  setTab: (state, payload) => (state.tab = payload),
  setTabs: (state, payload) => (state.tabs = payload),
  addTab: (state, payload) => {
    const exists = state.tabs.find((t) => t.key === payload.key)
    if (!exists) {
      state.tab = payload.key
      state.tabs.push(payload)
    } else if (state.tab !== payload.key) {
      state.tab = payload.key
    }
  },
  updateTab: (state, { tab, data }) => {
    const index = state.tabs.findIndex((t) => t.key === tab.key)
    if (index >= 0) {
      Vue.set(state.tabs, index, { ...state.tabs[index], ...data })
    }
  },
  removeTab: (state, payload) => {
    const index = state.tabs.findIndex((tab) => tab.key == payload.key)
    if (index >= 0) {
      state.tabs.splice(index, 1)
      if (state.tabs.length === 1) state.tabs[0].closable = false
    }
  },
}

export const actions = {
  setTab: ({ commit }, payload) => commit('setTab', payload),
  setTabs: ({ commit }, payload) => commit('setTabs', payload),
  addTab: ({ commit }, payload) => commit('addTab', payload),
  updateTab: ({ commit }, payload) => commit('updateTab', payload),
  removeTab: ({ commit }, payload) => commit('removeTab', payload),
}
