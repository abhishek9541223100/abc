1. Project Overview
1.1 Current State

Frontend: React 18 + Vite + Tailwind CSS
Routing: React Router DOM (SPA)
State Management: Context API (CartContext, AuthContext, LocationContext)
Data Storage: localStorage (products, categories, users, orders, testimonials)
Icons: Lucide React

1.2 Goal
Replace localStorage with Supabase PostgreSQL backend while maintaining:

✅ Zero UI/UX changes
✅ 100% frontend compatibility
✅ Drop-in replacement for existing logic
✅ Production-grade security
✅ Scalability for growth

1.3 Tech Stack

Database: Supabase PostgreSQL
Authentication: Supabase Auth
Storage: Supabase Storage (for images)
Real-time: Supabase Realtime (optional for orders)
Client: @supabase/supabase-js


2. Complete Database Schema
2.1 Full SQL Schema
-- ============================================
-- ENABLE EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- Extends Supabase auth.users with app-specific data
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster role checks
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON COLUMN profiles.role IS 'User role: user or admin';

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT, -- lucide icon name or emoji
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active) WHERE is_active = true;
CREATE INDEX idx_categories_order ON categories(display_order);

COMMENT ON TABLE categories IS 'Product categories (Fruits & Vegetables, Dairy, etc.)';

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10, 2) CHECK (original_price >= 0),
  discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  unit TEXT DEFAULT 'kg', -- kg, liter, piece, pack, dozen
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  min_order_quantity INTEGER DEFAULT 1 CHECK (min_order_quantity > 0),
  max_order_quantity INTEGER DEFAULT 100 CHECK (max_order_quantity > 0),
  tags TEXT[], -- for search and filtering
  sku TEXT UNIQUE, -- Stock Keeping Unit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_name_search ON products USING gin(to_tsvector('english', name));
CREATE INDEX idx_products_tags ON products USING gin(tags);

COMMENT ON TABLE products IS 'All products available for purchase';
COMMENT ON COLUMN products.unit IS 'Unit of measurement: kg, liter, piece, pack, dozen';

-- ============================================
-- ADDRESSES TABLE
-- ============================================
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  landmark TEXT,
  address_type TEXT DEFAULT 'home' CHECK (address_type IN ('home', 'work', 'other')),
  is_default BOOLEAN DEFAULT false,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_addresses_default ON addresses(user_id, is_default) WHERE is_default = true;
CREATE INDEX idx_addresses_pincode ON addresses(pincode);

COMMENT ON TABLE addresses IS 'User delivery addresses';

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Address snapshot (denormalized for history)
  delivery_address JSONB NOT NULL,
  
  -- Order totals
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  discount_amount NUMERIC(10, 2) DEFAULT 0 CHECK (discount_amount >= 0),
  delivery_fee NUMERIC(10, 2) DEFAULT 0 CHECK (delivery_fee >= 0),
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  
  -- Order status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',       -- Order placed, awaiting confirmation
    'confirmed',     -- Order confirmed by admin
    'processing',    -- Being prepared
    'out_for_delivery', -- On the way
    'delivered',     -- Successfully delivered
    'cancelled',     -- Cancelled by user/admin
    'refunded'       -- Payment refunded
  )),
  
  -- Payment
  payment_method TEXT CHECK (payment_method IN ('cod', 'online', 'wallet')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending',
    'paid',
    'failed',
    'refunded'
  )),
  payment_transaction_id TEXT,
  
  -- Metadata
  notes TEXT,
  estimated_delivery_time INTEGER DEFAULT 15, -- in minutes
  actual_delivery_time INTEGER, -- in minutes
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_feedback TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

COMMENT ON TABLE orders IS 'Customer orders';
COMMENT ON COLUMN orders.delivery_address IS 'JSONB snapshot of address at order time';

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- Product snapshot (denormalized for history)
  product_name TEXT NOT NULL,
  product_image_url TEXT,
  product_sku TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit TEXT,
  
  -- Calculated
  total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

COMMENT ON TABLE order_items IS 'Line items for each order';

-- ============================================
-- TESTIMONIALS TABLE
-- ============================================
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_testimonials_user ON testimonials(user_id);
CREATE INDEX idx_testimonials_approved ON testimonials(is_approved) WHERE is_approved = true;
CREATE INDEX idx_testimonials_featured ON testimonials(is_featured) WHERE is_featured = true;
CREATE INDEX idx_testimonials_rating ON testimonials(rating);

COMMENT ON TABLE testimonials IS 'Customer reviews and testimonials';

