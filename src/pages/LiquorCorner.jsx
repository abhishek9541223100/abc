import { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Minus, AlertCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'

const LiquorCorner = () => {
  const { addToCart } = useCart()
  const [quantities, setQuantities] = useState({})
  const [products, setProducts] = useState([])
  const [isVerified, setIsVerified] = useState(false)
  const [showVerification, setShowVerification] = useState(false)

  // Real-time updates effect
  useEffect(() => {
    if (isVerified) {
      const checkForUpdates = () => {
        const storedProducts = localStorage.getItem('anynow_liquor_products')
        if (storedProducts) {
          const newProducts = JSON.parse(storedProducts)
          // Only update if data has actually changed
          if (JSON.stringify(newProducts) !== JSON.stringify(products)) {
            setProducts(newProducts)
          }
        }
      }

      // Check for updates every 2 seconds
      const interval = setInterval(checkForUpdates, 2000)
      
      // Also listen for storage events from other tabs
      const handleStorageChange = (e) => {
        if (e.key === 'anynow_liquor_products') {
          checkForUpdates()
        }
      }
      
      window.addEventListener('storage', handleStorageChange)
      
      return () => {
        clearInterval(interval)
        window.removeEventListener('storage', handleStorageChange)
      }
    }
  }, [isVerified, products])

  useEffect(() => {
    // Check if already verified in this session
    const verified = sessionStorage.getItem('liquor_verified')
    if (verified === 'true') {
      setIsVerified(true)
      loadLiquorProducts()
    } else {
      setShowVerification(true)
    }
  }, [])

  const loadLiquorProducts = () => {
    try {
      const storedProducts = localStorage.getItem('anynow_liquor_products')
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts))
      } else {
        // Initialize with empty array (admin will add products)
        const defaultProducts = []
        setProducts(defaultProducts)
        localStorage.setItem('anynow_liquor_products', JSON.stringify(defaultProducts))
      }
    } catch (error) {
      console.error('Error loading liquor products:', error)
    }
  }

  const handleAgeVerification = (isOver21) => {
    if (isOver21) {
      setIsVerified(true)
      setShowVerification(false)
      sessionStorage.setItem('liquor_verified', 'true')
      loadLiquorProducts()
    } else {
      alert('You must be 21 or older to access this section.')
      window.history.back()
    }
  }

  const handleQuantityChange = (productId, change) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + change)
    }))
  }

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 1
    addToCart({ ...product, quantity })
    setQuantities(prev => ({ ...prev, [product.id]: 1 }))
  }

  // Age Verification Modal
  if (showVerification) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Age Verification Required</h2>
            <p className="text-gray-600 mb-6">
              You must be 21 years or older to access the Liquor Corner. Please confirm your age to proceed.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleAgeVerification(true)}
                className="w-full btn-primary"
              >
                I am 21 or older
              </button>
              <button
                onClick={() => handleAgeVerification(false)}
                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                I am under 21
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Liquor Corner</h1>
          <p className="text-xl">Premium alcoholic beverages</p>
          <p className="text-sm mt-2 opacity-75">21+ Only</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              {/* Product Image */}
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                {product.inStock && (
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    In Stock
                  </span>
                )}
              </div>

              {/* Product Details */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-primary-green">₹{product.price}</span>
                  <span className="text-sm text-gray-500">per {product.unit}</span>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => handleQuantityChange(product.id, -1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center">{quantities[product.id] || 1}</span>
                  <button
                    onClick={() => handleQuantityChange(product.id, 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products available in Liquor Corner</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LiquorCorner
