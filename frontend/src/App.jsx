console.log('*** THIS IS THE REAL APP ***');

import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import QuestionList from './components/QuestionList'
import Playlist from './pages/Playlist'
import LandingPage from './pages/LandingPage'
import FAQ from './pages/FAQ'
import About from './pages/About'
import HamburgerMenu from './components/HamburgerMenu'
import { useState } from 'react'
import Privacy from './pages/Privacy'
import Contact from './pages/Contact'
import Help from './pages/Help'
import Footer from './components/Footer'
import Grownup from './pages/Grownup'
import { useAudio } from './components/AudioContext'
import BlockSelectionPage from './pages/BlockSelectionPage'
import BeforeYouBegin from './pages/BeforeYouBegin'
import { initializeReferralTracking } from './utils/referral'

function App() {
  const { isPlaying, isThemeSong, themeEnabled, toggleTheme } = useAudio();
  
  // Initialize referral tracking when app loads
  useEffect(() => {
    initializeReferralTracking();
  }, []);
  
  const handleToggleThemeSound = () => {
    toggleTheme();
  };
  
  return (
    <div className="min-h-screen bg-navy-900 flex flex-col">
      <HamburgerMenu isSoundOn={themeEnabled} onToggleSound={handleToggleThemeSound} />
      <div className="flex-1 overflow-y-auto">
      <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/before-you-begin" element={<BeforeYouBegin />} />
          <Route path="/questions/:categoryId/:block" element={<QuestionList />} />
          <Route path="/blocks/:categoryId" element={<BlockSelectionPage />} />
          {/* <Route path="/questions/:categoryId" element={<QuestionList />} /> */}
          <Route path="/playlist" element={<Navigate to="/soundtrack/playlist/all" replace />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<Help />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/soundtrack/playlist/:playlistTag" element={<Playlist />} />
          <Route path="/grownup" element={<Grownup />} />
      </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App 