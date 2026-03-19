export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

const statusColors = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export function statusBadge(status) {
  return statusColors[status] || "bg-gray-100 text-gray-700";
}

export function getCartItemPrice(item) {
  if (item?.itemType === "bundle") {
    const bundlePrice = Number(item.price ?? item.bundle?.price ?? 0) || 0
    return { originalPrice: bundlePrice, effectivePrice: bundlePrice, hasSale: false, discountPct: 0 }
  }
  const originalPrice = Number(item?.product?.price ?? item?.price ?? 0) || 0
  const salePct = Number(item?.product?.sale ?? item?.sale ?? 0) || 0
  const hasSale = salePct > 0 && salePct < 100
  const effectivePrice = hasSale ? originalPrice * (1 - salePct / 100) : originalPrice
  const discountPct = hasSale && originalPrice > 0 ? Math.round(salePct) : 0
  return { originalPrice, effectivePrice, hasSale, discountPct }
}

export function limitText(text, max = 40) {
  if (!text) return ""
  const str = String(text).trim()
  return str.length > max ? `${str.slice(0, max).trimEnd()}...` : str
}

export function normalizeTags(tags) {
  if (!tags) return []
  const result = []
  const seen = new Set()

  const clean = (value) => {
    if (Array.isArray(value)) {
      value.forEach(clean)
      return
    }
    if (typeof value !== "string") return

    const trimmed = value.trim()
    if (!trimmed) return

    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          parsed.forEach(clean)
          return
        }
      } catch {
        /* fall through to comma split */
      }
    }

    trimmed
      .replace(/\\"/g, '"')
      .split(",")
      .map((part) => part.replace(/^"|"$/g, "").trim())
      .filter(Boolean)
      .forEach((tag) => {
        if (!seen.has(tag.toLowerCase())) {
          seen.add(tag.toLowerCase())
          result.push(tag)
        }
      })
  }

  clean(tags)
  return result
}
