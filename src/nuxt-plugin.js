import Vue from 'vue'
import VueAppTabs from './vue-app-tabs'

export default ({ app }) => {
  Vue.use(VueAppTabs, { store: app.store })
}
