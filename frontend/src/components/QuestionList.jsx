import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import BubbleQuestion from './BubbleQuestion'
import API_BASE_URL from '../config'

const pastelColors = [
  'rgba(255, 182, 193, 0.9)', // Light Pink
  'rgba(255, 218, 185, 0.9)', // Peach
  'rgba(176, 224, 230, 0.9)', // Powder Blue
  'rgba(221, 160, 221, 0.9)', // Plum
  'rgba(152, 251, 152, 0.9)', // Pale Green
  'rgba(238, 232, 170, 0.9)', // Pale Goldenrod
  'rgba(230, 230, 250, 0.9)', // Lavender
  'rgba(255, 160, 122, 0.9)', // Light Salmon
]

const QuestionList = ({ isSoundOn = true }) => {
  const { categoryId, block } = useParams()
  const navigate = useNavigate()
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [questionHistory, setQuestionHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [finished, setFinished] = useState(false)

  const fetchQuestions = async () => {
    try {
      console.log('Fetching questions for category:', categoryId, 'block:', block);
      const response = await fetch(`${API_BASE_URL}/api/questions?category_id=${categoryId}&block=${block}`);
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      console.log('Questions data:', data);
      setQuestionHistory(data); // Set the list of questions
      setCurrentQuestion(data[0] || null); // Optionally set the first question as current
      setLoading(false);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchNextQuestion = async (questionId, optionCode) => {
    try {
      console.log('Fetching next question...')
      const response = await fetch(`${API_BASE_URL}/api/next-question/${questionId}/${optionCode}`);
      if (!response.ok) {
        throw new Error('Failed to fetch next question')
      }
      const data = await response.json()
      console.log('Next question data:', data)
      
      if (data.done && !data.question_id) {
        // If there's no next question and no random question returned, we're done
        console.log('No more questions in this path')
        return null
      }
      
      // Whether it's a next question in the path or a random start question, handle it the same way
      setCurrentQuestion(data)
      setQuestionHistory(prev => [...prev, data])
      return data
    } catch (err) {
      console.error('Error fetching next question:', err)
      setError(err.message)
      return null
    }
  }

  // Fetch start question on mount or category/block change
  useEffect(() => {
    fetchQuestions();
  }, [categoryId, block])

  useEffect(() => {
    if (finished) {
      navigate('/'); // Redirect to landing page
    }
  }, [finished, navigate]);

  // Scroll to current question when it changes
  useEffect(() => {
    console.log('Scroll effect triggered, currentQuestion:', currentQuestion);
    if (currentQuestion) {
      const questionElement = document.querySelector(`[data-question-id="${currentQuestion.question_id}"]`);
      console.log('Found question element:', questionElement);
      if (questionElement) {
        console.log('Scrolling to question:', currentQuestion.question_id);
        questionElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      } else {
        console.log('Question element not found for ID:', currentQuestion.question_id);
      }
    }
  }, [currentQuestion]);

  const handleVoteSubmitted = async (questionId, optionCode) => {
    console.log('handleVoteSubmitted called with:', { questionId, optionCode });
    const currentIndex = questionHistory.findIndex(q => q.question_id === questionId);
    console.log('Current index in history:', currentIndex, 'History length:', questionHistory.length);
    
    if (currentIndex + 1 < questionHistory.length) {
      // If we have the next question already in history, use it
      console.log('Using next question from history');
      setCurrentQuestion(questionHistory[currentIndex + 1]);
    } else {
      // Try to fetch the next question from the backend
      console.log('Fetching next question from backend');
      const nextQuestion = await fetchNextQuestion(questionId, optionCode);
      if (nextQuestion) {
        // Next question was fetched successfully
        console.log('Next question fetched successfully:', nextQuestion);
        setCurrentQuestion(nextQuestion);
      } else {
        // No more questions available
        console.log('No more questions available, finishing');
        setFinished(true);
        setCurrentQuestion(null);
      }
    }
  };

  if (finished) {
    return (
      <div className="fixed inset-0 bg-navy-900 flex flex-col items-center justify-center text-center px-4">
        <div className="text-2xl text-white font-bold mb-6">You've finished this category for now.<br/>You may vote again after 24 hours.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-navy-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-navy-900 flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-900">
      <div className="w-full max-w-screen-lg mx-auto pt-24 pb-12 px-4">
        <div className="space-y-24">
          {questionHistory.map((question, index) => {
            // Determine if this is the last question of its block
            const isEndOfBlock =
              index === questionHistory.length - 1 ||
              question.block !== questionHistory[index + 1]?.block;
            return (
              <div 
                key={question.question_id}
                data-question-id={question.question_id}
                className="scroll-mt-24"
              >
                <BubbleQuestion
                  question={question}
                  color={question.color_code || pastelColors[index % pastelColors.length]}
                  isActive={question.question_id === currentQuestion?.question_id}
                  isEndOfBlock={isEndOfBlock}
                  onVoteSubmitted={(optionCode) => handleVoteSubmitted(question.question_id, optionCode)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}

export default QuestionList 