-- ============================================
-- LOCATION AVAILABILITY TABLE
-- ============================================
CREATE TABLE location_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_serviceable BOOLEAN DEFAULT true,
  estimated_delivery_minutes INTEGER DEFAULT 15 CHECK (estimated_delivery_minutes > 0),
  delivery_fee NUMERIC(10, 2) DEFAULT 0 CHECK (delivery_fee >= 0),
  min_order_amount NUMERIC(10, 2) DEFAULT 0 CHECK (min_order_amount >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city, state, pincode)
);

CREATE INDEX idx_location_city ON location_availability(city);
CREATE INDEX idx_location_pincode ON location_availability(pincode);
CREATE INDEX idx_location_serviceable ON location_availability(is_serviceable) WHERE is_serviceable = true;

COMMENT ON TABLE location_availability IS 'Serviceable locations and delivery details';

-- ============================================
-- CART ITEMS TABLE (Optional - for persistent cart)
-- ============================================
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);

COMMENT ON TABLE cart_items IS 'Persistent shopping cart (optional - can use frontend state)';

-- ============================================
-- PROMO CODES TABLE (Future feature)
-- ============================================
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value >= 0),
  min_order_amount NUMERIC(10, 2) DEFAULT 0,
  max_discount_amount NUMERIC(10, 2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active) WHERE is_active = true;

COMMENT ON TABLE promo_codes IS 'Discount promo codes';

-- ============================================
-- NOTIFICATIONS TABLE (Future feature)
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('order', 'promo', 'system', 'delivery')),
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

COMMENT ON TABLE notifications IS 'User notifications';

-- ============================================
-- DATABASE FUNCTIONS
-- ============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  order_date TEXT;
  order_count INTEGER;
  order_num TEXT;
BEGIN
  order_date := TO_CHAR(NOW(), 'YYYYMMDD');
  
  SELECT COALESCE(COUNT(*), 0) + 1 INTO order_count
  FROM orders
  WHERE order_number LIKE 'ORD-' || order_date || '-%';
  
  order_num := 'ORD-' || order_date || '-' || LPAD(order_count::TEXT, 4, '0');
  
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Function: Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE addresses
    SET is_default = false
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update product stock on order
CREATE OR REPLACE FUNCTION update_product_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    -- Decrease stock when order is confirmed
    UPDATE products
    SET stock_quantity = stock_quantity - oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id AND products.id = oi.product_id;
  ELSIF NEW.status = 'cancelled' AND OLD.status IN ('confirmed', 'processing') THEN
    -- Restore stock when order is cancelled
    UPDATE products
    SET stock_quantity = stock_quantity + oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id AND products.id = oi.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Update updated_at on all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_location_availability_updated_at BEFORE UPDATE ON location_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON promo_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Ensure single default address
CREATE TRIGGER ensure_default_address BEFORE INSERT OR UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION ensure_single_default_address();

-- Trigger: Update stock on order status change
CREATE TRIGGER update_stock_on_order_status AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_product_stock_on_order();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Sample categories
INSERT INTO categories (name, slug, icon, description, display_order) VALUES
('Fruits & Vegetables', 'fruits-vegetables', '🥬', 'Fresh fruits and vegetables', 1),
('Dairy & Bakery', 'dairy-bakery', '🥛', 'Milk, cheese, bread and bakery items', 2),
('Snacks & Beverages', 'snacks-beverages', '🥤', 'Chips, drinks and snacks', 3),
('Household Items', 'household-items', '🏠', 'Cleaning supplies and household essentials', 4),
('Personal Care', 'personal-care', '💆', 'Health and beauty products', 5),
('Instant Food', 'instant-food', '🍜', 'Ready to eat meals', 6);

-- Sample location (Kathua, Delhi as mentioned in images)
INSERT INTO location_availability (city, state, pincode, is_serviceable, estimated_delivery_minutes, delivery_fee, min_order_amount) VALUES
('Delhi', 'Delhi', '110001', true, 15, 0, 0),
('Kathua', 'Jammu and Kashmir', '184101', true, 15, 0, 0);

-- Sample admin user (create this after first user signs up)
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@kathuafresh.com';
3. Row Level Security Policies
3.1 Enable RLS on All Tables
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
3.2 Helper Function for Admin Check
-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
3.3 Profiles Table Policies
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    (role = (SELECT role FROM profiles WHERE id = auth.uid()))
  );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (is_admin());
  3.4 Categories Table Policies
  -- Everyone can read active categories
CREATE POLICY "Public can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

-- Admins can view all categories
CREATE POLICY "Admins can view all categories"
  ON categories FOR SELECT
  USING (is_admin());

