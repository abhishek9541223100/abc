import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  // Check login state on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('anynow_user')
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        setUser(parsed)
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('anynow_user')
      }
    }
    setIsLoading(false)
  }, [])

  // Save user state to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('anynow_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('anynow_user')
    }
  }, [user])

  const handleAuthSubmit = (e) => {
    e.preventDefault()
    setMessage('')

    if (isLogin) {
      // Login logic
      const { email, password } = formData
      
      if (!email || !password) {
        setMessage('Please fill in all fields')
        return
      }

      // Simple authentication (in production, use real API)
      const users = JSON.parse(localStorage.getItem('anynow_users') || '[]')
      const foundUser = users.find(u => u.email === email && u.password === password)

      if (foundUser) {
        setUser({ name: foundUser.name, email: foundUser.email })
        setShowAuthModal(false)
        setMessage('Login successful!')
        resetForm()
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('Invalid email or password')
      }
    } else {
      // Signup logic
      const { name, email, password, confirmPassword } = formData
      
      if (!name || !email || !password || !confirmPassword) {
        setMessage('Please fill in all fields')
        return
      }

      if (password !== confirmPassword) {
        setMessage('Passwords do not match')
        return
      }

      if (password.length < 6) {
        setMessage('Password must be at least 6 characters')
        return
      }

      // Check if user already exists
      const users = JSON.parse(localStorage.getItem('anynow_users') || '[]')
      if (users.find(u => u.email === email)) {
        setMessage('User with this email already exists')
        return
      }

      // Create new user
      const newUser = { name, email, password }
      users.push(newUser)
      localStorage.setItem('anynow_users', JSON.stringify(users))

      setUser({ name, email })
      setShowAuthModal(false)
      setMessage('Signup successful!')
      resetForm()
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setMessage('Logged out successfully!')
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage(''), 3000)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
    setMessage('')
  }

  const toggleAuthMode = () => {
    setIsLogin(!isLogin)
    resetForm()
  }

  const value = {
    user,
    isLoading,
    showAuthModal,
    isLogin,
    message,
    formData,
    setShowAuthModal,
    setIsLogin,
    setFormData,
    handleAuthSubmit,
    handleLogout,
    toggleAuthMode,
    resetForm
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
