import { warmCache } from './cache-warmer';

let cacheInitialized = false;

export async function initializeCache() {
  if (cacheInitialized) return;
  
  try {
    // Initialize cache in background
    warmCache().catch(console.error);
    cacheInitialized = true;
  } catch (error) {
    console.error('Cache initialization failed:', error);
  }
}

// Auto-initialize cache when module loads
if (typeof window === 'undefined') {
  initializeCache();
}