import { useState } from 'react'
import { ArrowRight } from './icons'

/**
 * Footer newsletter sign-up.
 *
 * Deliberately client-only: there is no subscribe endpoint on the API, and
 * inventing a POST to one that doesn't exist would ship a form that silently
 * fails. It validates, acknowledges, and holds the address in local state. When
 * a real endpoint lands, the one thing to change is the body of `submit`.
 */
export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle') // idle | invalid | done

  const submit = (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setState('invalid')
      return
    }
    setState('done')
  }

  return (
    <div className="newsletter">
      <div className="footer__colhead">
        <h4>Farm notes</h4>
      </div>
      <p className="newsletter__sell">
        Seasonal harvests, new batches and the occasional recipe. Once a month.
      </p>

      {state === 'done' ? (
        <p className="newsletter__msg" role="status">
          Thank you — we'll be in touch.
        </p>
      ) : (
        <form className="newsletter__form" onSubmit={submit} noValidate>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (state === 'invalid') setState('idle')
            }}
            placeholder="you@example.com"
            aria-label="Email address"
            aria-invalid={state === 'invalid'}
            autoComplete="email"
          />
          <button type="submit" aria-label="Subscribe">
            <ArrowRight />
          </button>
        </form>
      )}

      {state === 'invalid' && (
        <p className="newsletter__msg" role="alert">
          That doesn't look like an email address.
        </p>
      )}
    </div>
  )
}
