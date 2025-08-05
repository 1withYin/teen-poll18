// Debug utility to check UUID storage

export const debugUUID = () => {
  console.log('🔍 UUID Debug Information:');
  console.log('========================');
  
  // Check all possible UUID keys
  const userUUID = localStorage.getItem('userUUID');
  const uuid = localStorage.getItem('uuid');
  const yearOfBirth = localStorage.getItem('yearOfBirth');
  
  console.log('userUUID:', userUUID);
  console.log('uuid (legacy):', uuid);
  console.log('yearOfBirth:', yearOfBirth);
  
  // Check if there are any other UUID-like keys
  const allKeys = Object.keys(localStorage);
  const uuidKeys = allKeys.filter(key => key.toLowerCase().includes('uuid') || key.toLowerCase().includes('id'));
  console.log('All UUID-related keys:', uuidKeys);
  
  // Recommendations
  if (!userUUID && uuid) {
    console.log('⚠️  Found legacy UUID, consider migrating...');
  }
  
  if (!userUUID) {
    console.log('❌ No userUUID found - this is why the FAQ page shows "No ID found"');
  } else {
    console.log('✅ userUUID found - FAQ page should display this');
  }
  
  return {
    userUUID,
    legacyUUID: uuid,
    yearOfBirth,
    allUUIDKeys: uuidKeys
  };
};

export const migrateLegacyUUID = () => {
  const legacyUUID = localStorage.getItem('uuid');
  const userUUID = localStorage.getItem('userUUID');
  
  if (legacyUUID && !userUUID) {
    localStorage.setItem('userUUID', legacyUUID);
    localStorage.removeItem('uuid');
    console.log('✅ Migrated legacy UUID to userUUID');
    return true;
  }
  
  return false;
}; 