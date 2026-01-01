import UserIcon from "../assets/user_icon.svg";
import SettingsIcon from "../assets/settings_icon.svg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Settings from "./Settings.jsx";

export default function Sidebar({ selectTheme, theme, logout, userInfo }) {
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();
  
  const isAdmin = userInfo?.role === "admin";
  const isTester = userInfo?.role === "tester";

  return (
    <div className="fixed bottom-0 left-0 z-50">
      {/* Admin Panel Button - only show for admin */}
      {isAdmin && (
        <button
          onClick={() => navigate("/admin")}
          className="bg-sidebar-profile-bar-bg w-96 py-2 px-4 rounded-tr-lg mb-0 hover:bg-ctp-surface2 transition-all flex items-center gap-2 border-b border-white/10"
        >
          <span className="text-lg">Admin Panel</span>
        </button>
      )}
      
      <div className="bg-sidebar-profile-bar-bg h-24 w-96 rounded-tr-lg p-2 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <img src={UserIcon} className="w-8 h-8" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-2xl truncate">
                {userInfo?.username || "Loading..."}
              </span>
              {isAdmin && (
                <span className="text-xs px-2 py-0.5 rounded bg-red-500/30 text-red-300">
                  admin
                </span>
              )}
              {isTester && (
                <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/30 text-yellow-300">
                  tester
                </span>
              )}
            </div>
            <p>Lekce 1</p>
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

