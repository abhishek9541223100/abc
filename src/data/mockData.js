// API Service for connecting with Admin Panel
// Now fetches real-time data from admin panel via localStorage

// Fetch data from admin panel's DataBridge
export const fetchAdminData = () => {
  try {
    // Try to get data from localStorage (shared with admin panel)
    const products = localStorage.getItem('anynow_products')
    const categories = localStorage.getItem('anynow_categories')
    
    if (products && categories) {
      const productsData = JSON.parse(products)
      const categoriesData = JSON.parse(categories)
      
      // Organize products by category
      const productsByCategory = {}
      categoriesData.forEach(category => {
        productsByCategory[category.slug] = productsData.filter(p => p.category === category.slug)
      })
      
      return {
        products: productsByCategory,
        categories: categoriesData.map(c => ({ name: c.name, slug: c.slug }))
      }
    }
  } catch (error) {
    console.error('Error fetching admin data:', error)
  }
  
  // Fallback to default data if no admin data found
  return fallbackData
}

// Real-time data fetching with polling
export const subscribeToAdminData = (callback) => {
  let lastData = null
  
  const checkForUpdates = () => {
    const currentData = fetchAdminData()
    const currentDataStr = JSON.stringify(currentData)
    const lastDataStr = JSON.stringify(lastData)
    
    if (currentDataStr !== lastDataStr) {
      lastData = currentData
      callback(currentData)
    }
  }
  
  // Check for updates every 2 seconds
  const interval = setInterval(checkForUpdates, 2000)
  
  // Initial check
  checkForUpdates()
  
  // Return unsubscribe function
  return () => clearInterval(interval)
}

// Fallback data for offline/error scenarios
const fallbackData = {
  products: {
    'fruits-vegetables': [
      {
        id: 1,
        name: 'Fresh Apples',
        price: 120,
        unit: 'kg',
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300',
        description: 'Crispy and sweet red apples, perfect for snacking',
        category: 'fruits-vegetables',
        inStock: true,
        discount: 10
      },
      {
        id: 2,
        name: 'Organic Tomatoes',
        price: 80,
        unit: 'kg',
        image: 'https://images.unsplash.com/photo-1546470427-e92b2c9c09d6?w=300',
        description: 'Fresh organic tomatoes, rich in flavor',
        category: 'fruits-vegetables',
        inStock: true,
        discount: 0
      },
      {
        id: 3,
        name: 'Fresh Spinach',
        price: 40,
        unit: 'bunch',
        image: 'https://images.unsplash.com/photo-1574386312658-830c5b77d4c5?w=300',
        description: 'Nutritious fresh spinach leaves',
        category: 'fruits-vegetables',
        inStock: true,
        discount: 5
      }
    ],
    'dairy-bakery': [
      {
        id: 4,
        name: 'Fresh Milk',
        price: 60,
        unit: 'liter',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300',
        description: 'Pure and fresh cow milk',
        category: 'dairy-bakery',
        inStock: true,
        discount: 0
      },
      {
        id: 5,
        name: 'White Bread',
        price: 45,
        unit: 'loaf',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300',
        description: 'Soft and fresh white bread',
        category: 'dairy-bakery',
        inStock: true,
        discount: 0
      },
      {
        id: 6,
        name: 'Greek Yogurt',
        price: 90,
        unit: '500g',
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300',
        description: 'Creamy and healthy Greek yogurt',
        category: 'dairy-bakery',
        inStock: true,
        discount: 15
      }
    ],
    'snacks-beverages': [
      {
        id: 7,
        name: 'Potato Chips',
        price: 50,
        unit: 'pack',
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300',
        description: 'Crispy and flavorful potato chips',
        category: 'snacks-beverages',
        inStock: true,
        discount: 0
      },
      {
        id: 8,
        name: 'Orange Juice',
        price: 120,
        unit: 'liter',
        image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300',
        description: 'Fresh and tangy orange juice',
        category: 'snacks-beverages',
        inStock: true,
        discount: 10
      }
    ],
    'household': [
      {
        id: 9,
        name: 'Dish Soap',
        price: 85,
        unit: 'bottle',
        image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=300',
        description: 'Effective dish cleaning liquid',
        category: 'household',
        inStock: true,
        discount: 0
      },
      {
        id: 10,
        name: 'Paper Towels',
        price: 150,
        unit: 'roll',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300',
        description: 'Absorbent paper towels for kitchen',
        category: 'household',
        inStock: true,
        discount: 5
      }
    ],
    'personal-care': [
      {
        id: 11,
        name: 'Hand Soap',
        price: 75,
        unit: 'bottle',
        image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=300',
        description: 'Gentle hand soap with moisturizer',
        category: 'personal-care',
        inStock: true,
        discount: 0
      },
      {
        id: 12,
        name: 'Shampoo',
        price: 200,
        unit: 'bottle',
        image: 'https://images.unsplash.com/photo-1526947425969-112a8a8c0b67?w=300',
        description: 'Nourishing shampoo for all hair types',
        category: 'personal-care',
        inStock: true,
        discount: 20
      }
    ],
    'instant-food': [
      {
        id: 13,
        name: 'Instant Noodles',
        price: 35,
        unit: 'pack',
        image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=300',
        description: 'Quick and delicious instant noodles',
        category: 'instant-food',
        inStock: true,
        discount: 0
      },
      {
        id: 14,
        name: 'Ready to Eat Rice',
        price: 80,
        unit: 'pack',
        image: 'https://images.unsplash.com/photo-1536304993881-ff1e9d3a9c3c?w=300',
        description: 'Convenient ready-to-eat rice meal',
        category: 'instant-food',
        inStock: true,
        discount: 10
      }
    ]
  },
  categories: [
    { name: 'Fruits & Vegetables', slug: 'fruits-vegetables' },
    { name: 'Dairy & Bakery', slug: 'dairy-bakery' },
    { name: 'Snacks & Beverages', slug: 'snacks-beverages' },
    { name: 'Household Items', slug: 'household' },
    { name: 'Personal Care', slug: 'personal-care' },
    { name: 'Instant Food', slug: 'instant-food' }
  ]
}

