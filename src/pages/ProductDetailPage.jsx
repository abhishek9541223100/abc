import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { Plus, Minus, ShoppingCart, ArrowLeft, Clock, CheckCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { fetchAdminData } from '../data/mockData'

const ProductDetailPage = () => {
  const { productId } = useParams()
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)

  // Find product across all categories from admin data
  const adminData = fetchAdminData()
  const allProducts = Object.values(adminData.products).flat()
  const product = allProducts.find(p => p.id === parseInt(productId))

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    addToCart(product, quantity)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const discountedPrice = product.discount > 0 
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link 
        to={`/category/${product.category}`}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-green mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {product.category.replace('-', ' & ')}
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg shadow-md"
          />
          {product.discount > 0 && (
            <span className="absolute top-4 right-4 bg-primary-yellow text-black text-lg font-bold px-3 py-1 rounded">
              {product.discount}% OFF
            </span>
          )}
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold font-poppins mb-4">{product.name}</h1>
          
          <p className="text-gray-600 text-lg mb-6">{product.description}</p>

          {/* Stock Status */}
          <div className="flex items-center gap-2 mb-6">
            {product.inStock ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-600 font-medium">In Stock</span>
              </>
            ) : (
              <>
                <span className="text-red-500">✕</span>
                <span className="text-red-600 font-medium">Out of Stock</span>
              </>
            )}
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary-green">
                ₹{discountedPrice}
              </span>
              <span className="text-gray-500 text-lg">/{product.unit}</span>
              {product.discount > 0 && (
                <span className="text-gray-400 line-through text-lg">
                  ₹{product.price}
                </span>
              )}
            </div>
            {product.discount > 0 && (
              <p className="text-primary-green font-medium mt-1">
                You save ₹{product.price - discountedPrice}
              </p>
            )}
          </div>

          {/* Delivery Time */}
          <div className="flex items-center gap-2 mb-8 p-4 bg-secondary-light rounded-lg">
            <Clock className="w-5 h-5 text-primary-green" />
            <span className="text-gray-700">
              <strong>Delivery in 10-15 minutes</strong>
            </span>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-gray-100"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 min-w-[60px] text-center font-semibold">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 hover:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`btn-primary flex-1 flex items-center justify-center gap-2 py-3 ${
                !product.inStock ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {addedToCart ? 'Added!' : 'Add to Cart'}
            </button>
          </div>

          {/* Product Features */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-4">Product Details</h3>
            <div className="space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="font-medium">{product.category.replace('-', ' & ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Unit:</span>
                <span className="font-medium">{product.unit}</span>
              </div>
              <div className="flex justify-between">
                <span>Availability:</span>
                <span className="font-medium">{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
