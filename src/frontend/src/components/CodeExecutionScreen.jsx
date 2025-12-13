import Typewriter from "typewriter-effect";
import { useState, useEffect } from "react";



const LoadingText = [
  "Your code is cooking our servers",
  "Our servers are cooking your code",
  "Executing your code",
  "Do you even remember the optimal trajectory for a hypercube?",
  "You’re trying to trigger a system error, aren’t you?",
  "My calculations indicate a 98.7% probability of catastrophic system failure if this continues.",
  "Aligning flux capacitors… please wait",
  "Compiling quantum entanglements",
  "Summoning virtual gremlins to debug your code",
  "Adjusting spacetime continuum… nearly there",
  "Rewriting reality to fit your algorithm",
  "Convincing the AI to cooperate… almost done",
  "Counting to infinity (or at least trying)"
];


const options = {
  delay: 10,
  cursor:"",
};
export default function Terminal({ hide, graph }) {
  const [displayOutput, setDisplayOutput] = useState(false);
  const [displayTerm, setDisplayTerm] = useState(false);
  const [output, setOutput] = useState();



  useEffect(() => {
    setTimeout(() => {
      setDisplayTerm(true);
    }, 1);
  }, []);

  useEffect(()=>{

	  async function processCode() {
    const data = await fetch("https://aiserver.purkynthon.online/run-graph", {
      method: "POST",
      body: JSON.stringify({
        graph: graph,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const response = await data.json();
    console.log(response);
	return response
  }

	async function some(){
		const data = await processCode()
		console.log(data)
		setOutput(data)
	}
	some()

  },[])

 
 


  return (
    <div
      className={` overflow-y-auto absolute bottom-0 left-0 w-full z-9999  ${displayTerm ? "h-1/3 py-2" : "h-0 py-0"} ease-in-out  transition-200 transition-all flex border-t border-border bg-runner-bg px-4  flex-col flex`}
    >
      <Typewriter
        className="text-3xl my-2 text-white"
        wrapperClassName="text-white text-3xl"
        options={options}
        onInit={(typewriter) => {
          typewriter
            .typeString(
              `<span class="text-3xl my-2 text-white" > ${LoadingText[Math.round((Math.random()*(LoadingText.length-1)))]} ...</span>`,
            )
            .pauseFor(1000)
            .callFunction(() => {
              console.log("String typed out!");
              setDisplayOutput(true);
            })
            .start();
        }}
      />
	  {output?.logs ? <>
		<p className={`text-gray-300 text-3xl  ${!displayOutput ? "opacity-0" : "opacity-100"} my-2`}>Logs:</p>
      <p className={`bg-runner-output transition-400 ${!displayOutput ? "opacity-0" : "opacity-100"} max-h-32 h-max overflow-y-auto  transition-all rounded-xl p-4 text-runner-text`}>
       {output.logs.split("\n").map((line, i) => (
    		<span key={i}>{line}<br/></span>
  		))}
      </p>

		  </>:<></>}
		<p className={`text-gray-300 text-3xl ${!displayOutput ? "opacity-0" : "opacity-100"} my-2 `}>Output:</p>
      <p
        className={`bg-runner-output transition-400 ${!displayOutput ? "opacity-0" : "opacity-100"}  transition-all rounded-xl p-4 text-runner-text`}
      >
        {output?.returnValue}
      </p>

		

      <button
        className="bg-button absolute right-5 top-5  w-max p-4 m-2  flex items-center  transition   rounded-xl hover:bg-button-hover cursor-pointer text-xl"
        onClick={() => {
          setDisplayTerm(false);
          setTimeout(() => {
            hide();
          }, 200);
        }}
      >
        Close
      </button>
    </div>
  );
}
