import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { api } from '../api'

export function UserDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchUser = async () => {
    setLoading(true)
    try {
      const [userRes, ordersRes] = await Promise.all([
        api.getUser(id),
        api.getUserOrders(id),
      ])
      setUser(userRes)
      setOrders(ordersRes.items || [])
    } catch (err) {
      setError(err.message || 'Failed to load user')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-6 text-center">
        <p className="text-red-600">{error}</p>
        <Link to="/users" className="mt-4 inline-block btn-primary">
          Back to Customers
        </Link>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="card p-6 text-center">
        <p className="text-gray-600">Customer not found</p>
        <Link to="/users" className="mt-4 inline-block btn-primary">
          Back to Customers
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/users" className="btn-ghost">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-600 mt-1">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge badge-success">Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-gray-900 font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-900 font-medium">{user.phone || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-gray-900 font-medium">
                  {new Date(user.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Stats</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{user.order_count || 0}</p>
                <p className="text-sm text-gray-500">Total Orders</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">₹{(user.total_spent || 0).toLocaleString('en-IN')}</p>
                <p className="text-sm text-gray-500">Total Spent</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {user.order_count > 0 ? `₹${((user.total_spent || 0) / user.order_count).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '₹0'}
                </p>
                <p className="text-sm text-gray-500">Avg Order Value</p>
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Order History ({orders.length})</h2>
            </div>
            {orders.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No orders yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" role="table">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link to={`/orders/${order.id}`} className="text-sm font-medium text-green-600 hover:text-green-700">
                            #{order.id}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.item_count} item{order.item_count !== 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{order.total.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge ${
                            order.status === 'delivered' ? 'badge-success' :
                            order.status === 'shipped' ? 'badge-info' :
                            order.status === 'processing' ? 'badge-warning' :
                            order.status === 'cancelled' ? 'badge-danger' : 'badge-gray'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link to={`/orders/${order.id}`} className="text-green-600 hover:text-green-900">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Addresses */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Default Shipping Address</h2>
            {user.default_shipping_address ? (
              <address className="not-italic text-gray-900">
                <p>{user.default_shipping_address.name}</p>
                <p>{user.default_shipping_address.address}</p>
                <p>{user.default_shipping_address.city}, {user.default_shipping_address.state} {user.default_shipping_address.postal_code}</p>
                <p>{user.default_shipping_address.country}</p>
                {user.default_shipping_address.phone && <p>Phone: {user.default_shipping_address.phone}</p>}
              </address>
            ) : (
              <p className="text-gray-500">No default shipping address</p>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Default Billing Address</h2>
            {user.default_billing_address ? (
              <address className="not-italic text-gray-900">
                <p>{user.default_billing_address.name}</p>
                <p>{user.default_billing_address.address}</p>
                <p>{user.default_billing_address.city}, {user.default_billing_address.state} {user.default_billing_address.postal_code}</p>
                <p>{user.default_billing_address.country}</p>
                {user.default_billing_address.phone && <p>Phone: {user.default_billing_address.phone}</p>}
              </address>
            ) : (
              <p className="text-gray-500">No default billing address</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}