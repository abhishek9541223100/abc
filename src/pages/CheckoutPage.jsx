import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, CreditCard, Smartphone, DollarSign, CheckCircle, Plus, Loader } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { cart, getTotalPrice, clearCart } = useCart()
  const { user, setShowAuthModal } = useAuth()

  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  // Add Address State
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  })

  const subtotal = getTotalPrice()
  const deliveryCharge = cart.length > 0 ? 30 : 0
  const total = subtotal + deliveryCharge

  useEffect(() => {
    if (user) {
      fetchAddresses()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })

      if (error) throw error
      setAddresses(data || [])
      if (data && data.length > 0) {
        setSelectedAddressId(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('addresses')
        .insert([{
          user_id: user.id,
          ...newAddress,
          is_default: addresses.length === 0
        }])
        .select()
        .single()

      if (error) throw error

      setAddresses([...addresses, data])
      setSelectedAddressId(data.id)
      setIsAddingAddress(false)
      setNewAddress({
        name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        phone: ''
      })
    } catch (error) {
      console.error('Error adding address:', error)
      alert('Failed to add address. Please try again.')
    }
  }

  const handlePlaceOrder = async () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    if (!selectedAddressId) {
      alert('Please select a delivery address')
      return
    }

    try {
      setIsPlacingOrder(true)

      const selectedAddr = addresses.find(a => a.id === selectedAddressId)

      // 1. Create Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          delivery_address: selectedAddr,
          subtotal,
          delivery_fee: deliveryCharge,
          total_amount: total,
          status: 'pending',
          payment_method: paymentMethod,
          payment_status: 'pending'
        }])
        .select()
        .single()

      if (orderError) throw orderError

      // 2. Create Order Items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        product_name: item.name,
        product_image_url: item.image,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
        total_price: item.price * item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      setOrderId(orderData.order_number)
      setOrderPlaced(true)
      clearCart()

    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order. Please try again.')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-8">
            Your order has been placed and will be delivered in 10-15 minutes.
          </p>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg text-left">
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-semibold text-xl text-primary-green">{orderId || 'Processing...'}</p>
            </div>
            <Link to="/" className="btn-primary w-full block">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No items in cart</h2>
          <Link to="/" className="btn-primary">
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-poppins mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Delivery Address */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Delivery Address
            </h2>

            {!user ? (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">Please login to manage addresses</p>
                <button onClick={() => setShowAuthModal(true)} className="btn-primary">Login Now</button>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center p-4"><Loader className="animate-spin text-primary-green" /></div>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <label key={address.id} className={`flex items-start gap-3 cursor-pointer p-4 border rounded-lg transition-colors ${selectedAddressId === address.id ? 'border-primary-green bg-green-50' : 'hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={selectedAddressId === address.id}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{address.name} <span className="text-gray-500 text-sm">({address.address_type})</span></div>
                      <div className="text-gray-600 text-sm">
                        {address.address_line1}, {address.address_line2 && `${address.address_line2}, `}<br />
                        {address.city}, {address.state} - {address.pincode}<br />
                        Phone: {address.phone}
                      </div>
                    </div>
                  </label>
                ))}

                {isAddingAddress ? (
                  <form onSubmit={handleAddAddress} className="mt-4 p-4 border rounded-lg bg-gray-50 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <input required placeholder="Full Name" className="input-field" value={newAddress.name} onChange={e => setNewAddress({ ...newAddress, name: e.target.value })} />
                      <input required placeholder="Phone Number" className="input-field" value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} />
                    </div>
                    <input required placeholder="Address Line 1" className="input-field w-full" value={newAddress.address_line1} onChange={e => setNewAddress({ ...newAddress, address_line1: e.target.value })} />
                    <input placeholder="Address Line 2" className="input-field w-full" value={newAddress.address_line2} onChange={e => setNewAddress({ ...newAddress, address_line2: e.target.value })} />
                    <div className="grid md:grid-cols-3 gap-4">
                      <input required placeholder="City" className="input-field" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                      <input required placeholder="State" className="input-field" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} />
                      <input required placeholder="Pincode" className="input-field" value={newAddress.pincode} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setIsAddingAddress(false)} className="px-4 py-2 border rounded hover:bg-gray-200">Cancel</button>
                      <button type="submit" className="btn-primary">Save Address</button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="mt-2 flex items-center gap-2 text-primary-green hover:underline font-medium"
                  >
                    <Plus className="w-4 h-4" /> Add New Address
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <Smartphone className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium">UPI</div>
                  <div className="text-sm text-gray-600">Pay using UPI apps</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <CreditCard className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium">Credit/Debit Card</div>
                  <div className="text-sm text-gray-600">Visa, Mastercard, Rupay</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <DollarSign className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium">Cash on Delivery</div>
                  <div className="text-sm text-gray-600">Pay when you receive</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            {/* Order Items */}
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.name} × {item.quantity}
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Charge</span>
                <span className="font-semibold">₹{deliveryCharge}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary-green">₹{total}</span>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || !user || !selectedAddressId}
              className={`btn-primary w-full mt-6 flex justify-center items-center gap-2 ${isPlacingOrder || !user || !selectedAddressId ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isPlacingOrder ? (
                <>Processing <Loader className="w-4 h-4 animate-spin" /></>
              ) : !user ? (
                'Login to Place Order'
              ) : (
                'Place Order'
              )}
            </button>

            {/* Back to Cart */}
            <Link
              to="/cart"
              className="block text-center mt-4 text-primary-green hover:underline"
            >
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
