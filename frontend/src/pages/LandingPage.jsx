import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAudio } from '../components/AudioContext'
import ReferralLink from '../components/ReferralLink'
import API_BASE_URL from '../config'

// Constants
const CHAOS_CATEGORY_ID = 12;
const MIN_AGE = 13;
const MAX_AGE = 18;
const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1900;
const ANIMATION_DURATION_BASE = 4;
const ANIMATION_DURATION_CHAOS = 4.5;
const ANIMATION_OFFSET = 0.5;
const FLOAT_DISTANCE = 20;
const BUBBLE_GAP = 6;
const BUBBLE_GAP_PX = BUBBLE_GAP * 16;

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
};

const fallbackGradient = 'bg-[linear-gradient(135deg,#f0f0f0,#cccccc)]';

// Animation constants
const bounceKeyframes = [0, -10, 0, -8, 0, -5, 0];
const titleGradient = 'linear-gradient(90deg, #98D8C8, #E6E6FA 50%, #B8E6B8 100%)';
const titleShadow = 'drop-shadow(0 0 16px #98D8C888)';

// Local storage keys
const STORAGE_KEYS = {
  YEAR_OF_BIRTH: 'yearOfBirth',
  USER_UUID: 'userUUID'
};

// Age validation constants
const AGE_MESSAGES = {
          UNDER_13: "This app is for teens. If you're under 13, please ask your parents to take you to other sites that are appropriate for your age.",
  OVER_18: "Looks like you're 18 or older. This version is for teens. Click here (we will build one in the future) for the version that fits you.",
  INVALID_YEAR: "Please enter a valid year."
};

// Utility functions
const getYearOfBirth = () => localStorage.getItem(STORAGE_KEYS.YEAR_OF_BIRTH);
const setYearOfBirth = (year) => localStorage.setItem(STORAGE_KEYS.YEAR_OF_BIRTH, year);

const simpleUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const getOrCreateUUID = () => {
  let uuid = localStorage.getItem(STORAGE_KEYS.USER_UUID);
  if (!uuid) {
    uuid = window.crypto?.randomUUID() || simpleUUID();
    localStorage.setItem(STORAGE_KEYS.USER_UUID, uuid);
  }
  return uuid;
};

const generateYearOptions = () => {
  const options = [];
  for (let i = 0; i < 6; i++) {
    const year = CURRENT_YEAR - MIN_AGE - (5 - i);
    options.push(year);
  }
  return options;
};

