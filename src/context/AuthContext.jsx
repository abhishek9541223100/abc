import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

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
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isLogin, setIsLogin] = useState(true) // Toggle between Login and Signup
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  // Initialize Supabase Auth
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setIsLoading(false)
      }
    })

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
      }

      // Combine auth user metadata with profile data
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser({ ...authUser, ...data })
    } catch (error) {
      console.error('Profile fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setIsLoading(true)

    const { name, email, password, confirmPassword } = formData

    try {
      if (isLogin) {
        // Login Logic
        if (!email || !password) {
          throw new Error('Please fill in all fields')
        }

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) throw error

        setShowAuthModal(false)
        setMessage('Login successful!')
        resetForm()
      } else {
        // Signup Logic
        if (!name || !email || !password || !confirmPassword) {
          throw new Error('Please fill in all fields')
        }

        if (password !== confirmPassword) {
          throw new Error('Passwords do not match')
        }

        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters')
        }

        // Sign up with metadata
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name }
          }
        })

        if (error) throw error

        setShowAuthModal(false)
        setMessage('Signup successful! Check your email for confirmation.') // If email confirm enabled
        // If email confirm is disabled, they are logged in automatically
        resetForm()
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsLoading(false)
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      setSession(null)
      setMessage('Logged out successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Logout error:', error)
    }
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
    session,
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
