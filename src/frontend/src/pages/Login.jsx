import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
function Login() {
  const [cookies, setCookies] = useCookies(["session"]);
  const navigate = useNavigate();
  return (
    <div className="h-dvh w-screen mocha bg-gradient-to-br from-login-start to-login-end flex items-center justify-center">
      <div className="bg-login-popup w-full max-w-md min-w-80 rounded-2xl shadow-2xl p-8 mx-4 border border-white/10 backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-center text-text-dark mb-8">
          Login To Purkynthon
        </h1>

        <div className="space-y-5">
          <div>
            <label className="text-text-dark text-sm font-medium mb-2 block">Username</label>
            <input
              className="w-full bg-login-input rounded-lg text-black p-3 border border-transparent focus:border-login-button focus:outline-none focus:ring-2 focus:ring-login-button/30 transition-all placeholder:text-black/50"
              placeholder="Enter your username"
            />
          </div>
          
          <div>
            <label className="text-text-dark text-sm font-medium mb-2 block">Password</label>
            <input
              type="password"
              className="w-full bg-login-input rounded-lg text-black p-3 border border-transparent focus:border-login-button focus:outline-none focus:ring-2 focus:ring-login-button/30 transition-all placeholder:text-black/50"
              placeholder="Enter your password"
            />
          </div>

          <button
            className="w-full py-3 px-4 bg-login-button hover:bg-login-button-hover active:scale-[0.98] transition-all cursor-pointer mt-4 rounded-lg font-medium text-black"
            onClick={(e) => {
              setCookies(
                "session",
                { token: "tester" },
                {
                  expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
                },
              );
              navigate("/");
            }}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
