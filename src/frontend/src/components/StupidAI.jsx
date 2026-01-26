import { useState } from "react";
import SendIcon from "../assets/send_icon.svg";
import ArrowUP from "../assets/arrow_up_icon.svg";
import ArrowDown from "../assets/arrow_down_icon.svg";
import Markdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { useCookies } from "react-cookie";
export default function StupidAI({ expanded, setExpanded, isEditor }) {
  const { t } = useTranslation();
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
  const [isLoading, setIsLoading] = useState(false);
  const [cookies] = useCookies(["session"]);
  const token = cookies?.session?.token;
  async function askAI(question) {
    const newChat = [...history, { role: "user", content: question }];
    updateText("");
    setIsLoading(true);

    updateHistory(newChat);

    const system = history[0];
    const recent = newChat.slice(-5);
    const payloadHistory = system ? [system, ...recent] : recent;

    const res = await fetch("https://aiserver.purkynthon.online/api/chat", {
      method: "POST",
      body: JSON.stringify({ history: payloadHistory }),
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.message || err.detail || "Request failed";
      setIsLoading(false);
      updateHistory([...newChat, { role: "assistant", content: msg }]);
      return;
    }

    const ct = res.headers.get("content-type") || "";

    if (!ct.includes("text/event-stream")) {
      const data = await res.json();
      setIsLoading(false);
      updateHistory([
        ...newChat,
        {
          role: "assistant",
          content: data.message || ""
        }
      ]);
      return;
    }

    if (!res.body) {
      setIsLoading(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let streamingStarted = false;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";

      for (const part of parts) {
        if (part.startsWith("data: ")) {
          const payload = JSON.parse(part.slice(6));
          const chunk = payload.message || "";
          const isFirstChunk = !streamingStarted;
          if (isFirstChunk) {
            setIsLoading(false);
            streamingStarted = true;
          }

          updateHistory((prev) => {
            if (isFirstChunk) {
              return [...newChat, { role: "assistant", content: chunk }];
            }
            const next = [...prev];
            const last = next.length - 1;
            next[last] = {
              ...next[last],
              content: next[last].content + chunk
            };
            return next;
          });
        }
      }
    }
    setIsLoading(false);
  }
  return (
    <div className="flex h-full flex-col items-center overflow-hidden">
      <div
        className="h-8 min-h-8 rounded-t-xl w-32 bg-ctp-surface1 hover:bg-ctp-surface2 cursor-pointer flex-shrink-0 flex justify-center"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <img src={ArrowDown} /> : <img src={ArrowUP} />}
      </div>

      <div className="bg-bg w-full flex flex-col p-4 pt-0 flex-1 overflow-hidden min-h-0">
        <div className="w-full border-ai-border bg-ai-bg border-2 rounded-full h-12 flex justify-between items-center flex-shrink-0">
          <h1 className="font-bold text-2xl mx-4 text-text-light">{t('stupidAI.title')}</h1>
          <p className="text-m mx-4 text-text-light italic">
            {t('stupidAI.subtitle')}
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
              {isLoading ? (
                <div className="w-full mb-4">
                  <div className="p-4 rounded-xl text-lg max-w-[80%] bg-ai-assistant-message">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-text-light animate-pulse" />
                      <span className="inline-block h-2 w-2 rounded-full bg-text-light animate-pulse" />
                      <span className="inline-block h-2 w-2 rounded-full bg-text-light animate-pulse" />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex p-4 border-t border-ai-border flex-shrink-0">
            <textarea
              className="p-3  h-12 rounded-xl w-full bg-ai-input resize-none text-black"
              value={currentText}
              onChange={(e) => updateText(e.target.value)}
              placeholder={t('stupidAI.placeholder')}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (currentText.trim().length !== 0) {
                    askAI(currentText);
                  }
                }
              }}
            />
            <button
              className="bg-ai-send-button rounded-lg mx-2 cursor-pointer h-12 w-12 flex items-center justify-center flex-shrink-0"
              onClick={() => {
                if (currentText.trim().length !== 0) {
                  askAI(currentText);
                }
              }}
            >
              <img src={SendIcon} className="h-full w-full p-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
