import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, CreditCard, Smartphone, DollarSign, CheckCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'

const CheckoutPage = () => {
  const { cart, getTotalPrice, clearCart } = useCart()
  const [selectedAddress, setSelectedAddress] = useState('home')
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [orderPlaced, setOrderPlaced] = useState(false)

  const subtotal = getTotalPrice()
  const deliveryCharge = cart.length > 0 ? 30 : 0
  const total = subtotal + deliveryCharge

  const addresses = [
    {
      id: 'home',
      name: 'Home',
      street: '123 Main Street',
      area: 'Bandra West',
      city: 'Mumbai',
      pincode: '400050',
      phone: '+91 98765 43210'
    },
    {
      id: 'work',
      name: 'Work',
      street: '456 Business Park',
      area: 'Andheri East',
      city: 'Mumbai',
      pincode: '400059',
      phone: '+91 98765 43210'
    }
  ]

  const handlePlaceOrder = () => {
    setOrderPlaced(true)
    setTimeout(() => {
      clearCart()
    }, 2000)
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
              <p className="font-semibold">ORD-2024-{Math.floor(Math.random() * 10000)}</p>
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
            
            <div className="space-y-3">
              {addresses.map((address) => (
                <label key={address.id} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="address"
                    value={address.id}
                    checked={selectedAddress === address.id}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{address.name}</div>
                    <div className="text-gray-600 text-sm">
                      {address.street}, {address.area}<br />
                      {address.city} - {address.pincode}<br />
                      {address.phone}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <button className="mt-4 text-primary-green hover:underline text-sm">
              + Add New Address
            </button>
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
              className="btn-primary w-full mt-6"
            >
              Place Order
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
