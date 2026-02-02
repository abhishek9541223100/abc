import { createContext, useContext, useState, useEffect } from 'react'

const LocationContext = createContext()

export const useLocation = () => {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
}

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState({ city: 'Select Location', area: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [permissionStatus, setPermissionStatus] = useState('prompt') // 'prompt', 'granted', 'denied'

  // Load saved location on mount and attempt auto-detection
  useEffect(() => {
    const savedLocation = localStorage.getItem('anynow_location')
    const savedPermissionStatus = localStorage.getItem('anynow_location_permission')
    
    if (savedPermissionStatus) {
      setPermissionStatus(savedPermissionStatus)
    }
    
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation)
        setLocation(parsed)
      } catch (error) {
        console.error('Error parsing saved location:', error)
        // Clear corrupted data
        localStorage.removeItem('anynow_location')
      }
    }
    
    // Always attempt auto-detection on first load if permission is not denied
    if (savedPermissionStatus !== 'denied') {
      // Small delay to ensure page is fully loaded
      setTimeout(() => {
        requestLocationPermission()
      }, 1000)
    }
  }, [])

  // Save location to localStorage whenever it changes
  useEffect(() => {
    if (location.city !== 'Select Location') {
      localStorage.setItem('anynow_location', JSON.stringify(location))
    }
  }, [location])

  // Save permission status
  useEffect(() => {
    localStorage.setItem('anynow_location_permission', permissionStatus)
  }, [permissionStatus])

  const requestLocationPermission = () => {
    if (!('geolocation' in navigator)) {
      console.error('Geolocation is not supported by this browser')
      setShowLocationModal(true)
      return
    }

    setIsLoading(true)
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          console.log('Location detected:', latitude, longitude)
          
          const city = await getCityFromCoordinates(latitude, longitude)
          const newLocation = { city, area: 'Current Location' }
          
          setLocation(newLocation)
          setPermissionStatus('granted')
          setIsLoading(false)
          
          // Show success feedback briefly
          console.log('Location auto-detected successfully:', city)
          
        } catch (error) {
          console.error('Error getting city from coordinates:', error)
          setIsLoading(false)
          setShowLocationModal(true)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        setIsLoading(false)
        setPermissionStatus('denied')
        
        // Show manual selection modal
        setShowLocationModal(true)
        
        // Set fallback location
        setLocation({ city: 'Select Location', area: '' })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  const getCityFromCoordinates = async (lat, lon) => {
    // Enhanced reverse geocoding with better accuracy
    const cities = [
      { name: 'Mumbai', lat: 19.0760, lon: 72.8777, range: 0.5 },
      { name: 'Delhi', lat: 28.6139, lon: 77.2090, range: 0.5 },
      { name: 'Bangalore', lat: 12.9716, lon: 77.5946, range: 0.5 },
      { name: 'Chennai', lat: 13.0827, lon: 80.2707, range: 0.5 },
      { name: 'Kolkata', lat: 22.5726, lon: 88.3639, range: 0.5 },
      { name: 'Hyderabad', lat: 17.3850, lon: 78.4867, range: 0.5 },
      { name: 'Pune', lat: 18.5204, lon: 73.8567, range: 0.5 },
      { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714, range: 0.5 },
      { name: 'Jaipur', lat: 26.9124, lon: 75.7873, range: 0.5 },
      { name: 'Lucknow', lat: 26.8467, lon: 80.9462, range: 0.5 },
      { name: 'Kanpur', lat: 26.4499, lon: 80.3319, range: 0.5 },
      { name: 'Nagpur', lat: 21.1458, lon: 79.0882, range: 0.5 },
      { name: 'Indore', lat: 22.7196, lon: 75.8577, range: 0.5 },
      { name: 'Thane', lat: 19.2183, lon: 72.9781, range: 0.5 },
      { name: 'Bhopal', lat: 23.2599, lon: 77.4126, range: 0.5 },
      { name: 'Visakhapatnam', lat: 17.6868, lon: 83.2185, range: 0.5 },
      { name: 'Patna', lat: 25.5941, lon: 85.1376, range: 0.5 },
      { name: 'Vadodara', lat: 22.3072, lon: 73.1812, range: 0.5 },
      { name: 'Agra', lat: 27.1767, lon: 78.0081, range: 0.5 },
      { name: 'Nashik', lat: 19.9975, lon: 73.7898, range: 0.5 }
    ]

    // Find closest city within range
    let closestCity = null
    let minDistance = Infinity

    cities.forEach(city => {
      const distance = Math.sqrt(
        Math.pow(lat - city.lat, 2) + Math.pow(lon - city.lon, 2)
      )
      if (distance < minDistance && distance < city.range) {
        minDistance = distance
        closestCity = city
      }
    })

    // If no city found within range, return the closest one
    if (!closestCity && cities.length > 0) {
      cities.forEach(city => {
        const distance = Math.sqrt(
          Math.pow(lat - city.lat, 2) + Math.pow(lon - city.lon, 2)
        )
        if (distance < minDistance) {
          minDistance = distance
          closestCity = city
        }
      })
    }

    return closestCity ? closestCity.name : 'Mumbai' // Default fallback
  }

  const searchLocations = (query) => {
    if (!query) {
      setSearchResults([])
      return
    }

    const cities = [
      { name: 'Mumbai', area: '400001' },
      { name: 'Delhi', area: '110001' },
      { name: 'Bangalore', area: '560001' },
      { name: 'Chennai', area: '600001' },
      { name: 'Kolkata', area: '700001' },
      { name: 'Hyderabad', area: '500001' },
      { name: 'Pune', area: '411001' },
      { name: 'Ahmedabad', area: '380001' },
      { name: 'Jaipur', area: '302001' },
      { name: 'Lucknow', area: '226001' },
      { name: 'Kanpur', area: '208001' },
      { name: 'Nagpur', area: '440001' },
      { name: 'Indore', area: '452001' },
      { name: 'Thane', area: '400601' },
      { name: 'Bhopal', area: '462001' },
      { name: 'Visakhapatnam', area: '530001' },
      { name: 'Patna', area: '800001' },
      { name: 'Vadodara', area: '390001' },
      { name: 'Agra', area: '282001' },
      { name: 'Nashik', area: '422001' }
    ]

    const filtered = cities.filter(city =>
      city.name.toLowerCase().includes(query.toLowerCase())
    )
    setSearchResults(filtered)
  }

  const selectLocation = (city, area) => {
    setLocation({ city, area })
    setShowLocationModal(false)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleLocationClick = () => {
    setShowLocationModal(true)
  }

  const retryLocationDetection = () => {
    setPermissionStatus('prompt')
    requestLocationPermission()
  }

  const value = {
    location,
    isLoading,
    showLocationModal,
    searchQuery,
    searchResults,
    permissionStatus,
    setShowLocationModal,
    setSearchQuery,
    searchLocations,
    selectLocation,
    handleLocationClick,
    requestLocationPermission,
    retryLocationDetection
  }

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  )
}
