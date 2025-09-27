import { API_BASE_URL } from '../config/api';

class AddressService {
  constructor() {
    this.searchCache = new Map();
    this.debounceTimeout = null;
  }

  async searchWards(query, signal) {
    try {
      // Check cache first
      if (this.searchCache.has(query)) {
        return this.searchCache.get(query);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/wards/search?query=${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal,
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to search addresses');
      }

      // Cache the result
      this.searchCache.set(query, data.data);
      
      // Limit cache size
      if (this.searchCache.size > 50) {
        const firstKey = this.searchCache.keys().next().value;
        this.searchCache.delete(firstKey);
      }

      return data.data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      throw new Error('Failed to search addresses');
    }
  }

  debouncedSearch(query, callback, delay = 300) {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      callback(query);
    }, delay);
  }

  clearCache() {
    this.searchCache.clear();
  }
}

export default new AddressService();