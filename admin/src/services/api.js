// API Service for Admin Panel
// Now uses DataBridge for real-time synchronization with main website

import { productAPI, categoryAPI, orderAPI, getWebsiteData } from './dataBridge'

// Re-export the APIs from dataBridge
export { productAPI, categoryAPI, orderAPI, getWebsiteData }
