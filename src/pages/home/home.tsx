import { useEffect } from "react";

const HomePage = () => {
  const handleDictateClick = () => {
    console.log("Dictate button clicked");
    // add API logic: on click, start ASR
  };

  // smart click-through (detect when mouse is over clickable elements)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as Element;
      
      // check if mouse is over a clickable element (button or panel)
      const isOverClickable = target.closest('.dictate-button') || target.closest('.side-panel');
      
      // if mouse isn't over a clickable element, ignore mouse events
      window.electron.setIgnoreMouseEvents(!isOverClickable);
    };

    // add global mousemove listener
    document.addEventListener('mousemove', handleMouseMove);
    
    // cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      {/* dictate button */}
      <button 
        className="dictate-button"
        onClick={handleDictateClick}
        onMouseEnter={() => window.electron.setIgnoreMouseEvents(false)}
        onMouseLeave={() => window.electron.setIgnoreMouseEvents(true)}
      >
        Dictate
      </button>

      {/* transcript panel */}
      <div 
        className="side-panel"
        onMouseEnter={() => window.electron.setIgnoreMouseEvents(false)}
        onMouseLeave={() => window.electron.setIgnoreMouseEvents(true)}
      >
        {/* insert transcript content here */}
      </div>
    </>
  );
};

export default HomePage;