-- Admins can insert categories
CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update categories
CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  USING (is_admin());

-- Admins can delete categories
CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  USING (is_admin());
  3.5 Products Table Policies
  -- Everyone can read active products
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (is_active = true);

-- Admins can view all products
CREATE POLICY "Admins can view all products"
  ON products FOR SELECT
  USING (is_admin());

-- Admins can insert products
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update products
CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  USING (is_admin());

-- Admins can delete products
CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (is_admin());
  3.6 Addresses Table Policies
  -- Users can view their own addresses
CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own addresses
CREATE POLICY "Users can insert own addresses"
  ON addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own addresses
CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own addresses
CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all addresses
CREATE POLICY "Admins can view all addresses"
  ON addresses FOR SELECT
  USING (is_admin());
  3.7 Orders Table Policies
  -- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending orders (for cancellation)
CREATE POLICY "Users can update own pending orders"
  ON orders FOR UPDATE
  USING (
    auth.uid() = user_id AND
    status IN ('pending', 'confirmed')
  )
  WITH CHECK (
    auth.uid() = user_id AND
    status IN ('pending', 'confirmed', 'cancelled')
  );

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (is_admin());

-- Admins can update all orders
CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  USING (is_admin());
  3.8 Order Items Table Policies
  -- Users can view their own order items
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Users can insert order items for their orders
CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Admins can view all order items
CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  USING (is_admin());

-- Admins can manage order items
CREATE POLICY "Admins can manage order items"
  ON order_items FOR ALL
  USING (is_admin());
  3.9 Testimonials Table Policies
  -- Everyone can read approved testimonials
CREATE POLICY "Public can view approved testimonials"
  ON testimonials FOR SELECT
  USING (is_approved = true);

-- Authenticated users can create testimonials
CREATE POLICY "Authenticated users can create testimonials"
  ON testimonials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own testimonials
CREATE POLICY "Users can view own testimonials"
  ON testimonials FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own pending testimonials
CREATE POLICY "Users can update own pending testimonials"
  ON testimonials FOR UPDATE
  USING (auth.uid() = user_id AND is_approved = false);

-- Admins can view all testimonials
CREATE POLICY "Admins can view all testimonials"
  ON testimonials FOR SELECT
  USING (is_admin());

-- Admins can manage all testimonials
CREATE POLICY "Admins can manage testimonials"
  ON testimonials FOR ALL
  USING (is_admin());
  3.10 Location Availability Policies
  -- Everyone can check serviceable locations
CREATE POLICY "Public can check location availability"
  ON location_availability FOR SELECT
  USING (true);

-- Admins can manage locations
CREATE POLICY "Admins can insert locations"
  ON location_availability FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update locations"
  ON location_availability FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete locations"
  ON location_availability FOR DELETE
  USING (is_admin());
  3.11 Cart Items Policies
  -- Users can view their own cart
CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert to their own cart
CREATE POLICY "Users can insert to own cart"
  ON cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own cart
CREATE POLICY "Users can update own cart"
  ON cart_items FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete from their own cart
CREATE POLICY "Users can delete from own cart"
  ON cart_items FOR DELETE
  USING (auth.uid() = user_id);
  3.12 Promo Codes Policies
  -- Everyone can view active promo codes
CREATE POLICY "Public can view active promo codes"
  ON promo_codes FOR SELECT
  USING (is_active = true AND valid_until > NOW());

-- Admins can manage promo codes
CREATE POLICY "Admins can manage promo codes"
  ON promo_codes FOR ALL
  USING (is_admin());
  3.13 Notifications Policies
  -- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- System can create notifications for users
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
  ON notifications FOR SELECT
  USING (is_admin());
  4. Supabase Client Setup
4.1 Install Dependencies
npm install @supabase/supabase-js
4.2 Environment Variables
Create .env file in project root:
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: For development
VITE_API_URL=http://localhost:5173
```

Add to `.gitignore`:
```
# Environment variables
.env
.env.local
.env.production
4.3 Supabase Client Configuration
File: src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage, // or sessionStorage
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'kathua-fresh',
    },
  },
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if current user is admin
 */
export const isAdmin = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    return profile?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Get current user profile
 */
