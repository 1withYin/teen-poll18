// Referral tracking utilities

// Storage keys
const REFERRAL_KEYS = {
  REFERRER_UUID: 'referrerUUID',
  REFERRAL_PENDING: 'referralPending'
};

/**
 * Get referrer UUID from URL parameters
 * @returns {string|null} The referrer UUID or null if not found
 */
export const getReferrerFromURL = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('ref') || urlParams.get('referrer');
};

/**
 * Store referrer UUID in localStorage
 * @param {string} referrerUUID - The referrer's UUID
 */
export const storeReferrer = (referrerUUID) => {
  if (referrerUUID) {
    localStorage.setItem(REFERRAL_KEYS.REFERRER_UUID, referrerUUID);
    localStorage.setItem(REFERRAL_KEYS.REFERRAL_PENDING, 'true');
  }
};

/**
 * Get stored referrer UUID from localStorage
 * @returns {string|null} The stored referrer UUID or null
 */
export const getStoredReferrer = () => {
  return localStorage.getItem(REFERRAL_KEYS.REFERRER_UUID);
};

/**
 * Check if there's a pending referral
 * @returns {boolean} True if there's a pending referral
 */
export const hasPendingReferral = () => {
  return localStorage.getItem(REFERRAL_KEYS.REFERRAL_PENDING) === 'true';
};

/**
 * Clear referral data after it's been processed
 */
export const clearReferralData = () => {
  localStorage.removeItem(REFERRAL_KEYS.REFERRER_UUID);
  localStorage.removeItem(REFERRAL_KEYS.REFERRAL_PENDING);
};

/**
 * Generate a referral link for sharing
 * @param {string} userUUID - The current user's UUID
 * @param {string} baseURL - The base URL of the app
 * @returns {string} The referral link
 */
export const generateReferralLink = (userUUID, baseURL = window.location.origin) => {
  return `${baseURL}?ref=${userUUID}`;
};

/**
 * Initialize referral tracking on app load
 * This should be called when the app first loads
 */
export const initializeReferralTracking = () => {
  const referrerFromURL = getReferrerFromURL();
  
  if (referrerFromURL) {
    storeReferrer(referrerFromURL);
    console.log('Referral detected:', referrerFromURL);
    
    // Clean up the URL by removing the referral parameter
    const url = new URL(window.location);
    url.searchParams.delete('ref');
    url.searchParams.delete('referrer');
    window.history.replaceState({}, '', url);
  }
};

/**
 * Get referral data for API calls
 * @returns {Object|null} Object with referrer information or null
 */
export const getReferralData = () => {
  const referrerUUID = getStoredReferrer();
  const hasReferral = hasPendingReferral();
  
  if (referrerUUID && hasReferral) {
    return {
      referred_by: referrerUUID
    };
  }
  
  return null;
}; 