import { useCookies } from "react-cookie"
import { useNavigate } from 'react-router-dom'
function Login() {
	const [cookies, setCookies] = useCookies(['session'])
	const navigate = useNavigate();
  return (
		<div className="h-dvh w-screen mocha bg-gradient-to-br  from-login-start to-login-end">

	  <div className="bg-login-popup absolute min-h-max -translate-y-1/2 -translate-x-1/2 w-1/4 min-w-max h-1/2 top-1/2 left-1/2 rounded-xl shadow p-6">

	  	<h1 className=" text-3xl text-center  text-text-dark">Login To Purkynthon</h1>
	  	
	  	<p className="text-text-dark text-xl mt-6">username:</p>
	  	<input className="w-full bg-login-input rounded-md  text-text-light p-2" placeholder="email"/>
	  	<p className="text-text-dark text-xl mt-6">password:</p>
	  	<input className="w-full bg-login-input rounded-md  text-text-light p-2" placeholder="password"/>
	    <div className='w-full flex'>
	    <button className="p-2 bg-login-button hover:bg-login-button-hover transition-all cursor-pointer mt-6 m-auto  rounded-md" onClick={e=>{
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
