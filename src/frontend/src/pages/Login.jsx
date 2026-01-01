import { useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
function Login() {
  const [cookies, setCookies] = useCookies(["session"]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  return (
    <div className="h-dvh w-screen mocha bg-gradient-to-br from-login-start to-login-end flex items-center justify-center">
      <div className="bg-login-popup w-full max-w-md min-w-80 rounded-2xl shadow-2xl p-8 mx-4 border border-white/10 backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-center text-text-dark mb-8">
          Login To Purkynthon
        </h1>

        <form className="space-y-5" onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setIsLoading(true);

              try {
                const data = await fetch(
                  "https://aiserver.purkynthon.online/api/auth/login",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ username, password }),
                  },
                );

                if (!data.ok) {
                  setError("Cannot connect to server.");
                  setIsLoading(false);
                  return;
                }

                const response = await data.json();

                if (response.success) {
                  setCookies(
                    "session",
                    { token: response.jwt_token },
                    {
                      expires: new Date(Date.now() + 3 * 60 * 60 * 1000),
                    },
                  );
                  navigate("/");
                } else {
                  setError("Invalid username or password");
                  setPassword("");
                }
              } catch (err) {
                setError("Cannot connect to server.");
              }

              setIsLoading(false);
            }}>
          <div>
            <label className="text-text-dark text-sm font-medium mb-2 block">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-login-input rounded-lg text-black p-3 border border-transparent focus:border-login-button focus:outline-none focus:ring-2 focus:ring-login-button/30 transition-all placeholder:text-black/50"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="text-text-dark text-sm font-medium mb-2 block">
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full bg-login-input rounded-lg text-black p-3 border border-transparent focus:border-login-button focus:outline-none focus:ring-2 focus:ring-login-button/30 transition-all placeholder:text-black/50"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="bg-red-500/60 border border-red-500 text-white rounded-lg p-3 text-sm mt-4 -mb-1">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-login-button hover:bg-login-button-hover active:scale-[0.98] transition-all cursor-pointer mt-5 rounded-lg font-medium text-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
	  <p className="text-white text-xl text-center">user: admin password: brambora</p>
        </form>
      </div>
    </div>
  );
}

export default Login;
