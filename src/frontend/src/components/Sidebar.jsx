import UserIcon from "../assets/user_icon.svg";
import SettingsIcon from "../assets/settings_icon.svg";
import { useState } from "react";
import Settings from "./Settings.jsx";

export default function Sidebar({ selectTheme, theme, logout, lessonNumber = 1, userName = "User" }) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 z-50">
      <div className="bg-sidebar-profile-bar-bg h-24 w-96 rounded-tr-lg p-2 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <img src={UserIcon} className="w-8 h-8" />
          <div className="flex flex-col">
            <span className="font-bold text-2xl truncate">
              {userName}
            </span>
            <p>Lekce {lessonNumber}</p>
          </div>
        </div>
        <button 
          type="button" 
          className="p-3 rounded-lg hover:bg-button-hover transition" 
          aria-label="Settings"
          onClick={() => setShowSettings(true)}
        >
          <img src={SettingsIcon} alt="Settings" className="w-7 h-7" />
        </button>
      </div>

      {showSettings && (
        <Settings 
		  logout={logout}
          hide={() => setShowSettings(false)} 
          theme={theme}
          selectTheme={selectTheme}
        />
      )}
    </div>
  );
}