export const getCurrentUserProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    
    return {
      ...user,
      ...profile,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Handle Supabase errors
 */
export const handleSupabaseError = (error) => {
  if (error.code === 'PGRST116') {
    return 'No data found';
  }
  if (error.code === '23505') {
    return 'This item already exists';
  }
  if (error.code === '23503') {
    return 'Referenced item does not exist';
  }
  return error.message || 'An unexpected error occurred';
};

/**
 * Upload file to Supabase Storage
 */
export const uploadFile = async (bucket, filePath, file) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Delete file from Supabase Storage
 */
export const deleteFile = async (bucket, filePath) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

export default supabase;
5. Complete Service Layer
5.1 Authentication Service
File: src/services/authService.js
import { supabase } from '../lib/supabaseClient';

/**
 * Sign up with email and password
 */
export const signUp = async (email, password, fullName, phone) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    
    return {
      user: data.user,
      session: data.session,
    };
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

/**
 * Sign in with email and password
 */
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    return {
      user: data.user,
      session: data.session,
    };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

/**
 * Sign out
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

/**
 * Get current session
 */
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
};

/**
 * Get current user with profile
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) return null;
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return user; // Return user without profile
    }
    
    return {
      ...user,
      ...profile,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (updates) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No user logged in');
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

/**
 * Reset password
 */
export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

/**
 * Update password
 */
export const updatePassword = async (newPassword) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Update password error:', error);
    throw error;
  }
};

/**
 * Check if user is admin
 */
export const checkIsAdmin = async () => {
  try {
    const user = await getCurrentUser();
    return user?.role === 'admin';
  } catch (error) {
    console.error('Check admin error:', error);
    return false;
  }
};
5.2 Products Service
File: src/services/productService.js
import { supabase } from '../lib/supabaseClient';

/**
 * Fetch all active products
 */
export const getAllProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug,
          icon
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get all products error:', error);
    throw error;
  }
};

/**
 * Fetch products by category
 */
export const getProductsByCategory = async (categorySlug) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories!inner (
          id,
          name,
          slug,
          icon
        )
      `)
      .eq('is_active', true)
      .eq('categories.slug', categorySlug)
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get products by category error:', error);
    throw error;
  }
};

/**
 * Fetch featured products
 */
export const getFeaturedProducts = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug,
          icon
        )
      `)
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get featured products error:', error);
    throw error;
  }
};

/**
 * Fetch single product by ID
 */
export const getProductById = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug,
          icon
        )
      `)
      .eq('id', productId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Get product by ID error:', error);
    throw error;
  }
};

/**
 * Search products
 */
export const searchProducts = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug,
          icon
        )
      `)
      .eq('is_active', true)
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Search products error:', error);
    throw error;
  }
};

/**
 * Admin: Create product
 */
export const createProduct = async (productData) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create product error:', error);
    throw error;
  }
};

/**
 * Admin: Update product
 */
export const updateProduct = async (productId, updates) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update product error:', error);
    throw error;
  }
};

/**
 * Admin: Delete product (soft delete)
 */
export const deleteProduct = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', productId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Delete product error:', error);
    throw error;
  }
};

/**
 * Admin: Get all products (including inactive)
 */
export const getAllProductsAdmin = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get all products (admin) error:', error);
    throw error;
  }
};

/**
 * Admin: Toggle product featured status
 */
export const toggleProductFeatured = async (productId, isFeatured) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ is_featured: isFeatured })
      .eq('id', productId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Toggle product featured error:', error);
    throw error;
  }
};

5.3 Categories Service
File: src/services/categoryService.js
import { supabase } from '../lib/supabaseClient';

/**
 * Fetch all active categories
 */
export const getAllCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get all categories error:', error);
    throw error;
  }
};

/**
 * Fetch category by slug
 */
export const getCategoryBySlug = async (slug) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Get category by slug error:', error);
    throw error;
  }
};

/**
 * Fetch category by ID
 */
export const getCategoryById = async (categoryId) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Get category by ID error:', error);
    throw error;
  }
};

/**
 * Admin: Create category
 */
export const createCategory = async (categoryData) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create category error:', error);
    throw error;
  }
};

/**
 * Admin: Update category
 */
export const updateCategory = async (categoryId, updates) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update category error:', error);
    throw error;
  }
};

/**
 * Admin: Delete category (soft delete)
 */
export const deleteCategory = async (categoryId) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update({ is_active: false })
      .eq('id', categoryId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Delete category error:', error);
    throw error;
  }
};

/**
 * Admin: Get all categories (including inactive)
 */
export const getAllCategoriesAdmin = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get all categories (admin) error:', error);
    throw error;
  }
};

/**
 * Admin: Reorder categories
 */
export const reorderCategories = async (categoryOrders) => {
  try {
    const updates = categoryOrders.map(({ id, display_order }) => 
      supabase
        .from('categories')
        .update({ display_order })
        .eq('id', id)
    );
    
    await Promise.all(updates);
    return true;
  } catch (error) {
    console.error('Reorder categories error:', error);
    throw error;
  }
};
5.4 Orders Service
File: src/services/orderService.js
import { supabase } from '../lib/supabaseClient';

