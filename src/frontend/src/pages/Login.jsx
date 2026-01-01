import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

function Login() {
  const [cookies, setCookies] = useCookies(["session"]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [forceLogoutMessage, setForceLogoutMessage] = useState("");

  const API_BASE = "http://localhost:2069";
  const navigate = useNavigate();

  // Check for force logout flag on mount
  useEffect(() => {
    const wasForceLoggedOut = localStorage.getItem("force_logged_out");
    if (wasForceLoggedOut) {
      setForceLogoutMessage("You were logged out by an administrator.");
      localStorage.removeItem("force_logged_out");
    }
  }, []);

  return (
    <div className="h-dvh w-screen mocha bg-gradient-to-br from-login-start to-login-end flex items-center justify-center">
      <div className="bg-login-popup w-full max-w-md min-w-80 rounded-2xl shadow-2xl p-8 mx-4 border border-white/10 backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-center text-text-dark mb-8">
          Login To Purkynthon
        </h1>

        {/* Force logout message */}
        {forceLogoutMessage && (
          <div className="bg-yellow-500/30 border border-yellow-500 text-yellow-200 rounded-lg p-3 text-sm mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{forceLogoutMessage}</span>
            <button 
              onClick={() => setForceLogoutMessage("")}
              className="ml-auto text-yellow-200/60 hover:text-yellow-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <form className="space-y-5" onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setIsLoading(true);

              try {
                const data = await fetch(
                  `${API_BASE}/api/auth/login`,
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
                  // Redirect admins to admin panel, everyone else to home
                  if (response.role === "admin") {
                    navigate("/admin");
                  } else {
                    navigate("/");
                  }
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
        </form>
      </div>
    </div>
  );
}

export default Login;
