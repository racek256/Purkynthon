import User from "../assets/user_icon.svg";
import Circle from "../assets/Circle.svg";
import { useState } from "react";
import { useEffect } from "react";
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
export default function NextLevel({ hide, graph, tests, input }) {
  const [finished, setFinished] = useState(false);
  const [testSuccess, setTestSucces] = useState([]);

  console.log(tests);

  console.log(tests);
  const LeaderBoard = [...leaderboard]
    .sort((a, b) => a.score - b.score)
    .reverse();
  const [displayed, setDisplayed] = useState(false);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (!closing) {
      setTimeout(() => {
        setDisplayed(true);
      }, 10);
      setTimeout(() => {
        setClosing(true);
      }, 150);
    }
  });
  function hideScreen() {
    setDisplayed(false);
    setTimeout(() => {
      hide();
    }, 150);
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
        setTestSucces(prev => {
          const updated = [...prev];
          updated[index] = Number(response.returnValue.trim()) == Number(output.trim());
          // Log test result
          console.log(`Test number ${index + 1}: ${updated[index] ? 'success' : 'failed'}`);
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
  return (
    <div
      className={`w-screen ${displayed ? "opacity-100" : "opacity-0"} transition-all top-0 left-0 h-screen fixed backdrop-blur-xs  z-999`}
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
             <div className="flex-col text-white">
             <div className="flex border-white border-y text-3xl py-4 text-white overflow-x-auto">
               {testSuccess.length > 0 ? (
                 <div className="flex flex-1 min-w-max gap-2 px-2">
                   {testSuccess.map((result, index) => (
                     <div key={index} className="flex-none text-center border-r border-white last:border-r-0 px-4 min-w-48">
                       Test {index + 1}: {result ? "success" : "failed"}
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="flex-1 text-center">No tests run</div>
               )}
             </div>
            <div className="text-white text-3xl py-4 border-b border-white">
              Skóre: 465
            </div>
            <div className="text-white text-3xl py-4 ">Peníze: 543</div>
            <div className="text-white text-3xl py-4 border-y border-white">
              Čas: 5m 36s
            </div>
          </div>
        </div>
        <div className="border border-white border-l rounded-r-xl w-5/16  h-full flex-col p-2 overflow-y-hidden">
          <div className="h-7/8 overflow-y-auto">
            {LeaderBoard.map((e, i) => {
              return (
                <div key={i} className="my-3 relative ">
                  <div className="flex flex-col">
                    {e.active ? (
                      <div>
                        <div className="w-full h-3 p-0 rounded-xl bg-leaderboard-color-active"></div>
                        <div className="w-full h-3 p-0 rounded-xl bg-leaderboard-color-active"></div>
                        <div className="w-full h-3 p-0 rounded-xl bg-leaderboard-color-active"></div>
                        <div className="w-full h-3 p-0 rounded-xl bg-leaderboard-color-active"></div>
                      </div>
                    ) : (
                      <div>
                        <div className="w-full h-3 p-0 rounded-xl bg-leaderboard-color"></div>
                        <div className="w-full h-3 p-0 rounded-xl bg-leaderboard-color"></div>
                        <div className="w-full h-3 p-0 rounded-xl bg-leaderboard-color"></div>
                        <div className="w-full h-3 p-0 rounded-xl bg-leaderboard-color"></div>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center mx-4 justify-between">
                    <div className="text-xl truncate">{`${i + 1}. ${e.name}`}</div>
                    <div className="text-xl">{e.score}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex-1">
            <button
              className="bg-button transition w-full h-12 rounded-md hover:bg-button-hover cursor-pointer text-xl"
              onClick={() => {
                hideScreen();
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
