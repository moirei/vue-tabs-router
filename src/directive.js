export default {
  bind(element, binding, vnode) {
    element.addEventListener('click', (event) => {
      event.preventDefault()
      vnode.context.$tabs.to(binding.value)
    })
  },
}
