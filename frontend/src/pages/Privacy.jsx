import React from 'react';

export default function Privacy() {
  return (
    <div className="max-w-xl mx-auto p-8 text-white bg-navy-900 rounded shadow mt-16">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4"><strong>Effective Date:</strong> [Today's Date]</p>
      <p className="mb-4">We do not knowingly collect any personal information, including name, email, or any other personal information, from anyone. </p>
      <p className="mb-4">However, our app targets teens. If you are under 13, please do not use this app. If you believe a child under 13 has provided us with information, please contact us and we will promptly delete it.</p>
      <p>If you have any questions about this policy, please contact us at <a href="mailto:info@myworldmysay.com" className="text-blue-300 underline">info@myworldmysay.com</a>.</p>
    </div>
  );
} 