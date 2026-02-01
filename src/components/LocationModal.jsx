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
    requestLocationPermission
  } = useLocation()

  if (!showLocationModal) return null

  const handleSearch = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    searchLocations(query)
  }

  const handleAutoDetect = () => {
    requestLocationPermission()
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
            onClick={handleAutoDetect}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 p-3 bg-primary-green text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
            <span>{isLoading ? 'Detecting...' : 'Auto-detect Location'}</span>
          </button>
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
