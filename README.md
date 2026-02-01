# AnyNow - Grocery & Daily Essentials Delivery

**Tagline:** Anything. Anytime. AnyNow

A modern, fast-loading grocery delivery website built with React, Vite, and Tailwind CSS.

## 🎨 Design Features

- **Primary Colors:** Yellow + Green theme
- **Secondary:** White background, Black text
- **Style:** Clean, minimal, mobile-first design
- **Font:** Poppins & Inter (modern & readable)
- **UI Feel:** Friendly, instant delivery vibe

## 🚀 Features

### 🏠 Homepage
- Sticky navbar with logo, location selector, search bar, and cart
- Hero section with bold messaging and CTA
- Category cards with icons (6 main categories)
- Offer banners for delivery time and first-order discount
- Features section highlighting key benefits

### 🧺 Category Page
- Grid layout of products with filtering options
- Sort by price (low to high, high to low) and popularity
- Product cards with images, pricing, quantity selector
- Add to cart functionality with visual feedback

### 📦 Product Detail Page
- Large product images with discount badges
- Detailed product information and stock status
- Quantity selector and add to cart functionality
- Delivery time display
- Product specifications

### 🛒 Cart Page
- List of added items with quantity controls
- Individual item totals and cart summary
- Coupon code application
- Delivery charges calculation
- Checkout button

### 💳 Checkout Page
- Address selection with saved addresses
- Multiple payment options (UPI, Card, Cash on Delivery)
- Order summary with item breakdown
- Order success animation

### 👤 User Account
- OTP-based login/signup system
- Order history with status tracking
- Saved addresses management
- Profile settings

## 🛠️ Technical Stack

- **Frontend:** React 18 with Vite
- **Styling:** Tailwind CSS with custom design system
- **Routing:** React Router DOM
- **Icons:** Lucide React
- **State Management:** React Context (Cart Context)
- **Fonts:** Google Fonts (Poppins, Inter)

## 📱 Responsive Design

- Mobile-first approach
- Fully responsive layout for all screen sizes
- Touch-friendly interface
- Optimized for performance

## 🏗️ Project Structure

```
anynow/
├── src/
│   ├── components/
│   │   └── Navbar.jsx
│   ├── context/
│   │   └── CartContext.jsx
│   ├── data/
│   │   └── mockData.js
│   ├── pages/
│   │   ├── Homepage.jsx
│   │   ├── CategoryPage.jsx
│   │   ├── ProductDetailPage.jsx
│   │   ├── CartPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   └── AccountPage.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── README.md
```

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎯 Key Features

### Cart Management
- Add/remove items with quantity controls
- Real-time cart updates
- Persistent cart state during session
- Cart count badge in navbar

### Product Catalog
- 6 main categories with 14+ sample products
- Product images from Unsplash
- Discount badges and pricing
- Stock status indicators

### User Experience
- Smooth transitions and hover effects
- Loading states and success feedback
- Mobile-optimized navigation
- Clean, intuitive interface

## 🔧 API-Ready Architecture

The application is structured to easily connect with a backend API:

- Mock data structure in `src/data/mockData.js`
- Context-based state management
- Component-based architecture
- Separation of concerns

## 🌟 Performance Optimizations

- Lazy loading with React Router
- Optimized images with proper sizing
- Minimal bundle size with Vite
- CSS-in-JS with Tailwind for efficient styling

## 📱 Mobile Features

- Responsive navigation with mobile search
- Touch-friendly buttons and controls
- Optimized product grid for mobile
- Swipe-friendly cart management

## 🎨 Design System

- Custom color palette (Yellow + Green)
- Consistent spacing and typography
- Reusable component classes
- Hover and focus states

---

**AnyNow** - Your trusted partner for quick grocery delivery!
