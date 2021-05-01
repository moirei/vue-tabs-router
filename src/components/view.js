import { extend, handleRouteEntered, fillPropsinData } from "./../helpers";

export default {
  name: "TabsView",
  props: {
    name: {
      type: String,
      default: "default",
    },
    route: {},
    component: {},
  },
  render() {
    let props = { ...this.$props };
    let data = { ...this.$data };
    let parent = { ...this.$parent };
    let children = [...this.$children];

    data.routerView = true;

    // directly use parent context's createElement() function
    // so that components rendered by router-view can resolve named slots
    const h = parent.$createElement;
    const name = props.name;
    const route = this.$router.resolve(props.route).resolved;
    const cache = parent._routerViewCache || (parent._routerViewCache = {});

    // determine current view depth, also check to see if the tree
    // has been toggled inactive but kept-alive.
    let depth = 0;
    let inactive = false;
    while (parent && parent._routerRoot !== parent) {
      const vnodeData = parent.$vnode ? parent.$vnode.data : {};
      if (vnodeData.routerView) {
        depth++;
      }
      if (vnodeData.keepAlive && parent._directInactive && parent._inactive) {
        inactive = true;
      }
      parent = parent.$parent;
    }
    data.routerViewDepth = depth;

    // render previous view if the tree is inactive and kept-alive
    if (inactive) {
      const cachedData = cache[name];
      const cachedComponent = cachedData && cachedData.component;
      if (cachedComponent) {
        // #2301
        // pass props
        if (cachedData.configProps) {
          fillPropsinData(
            cachedComponent,
            data,
            cachedData.route,
            cachedData.configProps
          );
        }
        return h(cachedComponent, data, children);
      } else {
        // render previous empty view
        return h();
      }
    }

    const matched = route.matched[depth];
    const component = props.component
      ? props.component
      : matched && matched.components[name];

    // render empty node if no matched route or no config component
    if (!matched || !component) {
      cache[name] = null;
      return h();
    }

    // cache component
    cache[name] = { component };

    // attach instance registration hook
    // this will be called in the instance's injected lifecycle hooks
    data.registerRouteInstance = (vm, val) => {
      // val could be undefined for unregistration
      const current = matched.instances[name];
      if ((val && current !== vm) || (!val && current === vm)) {
        matched.instances[name] = val;
      }
    };

    // also register instance in prepatch hook
    // in case the same component instance is reused across different routes
    (data.hook || (data.hook = {})).prepatch = (_, vnode) => {
      matched.instances[name] = vnode.componentInstance;
    };

    // register instance in init hook
    // in case kept-alive component be actived when routes changed
    data.hook.init = (vnode) => {
      if (
        vnode.data.keepAlive &&
        vnode.componentInstance &&
        vnode.componentInstance !== matched.instances[name]
      ) {
        matched.instances[name] = vnode.componentInstance;
      }

      // if the route transition has already been confirmed then we weren't
      // able to call the cbs during confirmation as the component was not
      // registered yet, so we call it here.
      handleRouteEntered(route);
    };

    const configProps = matched.props && matched.props[name];
    // save route and configProps in cache
    if (configProps) {
      extend(cache[name], {
        route,
        configProps,
      });
      fillPropsinData(component, data, route, configProps);
    }

    return h(component, data, children);
  },
};