/**
 * Create new order
 */
export const createOrder = async (orderData) => {
  try {
    // Generate order number using database function
    const { data: orderNumber, error: orderNumError } = await supabase
      .rpc('generate_order_number');
    
    if (orderNumError) throw orderNumError;
    
    // Prepare order data
    const orderToInsert = {
      user_id: orderData.user_id,
      order_number: orderNumber,
      delivery_address: orderData.delivery_address,
      subtotal: orderData.subtotal,
      discount_amount: orderData.discount_amount || 0,
      delivery_fee: orderData.delivery_fee || 0,
      total_amount: orderData.total_amount,
      payment_method: orderData.payment_method,
      payment_status: orderData.payment_status || 'pending',
      notes: orderData.notes || '',
      estimated_delivery_time: orderData.estimated_delivery_time || 15,
    };
    
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderToInsert])
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    // Insert order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id || item.id,
      product_name: item.name,
      product_image_url: item.image_url || item.image,
      product_sku: item.sku || '',
      price: item.price,
      quantity: item.quantity,
      unit: item.unit || 'kg',
      total_price: item.price * item.quantity,
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) throw itemsError;
    
    // Fetch complete order with items
    return await getOrderById(order.id);
  } catch (error) {
    console.error('Create order error:', error);
    throw error;
  }
};

/**
 * Fetch user orders
 */
export const getUserOrders = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get user orders error:', error);
    throw error;
  }
};

/**
 * Fetch single order by ID
 */
export const getOrderById = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *
        ),
        profiles (
          email,
          full_name,
          phone
        )
      `)
      .eq('id', orderId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Get order by ID error:', error);
    throw error;
  }
};

/**
 * Fetch order by order number
 */
export const getOrderByNumber = async (orderNumber) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *
        ),
        profiles (
          email,
          full_name,
          phone
        )
      `)
      .eq('order_number', orderNumber)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Get order by number error:', error);
    throw error;
  }
};

/**
 * Cancel order
 */
export const cancelOrder = async (orderId, reason) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
      })
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Cancel order error:', error);
    throw error;
  }
};

/**
 * Admin: Update order status
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const updates = { status };
    
    // Auto-update related fields based on status
    if (status === 'delivered') {
      updates.delivered_at = new Date().toISOString();
      updates.payment_status = 'paid'; // Auto-mark as paid on delivery for COD
    }
    
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select(`
        *,
        order_items (
          *
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update order status error:', error);
    throw error;
  }
};

/**
 * Admin: Get all orders
 */
export const getAllOrders = async (filters = {}) => {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *
        ),
        profiles (
          email,
          full_name,
          phone
        )
      `)
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.payment_status) {
      query = query.eq('payment_status', filters.payment_status);
    }
    
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get all orders error:', error);
    throw error;
  }
};

/**
 * Admin: Get order statistics
 */
export const getOrderStats = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('status, total_amount, created_at');
    
    if (error) throw error;
    
    // Calculate statistics
    const stats = {
      total_orders: data.length,
      pending: data.filter(o => o.status === 'pending').length,
      confirmed: data.filter(o => o.status === 'confirmed').length,
      processing: data.filter(o => o.status === 'processing').length,
      out_for_delivery: data.filter(o => o.status === 'out_for_delivery').length,
      delivered: data.filter(o => o.status === 'delivered').length,
      cancelled: data.filter(o => o.status === 'cancelled').length,
      total_revenue: data
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + parseFloat(o.total_amount), 0),
    };
    
    return stats;
  } catch (error) {
    console.error('Get order stats error:', error);
    throw error;
  }
};

/**
 * Submit order rating
 */
export const rateOrder = async (orderId, rating, feedback) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        customer_rating: rating,
        customer_feedback: feedback,
      })
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Rate order error:', error);
    throw error;
  }
};

5.5 Addresses Service
File: src/services/addressService.js
import { supabase } from '../lib/supabaseClient';

/**
 * Fetch user addresses
 */
export const getUserAddresses = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get user addresses error:', error);
    throw error;
  }
};

/**
 * Get default address
 */
export const getDefaultAddress = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  } catch (error) {
    console.error('Get default address error:', error);
    return null;
  }
};

/**
 * Get address by ID
 */
export const getAddressById = async (addressId) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', addressId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Get address by ID error:', error);
    throw error;
  }
};

/**
 * Create address
 */
export const createAddress = async (addressData) => {
  try {
    // If this is set as default, the database trigger will unset other defaults
    const { data, error } = await supabase
      .from('addresses')
      .insert([addressData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create address error:', error);
    throw error;
  }
};

/**
 * Update address
 */
export const updateAddress = async (addressId, updates) => {
  try {
    // If this is set as default, the database trigger will unset other defaults
    const { data, error } = await supabase
      .from('addresses')
      .update(updates)
      .eq('id', addressId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update address error:', error);
    throw error;
  }
};

/**
 * Delete address
 */
export const deleteAddress = async (addressId) => {
  try {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Delete address error:', error);
    throw error;
  }
};

/**
 * Set address as default
 */
export const setDefaultAddress = async (userId, addressId) => {
  try {
    // Update the selected address to be default (trigger will handle others)
    const { data, error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Set default address error:', error);
    throw error;
  }
};
5.6 Testimonials Service
File: src/services/testimonialService.js
import { supabase } from '../lib/supabaseClient';

/**
 * Fetch approved testimonials
 */
export const getApprovedTestimonials = async () => {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .eq('is_approved', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get approved testimonials error:', error);
    throw error;
  }
};

/**
 * Fetch featured testimonials
 */
export const getFeaturedTestimonials = async (limit = 6) => {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .eq('is_approved', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get featured testimonials error:', error);
    throw error;
  }
};

/**
 * Create testimonial
 */
export const createTestimonial = async (testimonialData) => {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .insert([testimonialData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create testimonial error:', error);
    throw error;
  }
};

/**
 * Get user testimonials
 */
export const getUserTestimonials = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get user testimonials error:', error);
    throw error;
  }
};

/**
 * Admin: Get all testimonials
 */
export const getAllTestimonials = async () => {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select(`
        *,
        profiles (
          full_name,
          email,
          phone
        ),
        orders (
          order_number
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get all testimonials error:', error);
    throw error;
  }
};

