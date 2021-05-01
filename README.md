# vue-tabs-router

A Vue2 router implementation for [vue-tabs-chrome](https://github.com/viewweiwu/vue-tabs-chrome).
**vue-tabs-chrome** is a brilliant package for chrome-like tabs :heart_eyes:.

This packages takes it a bit to the next level by providing a router component for your application.



## Installation

```bash
npm i @moirei/vue-tabs-router
```



Configure the plugin

See [extended example](docs/docs-options.md#configuration-example).

```javascript
import Vue from 'vue'
import store from './store'
import VueTabsRouter from '@moirei/vue-tabs-router'

Vue.use(VueTabsRouter, { store })
```



Use the router component

```html
<template>
  <v-app id="app">
    <v-main>
      <!-- Comment out nuxt or router-view -->
      <!-- <v-container>
        <nuxt />
      </v-container> -->
      <tabs-router-view
        :dark="isDark"
        container="v-container"
      />
    </v-main>
  </v-app>
</template>

...
```

### Nuxt

```javascript
// @/plugins/tabs-router-view.js

import Vue from 'vue'
import VueTabsRouter from '@moirei/vue-tabs-router'

export default ({ app }) => {
  Vue.use(VueTabsRouter, { store: app.store })
}

```

## Usage

**Using the directive**

This will open the route page in a new tab

```html
<v-btn
    icon
    v-tabs-route="{
      label: 'Settings',
      to: { name: 'settings' },
    }"
  >
  <v-icon small>settings</v-icon>
</v-btn>
```

**Using the plugin**

```javascript
this.$tabs.to({
    label: 'Settings',
    to: { name: 'settings' },
})
```

See [all tab options](docs/docs-options.md#tab-options).

## Dependencies

* [vue-router](https://github.com/vuejs/vue-router): You'll need **vue-router** installed and configured.
* [vuex](https://github.com/vuejs/vuex)



## Caveats

* Tabs do not render server-side

## Credits

* [Augustus Okoye](https://github.com/augustusnaz)

## License

[MIT](https://choosealicense.com/licenses/mit/)