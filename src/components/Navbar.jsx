import { Link } from 'react-router-dom'
import { Search, ShoppingCart, User, MapPin, Settings, LogOut } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useLocation } from '../context/LocationContext'
import { useAuth } from '../context/AuthContext'
import LocationModal from './LocationModal'
import AuthModal from './AuthModal'

const Navbar = () => {
  const { cartCount } = useCart()
  const { location, isLoading, handleLocationClick } = useLocation()
  const { user, showAuthModal, setShowAuthModal, handleLogout } = useAuth()
  const currentPath = window.location.pathname

  const handleLoginClick = () => {
    setShowAuthModal(true)
  }

  const handleLogoutClick = () => {
    handleLogout()
  }

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-green rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-xl font-poppins text-black">AnyNow</span>
            </Link>

            {/* Location Selector */}
            <button
              onClick={handleLocationClick}
              className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-primary-green cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {isLoading ? 'Detecting...' : `${location.city}, ${location.area}`}
              </span>
            </button>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search for groceries..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-green"
                />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Admin Panel Button - Only show on main website, not on admin page */}
              {currentPath !== '/admin' && (
                <Link 
                  to="/admin"
                  className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-primary-green"
                  title="Admin Panel"
                >
                  <Settings className="w-5 h-5" />
                  <span className="text-sm">Admin</span>
                </Link>
              )}
              
              {/* Auth Section */}
              {user ? (
                <div className="flex items-center space-x-2">
                  <div className="hidden md:flex items-center space-x-2 text-gray-600">
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">Hi, {user.name}</span>
                  </div>
                  <button
                    onClick={handleLogoutClick}
                    className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-primary-green"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm">Logout</span>
                  </button>
                  <button
                    onClick={handleLogoutClick}
                    className="md:hidden p-2 text-gray-600 hover:text-primary-green"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-primary-green"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm">Login</span>
                </button>
              )}
              
              <Link to="/cart" className="relative">
                <ShoppingCart className="w-6 h-6 text-gray-600 hover:text-primary-green" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-yellow text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Location */}
          <div className="md:hidden pb-3">
            <button
              onClick={handleLocationClick}
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-green cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {isLoading ? 'Detecting...' : `${location.city}, ${location.area}`}
              </span>
            </button>
          </div>

          {/* Mobile Auth */}
          <div className="md:hidden pb-3">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Hi, {user.name}</span>
                </div>
                <button
                  onClick={handleLogoutClick}
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary-green"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleLoginClick}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-green"
              >
                <User className="w-4 h-4" />
                <span className="text-sm">Login</span>
              </button>
            )}
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search for groceries..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-green"
              />
            </div>
          </div>

          {/* Mobile Admin Button - Only show on main website, not on admin page */}
          {currentPath !== '/admin' && (
            <div className="md:hidden pb-3 flex justify-center">
              <Link
                to="/admin"
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-green px-4 py-2 border border-gray-300 rounded-lg"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Admin Panel</span>
              </Link>
            </div>
          )}
        </div>
      </nav>
      <LocationModal />
      <AuthModal />
    </>
  )
}

export default Navbar
