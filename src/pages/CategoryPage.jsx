import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Plus, Minus, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { fetchAdminData, fetchFeaturedProducts } from '../data/mockData'

const CategoryPage = () => {
  const { categoryName } = useParams()
  const { addToCart } = useCart()
  const [quantities, setQuantities] = useState({})
  const [sortBy, setSortBy] = useState('popular')
  const [categoryProducts, setCategoryProducts] = useState([])

  useEffect(() => {
    // Get initial data from admin panel
    if (categoryName === 'pan-corner') {
      // Handle Pan Corner category
      const panProducts = localStorage.getItem('anynow_pan_products')
      if (panProducts) {
        setCategoryProducts(JSON.parse(panProducts))
      } else {
        setCategoryProducts([])
      }
    } else if (categoryName === 'liquor-corner') {
      // Handle Liquor Corner category
      const liquorProducts = localStorage.getItem('anynow_liquor_products')
      if (liquorProducts) {
        setCategoryProducts(JSON.parse(liquorProducts))
      } else {
        setCategoryProducts([])
      }
    } else {
      // Handle regular grocery categories
      const data = fetchAdminData()
      setCategoryProducts(data.products[categoryName] || [])
    }

    // Subscribe to real-time updates from admin panel
    const checkForUpdates = () => {
      let newProducts = []
      
      if (categoryName === 'pan-corner') {
        const panProducts = localStorage.getItem('anynow_pan_products')
        if (panProducts) {
          newProducts = JSON.parse(panProducts)
        }
      } else if (categoryName === 'liquor-corner') {
        const liquorProducts = localStorage.getItem('anynow_liquor_products')
        if (liquorProducts) {
          newProducts = JSON.parse(liquorProducts)
        }
      } else {
        const newData = fetchAdminData()
        newProducts = newData.products[categoryName] || []
      }
      
      // Only update if data has actually changed
      if (JSON.stringify(newProducts) !== JSON.stringify(categoryProducts)) {
        setCategoryProducts(newProducts)
      }
    }

    // Check for updates every 2 seconds
    const interval = setInterval(checkForUpdates, 2000)
    
    return () => clearInterval(interval)
  }, [categoryName, categoryProducts])
  
  const sortedProducts = [...categoryProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price
    if (sortBy === 'price-high') return b.price - a.price
    return 0 // popular (default)
  })

  const handleQuantityChange = (productId, change) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + change)
    }))
  }

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 1
    addToCart(product, quantity)
    setQuantities(prev => ({ ...prev, [product.id]: 1 }))
  }

  const getCategoryName = (slug) => {
    const names = {
      'fruits-vegetables': 'Fruits & Vegetables',
      'dairy-bakery': 'Dairy & Bakery',
      'snacks-beverages': 'Snacks & Beverages',
      'household': 'Household Items',
      'personal-care': 'Personal Care',
      'instant-food': 'Instant Food'
    }
    return names[slug] || slug
  }

  return (
    <div className="min-h-screen">
      {/* Category Hero Section */}
      {categoryName === 'fruits-vegetables' && (
        <section className="relative bg-gradient-to-r from-green-500 to-green-600 text-white py-16 overflow-hidden">
          {/* Background Image with Blur */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/fruit-image.jpg)',
              filter: 'blur(3px)',
              transform: 'scale(1.1)'
            }}
          />
          
          {/* Overlay for better text visibility */}
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          
          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4 text-white drop-shadow-lg">
              Fresh Fruits & Vegetables
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-green-50 drop-shadow-md">
              Crisp, fresh, and delivered to your doorstep
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white/20 px-4 py-2 rounded-full">Daily Fresh</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">Farm to Table</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">100% Natural</span>
            </div>
          </div>
        </section>
      )}

      {/* Dairy & Bakery Hero Section */}
      {categoryName === 'dairy-bakery' && (
        <section className="relative bg-gradient-to-r from-blue-500 to-blue-600 text-white py-16 overflow-hidden">
          {/* Background Image with Blur */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/bak-image.jpg)',
              filter: 'blur(3px)',
              transform: 'scale(1.1)'
            }}
          />
          
          {/* Overlay for better text visibility */}
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          
          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4 text-white drop-shadow-lg">
              Dairy & Bakery
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-blue-50 drop-shadow-md">
              Fresh dairy products and baked goods daily
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white/20 px-4 py-2 rounded-full">Fresh Daily</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">Artisanal</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">Quality Assured</span>
            </div>
          </div>
        </section>
      )}

      {/* Snacks & Beverages Hero Section */}
      {categoryName === 'snacks-beverages' && (
        <section className="relative bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-16 overflow-hidden">
          {/* Background Image with Blur */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/snk-image.jpg)',
              filter: 'blur(3px)',
              transform: 'scale(1.1)'
            }}
          />
          
          {/* Overlay for better text visibility */}
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          
          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4 text-white drop-shadow-lg">
              Snacks & Beverages
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-yellow-50 drop-shadow-md">
              Delicious snacks and refreshing drinks for every occasion
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white/20 px-4 py-2 rounded-full">Tasty Treats</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">Refreshing</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">Quick Bites</span>
            </div>
          </div>
        </section>
      )}

      {/* Household Items Hero Section */}
      {categoryName === 'household' && (
        <section className="relative bg-gradient-to-r from-purple-500 to-purple-600 text-white py-16 overflow-hidden">
          {/* Background Image with Blur */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/hou-image.jpg)',
              filter: 'blur(3px)',
              transform: 'scale(1.1)'
            }}
          />
          
          {/* Overlay for better text visibility */}
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          
          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4 text-white drop-shadow-lg">
              Household Items
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-purple-50 drop-shadow-md">
              Essential household products for your daily needs
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white/20 px-4 py-2 rounded-full">Essential</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">Quality</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">Convenient</span>
            </div>
          </div>
        </section>
      )}

      {/* Personal Care Hero Section */}
      {categoryName === 'personal-care' && (
        <section className="relative bg-gradient-to-r from-pink-500 to-pink-600 text-white py-16 overflow-hidden">
          {/* Background Image with Blur */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/per-image.jpg)',
              filter: 'blur(3px)',
              transform: 'scale(1.1)'
            }}
          />
          
          {/* Overlay for better text visibility */}
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          
          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4 text-white drop-shadow-lg">
              Personal Care
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-pink-50 drop-shadow-md">
              Premium personal care products for your wellness
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white/20 px-4 py-2 rounded-full">Premium</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">Gentle</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">Effective</span>
            </div>
          </div>
        </section>
      )}

      {/* Instant Food Hero Section */}
      {categoryName === 'instant-food' && (
        <section className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16 overflow-hidden">
          {/* Background Image with Blur */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/ins-image.jpg)',
              filter: 'blur(3px)',
              transform: 'scale(1.1)'
            }}
          />
          
          {/* Overlay for better text visibility */}
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          
          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4 text-white drop-shadow-lg">
              Instant Food
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-orange-50 drop-shadow-md">
              Quick and delicious meals ready in minutes
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white/20 px-4 py-2 rounded-full">Quick</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">Delicious</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">Convenient</span>
            </div>
          </div>
        </section>
      )}

      {/* Pan Corner Hero Section */}
      {categoryName === 'pan-corner' && (
        <section className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white py-16 overflow-hidden">
          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4 text-white drop-shadow-lg">
              Pan Corner
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-orange-50 drop-shadow-md">
              Your daily essentials and tobacco products
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white/20 px-4 py-2 rounded-full">Pan Masala</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">Cigarettes</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">Gutkha</span>
            </div>
          </div>
        </section>
      )}

      {/* Liquor Corner Hero Section */}
      {categoryName === 'liquor-corner' && (
        <section className="relative bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16 overflow-hidden">
          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4 text-white drop-shadow-lg">
              Liquor Corner
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-purple-50 drop-shadow-md">
              Premium alcoholic beverages for adults
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white/20 px-4 py-2 rounded-full">Beer</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">Wine</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">Whisky</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">21+ Only</span>
            </div>
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header (for non-special categories) */}
        {categoryName !== 'fruits-vegetables' && categoryName !== 'dairy-bakery' && categoryName !== 'snacks-beverages' && categoryName !== 'household' && categoryName !== 'personal-care' && categoryName !== 'instant-food' && categoryName !== 'pan-corner' && categoryName !== 'liquor-corner' && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-poppins mb-2">
              {categoryName === 'pan-corner' ? 'Pan Corner' : categoryName === 'liquor-corner' ? 'Liquor Corner' : getCategoryName(categoryName)}
            </h1>
            <p className="text-gray-600">
              {categoryProducts.length} products available
            </p>
          </div>
        )}

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-4 items-center">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-green"
        >
          <option value="popular">Popular</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedProducts.map((product) => (
          <div key={product.id} className="card p-4">
            {/* Product Image */}
            <div className="relative mb-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg"
              />
              {product.discount > 0 && (
                <span className="absolute top-2 right-2 bg-primary-yellow text-black text-xs font-bold px-2 py-1 rounded">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            {/* Product Info */}
            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-3">{product.description}</p>
            
            {/* Price */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-2xl font-bold text-primary-green">
                  ₹{product.price}
                </span>
                <span className="text-gray-500 text-sm ml-1">/{product.unit}</span>
                {product.discount > 0 && (
                  <span className="text-gray-400 line-through text-sm ml-2">
                    ₹{Math.round(product.price / (1 - product.discount / 100))}
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Selector and Add to Cart */}
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => handleQuantityChange(product.id, -1)}
                  className="p-2 hover:bg-gray-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 min-w-[40px] text-center">
                  {quantities[product.id] || 1}
                </span>
                <button
                  onClick={() => handleQuantityChange(product.id, 1)}
                  className="p-2 hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => handleAddToCart(product)}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {categoryProducts.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p className="text-gray-600">
            This category doesn't have any products yet.
          </p>
        </div>
      )}
      </div>
    </div>
  )
}

export default CategoryPage
