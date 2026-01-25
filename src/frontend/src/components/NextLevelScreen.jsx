import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

export default function NextLevel({ hide, graph, input, time, token, lessonNumber = 1, onLessonComplete }) {
  const { t } = useTranslation();
  const [finishTime] = useState(Date.now() - time);
  const [dataSent, setDataSent] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [displayed, setDisplayed] = useState(false);
  const [closing, setClosing] = useState(false);
  const [correctness, setCorrectness] = useState(null); // null = loading, true = correct, false = wrong
  const [isLoading, setIsLoading] = useState(true);

  function hideScreen() {
    setDisplayed(false);
    setTimeout(() => {
      hide();
    }, 150);
  }

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      hideScreen();
    }
  }, []);

  useEffect(() => {
    if (!closing) {
      setTimeout(() => {
        setDisplayed(true);
      }, 10);
      setTimeout(() => {
        setClosing(true);
      }, 150);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      hideScreen();
    }
  };

  function scoreCalculator3000() {
    let score = 1000;
    const seconds = finishTime / 1000;
    score = score - seconds * 2;
    return Math.max(0, Math.round(score));
  }

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch("https://aiserver.purkynthon.online/api/auth/leaderboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.success && data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    }
  }, []);

  const getCurrentUser = useCallback(async () => {
    try {
      const response = await fetch("https://aiserver.purkynthon.online/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jwt_token: token }),
      });
      const data = await response.json();
      if (data.success) {
        setCurrentUserId(data.user_id);
      }
    } catch (error) {
      console.error("Failed to get current user:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchLeaderboard();
    getCurrentUser();
  }, [fetchLeaderboard, getCurrentUser]);

  // Run verification
  useEffect(() => {
    async function runVerification() {
      try {
        const graph_clone = JSON.parse(JSON.stringify(graph));
        const inputIndex = graph.nodes.findIndex((e) => e.type == "input");
        graph_clone.nodes[inputIndex].code = graph_clone.nodes[inputIndex].code.replace("{original_input}", input);

        const response = await fetch("https://aiserver.purkynthon.online/run-graph", {
          method: "POST",
          body: JSON.stringify({
            graph: graph_clone,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        console.log("Verification response:", data);

        // Check if returnValue is "1" (correct)
        if (data?.returnValue) {
          const result = data.returnValue.trim();
          const isCorrect = result === "1";
          setCorrectness(isCorrect);

          // Send data if correct
          if (isCorrect && !dataSent) {
            SendData();
          }
        } else {
          setCorrectness(false);
        }
      } catch (error) {
        console.error("Verification failed:", error);
        setCorrectness(false);
      } finally {
        setIsLoading(false);
      }
    }

    runVerification();
  }, [graph, input]);

  async function SendData() {
    if (dataSent) return;
    setDataSent(true);

    try {
      const user_data = await fetch("https://aiserver.purkynthon.online/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jwt_token: token }),
      });
      const response = await user_data.json();

      const data = JSON.stringify({
        user_id: response.user_id,
        score: scoreCalculator3000(),
        time: finishTime,
        lesson_id: lessonNumber,
      });

      const lesson_data = await fetch("https://aiserver.purkynthon.online/api/auth/finished_lesson", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
      });
      const lessonResponse = await lesson_data.json();
      console.log("Lesson completion response:", lessonResponse);

      await fetchLeaderboard();

      return lessonResponse;
    } catch (error) {
      console.error("Failed to send completion data:", error);
    }
  }

  const sortedLeaderboard = [...leaderboard].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div
      className={`w-screen ${displayed ? "opacity-100" : "opacity-0"} transition-all top-0 left-0 h-screen fixed backdrop-blur-xs z-999`}
      onClick={handleBackdropClick}
    >
      <div
        className={`absolute ease-in-out ${displayed ? "top-1/2 scale-100 opacity-100" : !displayed && !closing ? "scale-75 opacity-0 top-3/4" : "scale-75 opacity-0 top-1/4"} transition-all left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 rounded-xl h-1/2 flex border border-white bg-bg`}
      >
        <div className="border border-white rounded-l-xl border-r w-11/16 h-full p-3">
          <div className="flex items-center">
            <img
              className="rounded-full bg-gray-500 m-3 h-24 w-24"
              src={correctness ? "https://i.pinimg.com/originals/88/14/9b/88149b0400750578f4d07d9bc3fb0fee.gif" : "https://media.tenor.com/JYyzR_1h77MAAAAi/angry-emoji.gif"}
            />
            <div className="text-white text-3xl">
              {isLoading ? t('nextLevel.verifying') : correctness ? t('nextLevel.greatWork') : t('nextLevel.tryAgain')}
            </div>
          </div>
          <div className="flex-col text-white h-full">
            {/* Verification Result */}
            <div className="flex border-white border-y text-3xl py-4 text-white overflow-x-auto">
              {isLoading ? (
                <div className="flex-1 text-center">{t('nextLevel.verifying')}</div>
              ) : (
                <div className={`flex-1 text-center flex items-center justify-center gap-3 ${correctness ? "text-green-400" : "text-red-400"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${correctness ? "bg-green-500" : "bg-red-500"}`}>
                    {correctness ? (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  {correctness ? t('nextLevel.correct') : t('nextLevel.wrong')}
                </div>
              )}
            </div>
            {correctness ? (
              <div>
                <div className="text-white text-3xl py-4 border-y border-white">
                  {t('nextLevel.time')}{" "}
                  {Math.floor(finishTime / 3600000) > 0 ? `${Math.floor(finishTime / 3600000)}h ` : ""}
                  {Math.floor((finishTime % 3600000) / 60000)}m {Math.floor((finishTime % 60000) / 1000)}s
                </div>
                <div className="text-white text-3xl py-4 border-b border-white">{t('nextLevel.score')}: {scoreCalculator3000()}</div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-3xl">{isLoading ? "" : t('nextLevel.solutionIncorrect')}</div>
              </div>
            )}
          </div>
        </div>
        <div className="border border-white border-l rounded-r-xl w-5/16 h-full flex-col p-2 overflow-y-hidden">
          <div className="text-white text-xl font-bold mb-2 px-2">{t('nextLevel.leaderboard')}</div>
          <div className="h-[calc(100%-6rem)] overflow-y-auto">
            {sortedLeaderboard.length > 0 ? (
              sortedLeaderboard.map((e, i) => {
                const isCurrentUser = e.user_id === currentUserId || e.id === currentUserId;
                return (
                  <div
                    key={e.user_id || e.id || i}
                    className={`my-2 p-3 rounded-lg flex items-center justify-between ${isCurrentUser ? "bg-leaderboard-color-active" : "bg-leaderboard-color"}`}
                  >
                    <div className="text-xl truncate">{`${i + 1}. ${e.username || e.name}`}</div>
                    <div className="text-xl">{e.score || 0}</div>
                  </div>
                );
              })
            ) : (
              <div className="text-white text-center py-4">{t('nextLevel.loading')}</div>
            )}
          </div>
          <div className="flex-1 mt-2">
            <button
              className="bg-button transition w-full h-12 rounded-md hover:bg-button-hover cursor-pointer text-xl"
              onClick={() => {
                if (correctness && onLessonComplete) {
                  onLessonComplete();
                }
                hideScreen();
              }}
            >
              {correctness ? t('nextLevel.nextLevel') : t('nextLevel.tryAgainButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
