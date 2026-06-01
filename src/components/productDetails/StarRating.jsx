import { FiStar } from "react-icons/fi"

/** Stars with half-star support via a clipped overlay. */
export default function StarRating({ rating = 0, size = "w-4 h-4" }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, rating - i))
        return (
          <span key={i} className="relative inline-flex">
            <FiStar className={`${size} text-gray-300`} />
            {fill > 0 && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <FiStar className={`${size} fill-current text-red-600`} />
              </span>
            )}
          </span>
        )
      })}
    </div>
  )
}
