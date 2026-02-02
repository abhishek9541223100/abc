import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Homepage from './pages/Homepage'
import CategoryPage from './pages/CategoryPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import AccountPage from './pages/AccountPage'
import AdminPanel from './pages/AdminPanel'
import PanCorner from './pages/PanCorner'
import LiquorCorner from './pages/LiquorCorner'
import AllProductsPage from './pages/AllProductsPage'
import { CartProvider } from './context/CartContext'
import { LocationProvider } from './context/LocationContext'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/category/:categoryName" element={<CategoryPage />} />
                <Route path="/product/:productId" element={<ProductDetailPage />} />
                <Route path="/products" element={<AllProductsPage />} />
                <Route path="/all-products" element={<AllProductsPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/pan-corner" element={<PanCorner />} />
                <Route path="/liquor-corner" element={<LiquorCorner />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  )
}

export default App
