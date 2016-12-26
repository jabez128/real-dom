const maybe = (...funcs) => funcs.reduce((accumulator, current) => arg => {
  const result = accumulator(arg)
  return (result === null || result === undefined)
    ? null
    : current(result)
}, arg => arg)
    , flatten = array => array.reduce((acc, cur) => acc.concat(cur), [])

const removeAllChildren = element => (Array.prototype.forEach.call(element.children, child => element.removeChild(child)), element)
    , returnFocusToElement = maybe(x => x.id, x => document.getElementById(x), x => x.focus())

const render = root => tree => {  
  const focused = document.activeElement
  removeAllChildren(root).appendChild(tree)
  returnFocusToElement(focused)
}

export const h = (tagName, props = {}, ...children) => {
  if (typeof tagName === 'function')
    return tagName(props)
  const node = Object.assign(document.createElement(tagName), props)
  Object.assign(node.style, (props || {}).style)
  flatten(children).forEach(child => node.appendChild((typeof child !== 'object') ? document.createTextNode(child) : child))
  return node
}

export const component = (initState, view, reducer = (state, action) => action, registerSubscriptions = dispatch => null) => root => {
  let state = initState
  const renderer = render(root)
  const dispatch = action => {
    state = reducer(state, action)
    renderer(view(state, dispatch))
  }
  registerSubscriptions(dispatch)
  renderer(view(state, dispatch))
}