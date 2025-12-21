import UserIcon from "../assets/user_icon.svg";
import SettingsIcon from "../assets/settings_icon.svg";
import Editor from "@monaco-editor/react";
import { useState } from "react";
import Settings from "./Settings.jsx";

export default function Sidebar({ selectTheme, theme }) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="w-5/32 min-w-42 h-dvh border-r border-border bg-sidebar-bg flex flex-col justify-between">
      <div />

      <div className="bg-sidebar-profile-bar-bg h-24 w-full rounded-t-lg p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <img src={UserIcon} className="w-8 h-8" />
            <span className="font-bold text-2xl truncate">
              František Pátek
            </span>
          </div>
        </div>
        <div className="flex justify-between items-end">
          <p className="w-full">Lekce 1</p>
        </div>
        <div className="flex justify-end -mt-3">
          <button 
            type="button" 
            className="p-2 rounded-lg hover:bg-button-hover transition" 
            aria-label="Settings"
            onClick={() => setShowSettings(true)}
          >
            <img src={SettingsIcon} alt="Settings" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showSettings && (
        <Settings 
          hide={() => setShowSettings(false)} 
          theme={theme}
          selectTheme={selectTheme}
        />
      )}
    </div>
  );
}