const validateAge = (year) => {
  if (!year || year < MIN_YEAR || year > CURRENT_YEAR) {
    return { isValid: false, message: AGE_MESSAGES.INVALID_YEAR };
  }
  
  const age = CURRENT_YEAR - year;
  if (age < MIN_AGE) {
    return { isValid: false, message: AGE_MESSAGES.UNDER_13 };
  }
  if (age > MAX_AGE) {
    return { isValid: false, message: AGE_MESSAGES.OVER_18 };
  }
  
  return { isValid: true };
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [bubbles, setBubbles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showYearModal, setShowYearModal] = useState(false);
  const [bubbleClicked, setBubbleClicked] = useState(false);
  const [pendingBubble, setPendingBubble] = useState(null);
  const [inputYear, setInputYear] = useState('');
  const [ageMessage, setAgeMessage] = useState('');
  const { playTheme } = useAudio();
  const hasPlayedTheme = useRef(false);

  useEffect(() => {
    getOrCreateUUID();
  }, []);

  useEffect(() => {
    const fetchBubbles = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const catRes = await fetch('/api/categories');
        if (!catRes.ok) throw new Error('Failed to fetch categories');
        
        const categories = await catRes.json();
        const bubblesData = await Promise.all(
          categories.map(async (cat) => {
            try {
              const qRes = await fetch(`${API_BASE_URL}/api/start-question/${cat.id}`);
              if (!qRes.ok) throw new Error('No start question');
              
              const question = await qRes.json();
              const gradient = categoryGradients[cat.id] || fallbackGradient;
              
              return {
                id: cat.id,
                category: cat.category_name,
                categoryText: cat.category_text,
                color: gradient,
                questionText: question.text,
                questionId: question.question_id,
              };
            } catch {
              return null;
            }
          })
        );
        
        setBubbles(bubblesData.filter(Boolean));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBubbles();
  }, []);

  const handleBubbleClick = async (bubble) => {
    setBubbleClicked(true);

    if (!hasPlayedTheme.current) {
      playTheme();
      hasPlayedTheme.current = true;
    }

    const uuid = getYearOfBirth() ? localStorage.getItem(STORAGE_KEYS.USER_UUID) : null;
    if (!uuid) {
      setShowYearModal(true);
      setPendingBubble(bubble);
      return;
    }

    console.log('Navigating to block selection with bubble:', bubble);
    // Navigate to the block selection page instead of opening modal
    navigate(`/blocks/${bubble.id}`);
  };

  const handleYearSubmit = () => {
    if (inputYear === 'before2007') {
      navigate('/grownup');
      return;
    }
    
    if (inputYear === 'after2012') {
      setAgeMessage(AGE_MESSAGES.UNDER_13);
      return;
    }
    
    const year = parseInt(inputYear, 10);
    const validation = validateAge(year);
    
    if (!validation.isValid) {
      setAgeMessage(validation.message);
      return;
    }
    
    setYearOfBirth(year);
    setShowYearModal(false);
    setAgeMessage('');
    
    if (pendingBubble) {
      navigate(`/blocks/${pendingBubble.id}`);
      setPendingBubble(null);
    }
  };

  const renderBubble = (bubble, isChaos = false) => {
    const animationDuration = isChaos ? ANIMATION_DURATION_CHAOS : ANIMATION_DURATION_BASE;
    const className = isChaos 
      ? "px-6 py-4 rounded-full text-xl font-semibold text-black shadow-xl bg-gradient-to-r from-red-500 to-red-700 focus:outline-none w-48 whitespace-normal text-center"
      : "px-6 py-4 rounded-full text-xl font-semibold text-black shadow-xl focus:outline-none w-48 whitespace-normal text-center";
    
    const style = isChaos ? {} : { background: bubble.color };

    return (
      <motion.button
        key={bubble.id}
        className={className}
        style={style}
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: [0, -FLOAT_DISTANCE, 0], opacity: 1 }}
        transition={{
          y: { 
            duration: animationDuration, 
            repeat: Infinity, 
            repeatType: 'reverse', 
            ease: 'easeInOut' 
          },
          opacity: { duration: 0.5 }
        }}
        onClick={() => handleBubbleClick(bubble)}
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px 6px rgba(255,255,255,0.2)' }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="leading-tight" style={{ fontSize: '18px' }}>
          {bubble.categoryText}
        </div>
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#0A0F2B] relative overflow-y-auto">
      {/* Year of Birth Modal */}
      {showYearModal && bubbleClicked && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-xs w-full text-center">
            <h2 className="text-xl font-bold mb-4">Year of Birth</h2>
            <div className="mb-3 text-gray-700 text-sm">
              We don't collect your name, email, or any personal info. Everything stays on your device.<br />
              <span className="block mt-2 text-xs text-gray-500">
                We do not knowingly collect any personal information from anyone, but our app targets teens. If you are under 13, please do not use this app. If you believe a child under 13 has provided us with information, please contact us and we will promptly delete it.
              </span>
            </div>
            <select
              className="w-full px-4 py-2 rounded border border-gray-300 mb-4 text-lg text-black bg-white"
              value={inputYear}
              onChange={e => setInputYear(e.target.value)}
            >
              <option value="">Year of Birth</option>
              <option value="before2007">Before 2007</option>
              {generateYearOptions().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
              <option value="after2012">After 2012</option>
            </select>
            {ageMessage && <div className="text-red-600 text-sm mb-2">{ageMessage}</div>}
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-semibold"
              onClick={handleYearSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Flat Logo */}
      <div className="mt-12 mb-4 text-center">
        <motion.div
          className="flex justify-center items-center mb-1"
          initial={{ y: -80, opacity: 0, scale: 0.7 }}
          animate={{ y: bounceKeyframes, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 120, duration: 1.2 }}
        >
          <svg
            width="600"
            height="140"
            viewBox="0 0 600 140"
            className="w-full max-w-2xl"
          >
            {/* Define the gradient */}
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#98D8C8', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#B19CD9', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#B8E6B8', stopOpacity: 1 }} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
                <feGaussianBlur stdDeviation="1" result="sharpBlur"/>
                <feMerge> 
                  <feMergeNode in="sharpBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
                <feGaussianBlur stdDeviation="0.5" result="extraGlow"/>
                <feMerge> 
                  <feMergeNode in="extraGlow"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              {/* Reflection blur filter */}
              <filter id="reflection-blur">
                <feGaussianBlur stdDeviation="2" />
              </filter>
            </defs>
            
            {/* Flat text */}
            <text
              x="300"
              y="60"
              textAnchor="middle"
              filter="url(#glow)"
              style={{
                fill: 'url(#logoGradient)',
                fontSize: '52px',
                fontWeight: 'bold',
                letterSpacing: '2px'
              }}
            >
              My World My Say
            </text>
            
            {/* Reflection text */}
            <text
              x="300"
              y="85"
              textAnchor="middle"
              filter="url(#reflection-blur)"
              style={{
                fill: 'url(#logoGradient)',
                fontSize: '52px',
                fontWeight: 'bold',
                letterSpacing: '2px',
                opacity: '0.3'
              }}
            >
              My World My Say
            </text>
            

          </svg>
        </motion.div>
        
        <motion.div
          className="-mt-4 text-center max-w-2xl mx-auto px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          {/* Emphasized section - moved up */}
          <div className="text-lg text-gray-100 mb-3 italic leading-relaxed">
            Funny or deep, quiet or bold—
          </div>
          
          {/* Main tagline */}
          <div className="text-2xl font-bold mb-4 tracking-wide text-white">
            Your voice matters.
          </div>
          
          {/* Subtitle */}
          <div className="text-lg text-gray-200 mb-3 font-medium">
            No names. No tracking. Just vibes.
          </div>
          
          {/* Descriptive text */}
          <div className="text-base text-gray-300 mb-3 leading-relaxed">
            Stats = trends, not truths. Mood rings, not microscopes.
          </div>
          
          {/* Call to action */}
          <div className="text-base text-gray-200 font-medium">
            Pick a bubble. Say it. <br />
            <span className="text-gray-100">See what others feel too.</span>
          </div>
          
          {/* Show referral link if user has entered birth year */}
          {getYearOfBirth() && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.8 }}
            >
              <ReferralLink userUUID={getOrCreateUUID()} />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Floating Bubbles */}
      {!showYearModal && (
        <div className="relative w-full flex-1 flex flex-col items-center justify-center">
          {loading && (
            <div className="text-white/80 text-xl mt-12">Loading questions...</div>
          )}
          {error && (
            <div className="text-red-400 text-lg mt-12">{error}</div>
          )}
          <div className="flex flex-col items-center gap-6 w-full relative z-10">
            {/* Render all regular bubbles first */}
            {bubbles
              .filter(b => Number(b.id) !== CHAOS_CATEGORY_ID)
              .map((bubble, i) => renderBubble(bubble, false))
            }
            
            {/* Render Chaos bubble at the bottom */}
            {(() => {
              const chaosBubble = bubbles.find(b => Number(b.id) === CHAOS_CATEGORY_ID);
              return chaosBubble ? renderBubble(chaosBubble, true) : null;
            })()}
          </div>
        </div>
      )}

    </div>
  );
};

export default LandingPage; 