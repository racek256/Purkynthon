import Typewriter from 'typewriter-effect';
import { useState } from 'react';

const options = {
	delay:10,
}
export default function Terminal({hide}){
	const [displayOutput, setDisplayOutput] = useState(false);
	return(
		<div className="w-screen top-0 left-0 h-screen fixed backdrop-blur-xs  z-999">
			
			<div className="absolute  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 rounded-xl h-1/2 flex border border-runner-border bg-runner-bg px-4 py-2 flex-col flex"	>
		<Typewriter className="text-3xl my-2 text-white" wrapperClassName="text-white text-3xl" 

		options={options}
  onInit={(typewriter) => {
    typewriter.typeString('<span class="text-3xl my-2 text-white" >Letting our servers cook...</span>')
      .callFunction(() => {
        console.log('String typed out!');
      })
      .start();
  }}
/><Typewriter className="text-3xl my-2 text-white" wrapperClassName="text-white text-3xl" 
		options={options}
  onInit={(typewriter) => {
    typewriter.pauseFor(4000).typeString('<span class="text-3xl my-2 text-white" >Executing your code...</span>')
      .callFunction(() => {
        console.log('String typed out!');
      })
      .start();
  }}
/><Typewriter className="text-3xl my-2 text-white" wrapperClassName="text-white text-3xl" 
		options={options}
  onInit={(typewriter) => {
    typewriter.pauseFor(8000).typeString('<span class="text-3xl my-2 text-white" >Your code is cooking our servers...</span>')
	  .pauseFor(1000)
      .callFunction(() => {
        console.log('String typed out!');
		setDisplayOutput(true)
      })
      .start();
  }}
/>


		<p className={`bg-runner-output transition-400 ${!displayOutput ? "opacity-0" : "opacity-100"}  transition-all rounded-xl p-4 text-runner-text`}>output: 69</p>


		<button className='bg-button absolute right-5 bottom-2 w-max p-4 px-6 flex items-center  transition  h-12 rounded-md hover:bg-button-hover cursor-pointer text-xl' onClick={()=>{hide()}}>Close</button>
		</div>
		</div>)
}
