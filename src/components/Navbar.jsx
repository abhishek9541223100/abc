import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, ShoppingCart, User, MapPin, Settings, LogOut } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useLocation } from '../context/LocationContext'
import { useAuth } from '../context/AuthContext'
import LocationModal from './LocationModal'
import AuthModal from './AuthModal'

// Add custom CSS for animations and improved styling
const style = document.createElement('style')
style.textContent = `
  @keyframes leafGrow {
    0% {
      transform: scale(0) rotate(-180deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.2) rotate(-10deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }
  
  @keyframes leafSway {
    0%, 100% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(-5deg);
    }
    75% {
      transform: rotate(5deg);
    }
  }
  
  @keyframes navbarFadeDown {
    0% {
      transform: translateY(-20px);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes cartBounce {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }
  
  @keyframes cartPulse {
    0% {
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
    }
  }
  
  .leaf-hover:hover {
    animation: leafSway 0.8s ease-in-out infinite;
  }
  
  .navbar-animate {
    animation: navbarFadeDown 0.6s ease-out;
  }
  
  .cart-bounce {
    animation: cartBounce 0.3s ease-out;
  }
  
  .cart-pulse {
    animation: cartPulse 0.6s ease-out;
  }
  
  .nav-link {
    position: relative;
    transition: all 0.3s ease;
  }
  
  .nav-link::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #22c55e, #16a34a);
    transition: all 0.3s ease;
    transform: translateX(-50%);
  }
  
  .nav-link:hover::after {
    width: 100%;
  }
  
  .nav-link:hover {
    color: #22c55e;
    transform: translateY(-1px);
  }
  
  .btn-nav {
    transition: all 0.3s ease;
    border-radius: 12px;
  }
  
  .btn-nav:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
  }
  
  .logo-container {
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
    border-radius: 50%;
    padding: 8px;
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.15);
    transition: all 0.3s ease;
  }
  
  .logo-container:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(34, 197, 94, 0.25);
  }
`
if (!document.head.querySelector('style[data-navbar-animations]')) {
  style.setAttribute('data-navbar-animations', 'true')
  document.head.appendChild(style)
}

const Navbar = () => {
  const { cartCount } = useCart()
  const { location, isLoading, handleLocationClick } = useLocation()
  const { user, showAuthModal, setShowAuthModal, handleLogout } = useAuth()
  const currentPath = window.location.pathname
  const [cartAnimating, setCartAnimating] = useState(false)

  // Listen for cart updates to trigger animation
  useEffect(() => {
    const handleCartUpdate = () => {
      setCartAnimating(true)
      setTimeout(() => setCartAnimating(false), 600)
    }

    // Listen for custom cart events
    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [])

  const handleLoginClick = () => {
    setShowAuthModal(true)
  }

  const handleLogoutClick = () => {
    handleLogout()
  }

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50 navbar-animate" style={{ height: '72px' }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-full py-2">
            {/* Logo with Circular Design */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="logo-container">
                <div className="flex items-center gap-0.5">
                  {/* Animated Leaves */}
                  <span className="inline-flex items-center gap-0.5">
                    <span className="text-green-500 text-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 inline-block leaf-hover" style={{ animation: 'leafGrow 0.6s ease-out' }}>🌿</span>
                    <span className="text-green-600 text-sm transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12 inline-block leaf-hover" style={{ animation: 'leafGrow 0.6s ease-out 0.1s both' }}>🌿</span>
                    <span className="text-green-500 text-base transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 inline-block leaf-hover" style={{ animation: 'leafGrow 0.6s ease-out 0.2s both' }}>🌿</span>
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-2xl font-poppins text-black group-hover:text-green-700 transition-colors duration-300">
                  Kathua Fresh
                </span>
                <span className="text-xs text-gray-500 hidden md:block">Fresh • Organic • Local</span>
              </div>
            </Link>

            {/* Location Selector */}
            <button
              onClick={handleLocationClick}
              className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-primary-green cursor-pointer nav-link px-3 py-2 rounded-lg hover:bg-green-50 transition-all duration-300"
            >
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isLoading ? 'Detecting...' : location.city === 'Select Location' ? 'Select Location' : `${location.city}, ${location.area}`}
              </span>
            </button>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search for fresh groceries..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:border-primary-green focus:ring-2 focus:ring-green-100 transition-all duration-300"
                />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Admin Panel Button */}
              {currentPath !== '/admin' && (
                <Link 
                  to="/admin"
                  className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-primary-green hover:bg-green-50 px-4 py-2 rounded-full btn-nav"
                  title="Admin Panel"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-medium">Admin</span>
                </Link>
              )}
              
              {/* Auth Section */}
              {user ? (
                <div className="flex items-center space-x-2">
                  <div className="hidden md:flex items-center space-x-2 text-gray-600 hover:bg-green-50 px-4 py-2 rounded-full btn-nav">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Hi, {user.name}</span>
                  </div>
                  <button
                    onClick={handleLogoutClick}
                    className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-red-500 hover:bg-red-50 px-4 py-2 rounded-full btn-nav"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                  <button
                    onClick={handleLogoutClick}
                    className="md:hidden p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-full btn-nav"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-primary-green hover:bg-green-50 px-4 py-2 rounded-full btn-nav"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Login</span>
                </button>
              )}
              
              {/* Cart Icon */}
              <Link to="/cart" className={`relative p-3 text-gray-600 hover:text-primary-green hover:bg-green-50 rounded-full btn-nav ${cartAnimating ? 'cart-bounce cart-pulse' : ''}`}>
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Bottom Section */}
          <div className="md:hidden border-t border-gray-100 py-3 space-y-3">
            {/* Mobile Location */}
            <button
              onClick={handleLocationClick}
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-green cursor-pointer nav-link px-3 py-2 rounded-lg hover:bg-green-50 transition-all duration-300 w-full"
            >
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isLoading ? 'Detecting...' : location.city === 'Select Location' ? 'Select Location' : `${location.city}, ${location.area}`}
              </span>
            </button>

            {/* Mobile Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search for fresh groceries..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:border-primary-green focus:ring-2 focus:ring-green-100 transition-all duration-300"
              />
            </div>

            {/* Mobile Auth */}
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-600 hover:bg-green-50 px-4 py-2 rounded-full btn-nav">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Hi, {user.name}</span>
                </div>
                <button
                  onClick={handleLogoutClick}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-500 hover:bg-red-50 px-4 py-2 rounded-full btn-nav"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleLoginClick}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-green hover:bg-green-50 px-4 py-2 rounded-full btn-nav w-full"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Login</span>
              </button>
            )}

            {/* Mobile Admin Button */}
            {currentPath !== '/admin' && (
              <div className="flex justify-center">
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-green hover:bg-green-50 px-4 py-2 rounded-full btn-nav"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-medium">Admin Panel</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      <LocationModal />
      <AuthModal />
    </>
  )
}

export default Navbar