// Get current data (for immediate use)
export const getCurrentData = () => fetchAdminData()

// Fetch featured products specifically
export const fetchFeaturedProducts = () => {
  try {
    // Get all product types from localStorage
    const groceryProducts = localStorage.getItem('anynow_products')
    const panProducts = localStorage.getItem('anynow_pan_products')
    const liquorProducts = localStorage.getItem('anynow_liquor_products')
    
    const allFeaturedProducts = []
    
    // Process grocery products
    if (groceryProducts) {
      const products = JSON.parse(groceryProducts)
      const featured = products.filter(p => p.featured === true)
      allFeaturedProducts.push(...featured)
    }
    
    // Process pan products
    if (panProducts) {
      const products = JSON.parse(panProducts)
      const featured = products.filter(p => p.featured === true)
      allFeaturedProducts.push(...featured)
    }
    
    // Process liquor products
    if (liquorProducts) {
      const products = JSON.parse(liquorProducts)
      const featured = products.filter(p => p.featured === true)
      allFeaturedProducts.push(...featured)
    }
    
    return allFeaturedProducts
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}

// Subscribe to featured products changes
export const subscribeToFeaturedProducts = (callback) => {
  let lastData = []
  
  const checkForUpdates = () => {
    const currentData = fetchFeaturedProducts()
    const currentDataStr = JSON.stringify(currentData)
    const lastDataStr = JSON.stringify(lastData)
    
    if (currentDataStr !== lastDataStr) {
      lastData = currentData
      callback(currentData)
    }
  }
  
  // Check for updates every 2 seconds
  const interval = setInterval(checkForUpdates, 2000)
  
  // Initial check
  checkForUpdates()
  
  // Return unsubscribe function
  return () => clearInterval(interval)
}

// Legacy exports for backward compatibility
export const products = fallbackData.products
export const categories = fallbackData.categories
