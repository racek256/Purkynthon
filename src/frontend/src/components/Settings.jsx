import { useEffect, useState, useCallback } from "react";

export default function Settings({ hide, theme, selectTheme, logout }) {
  const [displayed, setDisplayed] = useState(false);
  const [closing, setClosing] = useState(false);

  function hideScreen() {
    setDisplayed(false);
    setTimeout(() => hide(), 150);
  }

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      hideScreen();
    }
  }, []);

  useEffect(() => {
    setTimeout(() => setDisplayed(true), 10);
    setTimeout(() => setClosing(true), 150);
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      hideScreen();
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 w-screen h-screen z-999 backdrop-blur-xs transition-opacity
        ${displayed ? "opacity-100" : "opacity-0"}`}
      onClick={handleBackdropClick}
    >
<div
         className={`absolute left-1/2 top-1/2 w-1/2 h-1/2 bg-bg border border-white rounded-xl
           transition-all ease-in-out
           ${displayed
             ? "opacity-100 scale-100 -translate-x-1/2 -translate-y-1/2"
             : closing
             ? "opacity-0 scale-75 -translate-x-1/2 -translate-y-3/4"
             : "opacity-0 scale-75 -translate-x-1/2 -translate-y-1/4"
           }`}
>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-white">Settings</h2>
            
            <div className="mb-6">
              <label className="block text-white mb-2">Theme</label>
              <select
                className="bg-sidebar-theme-selector shadow-xl p-2 rounded-lg"
                value={theme}
                onChange={(e) => {
                  console.log("setting theme: " + e.target.value);
                  selectTheme(e.target.value);
                }}
              >
                <option>mocha</option>
                <option>ocean</option>
                <option>fire</option>
                <option>flashbang</option>
              </select>
            </div>
          </div>
          
          <button
            className="absolute bottom-4 left-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
            onClick={() => {
              console.log("User logged out");
				logout();
            }}
          >
	  Logout - UPDATE: Works thanks to Racek doing Fimes’s job.
          </button>
          
          <button
            className="absolute bottom-4 right-4 bg-button px-6 py-2 rounded-md hover:bg-button-hover"
            onClick={hideScreen}
          >
            Close
          </button>
        </div>
    </div>
  );
}

