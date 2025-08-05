import { useState, useEffect } from 'react';

const SocialSettings = ({ isOpen, onClose }) => {
  const [socialHandles, setSocialHandles] = useState({
    discord: '',
    instagram: '',
    snapchat: '',
    whatsapp: '',
    tiktok: ''
  });

  useEffect(() => {
    // Load saved handles from localStorage
    const saved = localStorage.getItem('socialHandles');
    if (saved) {
      setSocialHandles(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('socialHandles', JSON.stringify(socialHandles));
    onClose();
  };

  const handleChange = (platform, value) => {
    setSocialHandles(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Share Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        
        <p className="text-gray-300 text-sm mb-4">
          Add your social handles to make sharing easier! We'll only use these to create quick share links.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Discord Username
            </label>
            <input
              type="text"
              placeholder="username#1234"
              value={socialHandles.discord}
              onChange={(e) => handleChange('discord', e.target.value)}
              className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Instagram Handle
            </label>
            <input
              type="text"
              placeholder="@username"
              value={socialHandles.instagram}
              onChange={(e) => handleChange('instagram', e.target.value)}
              className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Snapchat Username
            </label>
            <input
              type="text"
              placeholder="username"
              value={socialHandles.snapchat}
              onChange={(e) => handleChange('snapchat', e.target.value)}
              className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              WhatsApp Number
            </label>
            <input
              type="text"
              placeholder="+1234567890"
              value={socialHandles.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              TikTok Username
            </label>
            <input
              type="text"
              placeholder="@username"
              value={socialHandles.tiktok}
              onChange={(e) => handleChange('tiktok', e.target.value)}
              className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialSettings; 