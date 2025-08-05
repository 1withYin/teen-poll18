import React from 'react';

const Grownup = () => (
  <div style={{
    fontFamily: 'system-ui, sans-serif',
    backgroundColor: '#f8f9fa',
    color: '#222',
    padding: '2rem',
    maxWidth: '700px',
    margin: 'auto',
    lineHeight: 1.6
  }}>
    <h1 style={{ color: '#0E0F1A', fontSize: '2rem', marginBottom: '1rem' }}>Welcome, Grown-Ups 👋</h1>
    <p>Your world, your say—too.</p>

    <h2 style={{ color: '#0E0F1A', marginTop: '2.5rem', fontSize: '1.4rem' }}>For Parents</h2>
    <p>This isn't just about understanding your teen.  <br/>
    It's about reconnecting with your own voice.  <br/>
    What do you wish someone had told you?  <br/>
    What do you hope your child carries forward?</p>

    <div style={{ fontStyle: 'italic', marginTop: '1rem', color: '#555' }}>
      Coming soon:
      <ul>
        <li>Reflection prompts</li>
        <li>Your own private answers</li>
        <li><strong>Bar charts showing how other parents responded, too</strong></li>
      </ul>
    </div>

    <h2 style={{ color: '#0E0F1A', marginTop: '2.5rem', fontSize: '1.4rem' }}>For Other Grown-Ups</h2>
    <p>Whether you're a mentor, teacher, sibling, or just someone who's lived a little—  <br/>
    you've got a story, a lens, a voice.</p>

    <p>We'll be asking real questions—about:</p>
    <div style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>
      💔 heartbreak &nbsp; 👥 friendship &nbsp; 💼 work <br/>
      🌱 healing &nbsp; 🌀 choices you made (or didn't)
    </div>

    <div style={{ fontStyle: 'italic', marginTop: '1rem', color: '#555' }}>
      Coming soon:
      <ul>
        <li>Thought-provoking polls</li>
        <li>Insightful results</li>
        <li>A space to reflect, laugh, regret, and grow</li>
      </ul>
    </div>

    <p>Sometimes, seeing the bar chart is all it takes to realize you're not the only one.</p>
  </div>
);

export default Grownup; 