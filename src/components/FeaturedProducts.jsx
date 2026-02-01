import { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { fetchFeaturedProducts, subscribeToFeaturedProducts } from '../data/mockData'

const FeaturedProducts = () => {
  const { addToCart } = useCart()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [quantities, setQuantities] = useState({})

  useEffect(() => {
    loadFeaturedProducts()
    
    // Subscribe to featured products changes
    const unsubscribe = subscribeToFeaturedProducts((products) => {
      setFeaturedProducts(products)
    })

    return () => unsubscribe()
  }, [])

  const loadFeaturedProducts = () => {
    try {
      const featured = fetchFeaturedProducts()
      setFeaturedProducts(featured)
    } catch (error) {
      console.error('Error loading featured products:', error)
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
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold font-poppins">Featured Products</h2>
          <Link 
            to="/category/all" 
            className="text-primary-green hover:text-green-700 font-medium"
          >
            View All Products →
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No featured products yet</h3>
            <p className="text-gray-500">
              Mark products as featured in the admin panel to see them here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow group-hover:scale-105">
                {/* Product Image */}
                <div className="relative">
                  <img
                    src={product.image || 'https://via.placeholder.com/300'}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {product.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      Featured
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    {product.featured && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-2xl font-bold text-primary-green">₹{product.price}</span>
                      {product.discount > 0 && (
                        <span className="text-sm text-green-600 ml-2">-{product.discount}%</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">{product.unit}</span>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      onClick={() => handleQuantityChange(product.id, -1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      <span className="text-gray-600">−</span>
                    </button>
                    <span className="w-12 text-center">{quantities[product.id] || 1}</span>
                    <button
                      onClick={() => handleQuantityChange(product.id, 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      <span className="text-gray-600">+</span>
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default FeaturedProducts
