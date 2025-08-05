import React from 'react';
import { motion } from 'framer-motion';
import { debugUUID, migrateLegacyUUID } from '../utils/debugUUID';

const faqs = [
  {
    q: "Do you collect personal information?",
    a: `No. We do not collect your name, email, phone number, or location. You can use the app without signing up or logging in.\n\nSome answers—like text typed into an "Other" box—may be saved anonymously to help us understand trends. But we never ask for personal info, and we ask you not to include names, emails, or social handles in those boxes.`
  },
  {
    q: "What do you store, then?",
    a: `We save your answers with a random ID (called a UUID) that helps us group responses without knowing who you are. This lets us show charts and patterns—like how teens feel about school or friendship—without ever identifying any individual.`
  },
  {
    q: "Can anyone trace my responses back to me?",
    a: `No. We don't ask who you are, and the random ID cannot be used to track your identity or device. We built it this way on purpose, to protect your privacy.`
  },
  {
    q: "I'm under 13. Can I use this app?",
    a: `No. If you're under 13, please don't use this app. If someone under 13 enters data by mistake, a parent or guardian can email us at info@myworldmysay.com, and we'll remove it.`
  },
  {
    q: "How can I clear my data or delete my responses?",
    a: `You can clear all your local data (including your answers and random ID) by clearing your browser's site data or local storage for this app. This will remove all your responses from your device.\n\nIf you want your responses deleted from our servers (hosted on Render), please email us at info@myworldmysay.com with your random ID (UUID) if possible. We do not know who you are or which device you use, but with your UUID, we can find and delete your responses from our database.`
  },
  {
    q: "How can I find my random ID (UUID) to request data deletion?",
    a: `You can find your anonymous ID (called a UUID) at the bottom of this page. If you can't find it, email us at info@myworldmysay.com and we'll help you.`
  },
  {
    q: "How accurate are the stats?",
    a: `The stats shown in this app are based on anonymous responses. We do not collect personal information, so the data is not precise or representative of any specific group. Instead, it reflects general trends from people who chose to share. Think of it as a conversation starter—not official research.`
  }
];

const FAQ = () => (
  <div className="min-h-screen bg-navy-900 text-white flex flex-col items-center py-12 px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl bg-white/10 rounded-xl shadow-lg p-8"
    >
      <h1 className="text-3xl font-bold mb-8 text-center">FAQ – Your Privacy, Safety, and Our Promise</h1>
      
      {/* About Section */}
      <div className="mb-12 p-6 bg-white/20 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">About</h2>
        <div className="space-y-4 text-lg text-white/90">
          <p>
            This app grew out of real conversations—between parents, psychologists, and teens themselves. The thoughts are true. The emotions are shared.
          </p>
          <p>
            Most surveys ask teens what they think, but never show them the results. <strong>My World My Say</strong> changes that—giving teens a voice <em>and</em> the big picture.
          </p>
          <p>
            And the songs? They don't just echo pain. They lift it, shape it, and give it direction. Because we're not here to just feel—we're here to build.
          </p>
        </div>
      </div>
      
      <div className="space-y-8">
        {faqs.map((item, idx) => (
          <div key={idx}>
            <h2 className="text-xl font-semibold mb-2">Q: {item.q}</h2>
            <p className="text-lg text-white/90 whitespace-pre-line">A: {item.a}</p>
          </div>
        ))}
      </div>
      {/* Show UUID section */}
      <div className="mt-12 p-6 bg-white/20 rounded-lg text-center">
        <h2 className="text-xl font-semibold mb-2">Your Anonymous ID (UUID)</h2>
        <ShowUUID />
        <p className="text-sm text-white/80 mt-2">
          This random ID is used to group your answers anonymously. <strong>Your ID will appear here after you finish at least one question.</strong> If you ever want your responses deleted from our server, email us this ID at info@myworldmysay.com.<br/>
          <span className="block mt-1 text-white/60">
            We do not know who you are or which device you use, but with your UUID, we can find and delete your responses from our database.
          </span>
        </p>
      </div>
    </motion.div>
  </div>
);

function ShowUUID() {
  const [uuid, setUuid] = React.useState('');
  const [debugInfo, setDebugInfo] = React.useState(null);
  
  React.useEffect(() => {
    // Try to migrate legacy UUID first
    migrateLegacyUUID();
    
    // Get current UUID
    const currentUUID = localStorage.getItem('userUUID');
    setUuid(currentUUID);
    
    // Debug info (only in development)
    if (process.env.NODE_ENV === 'development') {
      const info = debugUUID();
      setDebugInfo(info);
    }
  }, []);
  
  return (
    <div>
      <div className="break-all text-lg font-mono text-yellow-200">
        {uuid ? uuid : 'No ID found. You may not have answered any questions yet.'}
      </div>
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && debugInfo && (
        <details className="mt-4 text-sm text-gray-300">
          <summary className="cursor-pointer">Debug Info (Development Only)</summary>
          <pre className="mt-2 text-xs bg-black/20 p-2 rounded">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

export default FAQ; 