mutationObserverHasBuggyRemovedNodes(result => {
  if (result) patchInnerHTMLToRemoveChildNodes()
})

function mutationObserverHasBuggyRemovedNodes(callback) {
  if (!window.MutationObserver) {
    callback(false)
    return
  }

  const element = document.createElement("div")
  element.innerHTML = "<div><div></div></div>"

  const observer = new MutationObserver(mutations => {
    observer.disconnect()
    const mutation = mutations[0]
    if (mutation && mutation.type == "childList") {
      const removedNode = mutation.removedNodes[0]
      const isBuggy = removedNode.childNodes.length == 0
      callback(isBuggy)
    }
  })

  observer.observe(element, { childList: true, subtree: true })
  element.innerHTML = ""
}

function patchInnerHTMLToRemoveChildNodes() {
  const { prototype } = HTMLElement
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "innerHTML")
  if (!descriptor) return
  const { set } = descriptor
  if (!set) return

  Object.defineProperty(prototype, "innerHTML", {
    set(value) {
      while (this.lastChild) {
        this.removeChild(this.lastChild)
      }
      set.call(this, value)
    }
  })
}
