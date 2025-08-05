import React from 'react';
import { motion } from 'framer-motion';

const About = () => (
  <div className="min-h-screen bg-navy-900 text-white flex flex-col items-center py-12 px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl bg-white/10 rounded-xl shadow-lg p-8"
    >
      <h1 className="text-3xl font-bold mb-8 text-center">About</h1>
      <div className="space-y-6 text-lg text-white/90">
        <p><strong>Why we made this</strong></p>
        <p>Everyone's got thoughts. But not everyone gets asked.</p>
        <p>We built My World My Say to make space for that—<br />to ask, to listen, to reflect.</p>
        <p>This isn't about likes or followers.<br />It's about what's real to you—your feelings, your opinions, your way of making sense of the world.</p>
        <p>We don't collect names or personal info.<br />We don't need to.<br />Because this isn't about being tracked.<br />It's about being heard.</p>
        <p>You answer questions.<br />You see how others feel too.<br />Sometimes, that's all it takes to feel less alone.</p>
        <p>And when you answer—<br />we send a message back.<br />Not a score. Not a judgment.<br />Just something thoughtful,<br />based on what you chose.</p>
        <p>Some messages validate.<br />Some offer advice—if you want it.<br />You can take it or leave it.</p>
        <p><strong>But one thing's always true:<br />This app was built to be on your side.</strong></p>
        <hr className="my-6 border-white/20" />
        <p className="text-center">Questions or thoughts?<br />📧 <a href="mailto:info@myworldmysay.com" className="underline text-blue-200">info@myworldmysay.com</a></p>
      </div>
    </motion.div>
  </div>
);

export default About; 