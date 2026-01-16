import User from "../assets/user_icon.svg";
import Circle from "../assets/Circle.svg";
import { useState, useEffect, useCallback } from "react";
const leaderboard = [
  {
    name: "racek256",
    score: 265,
  },
  {
    name: "itsfimes",
    score: 245,
    active: true,
  },
  {
    name: "rakon",
    score: 324,
  },
  {
    name: "Martin40645",
    score: 234,
  },
];
//https://i.pinimg.com/originals/88/14/9b/88149b0400750578f4d07d9bc3fb0fee.gif
//https://media.tenor.com/JYyzR_1h77MAAAAi/angry-emoji.gif
export default function NextLevel({ hide, graph, tests, input, time, token, lessonNumber = 1, onLessonComplete }) {
  const [finished, setFinished] = useState(false);
  const [testSuccess, setTestSucces] = useState([]);
  const [finishTime] = useState(Date.now() - time);
  const [dataSent, setDataSent] = useState(false);

  const LeaderBoard = [...leaderboard]
    .sort((a, b) => a.score - b.score)
    .reverse();
  const [displayed, setDisplayed] = useState(false);
  const [closing, setClosing] = useState(false);
  const [correctness, setCorrectness] = useState(false);

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
	function scoreCalculator3000(){
		let score = 1000; 
		const seconds = finishTime/1000 
		score = score - seconds*2
		return Math.round(score)
	}

  useEffect(() => {
    async function runTest(input, output, index) {
      const graph_clone = JSON.parse(JSON.stringify(graph));

      const inputIndex = graph.nodes.findIndex((e) => e.type == "input");
      graph_clone.nodes[inputIndex].code = graph_clone.nodes[
        inputIndex
      ].code.replace("{original_input}", input);

      const data = await fetch("https://aiserver.purkynthon.online/run-graph", {
        method: "POST",
        body: JSON.stringify({
          graph: graph_clone,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const response = await data.json();

      // Create a copy of testSuccess array and update the specific index
      // Update state using functional updater to avoid stale closures
      setTestSucces((prev) => {
        const updated = [...prev];
        updated[index] =
          Number(response.returnValue.trim()) == Number(output.trim());
        // Log test result
        console.log(
          `Test number ${index + 1}: ${updated[index] ? "✅" : "❌"}`,
        );
        return updated;
      });

      return response;
    }

    // Run tests sequentially to ensure proper state updates
    async function runTests() {
      // Initialize testSuccess array with correct length
      const initialTests = Array(tests.length).fill(false);
      setTestSucces(initialTests);

      // Run tests one by one
      for (let i = 0; i < tests.length; i++) {
        await runTest(tests[i].input, tests[i].output, i);
      }
    }

    runTests();
  }, [tests]);

  useEffect(() => {
    if (testSuccess.length === tests.length && tests.length > 0) {
      const allPassed = testSuccess.every(Boolean);
      setCorrectness(allPassed);

      console.log("Final test results:", testSuccess);
      console.log("All correct:", allPassed);
      
      // Automatically send completion data when all tests pass
      if (allPassed && !dataSent) {
        SendData();
      }
    }
  }, [testSuccess, tests.length, dataSent]);


	async function SendData(){
		if (dataSent) return; // Prevent double submission
		setDataSent(true);
		
		// verify
		const user_data = await fetch(
          "https://aiserver.purkynthon.online/api/auth/verify",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ jwt_token: token }),
          },
        );
        const response = await user_data.json();

		// get user data - use the actual lesson number from props
		const data = JSON.stringify({
			user_id: response.user_id,
			score: scoreCalculator3000(),
			time: finishTime,
			lesson_id: lessonNumber
		})
		const lesson_data = await fetch("https://aiserver.purkynthon.online/api/auth/finished_lesson",
{
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: data,
          })
		const lessonResponse = await lesson_data.json();
		console.log(lessonResponse);
		
		return lessonResponse;
	}

  return (
    <div
      className={`w-screen ${displayed ? "opacity-100" : "opacity-0"} transition-all top-0 left-0 h-screen fixed backdrop-blur-xs  z-999`}
      onClick={handleBackdropClick}
    >
      <div
        className={`absolute ease-in-out  ${displayed ? "top-1/2 scale-100 opacity-100" : !displayed && !closing ? "scale-75 opacity-0 top-3/4" : "scale-75 opacity-0 top-1/4"} transition-all  left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 rounded-xl h-1/2 flex border border-white bg-bg`}
      >
        <div className="border border-white rounded-l-xl border-r w-11/16 h-full p-3">
          <div className="flex items-center">
            <img
              className="rounded-full bg-gray-500 m-3 h-24 w-24"
              src="https://i.pinimg.com/originals/88/14/9b/88149b0400750578f4d07d9bc3fb0fee.gif"
            />
            <div className="text-white text-3xl">
              Příště trochu rychleji jo?{" "}
            </div>
          </div>
          <div className="flex-col text-white h-full">
            <div className="flex border-white border-y text-3xl py-4 text-white overflow-x-auto">
              {testSuccess.length > 0 ? (
                <div className="flex flex-1 min-w-max gap-2 px-2">
                  {testSuccess.map((result, index) => (
                    <div
                      key={index}
                      className="flex-none text-center border-r border-white last:border-r-0 px-4 min-w-48"
                    >
                      Test {index + 1}: {result ? "✅" : "❌"}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 text-center">No tests run</div>
              )}
            </div>
            {correctness ? (
              <div>
                <div className="text-white text-3xl py-4 border-y border-white">
                  Čas:{" "}
                  {Math.floor(finishTime / 3600000) > 0
                    ? `${Math.floor(finishTime / 3600000)}h `
                    : ""}
                  {Math.floor((finishTime % 3600000) / 60000)}m{" "}
                  {Math.floor((finishTime % 60000) / 1000)}s
                </div>
                <div className="text-white text-3xl py-4 border-b border-white">
                  Skóre: {scoreCalculator3000()}
                </div>
              </div>
            ) : (
					<div className="flex items-center justify-center py-8"><div className="text-3xl">Looks like it wasn't quite right</div></div>
            )}
          </div>
        </div>
        <div className="border border-white border-l rounded-r-xl w-5/16  h-full flex-col p-2 overflow-y-hidden">
          <div className="h-7/8 overflow-y-auto">
            {LeaderBoard.map((e, i) => {
              return (
                <div
                  key={i}
                  className={`my-3 p-3 rounded-lg flex items-center justify-between ${e.active ? "bg-leaderboard-color-active" : "bg-leaderboard-color"}`}
                >
                  <div className="text-xl truncate">{`${i + 1}. ${e.name}`}</div>
                  <div className="text-xl">{e.score}</div>
                </div>
              );
            })}
          </div>
          <div className="flex-1">
            <button
              className="bg-button transition w-full h-12 rounded-md hover:bg-button-hover cursor-pointer text-xl"
              onClick={() => {
                if (correctness && onLessonComplete) {
                  onLessonComplete();
                }
                hideScreen();
              }}
            >
              {correctness ? "Next Level" : "Try Again"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
