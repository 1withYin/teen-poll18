import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import API_BASE_URL from '../config'

const BlockSelectionPage = () => {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categoryName, setCategoryName] = useState('')
  const [categoryColor, setCategoryColor] = useState('')

  // Category gradients
  const categoryGradients = {
    1: "linear-gradient(135deg, #FDCB82 0%, #F7797D 100%)", // Love
    2: "linear-gradient(135deg, #FBC2EB 0%, #A6C1EE 100%)", // Friends
    3: "linear-gradient(135deg, #B5FFFC 0%, #6EE2F5 100%)", // Social_Media
    4: "linear-gradient(135deg, rgb(247, 178, 210) 0%, rgb(246, 120, 126) 100%)", // Pinky
    5: "linear-gradient(135deg, #C2FFD8 0%, #465EFB 100%)", // Lowkey
    6: "linear-gradient(135deg, #A8FF78 0%, #78FFD6 100%)", // Personal
    7: "linear-gradient(135deg, rgb(230, 247, 179) 0%, rgb(244, 244, 20) 100%)", // Healing
    8: "linear-gradient(135deg, #C9FFBF 0%, #FFAFBD 100%)", // Defense
    9: "linear-gradient(135deg, #FFD6E0 0%, #FFB6B9 100%)", // Family
    10: "linear-gradient(135deg, #F7797D 0%, rgb(251, 161, 134) 100%)", // Dream Era
    11: "linear-gradient(135deg, #B5FFFC 0%, #6EE2F5 100%)", // School
    12: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)", // Chaos
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      console.log('BlockSelectionPage mounted with categoryId:', categoryId)
      
      try {
        // Fetch category info
        const catResponse = await fetch(`${API_BASE_URL}/api/categories`)
        if (!catResponse.ok) throw new Error('Failed to fetch categories')
        const categories = await catResponse.json()
        console.log('Available categories:', categories)
        console.log('Looking for category ID:', categoryId, 'Type:', typeof categoryId)
        
        const category = categories.find(cat => cat.id === categoryId)
        console.log('Found category:', category)
        
        if (!category) {
          console.error('Category not found. Available IDs:', categories.map(c => c.id))
          throw new Error(`Category not found for ID: ${categoryId}`)
        }
        
        setCategoryName(category.category_name)
        setCategoryColor(categoryGradients[parseInt(category.id)] || categoryGradients[1])

        // Fetch blocks
        const blocksResponse = await fetch(`${API_BASE_URL}/api/blocks/${categoryId}`)
        if (!blocksResponse.ok) throw new Error('Failed to fetch blocks')
        const blocksData = await blocksResponse.json()
        setBlocks(blocksData.blocks || [])
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [categoryId])

  const handleBlockSelect = (block) => {
    navigate(`/questions/${categoryId}/${block.block_number}`)
  }

  const handlePlaylistClick = (block) => {
    const playlistMatch = block.block_text.match(/\[playlist:([a-zA-Z0-9_]+)\]/)
    if (playlistMatch) {
      const tag = playlistMatch[1]
      navigate(`/soundtrack/playlist/${tag}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white mx-auto"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-white/30"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-200 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl transition-all duration-300 bg-white/20 hover:bg-white/30 text-white font-medium"
          >
            Back to Bubbles
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen p-4 flex flex-col"
      style={{
        background: `linear-gradient(135deg, ${categoryColor}15 0%, #0A0F2B 50%, ${categoryColor}10 100%)`,
        position: 'relative'
      }}
    >
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ background: categoryColor }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-15 blur-2xl animate-pulse"
          style={{ background: categoryColor, animationDelay: '1s' }}
        />
      </div>
      
      <div className="max-w-2xl mx-auto w-full flex-grow flex flex-col justify-center relative z-10">
        <motion.div
          className="rounded-3xl shadow-2xl p-8 backdrop-blur-sm"
          style={{
            background: `linear-gradient(135deg, ${categoryColor}30 0%, ${categoryColor}15 50%, rgba(255, 255, 255, 0.1) 100%)`,
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 40px ${categoryColor}20`
          }}
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
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

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {blocks.map((block, index) => (
              <div key={block.id}>
                <motion.button
                  className="w-full text-left px-6 py-5 text-lg rounded-2xl transition-all duration-300 group relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${categoryColor}25 0%, rgba(255, 255, 255, 0.15) 50%, ${categoryColor}10 100%)`,
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: `0 4px 15px rgba(0, 0, 0, 0.1), 0 0 20px ${categoryColor}15`
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
                    boxShadow: `0 8px 25px rgba(0, 0, 0, 0.15), 0 0 30px ${categoryColor}25`,
                    borderColor: 'rgba(255, 255, 255, 0.5)'
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
                    onClick={() => handlePlaylistClick(block)}
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
        </motion.div>
      </div>
    </div>
  )
}

export default BlockSelectionPage 