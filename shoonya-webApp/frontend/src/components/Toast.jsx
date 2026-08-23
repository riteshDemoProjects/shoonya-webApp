import { useCart } from '../context/CartContext'
import { CheckIcon } from './icons'

export default function Toast() {
  const { toastMsg } = useCart()
  return (
    <div className={`toast ${toastMsg ? 'is-show' : ''}`} role="status" aria-live="polite">
      <span className="toast__icon">
        <CheckIcon />
      </span>
      {toastMsg}
    </div>
  )
}
