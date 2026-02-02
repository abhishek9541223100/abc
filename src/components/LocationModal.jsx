import { useState } from 'react'
import { MapPin, Search, X, Loader2 } from 'lucide-react'
import { useLocation } from '../context/LocationContext'

const LocationModal = () => {
  const {
    showLocationModal,
    setShowLocationModal,
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLocations,
    selectLocation,
    isLoading,
    requestLocationPermission,
    permissionStatus,
    retryLocationDetection
  } = useLocation()

  if (!showLocationModal) return null

  const handleSearch = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    searchLocations(query)
  }

  const handleAutoDetect = () => {
    // Explicit onClick handler that calls navigator.geolocation.getCurrentPosition
    if (!('geolocation' in navigator)) {
      alert('Location not supported')
      return
    }

    setIsLoading(true)
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          console.log('Location detected:', latitude, longitude)
          
          // Get city from coordinates (using the same function from context)
          const city = await getCityFromCoordinates(latitude, longitude)
          const newLocation = { city, area: 'Current Location' }
          
          // Update location in context
          selectLocation(city, 'Current Location')
          setIsLoading(false)
          
          // Close modal after successful detection
          setShowLocationModal(false)
          
        } catch (error) {
          console.error('Error getting city from coordinates:', error)
          setIsLoading(false)
          alert('Unable to detect location. Please select manually.')
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        setIsLoading(false)
        alert('Unable to detect location. Please select manually.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  const getCityFromCoordinates = async (lat, lon) => {
    // Same city detection logic from LocationContext
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

    // Find closest city
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

    return closestCity ? closestCity.name : 'Mumbai'
  }

  const handleSelectLocation = (city, area) => {
    selectLocation(city, area)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Select Location</h2>
          <button
            onClick={() => setShowLocationModal(false)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auto-detect Option */}
        <div className="p-4 border-b">
          <button
            type="button"
            onClick={handleAutoDetect}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 p-3 bg-primary-green text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
            <span>
              {isLoading 
                ? 'Detecting...' 
                : permissionStatus === 'denied' 
                  ? 'Try Auto-detect Again' 
                  : 'Auto-detect Location'
              }
            </span>
          </button>
          {permissionStatus === 'denied' && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Location access was denied. Click above to try again or select manually.
            </p>
          )}
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search city or area..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-green"
              autoFocus
            />
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-60 overflow-y-auto">
          {searchQuery && searchResults.length > 0 && (
            <div className="p-2">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectLocation(result.name, result.area)}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-gray-500">{result.area}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No locations found</p>
              <p className="text-sm">Try searching for a different city</p>
            </div>
          )}

          {!searchQuery && (
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-3">Popular Cities:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Mumbai', area: '400001' },
                  { name: 'Delhi', area: '110001' },
                  { name: 'Bangalore', area: '560001' },
                  { name: 'Chennai', area: '600001' },
                  { name: 'Kolkata', area: '700001' },
                  { name: 'Hyderabad', area: '500001' }
                ].map((city, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectLocation(city.name, city.area)}
                    className="p-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary-green transition-colors"
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LocationModal
