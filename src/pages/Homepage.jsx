import { Link } from 'react-router-dom'
import { ShoppingCart, Apple, Milk, Cookie, Home, Heart, Pizza } from 'lucide-react'
import { useState, useEffect } from 'react'

import FeaturedProducts from '../components/FeaturedProducts'

const getIconForCategory = (slug) => {
  const iconMap = {
    'fruits-vegetables': Apple,
    'dairy-bakery': Milk,
    'snacks-beverages': Cookie,
    'household': Home,
    'personal-care': Heart,
    'instant-food': Pizza
  }
  return iconMap[slug] || Apple
}

const getColorForCategory = (slug) => {
  const colorMap = {
    'fruits-vegetables': 'bg-green-100',
    'dairy-bakery': 'bg-blue-100',
    'snacks-beverages': 'bg-yellow-100',
    'household': 'bg-purple-100',
    'personal-care': 'bg-pink-100',
    'instant-food': 'bg-orange-100'
  }
  return colorMap[slug] || 'bg-gray-100'
}

const getBackgroundImageForCategory = (slug) => {
  const imageMap = {
    'fruits-vegetables': 'url(/fruit-image.jpg)',
    'dairy-bakery': 'url(/bak-image.jpg)',
    'snacks-beverages': 'url(/snk-image.jpg)',
    'household': 'url(/hou-image.jpg)',
    'personal-care': 'url(/per-image.jpg)',
    'instant-food': 'url(/ins-image.jpg)'
  }
  return imageMap[slug] || null
}

import { supabase } from '../lib/supabaseClient'

const Homepage = () => {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      if (data) setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-green to-green-600 text-white py-20 overflow-hidden">
        {/* Background Image with Blur */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/public-image.jpg)',
            filter: 'blur(2px)',
            transform: 'scale(1.05)'
          }}
        />

        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-poppins mb-4 text-white drop-shadow-lg">
            Anything you need, delivered fast
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-green-50 drop-shadow-md">
            Groceries, fruits, veggies in minutes
          </p>
          <button className="btn-secondary text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
            Order Now
          </button>
        </div>
      </section>

      {/* Category Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 font-poppins">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => {
              const IconComponent = getIconForCategory(category.slug)
              const categoryColor = getColorForCategory(category.slug)
              const backgroundImage = getBackgroundImageForCategory(category.slug)
              const hasBackgroundImage = category.slug === 'fruits-vegetables' || category.slug === 'dairy-bakery' || category.slug === 'snacks-beverages' || category.slug === 'household' || category.slug === 'personal-care' || category.slug === 'instant-food'
              return (
                <Link
                  key={category.slug}
                  to={`/category/${category.slug}`}
                  className="group"
                >
                  <div
                    className={`${categoryColor} rounded-lg p-6 text-center hover:shadow-lg transition-all group-hover:scale-105 relative overflow-hidden ${hasBackgroundImage ? 'min-h-[140px]' : ''
                      }`}
                    style={{
                      backgroundImage: backgroundImage,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    {/* Enhanced Overlay for background image */}
                    {hasBackgroundImage && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
                    )}

                    <div className={`relative z-10 ${hasBackgroundImage ? 'text-white' : ''}`}>
                      <div className="flex justify-center mb-4">
                        <IconComponent className={`w-12 h-12 ${hasBackgroundImage
                          ? 'text-white drop-shadow-lg'
                          : 'text-primary-green'
                          }`} />
                      </div>
                      <h3 className={`font-semibold text-sm ${hasBackgroundImage
                        ? 'text-white drop-shadow-md font-bold'
                        : 'text-gray-800 group-hover:text-primary-green'
                        }`}>
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <FeaturedProducts />

      {/* Special Corners */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 font-poppins">
            Special Corners
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Pan Corner Card */}
            <div
              onClick={() => window.open('https://wa.me/9541223100?text=Hello,%20I%20want%20to%20order%20from%20Pan%20Corner.', '_blank')}
              className="group cursor-pointer"
            >
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-8 text-white shadow-lg hover:shadow-xl transition-all group-hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Pan Corner</h3>
                    <p className="text-orange-100 mb-4">Your daily essentials</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Pan Masala</span>
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Cigarettes</span>
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Gutkha</span>
                    </div>
                    <p className="text-sm text-orange-200 mt-4">Order via WhatsApp</p>
                  </div>
                  <div className="text-5xl">🚬</div>
                </div>
              </div>
            </div>

            {/* Liquor Corner Card */}
            <div
              onClick={() => window.open('https://wa.me/9541223100?text=Hello,%20I%20want%20to%20order%20from%20Liquor%20Corner.', '_blank')}
              className="group cursor-pointer"
            >
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-8 text-white shadow-lg hover:shadow-xl transition-all group-hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Liquor Corner</h3>
                    <p className="text-purple-100 mb-4">Premium alcoholic beverages</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Beer</span>
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Wine</span>
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Whisky</span>
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm">21+ Only</span>
                    </div>
                    <p className="text-sm text-purple-200 mt-4">Order via WhatsApp</p>
                  </div>
                  <div className="text-5xl">🍷</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offer Banner */}
      <section className="py-16 bg-secondary-light">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-8 text-center shadow-md">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-2 text-gray-800">
                10–15 min delivery
              </h3>
              <p className="text-gray-600">
                Get your essentials delivered in minutes, not hours
              </p>
            </div>
            <div className="bg-white rounded-lg p-8 text-center shadow-md">
              <div className="text-4xl mb-4">🔥</div>
              <h3 className="text-2xl font-bold mb-2 text-gray-800">
                Flat 20% OFF on first order
              </h3>
              <p className="text-gray-600">
                Use code <span className="font-semibold text-primary-green">FIRST20</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 font-poppins">
            Why Choose Kathua Fresh?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Wide Selection</h3>
              <p className="text-gray-600">
                Thousands of products from your favorite local stores
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                Delivery in as little as 10 minutes
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-black text-2xl font-bold">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
              <p className="text-gray-600">
                Competitive prices and amazing deals every day
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Homepage
