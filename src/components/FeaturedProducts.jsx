import { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabaseClient'

const FeaturedProducts = () => {
  const { addToCart } = useCart()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [quantities, setQuantities] = useState({})
  const [isShowingFallback, setIsShowingFallback] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [animatingButtons, setAnimatingButtons] = useState(new Set())

  useEffect(() => {
    loadFeaturedProducts()
  }, [])

  const loadFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .limit(8)

      if (error) throw error

      const mappedProducts = (data || []).map(p => ({
        ...p,
        image: p.image_url,
        inStock: p.stock_quantity > 0,
        discount: p.discount_percentage,
        featured: p.is_featured
      }))

      setFeaturedProducts(mappedProducts)
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

    // Trigger bounce animation for the button
    setAnimatingButtons(prev => new Set(prev).add(product.id))
    setTimeout(() => {
      setAnimatingButtons(prev => {
        const newSet = new Set(prev)
        newSet.delete(product.id)
        return newSet
      })
    }, 600)
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold font-poppins">
              {isShowingFallback ? 'Popular Products' : 'Featured Products'}
            </h2>
            {isShowingFallback && (
              <p className="text-gray-600 text-sm mt-1">
                Showing our latest products. Mark products as featured in admin panel to see them here.
              </p>
            )}
          </div>
          <Link
            to="/products"
            className="text-primary-green hover:text-green-700 font-medium"
          >
            View All Products →
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No products available</h3>
            <p className="text-gray-500 mb-4">
              Add products in the admin panel to see them here
            </p>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 bg-primary-green text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Go to Admin Panel
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <div
                key={product.id}
                className={`
                  bg-white rounded-lg shadow-sm border hover:shadow-xl transition-all duration-300 ease-out
                  hover:scale-105 hover:-translate-y-1
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                `}
                style={{
                  transitionDelay: `${index * 100}ms`,
                  transitionProperty: 'opacity, transform, box-shadow'
                }}
              >
                {/* Product Image */}
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={product.image || 'https://via.placeholder.com/300'}
                    alt={product.name}
                    className="w-full h-48 object-cover transition-transform duration-300 ease-out hover:scale-110"
                  />
                  {product.featured && !isShowingFallback && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      Featured
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    {product.featured && !isShowingFallback && (
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
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
                    >
                      <span className="text-gray-600">−</span>
                    </button>
                    <span className="w-12 text-center">{quantities[product.id] || 1}</span>
                    <button
                      onClick={() => handleQuantityChange(product.id, 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
                    >
                      <span className="text-gray-600">+</span>
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    className={`
                      w-full btn-primary flex items-center justify-center gap-2
                      transition-all duration-300 ease-out
                      ${animatingButtons.has(product.id)
                        ? 'scale-110 bg-green-600 hover:bg-green-700'
                        : 'hover:scale-105 hover:shadow-lg'
                      }
                    `}
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
