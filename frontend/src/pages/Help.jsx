import React from 'react';
import { motion } from 'framer-motion';

export default function Help() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Need to Talk to Someone Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-3xl font-bold mb-6 text-white">Need to Talk to Someone?</h1>
          <p className="text-lg mb-6 text-white">Here are two national directories that can help:</p>
          
          <div className="space-y-6">
            <div className="border border-gray-600 rounded-lg p-6 bg-gray-800">
              <div className="flex items-start space-x-3">
                <span className="text-gray-400 text-xl">🔗</span>
                <div>
                  <a 
                    href="https://www.aacap.org/AACAP/Families_Youth/CAP_Finder/AACAP/Families_and_Youth/Resources/CAP_Finder.aspx?hkey=61c4e311-beb7-4a25-ae4f-1ec61baf348c" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline font-semibold text-lg"
                  >
                    Find a Teen Psychiatrist - AACAP
                  </a>
                  <p className="text-gray-300 mt-1">From the American Academy of Child & Adolescent Psychiatry.</p>
                  <p className="text-sm text-gray-400 mt-1">We don't endorse individual providers.</p>
                </div>
              </div>
            </div>

            <div className="border border-gray-600 rounded-lg p-6 bg-gray-800">
              <div className="flex items-start space-x-3">
                <span className="text-gray-400 text-xl">🔗</span>
                <div>
                  <a 
                    href="https://www.psychologytoday.com/us/therapists" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline font-semibold text-lg"
                  >
                    Find a Therapist - Psychology Today
                  </a>
                  <p className="text-gray-300 mt-1">Search by location, insurance, or specialty.</p>
                  <p className="text-sm text-gray-400 mt-1">No endorsements implied.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* More Support & Education Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 text-white">More Support & Education</h2>
          
          <div className="space-y-6">
            <div className="border border-gray-600 rounded-lg p-6 bg-gray-800">
              <div className="flex items-start space-x-3">
                <span className="text-green-400 text-xl">📚</span>
                <div>
                  <a 
                    href="https://www.aacap.org/AACAP/Families_and_Youth/Resource_Centers/Home.aspx" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline font-semibold text-lg"
                  >
                    AACAP Family & Youth Resources
                  </a>
                  <p className="text-gray-300 mt-1">Helpful guides for parents, teens, and kids on mental health and development.</p>
                </div>
              </div>
            </div>

            <div className="border border-gray-600 rounded-lg p-6 bg-gray-800">
              <div className="flex items-start space-x-3">
                <span className="text-red-400 text-xl">🚫</span>
                <div>
                  <a 
                    href="https://www.stopbullying.gov/get-help-now" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline font-semibold text-lg"
                  >
                    StopBullying.gov - Get Help Now
                  </a>
                  <p className="text-gray-300 mt-1">If you or someone you know is being bullied, this site shows what you can do—and who can help.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
            <p className="font-bold text-yellow-100">
              This app is here to support reflection—not replace professional help. If you're ever in danger or crisis, please contact a trusted adult or call 911.
            </p>
          </div>
        </motion.div>

        {/* Sources & Real-World Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 text-white">
            <span className="text-green-400 mr-2">📊</span>
            Sources & Real-World Stats
          </h2>
          
          <p className="text-lg mb-6 italic text-gray-300">
            Some of the questions in this app are inspired by real studies, articles, and stats. Here are a few we found helpful.
          </p>
          
          <p className="text-lg mb-6 text-white">Then list them in a clean table or bulleted format with short labels and links:</p>
          
          <ul className="space-y-3 text-lg text-white">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Only 51% of high schoolers feel a sense of belonging →{' '}
                <a 
                  href="https://www.qualtrics.com/news/only-half-of-high-school-students-feel-a-sense-of-belonging-at-their-school-qualtrics-research-shows/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Qualtrics Study
                </a>
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Teen loneliness doubled from 2012-2018 →{' '}
                <a 
                  href="https://www.snexplores.org/article/teens-feels-lonely-school-cell-phones-internet" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Science News for Students
                </a>
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                19.2% of students report being bullied →{' '}
                <a 
                  href="https://www.stopbullying.gov/resources/facts#fast-facts" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  StopBullying.gov
                </a>
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                What to do about bullying →{' '}
                <a 
                  href="https://www.stopbullying.gov/resources/teens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  StopBullying.gov Teen Guide
                </a>
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                More than 40% of college grads are underemployed →{' '}
                <a 
                  href="https://www.wsj.com/lifestyle/careers/college-degree-jobs-unused-440b2abd" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Wall Street Journal
                </a>
              </span>
            </li>
          </ul>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12"
        >
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            ← Go Back
          </button>
        </motion.div>
      </div>
    </div>
  );
} 