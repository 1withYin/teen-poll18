import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const BeforeYouBegin = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-4">Before You Begin</h1>
          <hr className="border-gray-300 mb-4" />
        </motion.div>

        {/* Instruction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-red-900/20 border-2 border-red-400 rounded-lg p-4 mb-6">
            <p className="text-red-300 font-bold text-lg text-center">
              ⚠️ (Please read before selecting a bubble) ⚠️
            </p>
          </div>
        </motion.div>

        {/* What this is */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">What this is:</h2>
          <ul className="space-y-2 text-lg">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>A place to explore questions about life, emotions, and identity</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>A space to hear how others feel, and add your say</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Messages that respond to your answers—always with care</span>
            </li>
          </ul>
        </motion.div>

        {/* What this is not */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">What this is not:</h2>
          <ul className="space-y-2 text-lg">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>It's not therapy or medical advice</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>It's not a place for emergencies or crisis help</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>It's not collecting your personal info—we don't ask your name, email, or track you</span>
            </li>
          </ul>
        </motion.div>

        {/* If you're ever feeling overwhelmed */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">If you're ever feeling overwhelmed:</h2>
          <ul className="space-y-2 text-lg">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                You can{' '}
                <button
                  onClick={() => navigate('/help')}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  find a therapist or psychiatrist here
                </button>
                {' '}→ (links to Help & Resources page)
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Or, in an emergency, please call 911 or talk to a trusted adult.</span>
            </li>
          </ul>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-12"
        >
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors duration-200 font-medium border border-white/20"
          >
            ← Go Back
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default BeforeYouBegin; 