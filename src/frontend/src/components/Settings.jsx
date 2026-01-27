import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

export default function Settings({ hide, theme, selectTheme, logout, onEndGame }) {
  const { t, i18n } = useTranslation();
  const [displayed, setDisplayed] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [confirmError, setConfirmError] = useState(false);

  // Get current language from i18n
  const [language, setLanguage] = useState(i18n.language);

  // Function to change language
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
    // Store language preference in cookie
    document.cookie = `language=${lng}; path=/; max-age=${1000000 * 3600}`;
  };

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
    if (e.target === e.currentTarget && !showConfirmDialog) {
      hideScreen();
    }
  };

  const handleEndDrive = () => {
    setShowConfirmDialog(true);
    setConfirmText("");
    setConfirmError(false);
  };

  const handleConfirmEndGame = () => {
    if (confirmText === "Purkiáda") {
      setShowConfirmDialog(false);
      hideScreen();
      if (onEndGame) {
        onEndGame();
      }
    } else {
      setConfirmError(true);
    }
  };

  const handleCancelEndGame = () => {
    setShowConfirmDialog(false);
    setConfirmText("");
    setConfirmError(false);
  };

  return (
    <div
      className={`fixed top-0 left-0 w-screen h-screen z-999 backdrop-blur-xs transition-opacity
        ${displayed ? "opacity-100" : "opacity-0"}`}
      onClick={handleBackdropClick}
    >
<div
         className={`absolute left-1/2 top-1/2 w-[650px] h-[450px] bg-bg border border-white rounded-xl
           transition-all ease-in-out
           ${displayed
             ? "opacity-100 scale-100 -translate-x-1/2 -translate-y-1/2"
             : closing
             ? "opacity-0 scale-75 -translate-x-1/2 -translate-y-3/4"
             : "opacity-0 scale-75 -translate-x-1/2 -translate-y-1/4"
           }`}
>
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-white">{t('settings.title')}</h2>
            
            <div className="mb-6">
              <label className="block text-white mb-3 text-lg font-semibold">{t('settings.theme')}</label>
              <select
                className="bg-sidebar-theme-selector shadow-xl p-3 rounded-lg text-lg w-48 cursor-pointer"
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

            <div className="mb-6">
              <label className="block text-white mb-3 text-lg font-semibold">{t('settings.language')}</label>
              <select
                className="bg-sidebar-theme-selector shadow-xl p-3 rounded-lg text-lg w-48 cursor-pointer"
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
              >
                <option value="en">🇬🇧 {t('settings.languages.en')}</option>
                <option value="cs">🇨🇿 {t('settings.languages.cs')}</option>
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
	  {t('settings.logout')}
          </button>
          
          <button
            className="absolute bottom-4 left-28 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors"
            onClick={handleEndDrive}
          >
            {t('settings.endDrive')}
          </button>
          
          <button
            className="absolute bottom-4 right-4 bg-button px-6 py-2 rounded-md hover:bg-button-hover"
            onClick={hideScreen}
          >
            {t('settings.close')}
          </button>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] bg-bg border-2 border-orange-500 rounded-xl p-6 shadow-2xl z-10">
            <h3 className="text-xl font-bold mb-4 text-white">{t('settings.endDriveConfirm.title')}</h3>
            <p className="text-white mb-2">{t('settings.endDriveConfirm.message')}</p>
            <p className="text-orange-400 font-bold text-lg mb-4">Purkiáda</p>
            
            <input
              type="text"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setConfirmError(false);
              }}
              placeholder={t('settings.endDriveConfirm.placeholder')}
              className="w-full bg-sidebar-theme-selector text-white p-3 rounded-lg mb-2 border border-gray-600 focus:border-orange-500 focus:outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirmEndGame();
                } else if (e.key === "Escape") {
                  handleCancelEndGame();
                }
              }}
            />
            
            {confirmError && (
              <p className="text-red-500 text-sm mb-4">
                {t('settings.endDriveConfirm.errorMessage')} <span className="font-bold">Purkiáda</span>
              </p>
            )}
            
            <div className="flex gap-3 mt-4">
              <button
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                onClick={handleCancelEndGame}
              >
                {t('settings.endDriveConfirm.cancel')}
              </button>
              <button
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors"
                onClick={handleConfirmEndGame}
              >
                {t('settings.endDriveConfirm.confirm')}
              </button>
            </div>
          </div>
        )}
    </div>
  );
}

