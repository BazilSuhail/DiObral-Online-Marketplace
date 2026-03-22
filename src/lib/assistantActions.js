// assistantActions.js - executes the action list returned by POST /assistant.
// The server never touches the UI; everything happens here.
// NOTE: We intentionally do NOT close the assistant modal on navigate/checkout/auth.
// The widget stays open so the user can keep chatting after routing.

export async function runActions(actions, deps) {
  if (!Array.isArray(actions)) return;
  for (const action of actions) {
    await runAction(action, deps);
  }
}

async function runAction(action, deps) {
  if (!action || !action.type) return;
  const { navigate, addToCart } = deps;

  switch (action.type) {
    case "navigate":
      if (action.route) navigate(action.route);
      break;

    case "add_to_cart":
      if (addToCart) {
        await addToCart({
          id: action.productId,
          quantity: action.quantity || 1,
          size: action.size,
        });
      }
      break;

    case "place_order":
      navigate("/checkout", { state: { autoPlace: true } });
      break;

    case "require_auth":
      navigate("/signin");
      break;

    case "render_products":
    case "none":
    default:
      // products are rendered by the widget itself, nothing to execute
      break;
  }
}

export default runActions;
