import { useState, useEffect, useRef } from "react";

function Toast({ message, onClose, onDismiss, duration = 10000 }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!message) return;

    startTimeRef.current = Date.now();

    // Progress bar animation using requestAnimationFrame for smooth updates
    const animationFrame = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining > 0) {
        animationFrameRef.current = requestAnimationFrame(animationFrame);
      } else {
        handleExpire();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animationFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [message, duration]);

  function handleExpire() {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onDismiss) onDismiss(); // Clear announcement on server when expired
      if (onClose) onClose();
    }, 300);
  }

  function handleClose() {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  }

  if (!isVisible || !message) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 w-80 transition-all duration-300 ${
        isLeaving ? "opacity-0 translate-x-full" : "opacity-100 translate-x-0"
      }`}
    >
      <div className="bg-login-popup border border-blue-500/50 rounded-xl shadow-lg overflow-hidden">
        {/* Message */}
        <div className="p-4 flex items-start gap-3">
          <p className="text-text-dark flex-1">{message}</p>
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-text-dark/60 hover:text-text-dark transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-700/50">
          <div
            className="h-full bg-blue-500"
            style={{ 
              width: `${progress}%`,
              transition: 'none'
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Toast;
