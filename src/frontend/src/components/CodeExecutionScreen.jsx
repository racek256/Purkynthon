import Typewriter from "typewriter-effect";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const options = {
  delay: 10,
  cursor: "",
};
export default function Terminal({ hide, graph, input, activate }) {
  const { t } = useTranslation();
  const [displayOutput, setDisplayOutput] = useState(false);
  const [displayTerm, setDisplayTerm] = useState(false);
  const [output, setOutput] = useState();
  const [isCorrect, setIsCorrect] = useState(null);
  // State for terminal height - default to 1/3 of screen + 10px higher
  const [height, setHeight] = useState(37);
  // State for tracking resize drag
  const [isResizing, setIsResizing] = useState(false);
  // Refs for resizing functionality
  const terminalRef = useRef(null);
  const resizeStartY = useRef(0);
  const startHeight = useRef(0);

  useEffect(() => {
    setTimeout(() => {
      setDisplayTerm(true);
		activate(true)
    }, 1);
  }, []);

  useEffect(() => {
    async function processCode() {
		const graph_clone = JSON.parse(JSON.stringify(graph))

		console.log(graph.nodes)
      const inputIndex = graph.nodes.findIndex((e) => e.type == "input");
		console.log(inputIndex)
	  graph_clone.nodes[inputIndex].code = graph_clone.nodes[inputIndex].code.replace("{original_input}", input)
	console.log(`curr code: ${graph_clone.nodes[inputIndex].code}`)
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
      console.log(response);
		console.log(graph.nodes[0])
		
      return response;
    }

    async function some() {
      const data = await processCode();
      console.log(data);
      setOutput(data);
      
      // Check if verification passed (returnValue is "1")
      if (data?.returnValue) {
        const result = data.returnValue.trim();
        setIsCorrect(result === "1");
      }
    }
    some();
  }, []);

  // Resize handlers
  const startResize = (e) => {
    e.preventDefault();
    setIsResizing(true); // disable transition while dragging
    resizeStartY.current = e.clientY;
    startHeight.current = terminalRef.current
      ? terminalRef.current.getBoundingClientRect().height
      : window.innerHeight * (height / 100);

    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", stopResize);
  };

  const handleResize = (e) => {
    if (!terminalRef.current) return;

    const windowHeight = window.innerHeight;
    const deltaY = e.clientY - resizeStartY.current;
    const newHeightPx = startHeight.current - deltaY;
    const newHeightPercent = Math.max(
      10,
      Math.min(80, (newHeightPx / windowHeight) * 100),
    ); // Limit between 10% and 80%

    setHeight(newHeightPercent);
  };

  const stopResize = () => {
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", stopResize);
    setIsResizing(false); // re‑enable transition after drag
  };

  return (
    <div
      ref={terminalRef}
className={`overflow-y-auto absolute bottom-0 left-0 w-full z-9999 ${
          displayTerm ? "py-2" : "h-0 py-0"
        } ${isResizing ? "transition-none" : "ease-in-out transition-200 transition-all"} flex border-t border-border bg-runner-bg px-4 flex-col`}
      style={{ height: displayTerm ? `${height}vh` : "0px" }}
    >
      {/* Resize handle - placed at the top of the terminal */}
      <div
        className="w-full h-2 cursor-row-resize hover:bg-ctp-surface1 transition-colors mt-[-8px]"
        onMouseDown={startResize}
      >
        <div className="w-full h-1 flex justify-center">
          <div className="w-full h-0.5 bg-transparent hover:bg-ctp-overlay2 opacity-0 hover:opacity-100 transition-all"></div>
        </div>
      </div>

      <Typewriter
        className="text-3xl my-2 text-white"
        wrapperClassName="text-white text-3xl"
        options={options}
        onInit={(typewriter) => {
          const loadingMessages = t('codeExecution.loadingMessages', { returnObjects: true });
          typewriter
            .typeString(
              `<span class="text-3xl my-2 text-white" > ${loadingMessages[Math.round(Math.random() * (loadingMessages.length - 1))]}...</span>`,
            )
            .pauseFor(1000)
            .callFunction(() => {
              console.log("String typed out!");
              setDisplayOutput(true);
            })
            .start();
        }}
      />
      {output?.logs ? (
        <>
          <p
            className={`text-gray-300 text-3xl  ${!displayOutput ? "opacity-0" : "opacity-100"} my-2`}
          >
            {t('codeExecution.logs')}
          </p>
          <p
            className={`bg-runner-output transition-400 ${!displayOutput ? "opacity-0" : "opacity-100"} max-h-32 h-max overflow-y-auto  transition-all rounded-xl p-4 text-runner-text`}
          >
            {output.logs.split("\n").filter((line, i, arr) => i !== arr.length - 1 || (line.trim() !== "1" && line.trim() !== "0")).map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </p>
        </>
      ) : (
        <></>
      )}
      
      {/* Verification Result */}
      {displayOutput && isCorrect !== null && (
        <div className={`flex items-center gap-3 my-4 p-4 rounded-xl ${isCorrect ? "bg-green-500/20 border border-green-500" : "bg-red-500/20 border border-red-500"}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCorrect ? "bg-green-500" : "bg-red-500"}`}>
            {isCorrect ? (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <span className={`text-2xl font-bold ${isCorrect ? "text-green-400" : "text-red-400"}`}>
            {isCorrect ? t('codeExecution.correct') : t('codeExecution.incorrect')}
          </span>
        </div>
      )}

      <button
        className="bg-button absolute right-5 top-5  w-max p-4 m-2  flex items-center  transition   rounded-xl hover:bg-button-hover cursor-pointer text-xl"
        onClick={() => {
          setDisplayTerm(false);
          setTimeout(() => {
            hide();
          }, 200);
        }}
      >
        {t('codeExecution.close')}
      </button>
    </div>
  );
}
