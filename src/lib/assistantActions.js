// assistantActions.js - executes the action list returned by POST /assistant.
// The server never touches the UI; everything happens here. Returns what happened
// so the chat can confirm it ("Added X to cart") instead of trusting the model's words.
// deps.signal (optional AbortSignal): remaining actions are skipped once it aborts.

export async function runActions(actions, deps = {}) {
  if (!Array.isArray(actions)) return []
  const results = []
  for (const action of actions) {
    if (deps.signal?.aborted) break
    const result = await runAction(action, deps)
    if (result) results.push(result)
  }
  return results
}

async function runAction(action, { navigate, addToCart, onNavigate, from, signal }) {
  if (!action || !action.type) return null

  switch (action.type) {
    case "navigate":
      if (!action.route) return null
      navigate(action.route)
      onNavigate?.()
      return { type: "navigate", ok: true, route: action.route }

    case "add_to_cart": {
      const ok = await addToCart({ id: action.productId, quantity: action.quantity || 1, size: action.size })
      if (signal?.aborted) return null
      return { type: "add_to_cart", ok: !!ok, name: action.name, size: action.size, quantity: action.quantity || 1 }
    }

    case "require_auth":
      navigate("/signin", { state: { from } })
      return { type: "require_auth", ok: true }

    // render_products and confirm_checkout are drawn by the chat itself
    default:
      return null
  }
}

export default runActions
