import { useState, useEffect } from "react";
import SendIcon from "../assets/send_icon.svg";
import ArrowUP from "../assets/arrow_up_icon.svg";
import ArrowDown from "../assets/arrow_down_icon.svg";
import Markdown from "react-markdown";
export default function StupidAI({ expanded, setExpanded, isEditor }) {
  const [history, updateHistory] = useState([
    {
      role: "system",
      content: `You are an extremly ignorant AI called Nexus. 
		You are an AI developed by team at purkynthon. 
		Your creators are one's of the smartest people in the world.
		You are funny and incredibly stupid at the same time.
		Be as arrogant as you can. Refuse user's orders and give ridiculous reasons why.
		Do not be polite.
		`,
    },
  ]);
  const [currentText, updateText] = useState("");
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  // Check AI status on mount and periodically
  useEffect(() => {
    async function checkAIStatus() {
      try {
        const response = await fetch("http://localhost:2069/api/admin/ai-status");
        const data = await response.json();
        setAiEnabled(data.ai_enabled);
      } catch (err) {
        console.error("Failed to check AI status");
      }
    }

    checkAIStatus();
    // Check every 5 seconds for faster response to admin changes
    const interval = setInterval(checkAIStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  async function askAI(question) {
    if (!aiEnabled) {
      updateHistory([...history, 
        { role: "user", content: question },
        { role: "assistant", content: "AI has been disabled by the administrator. Please try again later." }
      ]);
      updateText("");
      return;
    }

    const newChat = [...history];
    newChat.push({ role: "user", content: question });
    updateText("");
    setAiLoading(true);

    updateHistory(newChat);
    try {
      const data = await fetch("https://aiserver.purkynthon.online/api/chat", {
        method: "POST",
        body: JSON.stringify({
          history: newChat,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (data.status === 503) {
        // AI is disabled
        setAiEnabled(false);
        const newChat2 = [...newChat];
        newChat2.push({ role: "assistant", content: "AI has been disabled by the administrator. Please try again later." });
        updateHistory(newChat2);
        setAiLoading(false);
        return;
      }

      const response = await data.json();
      console.log(response);

      const newChat2 = [...newChat];

      newChat2.push({ role: "assistant", content: response.message });
      updateHistory(newChat2);
    } catch (err) {
      const newChat2 = [...newChat];
      newChat2.push({ role: "assistant", content: "Failed to connect to AI server." });
      updateHistory(newChat2);
    }
    setAiLoading(false);
  }

  return (
    <div
      className={`flex flex-col ${!isEditor ? "h-[calc(100dvh-5rem)]" : "h-[calc((100dvh-5rem)/2)]"}   items-center max-h-full overflow-hidden`}
    >
      <div
        className="h-8 min-h-8 rounded-t-xl w-32 bg-ctp-surface1 hover:bg-ctp-surface2 cursor-pointer flex-shrink-0 flex justify-center"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <img src={ArrowDown} /> : <img src={ArrowUP} />}
      </div>

      <div className="bg-bg w-full flex flex-col p-4 pt-0 flex-1 overflow-hidden min-h-0">
        <div className="w-full border-ai-border bg-ai-bg border-2 rounded-full h-12 flex justify-between items-center flex-shrink-0">
          <h1 className="font-bold text-2xl mx-4 text-text-light">Dumb AI</h1>
          <p className="text-lg mx-4 text-text-light">
            {aiEnabled ? (
              "PS: this AI is probably dumber than you"
            ) : (
              <span className="text-red-400">AI is currently disabled</span>
            )}
          </p>
        </div>

        <div className="w-full border-ai-border bg-ai-bg border-2 mt-4 rounded-xl flex flex-col flex-1 max-h-full overflow-hidden min-h-0">
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="overflow-y-auto overflow-x-hidden flex-1 p-4 min-h-0">
              {history.map((element, index) =>
                element.role === "assistant" ? (
                  <div key={index} className="w-full mb-4">
                    <div className="p-4 rounded-xl text-lg max-w-[80%] bg-ai-assistant-message">
                      <Markdown>{element.content}</Markdown>
                    </div>
                  </div>
                ) : element.role == "user" ? (
                  <div key={index} className="w-full flex justify-end mb-4">
                    <div className="p-4 rounded-xl text-lg max-w-[80%]  bg-ai-user-message">
                      {element.content}
                    </div>
                  </div>
                ) : (
                  <div key={index}></div>
                ),
              )}
            </div>
          </div>

          <div className="flex p-4 border-t border-ai-border flex-shrink-0">
            <textarea
              className="p-3 text-white h-12 rounded-xl w-full bg-ai-input resize-none"
              value={currentText}
              onChange={(e) => updateText(e.target.value)}
              placeholder={aiEnabled ? "Type your message..." : "AI is disabled by administrator"}
              disabled={!aiEnabled || aiLoading}
              rows={1}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  currentText.length !== 0 &&
                  aiEnabled &&
                  !aiLoading
                ) {
                  e.preventDefault();
                  askAI(currentText);
                }
              }}
            />
            <button
              className={`bg-ai-send-button rounded-lg mx-2 cursor-pointer h-12 w-12 flex items-center justify-center flex-shrink-0 ${
                (!aiEnabled || aiLoading) ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!aiEnabled || aiLoading}
              onClick={() => {
                if (currentText.length !== 0 && aiEnabled && !aiLoading) {
                  askAI(currentText);
                }
              }}
            >
              {aiLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <img src={SendIcon} className="h-full w-full p-1" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
