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
    <div className="h-24  border-b  border-border w-full flex justify-between bg-bg overflow-hidden">
      <div className="h-full min-w-0 flex-1">
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
    </div>
  );
}
