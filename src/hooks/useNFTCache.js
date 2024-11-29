import { useState } from 'react';

const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useNFTCache = () => {
  const [cache, setCache] = useState(new Map());

  const getCachedData = (key) => {
    const cachedItem = cache.get(key);
    if (!cachedItem) return null;

    const isExpired = Date.now() - cachedItem.timestamp > CACHE_EXPIRY;
    if (isExpired) {
      cache.delete(key);
      return null;
    }

    return cachedItem.data;
  };

  const setCachedData = (key, data) => {
    setCache(new Map(cache.set(key, {
      data,
      timestamp: Date.now()
    })));
  };

  return {
    getCachedData,
    setCachedData
  };
};
