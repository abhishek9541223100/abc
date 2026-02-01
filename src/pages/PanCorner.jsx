import { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Minus } from 'lucide-react'
import { useCart } from '../context/CartContext'

const PanCorner = () => {
  const { addToCart } = useCart()
  const [quantities, setQuantities] = useState({})
  const [products, setProducts] = useState([])

  useEffect(() => {
    loadPanProducts()
    
    // Subscribe to real-time updates from admin panel
    const checkForUpdates = () => {
      const storedProducts = localStorage.getItem('anynow_pan_products')
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
      if (e.key === 'anynow_pan_products') {
        checkForUpdates()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [products])

  const loadPanProducts = () => {
    try {
      const storedProducts = localStorage.getItem('anynow_pan_products')
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts))
      } else {
        // Initialize with empty array (admin will add products)
        const defaultProducts = []
        setProducts(defaultProducts)
        localStorage.setItem('anynow_pan_products', JSON.stringify(defaultProducts))
      }
    } catch (error) {
      console.error('Error loading pan products:', error)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Pan Corner</h1>
          <p className="text-xl">Your daily essentials</p>
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
            <p className="text-gray-500">No products available in Pan Corner</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PanCorner
