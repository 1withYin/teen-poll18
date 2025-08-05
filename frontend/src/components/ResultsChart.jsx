import { motion } from 'framer-motion'

const ResultsChart = ({ data = [], color, customResponses = [] }) => {
  console.log('ResultsChart received data:', {
    data,
    type: typeof data,
    isArray: Array.isArray(data),
    length: data?.length,
    firstItem: data?.[0],
    color
  })
  
  if (!Array.isArray(data)) {
    console.error('ResultsChart: data is not an array', data)
    return (
      <div className="text-white/70 text-center p-4">
        Error: Invalid data format
      </div>
    )
  }

  if (data.length === 0) {
    console.warn('ResultsChart: data array is empty')
    return (
      <div className="text-white/70 text-center p-4">
        No results available yet
      </div>
    )
  }

  // Validate data structure
  const isValidData = data.every(item => 
    item && 
    typeof item === 'object' && 
    'text' in item && 
    'count' in item
  )

  if (!isValidData) {
    console.error('ResultsChart: invalid data structure', data)
    return (
      <div className="text-white/70 text-center p-4">
        Error: Invalid data structure
      </div>
    )
  }

  // Ensure all counts are proper numbers
  const processedData = data.map(item => ({
    ...item,
    count: Number(item.count) || 0  // Convert to number, default to 0 if NaN
  }))

  // Debug: log processedData and check for duplicate keys
  const keySet = new Set();
  processedData.forEach((item, index) => {
    const key = btoa(unescape(encodeURIComponent(JSON.stringify(item)))) + '-' + index;
    if (keySet.has(key)) {
      console.warn('DUPLICATE KEY:', key, item);
    }
    keySet.add(key);
  });
  console.log('ResultsChart processedData:', processedData);

  const totalResponses = processedData.reduce((sum, item) => sum + item.count, 0)
  console.log('Total responses:', totalResponses)
  
  if (totalResponses === 0) {
    return (
      <div className="text-white/70 text-center p-4">
        No votes recorded yet
      </div>
    )
  }
  
  return (
    <div className="space-y-3 w-full max-w-[400px] mx-auto">
      {processedData.map((item, index) => {
        const percentage = totalResponses > 0 ? Math.round((item.count / totalResponses) * 100) : 0
        console.log('Processing item:', { item, count: item.count, percentage })
        // Use a hash of the item as the key
        const key = btoa(unescape(encodeURIComponent(JSON.stringify(item)))) + '-' + index;
        console.log('ResultsChart rendering item:', { key, item, index });
        return (
          <div key={key} className="space-y-2">
            <div className="flex flex-col text-lg text-white/90">
              <span className="mb-2">{item.text}</span>
              <div className="flex justify-between items-center">
                <motion.div
                  key={key + '-bar-container'}
                  className="h-4 bg-white/10 rounded-full overflow-hidden flex-grow mr-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    key={key + '-bar'}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color || '#FFB6C1' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ 
                      duration: 0.8,
                      delay: 0.3,
                      type: "spring",
                      stiffness: 50,
                      damping: 15
                    }}
                  />
                </motion.div>
                <div className="flex-shrink-0 whitespace-nowrap text-lg">
                  <motion.span
                    key={key + '-percent'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {percentage}%
                  </motion.span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
      <motion.div 
        className="mt-6 text-center text-lg text-white/70"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Total responses: {Math.round(totalResponses)}
      </motion.div>
    </div>
  )
}

export default ResultsChart 