import { useState, useEffect, useCallback } from 'react';

interface StorageInfo {
  totalSize: number;
  localStorageSize: number;
  sessionStorageSize: number;
  cacheStorageSize: number;
  formattedSize: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getStorageSize = (storage: Storage): number => {
  let total = 0;
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key) {
      const value = storage.getItem(key) || '';
      total += key.length + value.length;
    }
  }
  return total * 2; // UTF-16 uses 2 bytes per character
};

export const useStorageInfo = () => {
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    totalSize: 0,
    localStorageSize: 0,
    sessionStorageSize: 0,
    cacheStorageSize: 0,
    formattedSize: '0 B'
  });
  const [isClearing, setIsClearing] = useState(false);

  const calculateStorageSize = useCallback(async () => {
    try {
      // Calculate localStorage size
      const localStorageSize = getStorageSize(localStorage);
      
      // Calculate sessionStorage size
      const sessionStorageSize = getStorageSize(sessionStorage);
      
      // Calculate Cache Storage size
      let cacheStorageSize = 0;
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          for (const request of keys) {
            const response = await cache.match(request);
            if (response) {
              const blob = await response.clone().blob();
              cacheStorageSize += blob.size;
            }
          }
        }
      }

      // Try to get storage estimate if available
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          if (estimate.usage) {
            const totalSize = estimate.usage;
            setStorageInfo({
              totalSize,
              localStorageSize,
              sessionStorageSize,
              cacheStorageSize,
              formattedSize: formatBytes(totalSize)
            });
            return;
          }
        } catch (e) {
          console.log('Storage estimate not available');
        }
      }

      // Fallback: sum of calculated sizes
      const totalSize = localStorageSize + sessionStorageSize + cacheStorageSize;
      setStorageInfo({
        totalSize,
        localStorageSize,
        sessionStorageSize,
        cacheStorageSize,
        formattedSize: formatBytes(totalSize)
      });
    } catch (error) {
      console.error('Error calculating storage size:', error);
    }
  }, []);

  const clearAllCache = useCallback(async (): Promise<boolean> => {
    setIsClearing(true);
    try {
      // Clear localStorage (preserve essential keys)
      const keysToPreserve = ['supabase.auth.token', 'theme', 'language'];
      const preservedData: Record<string, string> = {};
      
      keysToPreserve.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) preservedData[key] = value;
      });
      
      localStorage.clear();
      
      // Restore preserved keys
      Object.entries(preservedData).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });

      // Clear sessionStorage
      sessionStorage.clear();

      // Clear Cache Storage
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // Unregister service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }

      // Recalculate storage size
      await calculateStorageSize();
      
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    } finally {
      setIsClearing(false);
    }
  }, [calculateStorageSize]);

  useEffect(() => {
    calculateStorageSize();
  }, [calculateStorageSize]);

  return {
    storageInfo,
    isClearing,
    clearAllCache,
    refreshStorageInfo: calculateStorageSize
  };
};
