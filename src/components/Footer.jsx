import { Link } from 'react-router-dom'
import { Phone, MessageCircle, MapPin, Mail, Facebook, Instagram, Leaf } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const handleWhatsAppClick = () => {
    const phoneNumber = '9541223100'
    const message = encodeURIComponent('Hi! I would like to place an order.')
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
  }

  return (
    <footer className="bg-gradient-to-br from-green-800 to-green-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                <span className="text-green-300 text-lg">🌿</span>
                <span className="text-green-400 text-sm">🌿</span>
                <span className="text-green-300 text-base">🌿</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Kathua Fresh</h3>
            </div>
            <p className="text-green-100 mb-6 text-sm leading-relaxed">
              Fresh groceries at your doorstep
            </p>
            <p className="text-green-200 text-sm leading-relaxed max-w-sm">
              Your trusted partner for fresh, organic, and local products. We bring the best quality groceries directly from local farms to your home.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleWhatsAppClick}
                className="w-10 h-10 bg-green-700 hover:bg-green-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                title="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-green-700 hover:bg-green-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                title="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-green-700 hover:bg-green-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                title="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="text-green-100 hover:text-white transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/products" 
                  className="text-green-100 hover:text-white transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                  Categories
                </Link>
              </li>
              <li>
                <Link 
                  to="/#featured" 
                  className="text-green-100 hover:text-white transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                  Featured Products
                </Link>
              </li>
              <li>
                <Link 
                  to="/pan-corner" 
                  className="text-green-100 hover:text-white transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                  Pan Corner
                </Link>
              </li>
              <li>
                <Link 
                  to="/liquor-corner" 
                  className="text-green-100 hover:text-white transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                  Liquor Corner
                </Link>
              </li>
            </ul>
          </div>

          {/* Support / Help */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/about" 
                  className="text-green-100 hover:text-white transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-green-100 hover:text-white transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="text-green-100 hover:text-white transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-green-100 hover:text-white transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-green-300 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-green-100 font-medium">Phone / WhatsApp</p>
                  <button
                    onClick={handleWhatsAppClick}
                    className="text-white hover:text-green-300 transition-colors duration-300"
                  >
                    9541223100
                  </button>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-300 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-green-100 font-medium">Location</p>
                  <p className="text-white">Kathua</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-green-300 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-green-100 font-medium">Order via WhatsApp</p>
                  <button
                    onClick={handleWhatsAppClick}
                    className="text-white hover:text-green-300 transition-colors duration-300 text-sm underline"
                  >
                    Click to order easily
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-green-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-green-200 text-sm">
              © {currentYear} Kathua Fresh. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-green-200 text-sm">
              <Leaf className="w-4 h-4" />
              <span>Fresh • Organic • Local</span>
              <Leaf className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
