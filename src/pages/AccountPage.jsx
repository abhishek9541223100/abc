import { useState } from 'react'
import { User, ShoppingBag, MapPin, Settings, LogOut, Package, Clock, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState('orders')
  const { user, setShowAuthModal, handleLogout } = useAuth()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product_id,
            total_price
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const mappedOrders = data.map(order => ({
        id: order.order_number || order.id,
        date: new Date(order.created_at).toLocaleDateString(),
        status: order.status,
        total: order.total_amount,
        items: order.order_items?.length || 0,
        deliveryTime: order.estimated_delivery_time ? `${order.estimated_delivery_time} mins` : '15 mins'
      }))

      setOrders(mappedOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }


  // Mock addresses
  const addresses = [
    {
      id: 'home',
      name: 'Home',
      street: '123 Main Street',
      area: 'Bandra West',
      city: 'Mumbai',
      pincode: '400050',
      phone: '+91 98765 43210',
      isDefault: true
    },
    {
      id: 'work',
      name: 'Work',
      street: '456 Business Park',
      area: 'Andheri East',
      city: 'Mumbai',
      pincode: '400059',
      phone: '+91 98765 43210',
      isDefault: false
    }
  ]

  const LoginSection = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-primary-yellow rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-black" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to AnyNow</h2>
        <p className="text-gray-600">Login to access your account</p>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4 text-center">Login to Continue</h3>

        <div className="space-y-4">
          <p className="text-center text-gray-500">Please login or signup to view your orders and profile.</p>

          <button
            onClick={() => setShowAuthModal(true)}
            className="btn-primary w-full"
          >
            Login / Signup
          </button>

          <div className="text-center text-sm text-gray-600">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </div>
    </div>
  )

  const OrdersTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Order History</h3>
      {orders.map((order) => (
        <div key={order.id} className="card p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="font-semibold">{order.id}</div>
              <div className="text-sm text-gray-600">{order.date}</div>
            </div>
            <div className="flex items-center gap-2">
              {order.status === 'delivered' ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 text-sm font-medium">Delivered</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-600 text-sm font-medium">Pending</span>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {order.items} items • Delivered in {order.deliveryTime}
            </div>
            <div className="font-semibold text-primary-green">
              ₹{order.total}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const AddressesTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Saved Addresses</h3>
        <button className="btn-secondary text-sm px-4 py-2">
          + Add Address
        </button>
      </div>

      {addresses.map((address) => (
        <div key={address.id} className="card p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{address.name}</span>
                {address.isDefault && (
                  <span className="bg-primary-yellow text-black text-xs px-2 py-1 rounded">
                    Default
                  </span>
                )}
              </div>
              <div className="text-gray-600 text-sm">
                {address.street}, {address.area}<br />
                {address.city} - {address.pincode}<br />
                {address.phone}
              </div>
            </div>
            <button className="text-primary-green hover:underline text-sm">
              Edit
            </button>
          </div>
        </div>
      ))}
    </div>
  )

  const ProfileTab = () => (
    <div className="max-w-md">
      <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
      <div className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            defaultValue="John Doe"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-green"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            defaultValue="john.doe@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-green"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone
          </label>
          <input
            type="tel"
            defaultValue="+91 98765 43210"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-green"
          />
        </div>

        <button className="btn-primary w-full">
          Save Changes
        </button>
      </div>
    </div>
  )

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoginSection />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary-yellow rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-black" />
              </div>
              <div>
                <div className="font-semibold">John Doe</div>
                <div className="text-sm text-gray-600">+91 98765 43210</div>
              </div>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${activeTab === 'orders'
                  ? 'bg-primary-green text-white'
                  : 'hover:bg-gray-100'
                  }`}
              >
                <Package className="w-4 h-4" />
                Orders
              </button>

              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${activeTab === 'addresses'
                  ? 'bg-primary-green text-white'
                  : 'hover:bg-gray-100'
                  }`}
              >
                <MapPin className="w-4 h-4" />
                Addresses
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${activeTab === 'profile'
                  ? 'bg-primary-green text-white'
                  : 'hover:bg-gray-100'
                  }`}
              >
                <Settings className="w-4 h-4" />
                Profile
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-100 text-red-500"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'addresses' && <AddressesTab />}
          {activeTab === 'profile' && <ProfileTab />}
        </div>
      </div>
    </div>
  )
}

export default AccountPage
