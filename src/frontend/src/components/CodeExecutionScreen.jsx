import Typewriter from 'typewriter-effect';
import { useState, useEffect } from 'react';

const options = {
	delay:10,
}
export default function Terminal({hide}){
	const [displayOutput, setDisplayOutput] = useState(false);
	const [displayTerm, setDisplayTerm] = useState(false);
	useEffect(()=>{
		setTimeout(()=>{

		setDisplayTerm(true)
		},1)
	},[])
	return(
			
			<div className={` absolute bottom-0 left-0 w-full z-9999  ${displayTerm ? "h-1/3 py-2": "h-0 py-0"} ease-in-out overflow-hidden transition-200 transition-all flex border-t border-border bg-runner-bg px-4  flex-col flex`}	>
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

		<button className='bg-button absolute right-5 top-5  w-max p-4 m-2  flex items-center  transition   rounded-xl hover:bg-button-hover cursor-pointer text-xl' onClick={()=>{ setDisplayTerm(false); 
			setTimeout(()=>{hide()},200)}}>Close</button>
		</div>
	)
}
