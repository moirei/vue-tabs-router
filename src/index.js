import TabsRouterView from "./components/TabsRouterView";
import directive from "./directive";
import { getRouteName, warn } from "./helpers";
import * as module from "./store.module";

const install = function(Vue, options) {
  options = options || {};

  if (!options.store) {
    warn(
      false,
      "Please provide store instance or register the package's store module as 'tabs'"
    );
  } else {
    options.store.registerModule("tabs", {
      namespaced: true,
      ...module,
    });
  }

  if (!options.directive) options.directive = "tabs-route";

  // Ne Tab defaults
  if (!options.newTabDefaults)
    options.newTabDefaults = {
      label: "New Tab",
      navigation: false,
    };

  // register components
  const components = { TabsRouterView };
  Object.keys(components).forEach((name) => {
    Vue.component(name, components[name]);
  });

  Vue.directive(options.directive, directive);

  Object.defineProperty(Vue.prototype, "$tabs", {
    get() {
      const instance = this;

      return {
        options,

        hooks: {
          willAddTab: options.willAddTab || ((tab) => tab),
          willRenderTab: options.willRenderTab || ((tab) => tab),
        },

        newTab(value = null) {
          const { to, ...opts } = {
            ...options.newTabDefaults,
            ...(value || {}),
          };
          const tab = {
            ...opts,
            key: typeof to === "object" ? to.name : Date.now(),
            route: to || { name: "index" },
            navigation: true,
          };

          this.hooks.willAddTab(tab);

          instance.$store.dispatch("tabs/addTab", tab);
        },

        updateTab(tab, data) {
          instance.$store.dispatch("tabs/updateTab", {
            tab,
            data,
          });
        },

        removeTab(tab) {
          instance.$store.dispatch("tabs/removeTab", tab);
        },

        to(value) {
          const tab = { ...value };
          if (value.component) {
            tab.label = value.label ?? value.name;
            tab.component = value.component;
            tab.key = Date.now();
          } else {
            const to = value.to ? value.to : value;
            const { route } = instance.$router.resolve(to);
            tab.label = value.label ?? getRouteName(route);
            const { name, params, query } = route;
            tab.route = { name, params, query };
            tab.key = route.name;
          }
          tab.navigation = !!value.navigation;

          this.hooks.willAddTab(tab);

          instance.$store.dispatch("tabs/addTab", tab);
        },
      };
    },
  });
};

export default { install };
