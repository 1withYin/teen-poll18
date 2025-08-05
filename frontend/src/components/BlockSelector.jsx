import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config'

const BlockSelector = ({ 
  categoryId, 
  categoryName, 
  onClose, 
  color 
}) => {
  // Extract solid color from gradient if needed
  const getSolidColor = (colorString) => {
    if (!colorString) return '#FBC2EB'; // Default pink color
    
    console.log('Processing color string:', colorString);
    
    // Handle Tailwind CSS gradient format: "bg-[linear-gradient(135deg,#f0f0f0,#cccccc)]"
    if (colorString.startsWith('bg-[linear-gradient')) {
      // Extract the first color from the gradient
      const match = colorString.match(/#[A-Fa-f0-9]{6}|#[A-Fa-f0-9]{3}|rgb\([^)]+\)/);
      if (match) {
        console.log('Extracted color from Tailwind gradient:', match[0], 'from:', colorString);
        return match[0];
      }
    }
    
    // Handle regular CSS gradient format: "linear-gradient(135deg, #FBC2EB 0%, #A6C1EE 100%)"
    if (colorString.startsWith('linear-gradient')) {
      // Extract the first color from the gradient
      const match = colorString.match(/#[A-Fa-f0-9]{6}|#[A-Fa-f0-9]{3}|rgb\([^)]+\)/);
      if (match) {
        console.log('Extracted color from CSS gradient:', match[0], 'from:', colorString);
        return match[0];
      }
    }
    
    // Fallback: extract from specific gradient patterns
    if (colorString.includes('#FBC2EB')) return '#FBC2EB';
    if (colorString.includes('#A6C1EE')) return '#A6C1EE';
    if (colorString.includes('#FFD6E0')) return '#FFD6E0';
    if (colorString.includes('#FFB6B9')) return '#FFB6B9';
    if (colorString.includes('#B5FFFC')) return '#B5FFFC';
    if (colorString.includes('#6EE2F5')) return '#6EE2F5';
    if (colorString.includes('#FDCB82')) return '#FDCB82';
    if (colorString.includes('#F7797D')) return '#F7797D';
    if (colorString.includes('#C9FFBF')) return '#C9FFBF';
    if (colorString.includes('#FFAFBD')) return '#FFAFBD';
    if (colorString.includes('#C2FFD8')) return '#C2FFD8';
    if (colorString.includes('#465EFB')) return '#465EFB';
    if (colorString.includes('#A8FF78')) return '#A8FF78';
    if (colorString.includes('#78FFD6')) return '#78FFD6';
    
    // If it's a solid color hex, use it directly
    if (colorString.startsWith('#')) {
      console.log('Using solid color directly:', colorString);
      return colorString;
    }
    
    console.log('No color extracted, using default pink');
    return '#FBC2EB'; // Default pink color
  };

  const solidColor = getSolidColor(color);
  console.log('Final solid color:', solidColor, 'Original color:', color, 'Category ID:', categoryId);
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBlocks = async () => {
      setLoading(true)
      setError(null)
      console.log('Fetching blocks for category ID:', categoryId)
      try {
        const response = await fetch(`${API_BASE_URL}/api/blocks/${categoryId}`)
        console.log('Response status:', response.status)
        if (!response.ok) {
          throw new Error('Failed to fetch blocks')
        }
        const data = await response.json()
        console.log('Blocks data received:', data)
        console.log('Number of blocks:', data.blocks ? data.blocks.length : 0)
        setBlocks(data.blocks || [])
      } catch (err) {
        console.error('Error fetching blocks:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBlocks()
  }, [categoryId])

  const handleBlockSelect = (block) => {
    navigate(`/questions/${categoryId}/${block.block_number}`)
    onClose()
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
      >
        <motion.div
          className="rounded-3xl shadow-2xl p-8 max-w-lg w-full mx-4 backdrop-blur-sm"
          style={{
            background: `linear-gradient(135deg, ${solidColor}40 0%, ${solidColor}20 100%)`,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="text-center mb-8">
            <motion.h2 
              className="text-2xl font-bold mb-3 text-white"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Choose a Block
            </motion.h2>
          </div>

          {loading && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white mx-auto"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-white/30"></div>
              </div>
              <p className="mt-4 text-white/80 text-lg font-medium">Loading blocks...</p>
            </motion.div>
          )}

          {error && (
            <motion.div 
              className="text-center py-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6 mb-4">
                <p className="text-red-200 font-medium">{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-xl transition-all duration-300 bg-white/20 hover:bg-white/30 text-white font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {!loading && !error && (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {console.log('Rendering blocks:', blocks.length, blocks)}
              {blocks.map((block, index) => (
                <div key={block.id}>
                  <motion.button
                    className="w-full text-left px-6 py-5 text-lg rounded-2xl transition-all duration-300 group relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                    }}
                    onClick={() => handleBlockSelect(block)}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 300,
                      damping: 25
                    }}
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                      borderColor: 'rgba(255, 255, 255, 0.4)'
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative z-10">
                      <div className="font-bold text-white text-lg leading-tight" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>
                        {block.block_text.replace(/\[playlist:[^\]]+\]/g, '').trim()}
                      </div>
                    </div>
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                    />
                  </motion.button>
                  
                  {/* Separate playlist button if block contains playlist link */}
                  {block.block_text.includes('[playlist:') && (
                    <motion.button
                      className="w-full px-6 py-3 text-white bg-gradient-to-r from-blue-500/80 to-purple-500/80 border border-white/20 rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 mt-3 font-medium"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Extract playlist tag from block text
                        const playlistMatch = block.block_text.match(/\[playlist:([a-zA-Z0-9_]+)\]/);
                        if (playlistMatch) {
                          const tag = playlistMatch[1];
                          console.log('Block playlist button clicked for tag:', tag);
                          navigate(`/soundtrack/playlist/${tag}`);
                          onClose();
                        }
                      }}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        delay: index * 0.1 + 0.1,
                        type: "spring",
                        stiffness: 300,
                        damping: 25
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      🎵 Listen to Playlist
                    </motion.button>
                  )}
                </div>
              ))}
            </div>
          )}

          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-xl transition-all duration-300 bg-white/10 hover:bg-white/20 text-white font-medium shadow-lg hover:shadow-xl transform hover:scale-105 border border-white/20 hover:border-white/40"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default BlockSelector 