import { useState } from "react"
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { FiCreditCard, FiLoader, FiCheck, FiShield } from "react-icons/fi"
import { post } from "../../api/client"

const cardElementOptions = {
  style: {
    base: {
      fontSize: "14px",
      color: "#1f2937",
      "::placeholder": { color: "#9ca3af" },
    },
    invalid: { color: "#e11d48" },
  },
}

export default function StripePayment({ paymentInfo, onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")

  const handlePay = async () => {
    if (!stripe || !elements) {
      setError("Payment is still loading. Please try again.")
      return
    }
    setProcessing(true)
    setError("")
    try {
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement),
      })
      if (pmError) throw pmError

      const secrets = paymentInfo?.clientSecrets || []
      for (const { clientSecret } of secrets) {
        if (!clientSecret) continue
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: paymentMethod.id,
        })
        if (result.error) throw result.error
      }

      for (const { orderId } of secrets) {
        if (!orderId) continue
        const res = await post("/payment/verify", { orderId })
        if (res.status !== "succeeded") {
          throw new Error("Payment could not be verified. Please contact support.")
        }
      }

      onSuccess()
    } catch (err) {
      setError(err?.message || "Payment failed. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="rounded-2xl border-2 border-rose-100 bg-rose-50/40 p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <span className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0">
              <FiCreditCard className="w-4 h-4" />
            </span>
            Card Payment
          </h3>
          <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1">
            <FiShield className="w-3 h-3 text-green-600 flex-shrink-0" />
            Secured by Stripe — card details never touch our server
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] uppercase tracking-wide text-gray-400">Amount due</p>
          <p className="text-lg font-bold text-gray-900">Rs. {paymentInfo?.amount?.toFixed(2)}</p>
        </div>
      </div>

      <div className="rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 focus-within:border-rose-400 transition-colors">
        <CardElement options={cardElementOptions} />
      </div>

      {error && (
        <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">{error}</p>
      )}

      <button
        onClick={handlePay}
        disabled={processing || !stripe}
        className="w-full mt-4 py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-semibold rounded-xl shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {processing ? (
          <><FiLoader className="w-5 h-5 animate-spin" /> Processing Payment...</>
        ) : (
          <><FiCheck className="w-5 h-5" /> Pay Now</>
        )}
      </button>

      <p className="mt-3 text-[11px] text-gray-400 text-center">
        Test mode: use card <span className="font-mono font-medium">4242 4242 4242 4242</span>
      </p>
    </div>
  )
}