/**
 * Admin: Approve testimonial
 */
export const approveTestimonial = async (testimonialId, isApproved, adminId) => {
  try {
    const updates = {
      is_approved: isApproved,
    };
    
    if (isApproved) {
      updates.approved_at = new Date().toISOString();
      updates.approved_by = adminId;
    } else {
      updates.approved_at = null;
      updates.approved_by = null;
    }
    
    const { data, error } = await supabase
      .from('testimonials')
      .update(updates)
      .eq('id', testimonialId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Approve testimonial error:', error);
    throw error;
  }
};

/**
 * Admin: Feature testimonial
 */
export const featureTestimonial = async (testimonialId, isFeatured) => {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .update({ is_featured: isFeatured })
      .eq('id', testimonialId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Feature testimonial error:', error);
    throw error;
  }
};

/**
 * Admin: Delete testimonial
 */
export const deleteTestimonial = async (testimonialId) => {
  try {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', testimonialId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Delete testimonial error:', error);
    throw error;
  }
};
5.7 Location Service
File: src/services/locationService.js
import { supabase } from '../lib/supabaseClient';

/**
 * Check if location is serviceable by pincode
 */
export const checkLocationServiceability = async (pincode) => {
  try {
    const { data, error } = await supabase
      .from('location_availability')
      .select('*')
      .eq('pincode', pincode)
      .eq('is_serviceable', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Check location serviceability error:', error);
    return null;
  }
};

/**
 * Get delivery details for location
 */
export const getDeliveryDetails = async (city, state, pincode) => {
  try {
    const { data, error } = await supabase
      .from('location_availability')
      .select('*')
      .eq('city', city)
      .eq('state', state)
      .eq('pincode', pincode)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Get delivery details error:', error);
    return null;
  }
};

/**
 * Get all serviceable locations
 */
export const getServiceableLocations = async () => {
  try {
    const { data, error } = await supabase
      .from('location_availability')
      .select('*')
      .eq('is_serviceable', true)
      .order('city');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get serviceable locations error:', error);
    throw error;
  }
};

/**
 * Admin: Add serviceable location
 */
export const addServiceableLocation = async (locationData) => {
  try {
    const { data, error } = await supabase
      .from('location_availability')
      .insert([locationData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Add serviceable location error:', error);
    throw error;
  }
};

/**
 * Admin: Update location
 */
export const updateLocation = async (locationId, updates) => {
  try {
    const { data, error } = await supabase
      .from('location_availability')
      .update(updates)
      .eq('id', locationId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update location error:', error);
    throw error;
  }
};

/**
 * Admin: Delete location
 */
export const deleteLocation = async (locationId) => {
  try {
    const { error } = await supabase
      .from('location_availability')
      .delete()
      .eq('id', locationId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Delete location error:', error);
    throw error;
  }
};

/**
 * Admin: Get all locations
 */
export const getAllLocations = async () => {
  try {
    const { data, error } = await supabase
      .from('location_availability')
      .select('*')
      .order('city');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get all locations error:', error);
    throw error;
  }
};
5.8 Cart Service (Optional - for persistent cart)
File: src/services/cartService.js
import { supabase } from '../lib/supabaseClient';

/**
 * Get user cart
 */
export const getUserCart = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (
          id,
          name,
          price,
          image_url,
          unit,
          stock_quantity,
          is_active
        )
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get user cart error:', error);
    throw error;
  }
};

/**
 * Add item to cart
 */
export const addToCart = async (userId, productId, quantity = 1) => {
  try {
    // Check if item already exists
    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();
    
    if (existing) {
      // Update quantity
      return await updateCartItemQuantity(existing.id, existing.quantity + quantity);
    }
    
    // Insert new item
    const { data, error } = await supabase
      .from('cart_items')
      .insert([{
        user_id: userId,
        product_id: productId,
        quantity: quantity,
      }])
      .select(`
        *,
        products (
          id,
          name,
          price,
          image_url,
          unit,
          stock_quantity
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Add to cart error:', error);
    throw error;
  }
};

/**
 * Update cart item quantity
 */
export const updateCartItemQuantity = async (cartItemId, quantity) => {
  try {
    if (quantity <= 0) {
      return await removeFromCart(cartItemId);
    }
    
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
      .select(`
        *,
        products (
          id,
          name,
          price,
          image_url,
          unit,
          stock_quantity
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update cart item quantity error:', error);
    throw error;
  }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (cartItemId) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Remove from cart error:', error);
    throw error;
  }
};

/**
 * Clear user cart
 */
export const clearCart = async (userId) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Clear cart error:', error);
    throw error;
  }
};
6. Context Integration
6.1 Updated AuthContext
File: src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  signUp as authSignUp,
  signIn as authSignIn,
  signOut as authSignOut,
  getCurrentUser,
} from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check active sessions and set the user
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (session?.user) {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = async (email, password, fullName, phone) => {
    try {
      setError(null);
      const data = await authSignUp(email, password, fullName, phone);
      
      // Auto sign-in after signup (if email confirmation is disabled)
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      setError(null);
      const data = await authSignIn(email, password);
      
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await authSignOut();
      setUser(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    isAdmin,
    isAuthenticated,
    loading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
6.2 Updated CartContext
File: src/contexts/CartContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prevItems, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
6.3 LocationContext
File: src/contexts/LocationContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { checkLocationServiceability, getServiceableLocations } from '../services/locationService';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isServiceable, setIsServiceable] = useState(true);
  const [deliveryDetails, setDeliveryDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load saved location from localStorage
  useEffect(() => {
    const savedLocation = localStorage.getItem('currentLocation');
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        setCurrentLocation(location);
        checkServiceability(location.pincode);
      } catch (error) {
        console.error('Error loading location:', error);
      }
    }
  }, []);

  const checkServiceability = async (pincode) => {
    try {
      setLoading(true);
      const details = await checkLocationServiceability(pincode);
      
      if (details) {
        setIsServiceable(true);
        setDeliveryDetails(details);
      } else {
        setIsServiceable(false);
        setDeliveryDetails(null);
      }
      
      return details;
    } catch (error) {
      console.error('Error checking serviceability:', error);
      setIsServiceable(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const setLocation = async (location) => {
    setCurrentLocation(location);
    localStorage.setItem('currentLocation', JSON.stringify(location));
    
    if (location.pincode) {
      await checkServiceability(location.pincode);
    }
  };

  const clearLocation = () => {
    setCurrentLocation(null);
    setIsServiceable(true);
    setDeliveryDetails(null);
    localStorage.removeItem('currentLocation');
  };

  const value = {
    currentLocation,
    setLocation,
    clearLocation,
    isServiceable,
    deliveryDetails,
    checkServiceability,
    loading,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
7. Migration Strategy
7.1 Export LocalStorage Data
File: src/utils/exportLocalStorage.js
/**
 * Export all localStorage data to JSON file
 */
export const exportLocalStorageData = () => {
  const data = {
    products: JSON.parse(localStorage.getItem('products') || '[]'),
    categories: JSON.parse(localStorage.getItem('categories') || '[]'),
    users: JSON.parse(localStorage.getItem('users') || '[]'),
    orders: JSON.parse(localStorage.getItem('orders') || '[]'),
    testimonials: JSON.parse(localStorage.getItem('testimonials') || '[]'),
    addresses: JSON.parse(localStorage.getItem('addresses') || '[]'),
    exportedAt: new Date().toISOString(),
  };

  // Create and download JSON file
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `kathua-fresh-export-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);

  console.log('Data exported:', data);
  return data;
};

/**
 * Load exported JSON file
 */
export const loadExportedFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};
7.2 Import Data to Supabase
File: src/utils/importToSupabase.js
import { supabase } from '../lib/supabaseClient';

/**
 * Import categories to Supabase
 */
const importCategories = async (categories) => {
  if (!categories || categories.length === 0) return [];
  
  const categoriesData = categories.map((cat, index) => ({
    name: cat.name,
    slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
    icon: cat.icon || '📦',
    description: cat.description || '',
    image_url: cat.image_url || cat.imageUrl || '',
    is_active: cat.is_active !== undefined ? cat.is_active : true,
    display_order: cat.display_order !== undefined ? cat.display_order : index,
  }));

  const { data, error } = await supabase
    .from('categories')
    .insert(categoriesData)
    .select();

  if (error) throw error;
  
  console.log(`✅ Imported ${data.length} categories`);
  return data;
};

/**
 * Import products to Supabase
 */
const importProducts = async (products, categoryMap) => {
  if (!products || products.length === 0) return [];
  
  const productsData = products.map(prod => {
    // Find category ID by name or slug
    const categoryId = categoryMap[prod.category] || categoryMap[prod.categorySlug];
    
    return {
      name: prod.name,
      description: prod.description || '',
      price: parseFloat(prod.price),
      original_price: prod.originalPrice ? parseFloat(prod.originalPrice) : parseFloat(prod.price),
      discount_percentage: prod.discount || prod.discountPercentage || 0,
      category_id: categoryId || null,
      image_url: prod.image_url || prod.imageUrl || prod.image || '',
      unit: prod.unit || 'kg',
      stock_quantity: prod.stock || prod.stockQuantity || 100,
      is_featured: prod.featured || prod.isFeatured || false,
      is_active: prod.is_active !== undefined ? prod.is_active : true,
      sku: prod.sku || '',
      tags: prod.tags || [],
    };
  });

  const { data, error } = await supabase
    .from('products')
    .insert(productsData)
    .select();

  if (error) throw error;
  
  console.log(`✅ Imported ${data.length} products`);
  return data;
};

/**
 * Main import function
 */
export const importDataToSupabase = async (exportedData) => {
  try {
    console.log('Starting data import...');
    
    // 1. Import Categories
    const importedCategories = await importCategories(exportedData.categories);
    
    // Create category map for products
    const categoryMap = {};
    importedCategories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
      categoryMap[cat.slug] = cat.id;
    });
    
    // 2. Import Products
    const importedProducts = await importProducts(exportedData.products, categoryMap);
    
    console.log('✅ Data import completed successfully!');
    
    return {
      success: true,
      message: 'Import completed successfully',
      imported: {
        categories: importedCategories.length,
        products: importedProducts.length,
      },
    };
  } catch (error) {
    console.error('❌ Import error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Import from file
 */
export const importFromFile = async (file) => {
  try {
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          const result = await importDataToSupabase(data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  } catch (error) {
    console.error('Import from file error:', error);
    throw error;
  }
};
7.3 Migration Admin Panel Component
File: src/components/admin/MigrationPanel.jsx
import { useState } from 'react';
import { Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { exportLocalStorageData, loadExportedFile } from '../../utils/exportLocalStorage';
import { importFromFile } from '../../utils/importToSupabase';

export const MigrationPanel = () => {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const handleExport = () => {
    try {
      exportLocalStorageData();
      setResult({
        type: 'success',
        message: 'Data exported successfully!',
      });
    } catch (error) {
      setResult({
        type: 'error',
        message: `Export failed: ${error.message}`,
      });
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const result = await importFromFile(file);
      
      if (result.success) {
        setResult({
          type: 'success',
          message: `Import successful! Imported ${result.imported.categories} categories and ${result.imported.products} products.`,
        });
      } else {
        setResult({
          type: 'error',
          message: `Import failed: ${result.error}`,
        });
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: `Import error: ${error.message}`,
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Data Migration</h2>
      
      <div className="space-y-4">
        {/* Export */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export LocalStorage Data
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Export all data from localStorage to a JSON file
          </p>
          <button
            onClick={handleExport}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Export Data
          </button>
        </div>

        {/* Import */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import to Supabase
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Import data from exported JSON file to Supabase
          </p>
          <label className="bg-green-500 text-white px-4 py-2 rounded hover:bg-
          