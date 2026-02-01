import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Package, ShoppingCart, Users, TrendingUp, Eye, CheckCircle, XCircle, Clock, UserCheck, UserX, Mail, Phone, Calendar, Award, Star, Target, TrendingDown, Upload, X } from 'lucide-react'

const AdminPanel = () => {
  const [products, setProducts] = useState([])
  const [panProducts, setPanProducts] = useState([])
  const [liquorProducts, setLiquorProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [activeTab, setActiveTab] = useState('products')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [selectedTestimonial, setSelectedTestimonial] = useState(null)
  const [showTestimonialDetails, setShowTestimonialDetails] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    image: '',
    unit: 'kg',
    description: '',
    discount: 0,
    featured: false
  })
  const [imagePreview, setImagePreview] = useState('')
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    initializeData()
    loadData()
    
    // Add event listener for storage changes from other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'anynow_products' || e.key === 'anynow_categories' || 
          e.key === 'anynow_pan_products' || e.key === 'anynow_liquor_products' ||
          e.key === 'anynow_orders' || e.key === 'anynow_users' ||
          e.key === 'anynow_testimonials') {
        loadData()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Also check for updates periodically
    const interval = setInterval(() => {
      loadData()
    }, 1000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const initializeData = () => {
    // Initialize with default data if empty
    const existingProducts = localStorage.getItem('anynow_products')
    const existingCategories = localStorage.getItem('anynow_categories')
    const existingPanProducts = localStorage.getItem('anynow_pan_products')
    const existingLiquorProducts = localStorage.getItem('anynow_liquor_products')
    
    if (!existingCategories) {
      const defaultCategories = [
        { id: 1, name: 'Fruits & Vegetables', slug: 'fruits-vegetables' },
        { id: 2, name: 'Dairy & Bakery', slug: 'dairy-bakery' },
        { id: 3, name: 'Snacks & Beverages', slug: 'snacks-beverages' },
        { id: 4, name: 'Household Items', slug: 'household' },
        { id: 5, name: 'Personal Care', slug: 'personal-care' },
        { id: 6, name: 'Instant Food', slug: 'instant-food' }
      ]
      localStorage.setItem('anynow_categories', JSON.stringify(defaultCategories))
    }
    
    if (!existingProducts) {
      const defaultProducts = [
        {
          id: 1,
          name: 'Fresh Apples',
          category: 'fruits-vegetables',
          price: 120,
          quantity: 100,
          image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300',
          unit: 'kg',
          description: 'Crispy and sweet red apples, perfect for snacking',
          discount: 10,
          inStock: true
        },
        {
          id: 2,
          name: 'Organic Tomatoes',
          category: 'fruits-vegetables',
          price: 80,
          quantity: 50,
          image: 'https://images.unsplash.com/photo-1546470427-e92b2c9c09d6?w=300',
          unit: 'kg',
          description: 'Fresh organic tomatoes, rich in flavor',
          discount: 0,
          inStock: true
        },
        {
          id: 3,
          name: 'Fresh Milk',
          category: 'dairy-bakery',
          price: 60,
          quantity: 30,
          image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300',
          unit: 'liter',
          description: 'Pure and fresh cow milk',
          discount: 0,
          inStock: true
        }
      ]
      localStorage.setItem('anynow_products', JSON.stringify(defaultProducts))
    }
    
    // Initialize pan products if empty
    if (!existingPanProducts) {
      const defaultPanProducts = []
      localStorage.setItem('anynow_pan_products', JSON.stringify(defaultPanProducts))
    }
    
    // Initialize liquor products if empty
    if (!existingLiquorProducts) {
      const defaultLiquorProducts = []
      localStorage.setItem('anynow_liquor_products', JSON.stringify(defaultLiquorProducts))
    }
  }

  const loadData = () => {
    try {
      const storedProducts = localStorage.getItem('anynow_products')
      const storedCategories = localStorage.getItem('anynow_categories')
      const storedPanProducts = localStorage.getItem('anynow_pan_products')
      const storedLiquorProducts = localStorage.getItem('anynow_liquor_products')
      const storedOrders = localStorage.getItem('anynow_orders')
      const storedUsers = localStorage.getItem('anynow_users')
      const storedTestimonials = localStorage.getItem('anynow_testimonials')
      
      if (storedProducts) {
        const parsedProducts = JSON.parse(storedProducts)
        setProducts(parsedProducts)
      }
      if (storedCategories) {
        const parsedCategories = JSON.parse(storedCategories)
        setCategories(parsedCategories)
      }
      if (storedPanProducts) {
        const parsedPanProducts = JSON.parse(storedPanProducts)
        setPanProducts(parsedPanProducts)
      }
      if (storedLiquorProducts) {
        const parsedLiquorProducts = JSON.parse(storedLiquorProducts)
        setLiquorProducts(parsedLiquorProducts)
      }
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders)
        // Sort orders by date (newest first)
        const sortedOrders = parsedOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
        setOrders(sortedOrders)
      }
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers)
        // Sort users by signup date (newest first)
        const sortedUsers = parsedUsers.sort((a, b) => new Date(b.signupDate) - new Date(a.signupDate))
        setUsers(sortedUsers)
      }
      if (storedTestimonials) {
        const parsedTestimonials = JSON.parse(storedTestimonials)
        // Sort testimonials by date (newest first)
        const sortedTestimonials = parsedTestimonials.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setTestimonials(sortedTestimonials)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const saveData = (products, categories) => {
    try {
      localStorage.setItem('anynow_products', JSON.stringify(products))
      localStorage.setItem('anynow_categories', JSON.stringify(categories))
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage('')
    
    try {
      let updatedProducts
      if (editingProduct) {
        updatedProducts = products.map(p => 
          p.id === editingProduct.id 
            ? { ...p, ...formData, inStock: formData.quantity > 0 }
            : p
        )
        setMessage('Product updated successfully!')
      } else {
        const newProduct = {
          id: Math.max(...products.map(p => p.id), 0) + 1,
          ...formData,
          inStock: formData.quantity > 0,
          featured: formData.featured || false
        }
        updatedProducts = [...products, newProduct]
        setMessage('Product added successfully!')
      }
      
      setProducts(updatedProducts)
      saveData(updatedProducts, categories)
      resetForm()
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error saving product:', error)
      setMessage('Error saving product. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      image: product.image,
      unit: product.unit || 'kg',
      description: product.description || '',
      discount: product.discount || 0
    })
    setImagePreview(product.image || '')
    setShowAddForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const updatedProducts = products.filter(p => p.id !== id)
      setProducts(updatedProducts)
      saveData(updatedProducts, categories)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      quantity: '',
      image: '',
      unit: 'kg',
      description: '',
      discount: 0,
      featured: false
    })
    setImagePreview('')
    setUploadError('')
    setEditingProduct(null)
    setShowAddForm(false)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a valid image file (JPG, PNG, or WEBP)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB')
      return
    }

    setUploadError('')

    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      const imageUrl = event.target.result
      setImagePreview(imageUrl)
      setFormData(prev => ({ ...prev, image: imageUrl }))
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImagePreview('')
    setFormData(prev => ({ ...prev, image: '' }))
    setUploadError('')
  }

  const handlePanEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity || 1,
      image: product.image,
      unit: product.unit || 'pack',
      description: product.description || '',
      discount: product.discount || 0
    })
    setActiveTab('products')
    setShowAddForm(true)
  }

  const handleLiquorEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity || 1,
      image: product.image,
      unit: product.unit || 'bottle',
      description: product.description || '',
      discount: product.discount || 0
    })
    setActiveTab('products')
    setShowAddForm(true)
  }

  const handlePanDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const updatedProducts = panProducts.filter(p => p.id !== id)
      setPanProducts(updatedProducts)
      localStorage.setItem('anynow_pan_products', JSON.stringify(updatedProducts))
      // Trigger storage event to update the table
      window.dispatchEvent(new Event('storage'))
      window.dispatchEvent(new StorageEvent('storage', { key: 'anynow_pan_products' }))
    }
  }

  const handleLiquorDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const updatedProducts = liquorProducts.filter(p => p.id !== id)
      setLiquorProducts(updatedProducts)
      localStorage.setItem('anynow_liquor_products', JSON.stringify(updatedProducts))
      // Trigger storage event to update the table
      window.dispatchEvent(new Event('storage'))
      window.dispatchEvent(new StorageEvent('storage', { key: 'anynow_liquor_products' }))
    }
  }

  // Order Management Functions
  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    try {
      const updatedOrders = orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      )
      
      localStorage.setItem('anynow_orders', JSON.stringify(updatedOrders))
      setOrders(updatedOrders)
      
      // Show success message
      setMessage(`Order status updated to ${newStatus}`)
      setTimeout(() => setMessage(''), 3000)
      
      // Trigger storage event for real-time updates
      window.dispatchEvent(new Event('storage'))
      window.dispatchEvent(new StorageEvent('storage', { key: 'anynow_orders' }))
    } catch (error) {
      console.error('Error updating order status:', error)
      setMessage('Error updating order status')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800'
      case 'Accepted':
        return 'bg-yellow-100 text-yellow-800'
      case 'Delivered':
        return 'bg-green-100 text-green-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'New':
        return <Clock className="w-4 h-4" />
      case 'Accepted':
        return <CheckCircle className="w-4 h-4" />
      case 'Delivered':
        return <CheckCircle className="w-4 h-4" />
      case 'Cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  // Test function for creating sample orders (for development/testing)
  window.createTestOrder = () => {
    const testOrder = {
      id: Date.now(),
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '+91 9876543210',
      deliveryLocation: 'Mumbai, Maharashtra',
      orderDate: new Date().toISOString(),
      totalAmount: Math.floor(Math.random() * 1000) + 100,
      status: 'New',
      items: [
        {
          name: 'Fresh Apples',
          price: 120,
          quantity: 2,
          image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300'
        },
        {
          name: 'Organic Tomatoes',
          price: 80,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1546470427-e92b2c9c09d6?w=300'
        }
      ],
      subtotal: 320,
      deliveryFee: 40,
      updatedAt: new Date().toISOString()
    }
    
    const existingOrders = JSON.parse(localStorage.getItem('anynow_orders') || '[]')
    const updatedOrders = [testOrder, ...existingOrders]
    localStorage.setItem('anynow_orders', JSON.stringify(updatedOrders))
    
    // Trigger storage event for real-time update
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new StorageEvent('storage', { key: 'anynow_orders' }))
    
    console.log('Test order created:', testOrder)
    return testOrder
  }

  // User Management Functions
  const handleViewUser = (user) => {
    setSelectedUser(user)
    setShowUserDetails(true)
  }

  const handleToggleUserStatus = (userId) => {
    try {
      const updatedUsers = users.map(user => 
        user.id === userId 
          ? { ...user, isBlocked: !user.isBlocked, updatedAt: new Date().toISOString() }
          : user
      )
      
      localStorage.setItem('anynow_users', JSON.stringify(updatedUsers))
      setUsers(updatedUsers)
      
      const user = updatedUsers.find(u => u.id === userId)
      setMessage(`User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`)
      setTimeout(() => setMessage(''), 3000)
      
      // Trigger storage event for real-time updates
      window.dispatchEvent(new Event('storage'))
      window.dispatchEvent(new StorageEvent('storage', { key: 'anynow_users' }))
    } catch (error) {
      console.error('Error updating user status:', error)
      setMessage('Error updating user status')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const getUserTotalOrders = (userId) => {
    return orders.filter(order => order.customerId === userId).length
  }

  const getFilteredUsers = () => {
    if (!searchQuery) return users
    
    const query = searchQuery.toLowerCase()
    return users.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query)
    )
  }

  // Test function for creating sample users (for development/testing)
  window.createTestUser = () => {
    const testUser = {
      id: Date.now(),
      name: 'Test User ' + Math.floor(Math.random() * 1000),
      email: 'testuser' + Math.floor(Math.random() * 1000) + '@example.com',
      phone: '+91 ' + Math.floor(Math.random() * 9000000000 + 1000000000),
      signupDate: new Date().toISOString(),
      isBlocked: false,
      totalOrders: Math.floor(Math.random() * 10),
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const existingUsers = JSON.parse(localStorage.getItem('anynow_users') || '[]')
    const updatedUsers = [testUser, ...existingUsers]
    localStorage.setItem('anynow_users', JSON.stringify(updatedUsers))
    
    // Trigger storage event for real-time update
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new StorageEvent('storage', { key: 'anynow_users' }))
    
    console.log('Test user created:', testUser)
    return testUser
  }

  // Testimonial Management Functions
  const handleViewTestimonial = (testimonial) => {
    setSelectedTestimonial(testimonial)
    setShowTestimonialDetails(true)
  }

  const handleToggleTestimonialStatus = (testimonialId) => {
    try {
      const updatedTestimonials = testimonials.map(testimonial => 
        testimonial.id === testimonialId 
          ? { ...testimonial, isApproved: !testimonial.isApproved, updatedAt: new Date().toISOString() }
          : testimonial
      )
      
      localStorage.setItem('anynow_testimonials', JSON.stringify(updatedTestimonials))
      setTestimonials(updatedTestimonials)
      
      const testimonial = updatedTestimonials.find(t => t.id === testimonialId)
      setMessage(`Testimonial ${testimonial.isApproved ? 'approved' : 'rejected'} successfully`)
      setTimeout(() => setMessage(''), 3000)
      
      // Trigger storage event for real-time updates
      window.dispatchEvent(new Event('storage'))
      window.dispatchEvent(new StorageEvent('storage', { key: 'anynow_testimonials' }))
    } catch (error) {
      console.error('Error updating testimonial status:', error)
      setMessage('Error updating testimonial status')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const getFilteredTestimonials = () => {
    if (!searchQuery) return testimonials
    
    const query = searchQuery.toLowerCase()
    return testimonials.filter(testimonial => 
      testimonial.customerName.toLowerCase().includes(query) ||
      testimonial.customerEmail?.toLowerCase().includes(query) ||
      testimonial.productName.toLowerCase().includes(query)
    )
  }

  const getRatingStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />)
      }
    }
    return stars
  }

  // Test function for creating sample testimonials (for development/testing)
  window.createTestTestimonial = () => {
    const indianNames = ['Priya Sharma', 'Rahul Kumar', 'Anjali Patel', 'Vikram Singh', 'Meera Reddy', 'Amit Joshi', 'Kavita Nair', 'Rohit Verma', 'Sneha Gupta']
    const indianProducts = ['Fresh Apples', 'Organic Tomatoes', 'Pure Milk', 'Basmati Rice', 'Whole Wheat Atta', 'Fresh Potatoes']
    const testimonialTexts = [
      'Excellent quality products and very fast delivery! The fresh vegetables are always top-notch.',
      'Great service and reasonable prices. I love the convenience of getting everything delivered.',
      'Best grocery delivery service in Mumbai. Products are always fresh and packaging is perfect.',
      'Very satisfied with the quality and service. The organic products are amazing!',
      'Quick delivery and great customer support. Never had any issues with orders.',
      'Outstanding service! The pan corner products are always available and fresh.',
      'Highly recommend this service. Best prices for quality products in the market.',
      'Amazing experience with liquor corner delivery. Professional service and great selection.',
      'Consistently excellent service. Been using for 6 months and never disappointed.'
    ]

    const testTestimonial = {
      id: Date.now(),
      customerName: indianNames[Math.floor(Math.random() * indianNames.length)],
      customerEmail: 'customer' + Math.floor(Math.random() * 1000) + '@gmail.com',
      customerPhone: '+91 ' + Math.floor(Math.random() * 9000000000 + 1000000000),
      productName: indianProducts[Math.floor(Math.random() * indianProducts.length)],
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
      testimonial: testimonialTexts[Math.floor(Math.random() * testimonialTexts.length)],
      orderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 30 days
      isApproved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const existingTestimonials = JSON.parse(localStorage.getItem('anynow_testimonials') || '[]')
    const updatedTestimonials = [testTestimonial, ...existingTestimonials]
    localStorage.setItem('anynow_testimonials', JSON.stringify(updatedTestimonials))
    
    // Trigger storage event for real-time update
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new StorageEvent('storage', { key: 'anynow_testimonials' }))
    
    console.log('Test testimonial created:', testTestimonial)
    return testTestimonial
  }

  const ProductManagementTable = ({ products, onEdit, onDelete, category, setPanProducts, setLiquorProducts }) => {
    const [showAddForm, setShowAddForm] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [imagePreview, setImagePreview] = useState('')
    const [uploadError, setUploadError] = useState('')
    const [formData, setFormData] = useState({
      name: '',
      price: '',
      image: '',
      unit: category === 'pan-corner' ? 'pack' : 'bottle',
      description: '',
      featured: false
    })

    const handleImageUpload = (e) => {
      const file = e.target.files[0]
      if (!file) return

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setUploadError('Please upload a valid image file (JPG, PNG, or WEBP)')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Image size should be less than 5MB')
        return
      }

      setUploadError('')

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target.result
        setImagePreview(imageUrl)
        setFormData(prev => ({ ...prev, image: imageUrl }))
      }
      reader.readAsDataURL(file)
    }

    const removeImage = () => {
      setImagePreview('')
      setFormData(prev => ({ ...prev, image: '' }))
      setUploadError('')
    }

    const handleSubmit = async (e) => {
      e.preventDefault()
      setIsSaving(true)
      setMessage('')
      
      try {
        // Get the correct products array for ID calculation
        const currentProducts = products
        const newId = currentProducts.length > 0 ? Math.max(...currentProducts.map(p => p.id), 0) + 1 : 1
        
        const newProduct = {
          id: newId,
          ...formData,
          category: category,
          inStock: true,
          featured: formData.featured || false
        }
        
        const updatedProducts = [...currentProducts, newProduct]
        
        if (category === 'pan-corner') {
          localStorage.setItem('anynow_pan_products', JSON.stringify(updatedProducts))
          // Update parent state directly
          if (setPanProducts) setPanProducts(updatedProducts)
          setMessage('Pan product added successfully!')
        } else {
          localStorage.setItem('anynow_liquor_products', JSON.stringify(updatedProducts))
          // Update parent state directly
          if (setLiquorProducts) setLiquorProducts(updatedProducts)
          setMessage('Liquor product added successfully!')
        }
        
        // Trigger parent component to reload
        window.dispatchEvent(new Event('storage'))
        window.dispatchEvent(new StorageEvent('storage', { 
          key: category === 'pan-corner' ? 'anynow_pan_products' : 'anynow_liquor_products' 
        }))
        
        setFormData({
          name: '',
          price: '',
          image: '',
          unit: category === 'pan-corner' ? 'pack' : 'bottle',
          description: '',
          featured: false
        })
        setImagePreview('')
        setUploadError('')
        setShowAddForm(false)
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000)
      } catch (error) {
        console.error('Error saving product:', error)
        setMessage('Error saving product. Please try again.')
      } finally {
        setIsSaving(false)
      }
    }

    return (
      <div>
        {showAddForm && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Add New {category === 'pan-corner' ? 'Pan' : 'Liquor'} Product</h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>
            
            {/* Success/Error Message */}
            {message && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                message.includes('successfully') 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                {message}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                >
                  {category === 'pan-corner' ? (
                    <>
                      <option value="pack">pack</option>
                      <option value="piece">piece</option>
                      <option value="box">box</option>
                    </>
                  ) : (
                    <>
                      <option value="bottle">bottle</option>
                      <option value="can">can</option>
                      <option value="pack">pack</option>
                    </>
                  )}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                
                {/* Image Upload Area */}
                <div className="space-y-4">
                  {!imagePreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        id="image-upload-table"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="image-upload-table"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload className="w-12 h-12 text-gray-400 mb-3" />
                        <span className="text-sm text-gray-600 mb-2">
                          Click to upload image from device
                        </span>
                        <span className="text-xs text-gray-500">
                          Supports: JPG, PNG, WEBP (max 5MB)
                        </span>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="mt-2 text-sm text-green-600">
                        ✓ Image uploaded successfully
                      </div>
                    </div>
                  )}
                  
                  {/* Upload Error */}
                  {uploadError && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                      {uploadError}
                    </div>
                  )}
                  
                  {/* Alternative: URL input */}
                  <div className="text-center text-sm text-gray-500">
                    OR
                  </div>
                  <div>
                    <input
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={formData.image}
                      onChange={(e) => {
                        setFormData({...formData, image: e.target.value})
                        setImagePreview(e.target.value)
                      }}
                      placeholder="Enter image URL (optional)"
                    />
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Featured Product</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                      Mark as featured product
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2 flex gap-4">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    'Add Product'
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setImagePreview('')
                    setUploadError('')
                    setShowAddForm(false)
                  }} 
                  disabled={isSaving}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="px-6 py-4 border-b border-gray-200">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add {category === 'pan-corner' ? 'Pan' : 'Liquor'} Product
          </button>
        </div>

        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-lg object-cover mr-3"
                        src={product.image || 'https://via.placeholder.com/40'}
                        alt={product.name}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      In Stock
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onEdit(product)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {products.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No products found. Add your first product to get started.
            </div>
          )}
        </div>
      </div>
    )
  }

  const stats = {
    totalProducts: products.length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.quantity), 0),
    lowStock: products.filter(p => p.quantity < 10).length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">AnyNow Admin Panel</h1>
            <a 
              href="/"
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Website
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">₹{stats.totalValue}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold">{stats.lowStock}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Management */}
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Grocery Products
            </button>
            <button
              onClick={() => setActiveTab('pan')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pan'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pan Corner
            </button>
            <button
              onClick={() => setActiveTab('liquor')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'liquor'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Liquor Corner
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('testimonials')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'testimonials'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Testimonials
            </button>
          </nav>
        </div>

        {/* Grocery Products Management */}
        {activeTab === 'products' && (
          <div>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Grocery Product Management</h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </button>
            </div>

            {/* Add/Edit Product Form */}
            {showAddForm && (
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                    ×
                  </button>
                </div>
                
                {/* Success/Error Message */}
                {message && (
                  <div className={`mb-4 p-3 rounded-lg text-sm ${
                    message.includes('successfully') 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    {message}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.slug}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    >
                      <option value="kg">kg</option>
                      <option value="liter">liter</option>
                      <option value="pack">pack</option>
                      <option value="bottle">bottle</option>
                      <option value="piece">piece</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={formData.discount}
                      onChange={(e) => setFormData({...formData, discount: e.target.value})}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                    
                    {/* Image Upload Area */}
                    <div className="space-y-4">
                      {!imagePreview ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                          <input
                            type="file"
                            id="image-upload"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer flex flex-col items-center"
                          >
                            <Upload className="w-12 h-12 text-gray-400 mb-3" />
                            <span className="text-sm text-gray-600 mb-2">
                              Click to upload image from device
                            </span>
                            <span className="text-xs text-gray-500">
                              Supports: JPG, PNG, WEBP (max 5MB)
                            </span>
                          </label>
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Product preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="mt-2 text-sm text-green-600">
                            ✓ Image uploaded successfully
                          </div>
                        </div>
                      )}
                      
                      {/* Upload Error */}
                      {uploadError && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                          {uploadError}
                        </div>
                      )}
                      
                      {/* Alternative: URL input */}
                      <div className="text-center text-sm text-gray-500">
                        OR
                      </div>
                      <div>
                        <input
                          type="url"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          value={formData.image}
                          onChange={(e) => {
                            setFormData({...formData, image: e.target.value})
                            setImagePreview(e.target.value)
                          }}
                          placeholder="Enter image URL (optional)"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  
                  <div className="md:col-span-2 flex gap-4">
                    <button 
                      type="submit" 
                      disabled={isSaving}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        editingProduct ? 'Update Product' : 'Add Product'
                      )}
                    </button>
                    <button 
                      type="button" 
                      onClick={resetForm} 
                      disabled={isSaving}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products Table */}
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                            src={product.image || 'https://via.placeholder.com/40'}
                            alt={product.name}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.unit}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{product.price}
                        {product.discount > 0 && (
                          <span className="text-xs text-green-600 ml-1">-{product.discount}%</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.featured ? 'Featured' : 'Regular'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {products.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No products found. Add your first product to get started.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pan Corner Management */}
        {activeTab === 'pan' && (
          <div>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Pan Corner Products</h2>
            </div>
            <ProductManagementTable 
              products={panProducts}
              onEdit={handlePanEdit}
              onDelete={handlePanDelete}
              category="pan-corner"
              setPanProducts={setPanProducts}
              setLiquorProducts={setLiquorProducts}
            />
          </div>
        )}

        {/* Liquor Corner Management */}
        {activeTab === 'liquor' && (
          <div>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Liquor Corner Products</h2>
            </div>
            <ProductManagementTable 
              products={liquorProducts}
              onEdit={handleLiquorEdit}
              onDelete={handleLiquorDelete}
              category="liquor-corner"
              setPanProducts={setPanProducts}
              setLiquorProducts={setLiquorProducts}
            />
          </div>
        )}

        {/* Orders Management */}
        {activeTab === 'orders' && (
          <div>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Orders Management</h2>
            </div>
            
            {/* Success/Error Message */}
            {message && (
              <div className={`mx-6 mt-4 p-3 rounded-lg text-sm ${
                message.includes('Error') 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : 'bg-green-100 text-green-700 border border-green-200'
              }`}>
                {message}
              </div>
            )}

            <div className="overflow-hidden">
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No orders yet</p>
                  <p className="text-sm text-gray-400 mt-2">Orders will appear here when customers place them</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className={order.status === 'New' ? 'bg-blue-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.orderDate).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{order.totalAmount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{order.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                              title="View Order Details"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </button>
                            
                            {/* Status Update Dropdown */}
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                            >
                              <option value="New">New</option>
                              <option value="Accepted">Accepted</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Order Details Modal */}
            {showOrderDetails && selectedOrder && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Order Details - #{selectedOrder.id}</h3>
                    <button
                      onClick={() => setShowOrderDetails(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Customer Information */}
                    <div className="border-b pb-4">
                      <h4 className="font-medium mb-2">Customer Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Name:</span>
                          <p className="font-medium">{selectedOrder.customerName}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Email:</span>
                          <p className="font-medium">{selectedOrder.customerEmail}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Phone:</span>
                          <p className="font-medium">{selectedOrder.customerPhone}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Location:</span>
                          <p className="font-medium">{selectedOrder.deliveryLocation}</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-b pb-4">
                      <h4 className="font-medium mb-2">Order Items</h4>
                      <div className="space-y-2">
                        {selectedOrder.items?.map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                              </div>
                            </div>
                            <p className="font-medium">₹{item.price * item.quantity}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                      <h4 className="font-medium mb-2">Order Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>₹{selectedOrder.subtotal || selectedOrder.totalAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Fee:</span>
                          <span>₹{selectedOrder.deliveryFee || 0}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                          <span>Total Amount:</span>
                          <span>₹{selectedOrder.totalAmount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Status */}
                    <div className="flex justify-between items-center pt-4">
                      <div>
                        <span className="text-gray-500 text-sm">Current Status:</span>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ml-2 ${getStatusColor(selectedOrder.status)}`}>
                          {getStatusIcon(selectedOrder.status)}
                          <span className="ml-1">{selectedOrder.status}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowOrderDetails(false)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Management */}
        {activeTab === 'users' && (
          <div>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Users Management</h2>
            </div>
            
            {/* Success/Error Message */}
            {message && (
              <div className={`mx-6 mt-4 p-3 rounded-lg text-sm ${
                message.includes('Error') 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : 'bg-green-100 text-green-700 border border-green-200'
              }`}>
                {message}
              </div>
            )}

            {/* Search Bar */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="overflow-hidden">
              {getFilteredUsers().length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchQuery ? 'No users found matching your search' : 'No users yet'}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {searchQuery ? 'Try a different search term' : 'Users will appear here when they sign up'}
                  </p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email / Mobile
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Signup Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredUsers().map((user) => (
                      <tr key={user.id} className={user.isBlocked ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{user.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                              <span className="text-xs font-medium text-gray-600">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <Mail className="w-3 h-3 mr-1 text-gray-400" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center">
                                <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                            {new Date(user.signupDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-medium">{getUserTotalOrders(user.id)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.isBlocked 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.isBlocked ? (
                              <>
                                <UserX className="w-3 h-3 mr-1" />
                                Blocked
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3 h-3 mr-1" />
                                Active
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                              title="View User Details"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </button>
                            
                            <button
                              onClick={() => handleToggleUserStatus(user.id)}
                              className={`flex items-center ${
                                user.isBlocked 
                                  ? 'text-green-600 hover:text-green-900' 
                                  : 'text-red-600 hover:text-red-900'
                              }`}
                              title={user.isBlocked ? 'Unblock User' : 'Block User'}
                            >
                              {user.isBlocked ? (
                                <>
                                  <UserCheck className="w-4 h-4 mr-1" />
                                  Unblock
                                </>
                              ) : (
                                <>
                                  <UserX className="w-4 h-4 mr-1" />
                                  Block
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* User Details Modal */}
            {showUserDetails && selectedUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">User Details - #{selectedUser.id}</h3>
                    <button
                      onClick={() => setShowUserDetails(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* User Profile */}
                    <div className="flex items-center space-x-4 pb-4 border-b">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xl font-medium text-gray-600">
                          {selectedUser.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{selectedUser.name}</h4>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          selectedUser.isBlocked 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {selectedUser.isBlocked ? (
                            <>
                              <UserX className="w-3 h-3 mr-1" />
                              Blocked
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3 mr-1" />
                              Active
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* User Information */}
                    <div className="border-b pb-4">
                      <h4 className="font-medium mb-3">User Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">User ID:</span>
                          <p className="font-medium">#{selectedUser.id}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Email:</span>
                          <p className="font-medium">{selectedUser.email}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Phone:</span>
                          <p className="font-medium">{selectedUser.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Signup Date:</span>
                          <p className="font-medium">{new Date(selectedUser.signupDate).toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Login:</span>
                          <p className="font-medium">
                            {selectedUser.lastLogin 
                              ? new Date(selectedUser.lastLogin).toLocaleString() 
                              : 'Never'
                            }
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Total Orders:</span>
                          <p className="font-medium">{getUserTotalOrders(selectedUser.id)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Recent Orders Summary */}
                    <div>
                      <h4 className="font-medium mb-3">Recent Orders</h4>
                      {getUserTotalOrders(selectedUser.id) > 0 ? (
                        <div className="space-y-2">
                          {orders
                            .filter(order => order.customerId === selectedUser.id)
                            .slice(0, 3)
                            .map(order => (
                              <div key={order.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                                <div>
                                  <span className="font-medium">#{order.id}</span>
                                  <span className="text-gray-500 ml-2">
                                    {new Date(order.orderDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">₹{order.totalAmount}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No orders yet</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4">
                      <div className="text-sm text-gray-500">
                        Account created {new Date(selectedUser.signupDate).toLocaleDateString()}
                      </div>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleToggleUserStatus(selectedUser.id)}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            selectedUser.isBlocked 
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          {selectedUser.isBlocked ? 'Unblock User' : 'Block User'}
                        </button>
                        <button
                          onClick={() => setShowUserDetails(false)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Testimonials Management */}
        {activeTab === 'testimonials' && (
          <div>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Testimonials Management</h2>
            </div>
            
            {/* Success/Error Message */}
            {message && (
              <div className={`mx-6 mt-4 p-3 rounded-lg text-sm ${
                message.includes('Error') 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : 'bg-green-100 text-green-700 border border-green-200'
              }`}>
                {message}
              </div>
            )}

            {/* Search Bar */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search testimonials by name, email, or product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="overflow-hidden">
              {getFilteredTestimonials().length === 0 ? (
                <div className="text-center py-12">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchQuery ? 'No testimonials found matching your search' : 'No testimonials yet'}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {searchQuery ? 'Try a different search term' : 'Testimonials will appear here when customers submit them'}
                  </p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Testimonial ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredTestimonials().map((testimonial) => (
                      <tr key={testimonial.id} className={!testimonial.isApproved ? 'bg-yellow-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{testimonial.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-xs font-medium text-orange-600">
                                {testimonial.customerName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{testimonial.customerName}</div>
                              {testimonial.customerEmail && (
                                <div className="text-xs text-gray-500">{testimonial.customerEmail}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="font-medium">{testimonial.productName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="flex">
                              {getRatingStars(testimonial.rating)}
                            </div>
                            <span className="ml-2 text-gray-600">({testimonial.rating}.0)</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                            {new Date(testimonial.orderDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            testimonial.isApproved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {testimonial.isApproved ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approved
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewTestimonial(testimonial)}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                              title="View Testimonial Details"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </button>
                            
                            <button
                              onClick={() => handleToggleTestimonialStatus(testimonial.id)}
                              className={`flex items-center ${
                                testimonial.isApproved 
                                  ? 'text-yellow-600 hover:text-yellow-900' 
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                              title={testimonial.isApproved ? 'Reject Testimonial' : 'Approve Testimonial'}
                            >
                              {testimonial.isApproved ? (
                                <>
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Testimonial Details Modal */}
            {showTestimonialDetails && selectedTestimonial && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Testimonial Details - #{selectedTestimonial.id}</h3>
                    <button
                      onClick={() => setShowTestimonialDetails(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Customer Information */}
                    <div className="flex items-center space-x-4 pb-4 border-b">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-xl font-medium text-orange-600">
                          {selectedTestimonial.customerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{selectedTestimonial.customerName}</h4>
                        <div className="text-sm text-gray-600">{selectedTestimonial.customerEmail}</div>
                        {selectedTestimonial.customerPhone && (
                          <div className="text-sm text-gray-600">{selectedTestimonial.customerPhone}</div>
                        )}
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                          selectedTestimonial.isApproved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedTestimonial.isApproved ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approved
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              Pending Approval
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Testimonial Content */}
                    <div className="border-b pb-4">
                      <h4 className="font-medium mb-3">Testimonial</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 leading-relaxed">{selectedTestimonial.testimonial}</p>
                      </div>
                    </div>

                    {/* Product & Order Information */}
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                      <div>
                        <h4 className="font-medium mb-2">Product Reviewed</h4>
                        <p className="text-gray-900 font-medium">{selectedTestimonial.productName}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Rating</h4>
                        <div className="flex items-center">
                          <div className="flex">
                            {getRatingStars(selectedTestimonial.rating)}
                          </div>
                          <span className="ml-2 text-gray-600">({selectedTestimonial.rating}.0 / 5.0)</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Order Date</h4>
                        <p className="text-gray-900">{new Date(selectedTestimonial.orderDate).toLocaleString()}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Submitted On</h4>
                        <p className="text-gray-900">{new Date(selectedTestimonial.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4">
                      <div className="text-sm text-gray-500">
                        Testimonial submitted {new Date(selectedTestimonial.createdAt).toLocaleDateString()}
                      </div>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleToggleTestimonialStatus(selectedTestimonial.id)}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            selectedTestimonial.isApproved 
                              ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {selectedTestimonial.isApproved ? 'Reject Testimonial' : 'Approve Testimonial'}
                        </button>
                        <button
                          onClick={() => setShowTestimonialDetails(false)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel
