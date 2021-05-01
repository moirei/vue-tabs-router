# Configuration Options



## Tab Options

| Attribute    | Description                                                  | Default   |
| ------------ | ------------------------------------------------------------ | --------- |
| `label`      | The tab label                                                | `New Tab` |
| `navigation` | If set to the `true`, and the tab is selected, changing the app route will update the tab | `false`   |
| `favicon`    | Displayed next to the tab                                    |           |

Additional fields may be added for custom behaviour.



## Configuration Example

A configuration example for Nuxt.

```javascript
import Vue from 'vue'
import VueAppTabs from '@moirei/vue-tabs-router'
import { get } from 'lodash'

export default ({ app }) => {
  Vue.use(VueAppTabs, {
    store: app.store,

    newTabDefaults: {
      label: 'New Tab',
      navigation: false,
      icon: 'tab',
    },

    // hook before adding tabs
    willAddTab(tab) {
      if (tab.icon) {
        tab.favicon = {
          type: 'icon',
          icon: tab.icon ? tab.icon : 'apps',
        }
      }
    },

    // tab pre-render hook
    willRenderTab(tab) {
      if (typeof tab.favicon === 'string') return tab

      const type = get(tab.favicon, 'type')
      const icon = get(tab.favicon, 'icon')

      if (type !== 'icon') {
        tab.favicon = icon
        return tab
      }

      // disaplay icons with vuetify's v-icon
      tab.favicon = (h) => {
        const e = h('v-icon', icon)
        Vue.nextTick(() => (e.elm.style['font-size'] = '16px'))
        return e
      }

      return tab
    },
  })
}

```

