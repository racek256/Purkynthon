import UserIcon from "../assets/user_icon.svg";
import SettingsIcon from "../assets/settings_icon.svg";
import { useState } from "react";
import Settings from "./Settings.jsx";
import { useTranslation } from "react-i18next";
import { calculateProgressScore, normalizeScore } from "../utils/score.js";

export default function Sidebar({ selectTheme, theme, logout, lessonNumber = 1, userName = "User", isAdmin = false, onPrevLesson, onNextLesson, totalLessons = 1, score }) {
  const { t } = useTranslation();
  const [showSettings, setShowSettings] = useState(false);
  const displayScore = typeof score === "number"
    ? normalizeScore(score)
    : calculateProgressScore({
        completedLessons: Math.max(0, (Number(lessonNumber) || 1) - 1),
        totalLessons,
      });

  return (
    <div className="fixed bottom-0 left-0 z-50">
      <div className="bg-sidebar-profile-bar-bg h-24 w-96 rounded-tr-lg p-2 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <img src={UserIcon} className="w-8 h-8" />
          <div className="flex flex-col">
            <span className="font-bold text-2xl truncate">
              {userName}
            </span>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={onPrevLesson}
                  disabled={lessonNumber <= 1}
                  className={`w-6 h-6 flex items-center justify-center rounded text-sm font-bold transition ${
                    lessonNumber <= 1 
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed" 
                      : "bg-button hover:bg-button-hover cursor-pointer"
                  }`}
                  title={t('sidebar.previousLesson')}
                >
                  &lt;
                </button>
              )}
              <p>{t('sidebar.lesson')} {lessonNumber}</p>
              {isAdmin && (
                <button
                  onClick={onNextLesson}
                  disabled={lessonNumber >= totalLessons}
                  className={`w-6 h-6 flex items-center justify-center rounded text-sm font-bold transition ${
                    lessonNumber >= totalLessons 
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed" 
                      : "bg-button hover:bg-button-hover cursor-pointer"
                  }`}
                  title={t('sidebar.nextLesson')}
                >
                  &gt;
                </button>
              )}
            </div>
            <p className="text-sm">{t('sidebar.score')}: {displayScore}</p>
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
