import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ResultsChart from './ResultsChart'
import { useNavigate, Link } from 'react-router-dom'
import { getReferralData, clearReferralData } from '../utils/referral'
import API_BASE_URL from '../config'

const BubbleQuestion = ({ 
  question, 
  delay = 0, 
  color,
  isActive,
  onShowResults,
  onCloseResults,
  onShowOptions,
  onCloseOptions,
  onVoteSubmitted,
  isEndOfBlock
}) => {
  const [selectedOption, setSelectedOption] = useState(null)
  const [selectedOptions, setSelectedOptions] = useState([]) // For checkbox questions
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  const [showResponseMessage, setShowResponseMessage] = useState(false)
  const [responseMessage, setResponseMessage] = useState("")
  const [showAdvice, setShowAdvice] = useState(false)
  const [advice, setAdvice] = useState("")
  const [otherText, setOtherText] = useState('')
  const [showOtherInput, setShowOtherInput] = useState(false)
  const [checkboxMessages, setCheckboxMessages] = useState([]); // For checkbox response messages
  const [checkboxAdviceShown, setCheckboxAdviceShown] = useState([]); // Track which advice is shown
  const navigate = useNavigate();

  // Reset selected option when question changes
  useEffect(() => {
    console.log('Question changed:', question)
    console.log('Options with IDs:', question?.options?.map(opt => ({ id: opt.id, text: opt.text, code: opt.code })))
    setSelectedOption(null)
    setSelectedOptions([])
    setShowResults(false)
    setShowResponseMessage(false)
    setResponseMessage("")
    setShowAdvice(false)
    setAdvice("")
    setOtherText('')
    setShowOtherInput(false)
  }, [question])

  // Utility to get or create UUID
  function getOrCreateUserUUID() {
    let uuid = localStorage.getItem('userUUID');
    if (!uuid) {
      uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      localStorage.setItem('userUUID', uuid);
    }
    return uuid;
  }

  // Utility to get year of birth
  function getYearOfBirth() {
    return localStorage.getItem('yearOfBirth');
  }

  const handleOptionSelect = async (option) => {
    // For checkbox questions, handle differently
    if (question.check_box) {
      setSelectedOptions(prev => {
        const isSelected = prev.find(opt => opt.code === option.code);
        if (isSelected) {
          return prev.filter(opt => opt.code !== option.code);
        } else {
          return [...prev, option];
        }
      });
      return;
    }

    console.log('Starting handleOptionSelect')
    setLoading(true)
    setError(null)
    try {
      // Log the full question object to check its structure
      console.log('Full question object:', JSON.stringify(question, null, 2))
      
      if (!question.question_id) {
        console.error('Missing question_id:', question)
        throw new Error('Question ID is missing')
      }

      console.log('Submitting vote for:', {
        question_id: question.question_id,
        option_code: option.code,
        question: question
      })
      
      // Get referral data if available
      const referralData = getReferralData();
      
      // Submit vote to backend
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: question.question_id,
          option_code: option.code,
          uuid: getOrCreateUserUUID(),
          year_of_birth: getYearOfBirth(),
          ...(referralData && { referred_by: referralData.referred_by })
        }),
      });

      const data = await response.json();

      if (data.status === "already_voted") {
        setError(data.message);
        setTimeout(() => setError(null), 3000);
        setLoading(false);
        return;
      }

      if (data.status === 'other_needed') {
        setSelectedOption(option)
        setShowOtherInput(true)
        setLoading(false)
        return
      }

      // Fetch results after successful vote - using the same API_BASE
      const resultsUrl = `${API_BASE_URL}/api/questions/${question.question_id}/results`
      console.log('Attempting to fetch results from:', resultsUrl)
      
      try {
        const resultsResponse = await fetch(resultsUrl)
        console.log('Results response:', resultsResponse)
        
        if (!resultsResponse.ok) {
          throw new Error(`Failed to fetch results: ${resultsResponse.status} ${resultsResponse.statusText}`)
        }
        
        const resultsData = await resultsResponse.json()
        console.log('Results data:', resultsData)
        
        if (!resultsData || !resultsData.results) {
          throw new Error('Invalid results data format')
        }
        
        setSelectedOption(option)
        setResults(resultsData)
        setShowResults(true)
        // If the selected option has a non-empty response_message, show it after the bar chart
        if (option.response_message && option.response_message.trim() !== "") {
          setResponseMessage(option.response_message)
          setShowResponseMessage(false) // Will show after bar chart
        } else {
          setResponseMessage("")
          setShowResponseMessage(false)
        }
        if (option.companion_advice && option.companion_advice.trim() !== "") {
          setAdvice(option.companion_advice)
        } else {
          setAdvice("")
        }
        onShowResults && onShowResults()
        
        // Clear referral data after successful vote
        clearReferralData()
        
        // Don't call onVoteSubmitted immediately - wait for user to click Continue
        // onVoteSubmitted && onVoteSubmitted(option.code)
      } catch (resultsError) {
        console.error('Error fetching results:', resultsError)
        setError(`Error fetching results: ${resultsError.message}`)
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to submit vote')
      setTimeout(() => setError(null), 3000)
      setLoading(false)
    }
  }

  const submitOtherResponse = async () => {
    if (!otherText.trim()) return;
    
    setLoading(true);
    try {
      // Get referral data if available
      const referralData = getReferralData();
      
      const response = await fetch(`${API_BASE_URL}/api/other-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_id: question.question_id,
          question_text: question.text,
          other_text: otherText.trim(),
          uuid: getOrCreateUserUUID(),
          year_of_birth: getYearOfBirth(),
          ...(referralData && { referred_by: referralData.referred_by })
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit other response');
      }

      // After successful submission, proceed to show results
      const resultsUrl = `${API_BASE_URL}/api/questions/${question.question_id}/results`;
      const resultsResponse = await fetch(resultsUrl);
      
      if (!resultsResponse.ok) {
        throw new Error('Failed to fetch results');
      }
      
      const resultsData = await resultsResponse.json();
      setResults(resultsData);
      setShowResults(true);
      setShowOtherInput(false);
      // Set selectedOption to a dummy object with 'OTHER' code for auto-advance logic
      setSelectedOption({ code: 'OTHER' });
      // Check if there's a response message for "Other" option
      const otherOption = question.options.find(opt => opt.code === 'OTHER');
      if (otherOption && otherOption.response_message && otherOption.response_message.trim() !== "") {
        setResponseMessage(otherOption.response_message);
        setShowResponseMessage(false); // Will show after bar chart
      } else {
        setResponseMessage("");
        setShowResponseMessage(false);
      }
      if (otherOption && otherOption.companion_advice && otherOption.companion_advice.trim() !== "") {
        setAdvice(otherOption.companion_advice);
      } else {
        setAdvice("");
      }
      onShowResults && onShowResults();
      
      // Clear referral data after successful submission
      clearReferralData()
      
      // Don't call onVoteSubmitted immediately - wait for user to click Continue
      // onVoteSubmitted && onVoteSubmitted('OTHER');
    } catch (err) {
      console.error('Error submitting other response:', err);
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const submitCheckboxVote = async () => {
    if (selectedOptions.length === 0) return;
    // If 'Other' is selected, require otherText
    if (selectedOptions.some(opt => opt.code === 'OTHER') && !otherText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // Get referral data if available
      const referralData = getReferralData();
      
      const payload = {
        question_id: question.question_id,
        option_codes: selectedOptions.map(opt => opt.code),
        uuid: getOrCreateUserUUID(),
        year_of_birth: getYearOfBirth(),
        ...(referralData && { referred_by: referralData.referred_by })
      };
      if (selectedOptions.some(opt => opt.code === 'OTHER')) {
        payload.other_text = otherText.trim();
      }
      const response = await fetch(`${API_BASE_URL}/api/checkbox-vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.status === "already_voted") {
        setError(data.message);
        setTimeout(() => setError(null), 3000);
        setLoading(false);
        return;
      }
      // Fetch results after successful vote
      const resultsUrl = `${API_BASE_URL}/api/questions/${question.question_id}/results`;
      const resultsResponse = await fetch(resultsUrl);
      if (!resultsResponse.ok) {
        throw new Error('Failed to fetch results');
      }
      const resultsData = await resultsResponse.json();
      setResults(resultsData);
      setShowResults(true);
      onShowResults && onShowResults();
      
      // Clear referral data after successful checkbox vote
      clearReferralData()
      
      // Collect all non-empty response_messages and advice from selected options
      const messages = selectedOptions
        .map(opt => ({
          message: opt.response_message,
          advice: opt.companion_advice,
        }))
        .filter(obj => obj.message && obj.message.trim() !== '');
      setCheckboxMessages(messages);
      setCheckboxAdviceShown(Array(messages.length).fill(false));
      // Don't call onVoteSubmitted immediately - wait for user to click Pick another Bubble
      // onVoteSubmitted && onVoteSubmitted('CHECKBOX');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to submit checkbox vote');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handler for "Continue" after response_message
  const handleContinue = () => {
    setShowResponseMessage(false)
    setShowResults(false)
    setResponseMessage("")
    // Now trigger loading the next question
    const codeToPass = selectedOption?.code || 'OTHER';
    onVoteSubmitted && onVoteSubmitted(codeToPass)
  }

  // Handler for "Advice?" button
  const handleShowAdvice = () => {
    setShowAdvice(true)
  }

  // Show response_message after bar chart is shown
  useEffect(() => {
    if (showResults && responseMessage && !showResponseMessage) {
      // Show the response message after a short delay (e.g., 1s)
      const timer = setTimeout(() => setShowResponseMessage(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [showResults, responseMessage, showResponseMessage])

  // Auto-advance disabled - let users scroll and view results at their own pace
  // useEffect(() => {
  //   if (showResults && !isEndOfBlock) {
  //     const timer = setTimeout(() => {
  //       // For checkbox questions, use a special code, for single-choice use the selected option code
  //       const codeToPass = question.check_box ? 'CHECKBOX' : (selectedOption?.code || 'OTHER');
  //       onVoteSubmitted && onVoteSubmitted(codeToPass);
  //     }, 2000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [showResults, isEndOfBlock, selectedOption, question.check_box]);

  // Handler for Pick another Bubble
  const handlePickAnotherBubble = () => {
    navigate('/');
  };

  function renderAdvice(adviceText) {
    // Regex to find [playlist:tag]
    const playlistRegex = /\[playlist:([a-zA-Z0-9_]+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = playlistRegex.exec(adviceText)) !== null) {
      // Push text before the match
      if (match.index > lastIndex) {
        const textBefore = adviceText.slice(lastIndex, match.index);
        // Split by newlines and preserve them
        const textParts = textBefore.split('\n').map((line, index, array) => {
          if (index === array.length - 1) {
            return line;
          }
          return [line, <br key={`br-${index}`} />];
        }).flat();
        parts.push(...textParts);
      }
      // Push the link
      const tag = match[1];
      parts.push(
        <button
          key={tag + match.index}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Playlist button clicked for tag:', tag);
            console.log('Current URL before navigation:', window.location.href);
            window.location.href = `/soundtrack/playlist/${tag}`;
          }}
          className="playlist-link text-blue-500 underline hover:text-blue-700 bg-transparent border-none cursor-pointer"
        >
          Listen to the {tag.replace('_', ' ')} playlist
        </button>
      );
      lastIndex = playlistRegex.lastIndex;
    }
    // Push any remaining text
    if (lastIndex < adviceText.length) {
      const remainingText = adviceText.slice(lastIndex);
      // Split by newlines and preserve them
      const textParts = remainingText.split('\n').map((line, index, array) => {
        if (index === array.length - 1) {
          return line;
        }
        return [line, <br key={`br-remaining-${index}`} />];
      }).flat();
      parts.push(...textParts);
    }
    return parts;
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <motion.div
        className="space-y-6"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          delay, 
          duration: 0.8,
          type: "spring",
          stiffness: 50,
          damping: 15
        }}
      >
        {/* Question */}
        <div>
          <motion.div
            className="rounded-xl p-6 shadow-lg text-center"
            style={{ 
              background: color || '#ffd1dc',
            }}
            whileHover={{ scale: 1.02 }}
          >
            <h2 className="text-xl font-medium text-gray-800 whitespace-pre-wrap">
              {question.text}
            </h2>
          </motion.div>
          
          {/* Separate playlist button if question contains playlist link */}
          {question.text.includes('[playlist:') && (
            <motion.button
              className="w-full px-6 py-3 text-white bg-gradient-to-r from-blue-500/80 to-purple-500/80 border border-white/20 rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 mt-3 font-medium"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Extract playlist tag from question text
                const playlistMatch = question.text.match(/\[playlist:([a-zA-Z0-9_]+)\]/);
                if (playlistMatch) {
                  const tag = playlistMatch[1];
                  console.log('Question playlist button clicked for tag:', tag);
                  window.location.href = `/soundtrack/playlist/${tag}`;
                }
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: delay + 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🎵 Listen to Playlist
            </motion.button>
          )}
        </div>

        {/* Options */}
        {!showResults && (
          <div className="space-y-3">
            {question.options && question.options.length > 0 ? question.options.map((option, index) => {
              const isSelected = question.check_box 
                ? selectedOptions.find(opt => opt.code === option.code)
                : selectedOption?.code === option.code;
              
              return (
                <div key={option.id}>
                  <motion.button
                    className={`w-full text-left px-6 py-4 text-lg text-gray-700 rounded-xl border border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow-md flex items-center ${
                      question.check_box ? 'justify-start' : ''
                    }`}
                    style={{
                      backgroundColor: question.check_box ? 'white' : (isSelected ? `${color}40` : 'white'),
                    }}
                    onClick={() => !loading && handleOptionSelect(option)}
                    disabled={loading}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: delay + 0.1 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {question.check_box && (
                      <div 
                        className={`w-5 h-5 border-2 rounded mr-3 flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                        }`}
                        style={{
                          minWidth: '20px',
                          minHeight: '20px',
                          maxWidth: '20px',
                          maxHeight: '20px',
                          width: '20px',
                          height: '20px'
                        }}
                      >
                        {isSelected && (
                          <svg 
                            className="w-3 h-3 text-white" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                            style={{
                              minWidth: '12px',
                              minHeight: '12px',
                              maxWidth: '12px',
                              maxHeight: '12px',
                              width: '12px',
                              height: '12px'
                            }}
                          >
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    )}
                    {renderAdvice(option.text)}
                  </motion.button>
                  
                  {/* Separate playlist button if option contains playlist link */}
                  {option.text.includes('[playlist:') && (
                    <motion.button
                      className="w-full px-6 py-3 text-white bg-gradient-to-r from-blue-500/80 to-purple-500/80 border border-white/20 rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 mt-2 font-medium"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Extract playlist tag from option text
                        const playlistMatch = option.text.match(/\[playlist:([a-zA-Z0-9_]+)\]/);
                        if (playlistMatch) {
                          const tag = playlistMatch[1];
                          console.log('Playlist button clicked for tag:', tag);
                          window.location.href = `/soundtrack/playlist/${tag}`;
                        }
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: delay + 0.1 + index * 0.1 + 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      🎵 Listen to Playlist
                    </motion.button>
                  )}
                </div>
              )
            }) : (
              <div className="text-center text-gray-500 py-4">
                No options available for this question.
              </div>
            )}

            {/* Other Input for checkbox questions */}
            {question.check_box && selectedOptions.some(opt => opt.code === 'OTHER') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 space-y-4"
              >
                <input
                  type="text"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  placeholder="Type your answer (200 characters max)..."
                  className="w-full px-6 py-4 text-lg text-gray-700 rounded-xl border border-gray-200 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ focusRing: color }}
                  maxLength={200}
                />
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setShowOtherInput(false);
                      setSelectedOption(null);
                      setOtherText('');
                    }}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            {/* Submit button for checkbox questions (moved below Other input) */}
            {question.check_box && selectedOptions.length > 0 && (
              <motion.button
                className="w-full px-6 py-4 text-lg text-black rounded-xl transition-all shadow-sm hover:shadow-md mt-4"
                style={{ background: color || '#ffd1dc' }}
                onClick={submitCheckboxVote}
                disabled={loading || (selectedOptions.some(opt => opt.code === 'OTHER') && !otherText.trim())}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Submitting...' : `Submit (${selectedOptions.length} selected)`}
              </motion.button>
            )}
          </div>
        )}

        {/* Other Input for single-choice questions */}
        {(!question.check_box && showOtherInput) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 space-y-4"
          >
            <input
              type="text"
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              placeholder="Type your answer (200 characters max)..."
              className="w-full px-6 py-4 text-lg text-gray-700 rounded-xl border border-gray-200 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ focusRing: color }}
              maxLength={200}
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowOtherInput(false);
                  setSelectedOption(null);
                  setOtherText('');
                }}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={submitOtherResponse}
                disabled={loading || !otherText.trim()}
                className="px-6 py-2 rounded-lg text-white transition-colors"
                style={{ 
                  background: color || '#ffd1dc',
                  opacity: loading || !otherText.trim() ? 0.5 : 1
                }}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.p 
            className="mt-4 text-sm text-red-500 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        {/* Results Bar Chart */}
        {showResults && results && (
          <div>
            <ResultsChart data={results.results} color={color} customResponses={results.custom_responses || []} />
            {/* For checkbox questions, show each response message in its own box with More button if advice exists */}
            {question.check_box && checkboxMessages.length > 0 && (
              <div className="flex flex-col gap-4 mt-6">
                {checkboxMessages.map((obj, idx) => (
                  <motion.div
                    key={idx}
                    className="rounded-xl p-6 shadow-lg text-center"
                    style={{ background: color || '#ffd1dc' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 + idx * 0.1 }}
                  >
                    <div className="text-lg text-gray-800 mb-4">{obj.message}</div>
                    
                    {/* Playlist button if message contains playlist link */}
                    {obj.message.includes('[playlist:') && (
                      <motion.button
                        className="w-full px-6 py-3 text-white bg-gradient-to-r from-blue-500/80 to-purple-500/80 border border-white/20 rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 mt-3 font-medium"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const playlistMatch = obj.message.match(/\[playlist:([a-zA-Z0-9_]+)\]/);
                          if (playlistMatch) {
                            const tag = playlistMatch[1];
                            console.log('Message playlist button clicked for tag:', tag);
                            window.location.href = `/soundtrack/playlist/${tag}`;
                          }
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        🎵 Listen to Playlist
                      </motion.button>
                    )}
                    
                    {/* More button and advice */}
                    {obj.advice && obj.advice.trim() !== '' && !checkboxAdviceShown[idx] && (
                      <button
                        className="mt-2 px-6 py-2 rounded-lg text-white transition"
                        style={{ background: '#0A0F2B' }}
                        onClick={() => setCheckboxAdviceShown(prev => prev.map((shown, i) => i === idx ? true : shown))}
                      >
                        More?
                      </button>
                    )}
                    {obj.advice && obj.advice.trim() !== '' && checkboxAdviceShown[idx] && (
                      <div className="mt-4 text-gray-800">
                        {renderAdvice(obj.advice)}
                        
                        {/* Professional Help Link for checkbox questions */}
                        <div className="mt-4 text-sm text-gray-600">
                          This isn't therapy, but someone out there can be.
                        </div>
                        <motion.button
                          className="mt-2 px-3 py-1 text-sm text-gray-600 hover:text-blue-600 transition-colors underline hover:no-underline"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.location.href = '/help';
                          }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          Professional Help
                        </motion.button>
                      </div>
                    )}
                    
                    {/* Playlist button if advice contains playlist link */}
                    {obj.advice && obj.advice.includes('[playlist:') && checkboxAdviceShown[idx] && (
                      <motion.button
                        className="w-full px-6 py-3 text-white bg-gradient-to-r from-blue-500/80 to-purple-500/80 border border-white/20 rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 mt-3 font-medium"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const playlistMatch = obj.advice.match(/\[playlist:([a-zA-Z0-9_]+)\]/);
                          if (playlistMatch) {
                            const tag = playlistMatch[1];
                            console.log('Advice playlist button clicked for tag:', tag);
                            window.location.href = `/soundtrack/playlist/${tag}`;
                          }
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        🎵 Listen to Playlist
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Response Message (after bar chart, before next question) */}
        {showResults && showResponseMessage && responseMessage && (
          <motion.div
            className="rounded-xl p-6 shadow-lg text-center mt-6"
            style={{ background: color || '#ffd1dc' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-lg text-gray-800 mb-4">{responseMessage}</div>
            
            {/* Playlist button if response message contains playlist link */}
            {responseMessage.includes('[playlist:') && (
              <motion.button
                className="w-full px-6 py-3 text-white bg-gradient-to-r from-blue-500/80 to-purple-500/80 border border-white/20 rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 mt-3 font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const playlistMatch = responseMessage.match(/\[playlist:([a-zA-Z0-9_]+)\]/);
                  if (playlistMatch) {
                    const tag = playlistMatch[1];
                    console.log('Response message playlist button clicked for tag:', tag);
                    window.location.href = `/soundtrack/playlist/${tag}`;
                  }
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🎵 Listen to Playlist
              </motion.button>
            )}
            
            {/* Advice? button only if advice exists and not yet shown */}
            {advice && !showAdvice && (
              <button
                className="mt-4 px-6 py-2 rounded-lg text-white transition"
                style={{ background: '#0A0F2B' }}
                onClick={handleShowAdvice}
              >
                More?
              </button>
            )}
          </motion.div>
        )}
        {/* Companion Advice box */}
        {showResults && showResponseMessage && showAdvice && advice && (
          <motion.div
            className="rounded-xl p-6 shadow-lg text-center mt-6"
            style={{ background: color || '#ffd1dc' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-lg text-gray-800 mb-4">
              {renderAdvice(advice)}
            </div>
            
            {/* Professional Help Link */}
            <div className="mt-4 text-sm text-gray-600">
              This isn't therapy, but someone out there can be.
            </div>
            <motion.button
              className="mt-2 px-3 py-1 text-sm text-gray-600 hover:text-blue-600 transition-colors underline hover:no-underline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = '/help';
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Professional Help
            </motion.button>
            
            {/* Playlist button if companion advice contains playlist link */}
            {advice.includes('[playlist:') && (
              <motion.button
                className="w-full px-6 py-3 text-white bg-gradient-to-r from-blue-500/80 to-purple-500/80 border border-white/20 rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 mt-3 font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const playlistMatch = advice.match(/\[playlist:([a-zA-Z0-9_]+)\]/);
                  if (playlistMatch) {
                    const tag = playlistMatch[1];
                    console.log('Companion advice playlist button clicked for tag:', tag);
                    window.location.href = `/soundtrack/playlist/${tag}`;
                  }
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🎵 Listen to Playlist
              </motion.button>
            )}
          </motion.div>
        )}
        {/* For end-of-block question, show Pick another Bubble button BELOW the message/advice */}
        {isEndOfBlock && showResults && (
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={handlePickAnotherBubble}
              className="px-8 py-3 text-lg text-black rounded-xl transition-all shadow-sm hover:shadow-md"
              style={{ background: color || '#ffd1dc' }}
            >
              Pick another Bubble
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default BubbleQuestion 