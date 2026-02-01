// Data Bridge Service - Connects Admin Panel with Main Website
// This service provides a shared data store that both applications can access

class DataBridge {
  constructor() {
    this.products = this.loadFromStorage('products') || this.getDefaultProducts()
    this.categories = this.loadFromStorage('categories') || this.getDefaultCategories()
    this.orders = this.loadFromStorage('orders') || this.getDefaultOrders()
    
    // Initialize if empty
    if (!this.loadFromStorage('products')) {
      this.saveToStorage('products', this.products)
      this.saveToStorage('categories', this.categories)
      this.saveToStorage('orders', this.orders)
    }
  }

  // Storage helpers
  loadFromStorage(key) {
    try {
      const data = localStorage.getItem(`anynow_${key}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error(`Error loading ${key} from storage:`, error)
      return null
    }
  }

  saveToStorage(key, data) {
    try {
      localStorage.setItem(`anynow_${key}`, JSON.stringify(data))
      return true
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error)
      return false
    }
  }

  // Default data
  getDefaultProducts() {
    return [
      {
        id: 1,
        name: 'Fresh Apples',
        category: 'fruits-vegetables',
        price: 120,
        quantity: 100,
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300',
        inStock: true,
        unit: 'kg',
        description: 'Crispy and sweet red apples, perfect for snacking',
        discount: 10
      },
      {
        id: 2,
        name: 'Organic Tomatoes',
        category: 'fruits-vegetables',
        price: 80,
        quantity: 50,
        image: 'https://images.unsplash.com/photo-1546470427-e92b2c9c09d6?w=300',
        inStock: true,
        unit: 'kg',
        description: 'Fresh organic tomatoes, rich in flavor',
        discount: 0
      },
      {
        id: 3,
        name: 'Fresh Spinach',
        category: 'fruits-vegetables',
        price: 40,
        quantity: 75,
        image: 'https://images.unsplash.com/photo-1574386312658-830c5b77d4c5?w=300',
        inStock: true,
        unit: 'bunch',
        description: 'Nutritious fresh spinach leaves',
        discount: 5
      },
      {
        id: 4,
        name: 'Fresh Milk',
        category: 'dairy-bakery',
        price: 60,
        quantity: 30,
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300',
        inStock: true,
        unit: 'liter',
        description: 'Pure and fresh cow milk',
        discount: 0
      },
      {
        id: 5,
        name: 'White Bread',
        category: 'dairy-bakery',
        price: 45,
        quantity: 25,
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300',
        inStock: true,
        unit: 'loaf',
        description: 'Soft and fresh white bread',
        discount: 0
      }
    ]
  }

  getDefaultCategories() {
    return [
      { id: 1, name: 'Fruits & Vegetables', slug: 'fruits-vegetables' },
      { id: 2, name: 'Dairy & Bakery', slug: 'dairy-bakery' },
      { id: 3, name: 'Snacks & Beverages', slug: 'snacks-beverages' },
      { id: 4, name: 'Household Items', slug: 'household' },
      { id: 5, name: 'Personal Care', slug: 'personal-care' },
      { id: 6, name: 'Instant Food', slug: 'instant-food' }
    ]
  }

  getDefaultOrders() {
    return [
      {
        id: 1,
        customerName: 'John Doe',
        items: 5,
        total: 450,
        status: 'delivered',
        date: '2024-01-15'
      },
      {
        id: 2,
        customerName: 'Jane Smith',
        items: 3,
        total: 320,
        status: 'pending',
        date: '2024-01-16'
      }
    ]
  }

  // Product API methods
  getAllProducts() {
    return Promise.resolve([...this.products])
  }

  getProductById(id) {
    const product = this.products.find(p => p.id === parseInt(id))
    return Promise.resolve(product || null)
  }

  createProduct(productData) {
    const newProduct = {
      id: Math.max(...this.products.map(p => p.id), 0) + 1,
      ...productData,
      inStock: productData.quantity > 0
    }
    this.products.push(newProduct)
    this.saveToStorage('products', this.products)
    return Promise.resolve(newProduct)
  }

  updateProduct(id, productData) {
    const index = this.products.findIndex(p => p.id === parseInt(id))
    if (index !== -1) {
      this.products[index] = {
        ...this.products[index],
        ...productData,
        inStock: productData.quantity > 0
      }
      this.saveToStorage('products', this.products)
      return Promise.resolve(this.products[index])
    }
    return Promise.reject(new Error('Product not found'))
  }

  deleteProduct(id) {
    const index = this.products.findIndex(p => p.id === parseInt(id))
    if (index !== -1) {
      this.products.splice(index, 1)
      this.saveToStorage('products', this.products)
      return Promise.resolve(true)
    }
    return Promise.reject(new Error('Product not found'))
  }

  // Category API methods
  getAllCategories() {
    return Promise.resolve([...this.categories])
  }

  createCategory(categoryData) {
    const newCategory = {
      id: Math.max(...this.categories.map(c => c.id), 0) + 1,
      ...categoryData
    }
    this.categories.push(newCategory)
    this.saveToStorage('categories', this.categories)
    return Promise.resolve(newCategory)
  }

  deleteCategory(id) {
    const index = this.categories.findIndex(c => c.id === parseInt(id))
    if (index !== -1) {
      const category = this.categories[index]
      this.categories.splice(index, 1)
      this.saveToStorage('categories', this.categories)
      
      // Remove products in this category
      this.products = this.products.filter(p => p.category !== category.slug)
      this.saveToStorage('products', this.products)
      
      return Promise.resolve(true)
    }
    return Promise.reject(new Error('Category not found'))
  }

  // Order API methods
  getAllOrders() {
    return Promise.resolve([...this.orders])
  }

  getOrderStats() {
    const totalOrders = this.orders.length
    const totalRevenue = this.orders.reduce((sum, order) => sum + order.total, 0)
    const pendingOrders = this.orders.filter(order => order.status === 'pending').length
    
    return Promise.resolve({
      totalOrders,
      totalRevenue,
      pendingOrders
    })
  }

  // Website data export
  getWebsiteData() {
    const productsByCategory = {}
    this.categories.forEach(category => {
      productsByCategory[category.slug] = this.products.filter(p => p.category === category.slug)
    })
    
    return {
      products: productsByCategory,
      categories: this.categories.map(c => ({ name: c.name, slug: c.slug }))
    }
  }

  // Clear all data (for testing)
  clearAllData() {
    localStorage.removeItem('anynow_products')
    localStorage.removeItem('anynow_categories')
    localStorage.removeItem('anynow_orders')
    this.products = this.getDefaultProducts()
    this.categories = this.getDefaultCategories()
    this.orders = this.getDefaultOrders()
    this.saveToStorage('products', this.products)
    this.saveToStorage('categories', this.categories)
    this.saveToStorage('orders', this.orders)
  }
}

// Create singleton instance
const dataBridge = new DataBridge()

// Export for admin panel
export const productAPI = {
  getAll: () => dataBridge.getAllProducts(),
  getById: (id) => dataBridge.getProductById(id),
  create: (data) => dataBridge.createProduct(data),
  update: (id, data) => dataBridge.updateProduct(id, data),
  delete: (id) => dataBridge.deleteProduct(id)
}

export const categoryAPI = {
  getAll: () => dataBridge.getAllCategories(),
  create: (data) => dataBridge.createCategory(data),
  delete: (id) => dataBridge.deleteCategory(id)
}

export const orderAPI = {
  getAll: () => dataBridge.getAllOrders(),
  getStats: () => dataBridge.getOrderStats()
}

// Export for website
export const getWebsiteData = () => dataBridge.getWebsiteData()

// Export data bridge instance for direct access
export default dataBridge
