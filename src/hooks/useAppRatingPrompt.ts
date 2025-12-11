import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ayoka_app_rating';
const DAYS_BEFORE_PROMPT = 3;
const TRANSACTIONS_BEFORE_PROMPT = 1;

interface RatingData {
  firstUseDate: string;
  transactionCount: number;
  hasRated: boolean;
  lastPromptDate?: string;
  dismissed: boolean;
}

export const useAppRatingPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  const getRatingData = useCallback((): RatingData => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    const initial: RatingData = {
      firstUseDate: new Date().toISOString(),
      transactionCount: 0,
      hasRated: false,
      dismissed: false,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }, []);

  const updateRatingData = useCallback((updates: Partial<RatingData>) => {
    const current = getRatingData();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }, [getRatingData]);

  const checkShouldShowPrompt = useCallback(() => {
    const data = getRatingData();
    
    // Don't show if already rated or dismissed
    if (data.hasRated || data.dismissed) return false;

    // Don't show if prompted in last 7 days
    if (data.lastPromptDate) {
      const daysSinceLastPrompt = Math.floor(
        (Date.now() - new Date(data.lastPromptDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastPrompt < 7) return false;
    }

    // Check days since first use
    const daysSinceFirstUse = Math.floor(
      (Date.now() - new Date(data.firstUseDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceFirstUse >= DAYS_BEFORE_PROMPT;
  }, [getRatingData]);

  // Check on mount for time-based trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      if (checkShouldShowPrompt()) {
        setShowPrompt(true);
        updateRatingData({ lastPromptDate: new Date().toISOString() });
      }
    }, 5000); // Wait 5 seconds after app load

    return () => clearTimeout(timer);
  }, [checkShouldShowPrompt, updateRatingData]);

  // Listen for transaction complete event
  useEffect(() => {
    const handleTransactionComplete = () => {
      const data = getRatingData();
      
      if (data.hasRated || data.dismissed) return;

      const newCount = data.transactionCount + 1;
      updateRatingData({ transactionCount: newCount });

      if (newCount >= TRANSACTIONS_BEFORE_PROMPT) {
        setTimeout(() => {
          setShowPrompt(true);
          updateRatingData({ lastPromptDate: new Date().toISOString() });
        }, 1000);
      }
    };

    window.addEventListener('ayoka-transaction-complete', handleTransactionComplete);
    return () => window.removeEventListener('ayoka-transaction-complete', handleTransactionComplete);
  }, [getRatingData, updateRatingData]);

  // Trigger after successful transaction
  const triggerAfterTransaction = useCallback(() => {
    const data = getRatingData();
    
    if (data.hasRated || data.dismissed) return;

    const newCount = data.transactionCount + 1;
    updateRatingData({ transactionCount: newCount });

    if (newCount >= TRANSACTIONS_BEFORE_PROMPT) {
      // Small delay to let transaction dialog close
      setTimeout(() => {
        setShowPrompt(true);
        updateRatingData({ lastPromptDate: new Date().toISOString() });
      }, 1000);
    }
  }, [getRatingData, updateRatingData]);

  const markAsRated = useCallback(() => {
    updateRatingData({ hasRated: true });
    setShowPrompt(false);
  }, [updateRatingData]);

  const dismissPrompt = useCallback(() => {
    setShowPrompt(false);
  }, []);

  const dismissPermanently = useCallback(() => {
    updateRatingData({ dismissed: true });
    setShowPrompt(false);
  }, [updateRatingData]);

  return {
    showPrompt,
    setShowPrompt,
    triggerAfterTransaction,
    markAsRated,
    dismissPrompt,
    dismissPermanently,
  };
};
