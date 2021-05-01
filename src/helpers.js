export function startCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

export function getRouteName(route, default_name = "") {
  if (route.name == "index") {
    return "Home";
  }

  let path_name = "";
  if (route.path && route.path.length > 2) {
    const paths = route.path.split("/");
    path_name = paths
      .slice(paths.length - 2, paths.length)
      .filter((p) => p)
      .map(startCase)
      .join(" — ");
  }

  const route_name = (route.name || default_name)
    .split("-")
    .map(startCase)
    .join(" — ");

  return similarStrings(path_name, route_name) >= 25 ? path_name : route_name;
}

export function similarStrings(a, b) {
  var equivalency = 0;
  var minLength = a.length > b.length ? b.length : a.length;
  var maxLength = a.length < b.length ? b.length : a.length;
  for (var i = 0; i < minLength; i++) {
    if (a[i] == b[i]) {
      equivalency++;
    }
  }

  var weight = equivalency / maxLength;
  return weight * 100; // percent
}

const START = "/";
const trailingSlashRE = /\/?$/;

function isObjectEqual(a, b) {
  if (a === void 0) a = {};
  if (b === void 0) b = {};

  // handle null value #1566
  if (!a || !b) {
    return a === b;
  }
  var aKeys = Object.keys(a);
  var bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  return aKeys.every(function(key) {
    var aVal = a[key];
    var bVal = b[key];
    // check nested equality
    if (typeof aVal === "object" && typeof bVal === "object") {
      return isObjectEqual(aVal, bVal);
    }
    return String(aVal) === String(bVal);
  });
}

export function isSameRoute(a, b) {
  if (b === START) {
    return a === b;
  } else if (!b) {
    return false;
  } else if (a.path && b.path) {
    return (
      a.path.replace(trailingSlashRE, "") ===
        b.path.replace(trailingSlashRE, "") &&
      a.hash === b.hash &&
      isObjectEqual(a.query, b.query)
    );
  } else if (a.name && b.name) {
    return (
      a.name === b.name &&
      a.hash === b.hash &&
      isObjectEqual(a.query, b.query) &&
      isObjectEqual(a.params, b.params)
    );
  } else {
    return false;
  }
}

export function warn(condition, message) {
  if (!condition) {
    typeof console !== "undefined" &&
      console.warn("[app-tabs-route] " + message);
  }
}

export function extend(a, b) {
  for (var key in b) {
    a[key] = b[key];
  }
  return a;
}

export function fillPropsinData(component, data, route, configProps) {
  // resolve props
  let propsToPass = (data.props = resolveProps(route, configProps));
  if (propsToPass) {
    // clone to prevent mutation
    propsToPass = data.props = extend({}, propsToPass);
    // pass non-declared props as attrs
    const attrs = (data.attrs = data.attrs || {});
    for (const key in propsToPass) {
      if (!component.props || !(key in component.props)) {
        attrs[key] = propsToPass[key];
        delete propsToPass[key];
      }
    }
  }
}

export function resolveProps(route, config) {
  switch (typeof config) {
    case "undefined":
      return;
    case "object":
      return config;
    case "function":
      return config(route);
    case "boolean":
      return config ? route.params : undefined;
    default:
      if (process.env.NODE_ENV !== "production") {
        warn(
          false,
          `props in "${route.path}" is a ${typeof config}, ` +
            `expecting an object, function or boolean.`
        );
      }
  }
}

export function handleRouteEntered(route) {
  for (var i = 0; i < route.matched.length; i++) {
    var record = route.matched[i];
    for (var name in record.instances) {
      var instance = record.instances[name];
      var cbs = record.enteredCbs[name];
      if (!instance || !cbs) {
        continue;
      }
      delete record.enteredCbs[name];
      for (var i$1 = 0; i$1 < cbs.length; i$1++) {
        if (!instance._isBeingDestroyed) {
          cbs[i$1](instance);
        }
      }
    }
  }
}
