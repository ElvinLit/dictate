import React, { useEffect } from 'react';
import Conversation from './Conversation';

const Overlay: React.FC = () => {
  useEffect(() => {
    // Enable click-through for the entire window initially
    if (window.electron) {
      window.electron.setClickThrough(true);
    }
  }, []);

  const handleMouseEnter = () => {
    // Disable click-through when mouse enters the transcript area
    if (window.electron) {
      window.electron.setClickThrough(false);
    }
  };

  const handleMouseLeave = () => {
    // Re-enable click-through when mouse leaves the transcript area
    if (window.electron) {
      window.electron.setClickThrough(true);
    }
  };

  return (
    <div className="overlay-container">
      {/* Conversation Transcript - Top Right */}
      <div 
        className="overlay-clickable absolute top-4 right-4 h-128 w-80 rounded-lg"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(75, 85, 99, 0.2)'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Conversation />
      </div>
    </div>
  );
};

export default Overlay;
