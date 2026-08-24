import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import AnnounceBar from './components/AnnounceBar'
import CartDrawer from './components/CartDrawer'
import Toast from './components/Toast'
import RequireAuth from './components/RequireAuth'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'
import AccountOrders from './pages/AccountOrders'
import AccountProfile from './pages/AccountProfile'

// Scroll to top on navigation, or to the #hash target when present.
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    let frame
    let timer
    let attempts = 0
    const scrollToTarget = () => {
      if (hash) {
        const target = document.getElementById(hash.slice(1))
        if (target) {
          const header = document.querySelector('.header')
          const offset = header?.getBoundingClientRect().height || 0
          const targetTop = target.getBoundingClientRect().top + window.scrollY
          window.scrollTo({ top: Math.max(0, targetTop - offset), behavior: 'auto' })
          return
        }
        if (attempts++ < 60) {
          frame = requestAnimationFrame(scrollToTarget)
          return
        }
      }
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
    timer = window.setTimeout(() => {
      frame = requestAnimationFrame(scrollToTarget)
    }, 100)
    return () => {
      window.clearTimeout(timer)
      cancelAnimationFrame(frame)
    }
  }, [pathname, hash])
  return null
}

function NotFound() {
  return (
    <div className="empty-state empty-state--page">
      <div className="empty-state__mark">🌾</div>
      <h3>Page not found</h3>
      <p className="muted">The page you're looking for has wandered off the farm.</p>
      <a href="/" className="btn btn--primary">Back home</a>
    </div>
  )
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <AnnounceBar />
      <Header />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Everything below requires a signed-in account. */}
          <Route element={<RequireAuth />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:orderNumber" element={<OrderConfirmation />} />
            <Route path="/account" element={<Account />}>
              <Route index element={<Navigate to="/account/orders" replace />} />
              <Route path="orders" element={<AccountOrders />} />
              <Route path="profile" element={<AccountProfile />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <Toast />
    </>
  )
}
