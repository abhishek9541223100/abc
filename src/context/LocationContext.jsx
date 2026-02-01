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
  const [location, setLocation] = useState({ city: 'Mumbai', area: '400001' })
  const [isLoading, setIsLoading] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  // Load saved location on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('anynow_location')
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation)
        setLocation(parsed)
      } catch (error) {
        console.error('Error parsing saved location:', error)
      }
    } else {
      // Try to auto-detect location on first visit
      requestLocationPermission()
    }
  }, [])

  // Save location to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('anynow_location', JSON.stringify(location))
  }, [location])

  const requestLocationPermission = () => {
    if ('geolocation' in navigator) {
      setIsLoading(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords
            const city = await getCityFromCoordinates(latitude, longitude)
            setLocation({ city, area: 'Current Location' })
            setIsLoading(false)
          } catch (error) {
            console.error('Error getting city from coordinates:', error)
            setIsLoading(false)
            setShowLocationModal(true)
          }
        },
        (error) => {
          console.error('Geolocation error:', error)
          setIsLoading(false)
          setShowLocationModal(true)
        }
      )
    } else {
      setShowLocationModal(true)
    }
  }

  const getCityFromCoordinates = async (lat, lon) => {
    // Mock reverse geocoding - in production, use a real geocoding API
    const cities = [
      { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
      { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
      { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
      { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
      { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
      { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
      { name: 'Pune', lat: 18.5204, lon: 73.8567 },
      { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 }
    ]

    // Find closest city
    let closestCity = cities[0]
    let minDistance = Infinity

    cities.forEach(city => {
      const distance = Math.sqrt(
        Math.pow(lat - city.lat, 2) + Math.pow(lon - city.lon, 2)
      )
      if (distance < minDistance) {
        minDistance = distance
        closestCity = city
      }
    })

    return closestCity.name
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

  const value = {
    location,
    isLoading,
    showLocationModal,
    searchQuery,
    searchResults,
    setShowLocationModal,
    setSearchQuery,
    searchLocations,
    selectLocation,
    handleLocationClick,
    requestLocationPermission
  }

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  )
}
