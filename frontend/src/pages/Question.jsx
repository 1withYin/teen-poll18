import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'

const Question = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedOption, setSelectedOption] = useState(null)
  const [customText, setCustomText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await axios.get(`/api/question/${id}`)
        setQuestion(response.data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching question:', error)
        setLoading(false)
      }
    }

    fetchQuestion()
  }, [id])

  const handleVote = async (option) => {
    if (submitting) return

    setSubmitting(true)
    try {
      await axios.post(`/api/vote`, {
        question_id: id,
        option_code: option.code,
        custom_text: option.is_other ? customText : null,
        user_id: 1 // In a real app, this would come from auth
      })
      navigate(`/results/${id}`)
    } catch (error) {
      console.error('Error submitting vote:', error)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!question) {
    return <div className="text-center">Question not found</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto p-4"
    >
      <motion.div
        className="p-8 rounded-3xl shadow-lg mb-8"
        style={{ backgroundColor: question.bubble_color }}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <h2 className="text-2xl font-bold text-center mb-6">{question.text}</h2>
      </motion.div>

      <div className="space-y-4">
        {question.options.map((option, index) => (
          <motion.div
            key={option.code}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <button
              className={`w-full p-4 rounded-lg text-left transition-colors ${
                selectedOption?.code === option.code
                  ? 'bg-white text-[#0A0F2B]'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              onClick={() => setSelectedOption(option)}
            >
              {option.text}
            </button>
          </motion.div>
        ))}

        {selectedOption?.is_other && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Enter your answer..."
              className="w-full p-4 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-white/40"
            />
          </motion.div>
        )}

        {selectedOption && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full p-4 bg-white text-[#0A0F2B] rounded-lg font-bold mt-6"
            onClick={() => handleVote(selectedOption)}
            disabled={submitting || (selectedOption.is_other && !customText)}
          >
            {submitting ? 'Submitting...' : 'Submit Vote'}
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

export default Question 