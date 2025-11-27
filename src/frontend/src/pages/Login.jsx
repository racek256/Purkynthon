import { useCookies } from "react-cookie"
import { useNavigate } from 'react-router-dom'
function Login() {
	const [cookies, setCookies] = useCookies(['session'])
	const navigate = useNavigate();
  return (
		<div className="h-dvh w-screen mocha bg-gradient-to-br  from-ctp-base to-ctp-mantle">

	  <div className="bg-ctp-surface1 absolute min-h-max -translate-y-1/2 -translate-x-1/2 w-1/4 h-1/2 top-1/2 left-1/2 rounded-xl shadow p-6">

	  	<h1 className="text-black text-3xl text-center  text-ctp-text">Login To Purkynthon</h1>
	  	
	  	<p className="text-ctp-text text-xl mt-6">username:</p>
	  	<input className="w-full bg-ctp-surface2 rounded-md  text-ctp-text p-2" placeholder="email"/>
	  	<p className="text-ctp-text text-xl mt-6">password:</p>
	  	<input className="w-full bg-ctp-surface2 rounded-md  text-ctp-text p-2" placeholder="password"/>
	    <div className='w-full flex'>
	    <button className="p-2 bg-ctp-mauve-900 hover:bg-ctp-mauve-800 transition-all cursor-pointer mt-6 m-auto  rounded-md" onClick={e=>{
				setCookies('session', {token:'tester',},{
					expires: new Date(Date.now() + 1 * 60 * 60 * 1000 ) // 1 hour
				})
			    navigate('/')

		}}>Submit</button>
	    </div>
	  

	  </div>
		      
    </div>
  )
}

export default Login
