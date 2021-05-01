<template>
  <div id="app-tab" class="h-100" :class="{ 'theme-dark': dark }">
    <client-only>
      <vue-tabs-chrome
        ref="tabs"
        :class="{ 'theme-dark': dark }"
        v-model="tab"
        @hook:mounted="$nextTick(checkCurrentRoute)"
        @remove="removeTab"
        :tabs="tabs"
        :render-label="renderLabel"
      >
        <template #after>
          <v-btn icon small @click="addTab"><v-icon small>add</v-icon></v-btn>
        </template>
      </vue-tabs-chrome>
    </client-only>
    <component :is="container">
      <keep-alive v-for="t in storeTabs" :key="t.key">
        <tabs-view v-if="t.key == tab" :route="t.route" />
      </keep-alive>
    </component>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { getRouteName, isSameRoute } from "./../helpers";
import TabsView from "./view";
import VueTabsChrome from "vue-tabs-chrome";

export default {
  name: "TabsRouterView",
  components: { VueTabsChrome, TabsView },
  props: {
    dark: { type: Boolean, default: false },
    container: { type: String, default: "div" },
  },
  data() {
    return {
      tabs: [],
    };
  },
  mounted() {
    this.storeTabs.forEach((tab) => this.addStateTab(tab));
  },
  computed: {
    ...mapGetters({
      storeTabs: "tabs/tabs",
      activeTabDetails: "tabs/activeTabDetails",
    }),
    tab: {
      set(value) {
        this.$store.dispatch("tabs/setTab", value);
      },
      get() {
        return this.$store.getters["tabs/tab"];
      },
    },
  },
  methods: {
    addTab() {
      this.$tabs.newTab({ navigation: true });
    },
    checkCurrentRoute() {
      // if current route is not the active tab, add tab
      const { route } = this.activeTabDetails;
      if (
        route &&
        !isSameRoute(this.$router.resolve(route).resolved, this.$route)
      ) {
        this.newNavigation(this.$route);
      }
    },
    addStateTab(tab) {
      const newTab = { ...tab };
      this.$tabs.hooks.willRenderTab(newTab);
      // const newTab = this.$tabs.hooks.willRenderTab({ ...tab })
      const exists = this.tabs.find((t) => t.key === newTab.key);
      if (!exists) this.tabs.push(newTab);
    },
    removeTab(tab) {
      this.$tabs.removeTab(tab);
    },
    updateFromStore() {
      const tabs = [];
      const currentTabs = this.$refs.tabs.getTabs();
      this.storeTabs.forEach((tab) => {
        const newTab = { ...tab };
        this.$tabs.hooks.willRenderTab(newTab);
        // const newTab = this.$tabs.hooks.willRenderTab({ ...tab })
        const exists = currentTabs.find((t) => t.key === newTab.key);
        if (!exists) tabs.push(newTab);
      });

      this.$refs.tabs.addTab(...tabs);
    },
    renderLabel(tab) {
      // get latest changes
      tab = this.storeTabs.find((t) => t.key == tab.key);
      return tab?.label ?? "New Tab";
    },
    newNavigation(route) {
      const { name, params, query, path } = route;
      this.$tabs.newTab({
        to: { name, params, query, path },
        navigation: true,
      });
    },
  },
  watch: {
    storeTabs: {
      deep: true,
      handler: "updateFromStore",
    },
    tab: async function() {
      const { route } = this.activeTabDetails;
      if (
        route &&
        !isSameRoute(this.$router.resolve(route).resolved, this.$route)
      ) {
        try {
          await this.$router.replace(route);
        } catch (error) {
          // mostly trying to route twice
        }
      }
    },
    $route(to) {
      if (this.activeTabDetails.route) {
        const route = this.$router.resolve(this.activeTabDetails.route)
          .resolved;
        if (isSameRoute(route, to)) return;
      }

      if (this.activeTabDetails.navigation) {
        const { name, params, query, path } = to;
        this.$tabs.updateTab(this.activeTabDetails, {
          route: { name, params, query, path },
          label: getRouteName(to, this.$tabs.options.newTabDefaults.label),
        });
      } else {
        this.newNavigation(to);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
#app-tab.theme-dark {
  background-color: #323639;
}
</style>
