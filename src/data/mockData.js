// This file is deprecated.
// All data fetching has been migrated to Supabase.
// Please use supabaseClient.js for data operations.

export const fetchAdminData = () => {
  console.error('fetchAdminData is deprecated. Use Supabase client instead.')
  return { products: {}, categories: [] }
}

export const fetchFeaturedProducts = () => []
export const subscribeToFeaturedProducts = () => () => { }
