import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

function Admin() {
  const [cookies, setCookies] = useCookies(["session"]);
  const [users, setUsers] = useState([]);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  // Add user form state
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [addingUser, setAddingUser] = useState(false);
  // Edit user state
  const [editingUser, setEditingUser] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  // New states for additional features
  const [stats, setStats] = useState(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [announcementInput, setAnnouncementInput] = useState("");
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [forceLogoutLoading, setForceLogoutLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const API_BASE = "http://localhost:2069";

  // Verify session and check admin access
  useEffect(() => {
    async function verifyAccess() {
      if (!cookies.session?.token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/auth/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jwt_token: cookies.session.token }),
        });

        const data = await response.json();

        if (!data.success) {
          navigate("/login");
          return;
        }

        if (data.role !== "admin") {
          navigate("/");
          return;
        }

        setUserRole(data.role);
        setCurrentUserId(parseInt(data.user_id));
        loadUsers();
        loadAIStatus();
        loadStats();
        loadStatus();
      } catch (err) {
        setError("Failed to verify access");
        navigate("/login");
      }
    }

    verifyAccess();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadUsers();
      loadStats();
      loadStatus();
      loadAIStatus();
      setLastRefresh(new Date());
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  async function loadUsers() {
    try {
      const response = await fetch(`${API_BASE}/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jwt_token: cookies.session.token }),
      });

      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        setError("Failed to load users");
      }
    } catch (err) {
      setError("Failed to load users");
    }
    setLoading(false);
  }

  async function loadAIStatus() {
    try {
      const response = await fetch(`${API_BASE}/api/admin/ai-status`);
      const data = await response.json();
      setAiEnabled(data.ai_enabled);
    } catch (err) {
      console.error("Failed to load AI status");
    }
  }

  async function loadStats() {
    try {
      const response = await fetch(`${API_BASE}/api/admin/stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jwt_token: cookies.session.token }),
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load stats");
    }
  }

  async function loadStatus() {
    try {
      const response = await fetch(`${API_BASE}/api/admin/status`);
      const data = await response.json();
      setMaintenanceMode(data.maintenance_mode);
      setAnnouncement(data.announcement || "");
      setAnnouncementInput(data.announcement || "");
    } catch (err) {
      console.error("Failed to load status");
    }
  }

  async function refreshAll() {
    setRefreshing(true);
    await Promise.all([
      loadUsers(),
      loadStats(),
      loadStatus(),
      loadAIStatus(),
    ]);
    setLastRefresh(new Date());
    setRefreshing(false);
  }

  async function toggleMaintenance() {
    if (userRole !== "admin") {
      setError("Only admins can toggle maintenance mode");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/settings/maintenance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jwt_token: cookies.session.token,
          enabled: !maintenanceMode,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMaintenanceMode(data.maintenance_mode);
      } else {
        setError(data.detail || "Failed to toggle maintenance mode");
      }
    } catch (err) {
      setError("Failed to toggle maintenance mode: " + err.message);
    }
  }

  async function saveAnnouncement() {
    if (userRole !== "admin") {
      setError("Only admins can set announcements");
      return;
    }

    setSavingAnnouncement(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/settings/announcement`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jwt_token: cookies.session.token,
          message: announcementInput,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAnnouncement(data.announcement || "");
      } else {
        setError(data.detail || "Failed to set announcement");
      }
    } catch (err) {
      setError("Failed to set announcement: " + err.message);
    }
    setSavingAnnouncement(false);
  }

  async function forceLogoutAll() {
    if (userRole !== "admin") {
      setError("Only admins can force logout all users");
      return;
    }

    if (!confirm("Are you sure you want to log out ALL users?")) {
      return;
    }

    setForceLogoutLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/force-logout-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jwt_token: cookies.session.token }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Success - You will now be redirected to login.");
        logout();
      } else {
        setError(data.detail || "Failed to force logout all users");
      }
    } catch (err) {
      setError("Failed to force logout all users: " + err.message);
    }
    setForceLogoutLoading(false);
  }

  async function toggleAI() {
    if (userRole !== "admin") {
      setError("Only admins can toggle AI");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/settings/ai`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jwt_token: cookies.session.token,
          enabled: !aiEnabled,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAiEnabled(data.ai_enabled);
      } else {
        setError(data.detail || "Failed to toggle AI");
      }
    } catch (err) {
      setError("Failed to toggle AI: " + err.message);
    }
  }

  async function deleteUser(userId, username) {
    if (userRole !== "admin") {
      setError("Only admins can delete users");
      return;
    }

    if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jwt_token: cookies.session.token }),
      });

      const data = await response.json();
      if (data.success) {
        setUsers(users.filter((u) => u.id !== userId));
      } else {
        setError(data.detail || "Failed to delete user");
      }
    } catch (err) {
      setError("Failed to delete user");
    }
  }

  async function changeRole(userId, newRole) {
    if (userRole !== "admin") {
      setError("Only admins can change roles");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jwt_token: cookies.session.token,
          role: newRole,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setUsers(
          users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        setError(data.detail || "Failed to change role");
      }
    } catch (err) {
      setError("Failed to change role");
    }
  }

  async function addUser(e) {
    e.preventDefault();
    if (userRole !== "admin") {
      setError("Only admins can add users");
      return;
    }

    setAddingUser(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jwt_token: cookies.session.token,
          username: newUsername,
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setUsers([...users, data.user]);
        setShowAddUser(false);
        setNewUsername("");
        setNewPassword("");
        setNewRole("user");
      } else {
        setError(data.detail || "Failed to add user");
      }
    } catch (err) {
      setError("Failed to add user");
    }
    setAddingUser(false);
  }

  function openEditModal(user) {
    setEditingUser(user);
    setEditUsername(user.username);
    setEditPassword("");
  }

  function closeEditModal() {
    setEditingUser(null);
    setEditUsername("");
    setEditPassword("");
  }

  async function saveUsername() {
    if (!editingUser || editUsername === editingUser.username) return;
    
    setSavingEdit(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${editingUser.id}/username`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jwt_token: cookies.session.token,
          username: editUsername,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setUsers(users.map((u) => 
          u.id === editingUser.id ? { ...u, username: data.new_username } : u
        ));
        setEditingUser({ ...editingUser, username: data.new_username });
      } else {
        setError(data.detail || "Failed to update username");
      }
    } catch (err) {
      setError("Failed to update username");
    }
    setSavingEdit(false);
  }

  async function savePassword() {
    if (!editingUser || !editPassword) return;
    
    setSavingEdit(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${editingUser.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jwt_token: cookies.session.token,
          password: editPassword,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setEditPassword("");
        alert(`Password updated for ${editingUser.username}. They will need to log in again.`);
      } else {
        setError(data.detail || "Failed to update password");
      }
    } catch (err) {
      setError("Failed to update password");
    }
    setSavingEdit(false);
  }

  function logout() {
    setCookies("session", { token: "nope" }, { expires: new Date(0) });
    navigate("/login");
  }

  if (loading) {
    return (
      <div className="h-dvh w-screen mocha bg-gradient-to-br from-login-start to-login-end flex items-center justify-center">
        <div className="text-text-dark text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-screen mocha bg-gradient-to-br from-login-start to-login-end p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-text-dark">Admin Panel</h1>
            <p className="text-text-dark/70 mt-1">
              Logged in as: <span className="text-login-button">{userRole}</span>
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="text-right mr-2">
              <p className="text-text-dark/50 text-xs">Last updated</p>
              <p className="text-text-dark/70 text-sm">{lastRefresh.toLocaleTimeString()}</p>
            </div>
            <button
              onClick={refreshAll}
              disabled={refreshing}
              className="px-4 py-3 bg-blue-500/80 hover:bg-blue-500 text-white rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <svg 
                className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-ctp-surface1 hover:bg-ctp-surface2 text-text-dark rounded-lg transition-all"
            >
              Back to App
            </button>
            <button
              onClick={logout}
              className="px-6 py-3 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/60 border border-red-500 text-white rounded-lg p-4 mb-6">
            {error}
            <button
              onClick={() => setError("")}
              className="ml-4 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stats Dashboard */}
        {stats && (
          <div className="bg-login-popup rounded-2xl p-6 mb-6 border border-white/10">
            <h2 className="text-2xl font-bold text-text-dark mb-4">
              Dashboard Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-text-dark/60 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-text-dark">{stats.total_users}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-text-dark/60 text-sm">Avg Score</p>
                <p className="text-3xl font-bold text-login-button">{stats.average_score?.toFixed(1) || 0}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-text-dark/60 text-sm">Avg Level</p>
                <p className="text-3xl font-bold text-green-400">{stats.average_level?.toFixed(1) || 0}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-text-dark/60 text-sm">Top Scorer</p>
                <p className="text-xl font-bold text-yellow-400 truncate">{stats.top_scorer?.username || "N/A"}</p>
                <p className="text-text-dark/60 text-xs">{stats.top_scorer?.score || 0} pts</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-blue-500/20 rounded-xl p-3 border border-blue-500/30 text-center">
                <p className="text-blue-300 text-sm">Users</p>
                <p className="text-2xl font-bold text-blue-300">{stats.users_by_role?.user || 0}</p>
              </div>
              <div className="bg-yellow-500/20 rounded-xl p-3 border border-yellow-500/30 text-center">
                <p className="text-yellow-300 text-sm">Testers</p>
                <p className="text-2xl font-bold text-yellow-300">{stats.users_by_role?.tester || 0}</p>
              </div>
              <div className="bg-red-500/20 rounded-xl p-3 border border-red-500/30 text-center">
                <p className="text-red-300 text-sm">Admins</p>
                <p className="text-2xl font-bold text-red-300">{stats.users_by_role?.admin || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* System Settings Section */}
        <div className="bg-login-popup rounded-2xl p-6 mb-6 border border-white/10">
          <h2 className="text-2xl font-bold text-text-dark mb-4">
            System Settings
          </h2>
          
          {/* AI Toggle */}
          <div className="flex items-center justify-between py-4 border-b border-white/10">
            <div>
              <h3 className="text-lg text-text-dark">AI Assistant</h3>
              <p className="text-text-dark/60 text-sm">
                Enable or disable the AI chat functionality for all users
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`text-lg font-semibold ${
                  aiEnabled ? "text-green-400" : "text-red-400"
                }`}
              >
                {aiEnabled ? "Enabled" : "Disabled"}
              </span>
              <button
                onClick={toggleAI}
                disabled={userRole !== "admin"}
                className={`relative w-16 h-8 rounded-full transition-all ${
                  aiEnabled ? "bg-green-500" : "bg-red-500"
                } ${
                  userRole !== "admin"
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                    aiEnabled ? "left-9" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Maintenance Mode Toggle */}
          <div className="flex items-center justify-between py-4 border-b border-white/10">
            <div>
              <h3 className="text-lg text-text-dark">Maintenance Mode</h3>
              <p className="text-text-dark/60 text-sm">
                Lock the app for all non-admin users
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`text-lg font-semibold ${
                  maintenanceMode ? "text-yellow-400" : "text-green-400"
                }`}
              >
                {maintenanceMode ? "Active" : "Inactive"}
              </span>
              <button
                onClick={toggleMaintenance}
                disabled={userRole !== "admin"}
                className={`relative w-16 h-8 rounded-full transition-all ${
                  maintenanceMode ? "bg-yellow-500" : "bg-green-500"
                } ${
                  userRole !== "admin"
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                    maintenanceMode ? "left-9" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Announcement */}
          <div className="py-4 border-b border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg text-text-dark">Announcement</h3>
                <p className="text-text-dark/60 text-sm">
                  Display a toast message to all users
                </p>
              </div>
              {announcement && (
                <span className="px-2 py-1 bg-blue-500/30 text-blue-300 text-xs rounded">
                  Active
                </span>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={announcementInput}
                onChange={(e) => setAnnouncementInput(e.target.value)}
                placeholder="Enter announcement message (leave empty to clear)"
                className="flex-1 px-3 py-2 bg-ctp-surface0 text-text-dark rounded-lg border border-white/20 focus:border-login-button focus:outline-none"
                disabled={userRole !== "admin"}
              />
              <button
                onClick={saveAnnouncement}
                disabled={userRole !== "admin" || savingAnnouncement}
                className="px-4 py-2 bg-login-button hover:bg-login-button-hover text-black rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingAnnouncement ? "..." : "Send"}
              </button>
            </div>

          </div>

          {/* Force Logout All */}
          <div className="flex items-center justify-between py-4">
            <div>
              <h3 className="text-lg text-text-dark">Force Logout All Users</h3>
              <p className="text-text-dark/60 text-sm">
                Invalidate all sessions and force everyone to log in again
              </p>
            </div>
            <button
              onClick={forceLogoutAll}
              disabled={userRole !== "admin" || forceLogoutLoading}
              className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {forceLogoutLoading ? "Processing..." : "Force Logout All"}
            </button>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-login-popup rounded-2xl p-6 border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-text-dark">
              User Management
            </h2>
            {userRole === "admin" && (
              <button
                onClick={() => setShowAddUser(!showAddUser)}
                className="px-4 py-2 bg-green-500/80 hover:bg-green-500 text-white rounded-lg transition-all"
              >
                {showAddUser ? "Cancel" : "Add User"}
              </button>
            )}
          </div>

          {/* Add User Form */}
          {showAddUser && userRole === "admin" && (
            <form onSubmit={addUser} className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-lg font-semibold text-text-dark mb-4">Create New User</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-text-dark/80 text-sm mb-1">Username</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-ctp-surface0 text-text-dark rounded-lg border border-white/20 focus:border-login-button focus:outline-none"
                    placeholder="Enter username"
                    required
                    minLength={3}
                  />
                </div>
                <div>
                  <label className="block text-text-dark/80 text-sm mb-1">Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-ctp-surface0 text-text-dark rounded-lg border border-white/20 focus:border-login-button focus:outline-none"
                    placeholder="Enter password"
                    required
                    minLength={4}
                  />
                </div>
                <div>
                  <label className="block text-text-dark/80 text-sm mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 bg-ctp-surface0 text-text-dark rounded-lg border border-white/20 focus:border-login-button focus:outline-none"
                  >
                    <option value="user">user</option>
                    <option value="tester">tester</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={addingUser}
                  className="px-6 py-2 bg-login-button hover:bg-login-button-hover text-black rounded-lg transition-all disabled:opacity-50"
                >
                  {addingUser ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left text-text-dark py-3 px-4">ID</th>
                  <th className="text-left text-text-dark py-3 px-4">Username</th>
                  <th className="text-left text-text-dark py-3 px-4">Role</th>
                  <th className="text-left text-text-dark py-3 px-4">Score</th>
                  <th className="text-left text-text-dark py-3 px-4">Level</th>
                  {userRole === "admin" && (
                    <th className="text-left text-text-dark py-3 px-4">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={`border-b border-white/10 hover:bg-white/5 ${
                      user.id === currentUserId ? "bg-login-button/20" : ""
                    }`}
                  >
                    <td className="py-3 px-4 text-text-dark/80">{user.id}</td>
                    <td className="py-3 px-4 text-text-dark">
                      {user.username}
                      {user.id === currentUserId && (
                        <span className="ml-2 text-xs text-login-button">(you)</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {userRole === "admin" && user.id !== currentUserId ? (
                        <select
                          value={user.role}
                          onChange={(e) => changeRole(user.id, e.target.value)}
                          className="bg-ctp-surface0 text-text-dark rounded px-2 py-1 border border-white/20"
                        >
                          <option value="user">user</option>
                          <option value="tester">tester</option>
                          <option value="admin">admin</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            user.role === "admin"
                              ? "bg-red-500/30 text-red-300"
                              : user.role === "tester"
                              ? "bg-yellow-500/30 text-yellow-300"
                              : "bg-blue-500/30 text-blue-300"
                          }`}
                        >
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-text-dark/80">{user.score}</td>
                    <td className="py-3 px-4 text-text-dark/80">{user.level}</td>
                    {userRole === "admin" && (
                      <td className="py-3 px-4 flex gap-2">
                        {user.id !== currentUserId && (
                          <>
                            <button
                              onClick={() => openEditModal(user)}
                              className="px-3 py-1 bg-blue-500/80 hover:bg-blue-500 text-white rounded text-sm transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteUser(user.id, user.username)}
                              className="px-3 py-1 bg-red-500/80 hover:bg-red-500 text-white rounded text-sm transition-all"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <p className="text-text-dark/60 text-center py-8">No users found</p>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-login-popup rounded-2xl p-6 w-full max-w-md mx-4 border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-text-dark">
                Edit User: {editingUser.username}
              </h2>
              <button
                onClick={closeEditModal}
                className="text-text-dark/60 hover:text-text-dark text-2xl"
              >
                &times;
              </button>
            </div>

            {/* Change Username */}
            <div className="mb-6">
              <label className="block text-text-dark/80 text-sm mb-2">Username</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="flex-1 px-3 py-2 bg-ctp-surface0 text-text-dark rounded-lg border border-white/20 focus:border-login-button focus:outline-none"
                  minLength={3}
                />
                <button
                  onClick={saveUsername}
                  disabled={savingEdit || editUsername === editingUser.username || editUsername.length < 3}
                  className="px-4 py-2 bg-login-button hover:bg-login-button-hover text-black rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingEdit ? "..." : "Save"}
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div className="mb-6">
              <label className="block text-text-dark/80 text-sm mb-2">New Password</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="flex-1 px-3 py-2 bg-ctp-surface0 text-text-dark rounded-lg border border-white/20 focus:border-login-button focus:outline-none"
                  minLength={4}
                />
                <button
                  onClick={savePassword}
                  disabled={savingEdit || editPassword.length < 4}
                  className="px-4 py-2 bg-login-button hover:bg-login-button-hover text-black rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingEdit ? "..." : "Save"}
                </button>
              </div>
              <p className="text-text-dark/50 text-xs mt-1">
                User will be logged out after password change
              </p>
            </div>

            {/* User Info */}
            <div className="border-t border-white/10 pt-4">
              <p className="text-text-dark/60 text-sm">
                <span className="text-text-dark/80">ID:</span> {editingUser.id} | 
                <span className="text-text-dark/80 ml-2">Score:</span> {editingUser.score} | 
                <span className="text-text-dark/80 ml-2">Level:</span> {editingUser.level}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeEditModal}
                className="px-6 py-2 bg-ctp-surface1 hover:bg-ctp-surface2 text-text-dark rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
