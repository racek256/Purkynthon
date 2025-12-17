import User from "../assets/user_icon.svg";
import { useState } from "react";

export default function Navbar({name,description,creatorMode,onNameChange,onDescriptionChange}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [tempDescription, setTempDescription] = useState(description);

  const handleNameDoubleClick = () => {
    if (creatorMode) {
      setIsEditingName(true);
      setTempName(name);
    }
  };

  const handleDescriptionDoubleClick = () => {
    if (creatorMode) {
      setIsEditingDescription(true);
      setTempDescription(description);
    }
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (onNameChange && tempName.trim()) {
      onNameChange(tempName.trim());
    }
  };

  const handleDescriptionBlur = () => {
    setIsEditingDescription(false);
    if (onDescriptionChange && tempDescription.trim()) {
      onDescriptionChange(tempDescription.trim());
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
      setTempName(name);
    }
  };

  const handleDescriptionKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleDescriptionBlur();
    } else if (e.key === 'Escape') {
      setIsEditingDescription(false);
      setTempDescription(description);
    }
  };

  return (
    <div className="h-24  border-b  border-border w-full flex bg-bg">
      <div className="h-full w-5/8 border-r border-border">
        {isEditingName && creatorMode ? (
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            autoFocus
            className="text-xl text-text-light p-2 pb-0 bg-transparent border border-border rounded w-full"
          />
        ) : (
          <h1 
            className={`text-xl text-text-light p-2 pb-0 ${creatorMode ? 'cursor-text hover:bg-bg-hover' : ''}`}
            onDoubleClick={handleNameDoubleClick}
          >
            {name}
          </h1>
        )}
        
        {isEditingDescription && creatorMode ? (
          <textarea
            value={tempDescription}
            onChange={(e) => setTempDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            onKeyDown={handleDescriptionKeyDown}
            autoFocus
            className="p-2 text-lg text-text-light bg-transparent border border-border rounded w-full resize-none"
            rows={2}
          />
        ) : (
          <p 
            className={`p-2 text-lg text-text-light ${creatorMode ? 'cursor-text hover:bg-bg-hover' : ''}`}
            onDoubleClick={handleDescriptionDoubleClick}
          >
            {description}
          </p>
        )}
      </div>
      <div className="flex">
        <img className="rounded-full p-2" src={User} />
        <div>
          <h1 className="text-text-light text-xl p-2 pb-0">Zaměstnavatel</h1>
          <div className="rounded-xl border-3 border-black h-6 w-64 m-2 overflow-hidden relative">
            <div className="w-1/2 bg-gradient-to-r from-ctp-green-600 to-ctp-red-900 h-full "></div>
          </div>
        </div>
      </div>
    </div>
  );
}
