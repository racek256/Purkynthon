import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useState, useCallback, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import {
  ReactFlow,
  Position,
  Background,
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  useOnSelectionChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import StupidAI from "../components/StupidAI.jsx";
import CustomEdge from "../components/CustomEdge.jsx";
import CustomNode from "../components/CustomNode.jsx";
import InputNode from "../components/InputNode.jsx";
import EditableNode from "../components/EditableNode.jsx";
import NextLevel from "../components/NextLevelScreen.jsx";
import Terminal from "../components/CodeExecutionScreen.jsx";
import Toast from "../components/Toast.jsx";

import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import loadLesson from "../components/lessons/lessonLoader.js";

const edgeTypes = {
  default: CustomEdge,
};

function Home() {
  const [expanded, setExpanded] = useState(false);
  const [cookies, setCookies] = useCookies();
  const [selectedNodes, setSelectedNodes] = useState([]);
  // State for resizable split between nodes and code editor
  const [splitPosition, setSplitPosition] = useState(60); // Percentage of width for nodes panel
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [theme, setTheme] = useState(cookies?.theme?.currTheme);

  const [nextScreen, setNextScren] = useState(false);
  const [showTerm, setShowTerm] = useState(false);

  const [input, setInput] = useState(0);
  // Creator Mode states
  const [creatorMode, setCreatorMode] = useState(false);
  const [levelName, setLevelName] = useState("loading");
  const [levelDescription, setLevelDescription] = useState("loading");
  const [konamiCode, setKonamiCode] = useState([]);
  // User info
  const [userInfo, setUserInfo] = useState({ username: "Loading...", role: "user" });
  // Maintenance and announcement state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [sessionVersion, setSessionVersion] = useState(null);
  // Notifications
  const [notifications, setNotifications] = useState([]);

  const API_BASE = "http://localhost:2069";
  const navigate = useNavigate();
  function logout() {
    setCookies("session", { token: "nope" }, {});
    navigate("/login");
  }

  // Check for user notifications
  async function checkNotifications() {
    if (!cookies?.session?.token) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/admin/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jwt_token: cookies.session.token }),
      });
      const data = await res.json();
      if (data.success && data.notifications.length > 0) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Failed to check notifications");
    }
  }

  // Mark notification as read and remove from list
  async function dismissNotification(notificationId) {
    try {
      await fetch(`${API_BASE}/api/admin/notifications/${notificationId}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jwt_token: cookies.session.token }),
      });
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error("Failed to mark notification as read");
    }
  }

  // verify login and check system status
  useEffect(() => {
    async function callMe() {
      if (!cookies?.session?.token) {
        navigate("/login");
        return;
      }
      
      try {
        // Check system status first
        const statusRes = await fetch(`${API_BASE}/api/admin/status`);
        const status = await statusRes.json();
        
        // Store session version for later comparison
        if (sessionVersion === null) {
          setSessionVersion(status.session_version);
        } else if (sessionVersion !== status.session_version) {
          // Session version changed - force logout
          // Store flag in localStorage so login page knows to show message
          localStorage.setItem("force_logged_out", "true");
          setCookies("session", { token: "nope" }, {});
          navigate("/login");
          return;
        }
        
        // Check for announcement
        if (status.announcement && status.announcement !== announcement) {
          setAnnouncement(status.announcement);
          setShowAnnouncement(true);
        }
        
        // Verify token
        const data = await fetch(
          `${API_BASE}/api/auth/verify`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ jwt_token: cookies.session.token }),
          },
        );
        const response = await data.json();
        console.log(response);
        
        if (!response.success) {
          navigate("/login");
          return;
        }
        
        // Check maintenance mode - only allow admins
        if (status.maintenance_mode && response.role !== "admin") {
          setMaintenanceMode(true);
          return;
        } else {
          setMaintenanceMode(false);
        }
        
        setUserInfo({ username: response.username, role: response.role });
        
        // Check for notifications
        checkNotifications();
      } catch (err) {
        console.error("Failed to verify:", err);
        navigate("/login");
      }
    }
    callMe();
    
    // Poll for status updates every 5 seconds for faster response
    const interval = setInterval(() => {
      callMe();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [sessionVersion]);

  useEffect(() => {
    if (nodes.length > 0 && input != undefined) {
      const nodesClone = [...nodes];
      nodesClone[0].input = input;
      setNodes(nodesClone);
      console.log(nodes);
    }
  }, [input]);

  useEffect(() => {
    async function initLevel() {
      const data = await loadLesson();
      console.log(data);

      // Store ALL nodes (including test nodes) in state
      // For now the script expects the first node to be input
      //  TODO:: fixit

      data.nodes[0].data.setInput = setInput;
      setNodes(data.nodes);
      setInput(data.nodes[0].data.input);
      setEdges(data.edges);
      setLevelName(data.name);
      setLevelDescription(data.description);
    }
    initLevel();
  }, []);

  function updateTheme(newTheme) {
    setTheme(newTheme);
    setCookies(
      "theme",
      { currTheme: newTheme },
      {
        expires: new Date(Date.now() + 1000000 * 60 * 60 * 1000), // 1000000 hours in case this is not enough just add few zeros
      },
    );
  }

  const onNodesChange = useCallback(
    (changes) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  const onEdgeClick = useCallback(
    (event, edge) => {
      console.log("Edge clicked:", edge.id);
      setEdges((edgesSnapshot) =>
        edgesSnapshot.filter((e) => e.id !== edge.id),
      );
    },
    [setEdges],
  );

  const onChange = useCallback(({ nodes: selectedNodesArray }) => {
    setSelectedNodes(selectedNodesArray || []);
  }, []);

  useOnSelectionChange({
    onChange,
  });

  // Secret cheat detection
  useEffect(() => {
    const SECRET_SEQUENCE = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];

    const handleKeyPress = (e) => {
      const newSequence = [...konamiCode, e.key];

      if (newSequence.length > SECRET_SEQUENCE.length) {
        newSequence.shift();
      }

      setKonamiCode(newSequence);

      if (newSequence.join("") === SECRET_SEQUENCE.join("")) {
        setCreatorMode(!creatorMode);
        setKonamiCode([]);
        if (!creatorMode) {
          console.log(
            "%c🎨 Creator Mode Activated! 🎨",
            "color: #ff6b6b; font-size: 16px; font-weight: bold;",
          );
        } else {
          console.log(
            "%cCreator Mode Deactivated",
            "color: #666; font-size: 14px;",
          );
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [konamiCode, creatorMode]);

  // Refs for resizing functionality
  const resizeStartX = useRef(0);
  const startSplitPosition = useRef(0);

  // Resize handlers for the split between nodes and code editor
  const startSplitResize = useCallback(
    (e) => {
      e.preventDefault();
      resizeStartX.current = e.clientX;
      startSplitPosition.current = splitPosition;

      document.addEventListener("mousemove", handleSplitResize);
      document.addEventListener("mouseup", stopSplitResize);
    },
    [splitPosition],
  );

  const handleSplitResize = useCallback((e) => {
    const containerWidth = document.querySelector(".flex.h-full").clientWidth;
    const deltaX = e.clientX - resizeStartX.current;
    const deltaPercent = (deltaX / containerWidth) * 100;
    const newSplitPosition = Math.max(
      20,
      Math.min(80, startSplitPosition.current + deltaPercent),
    ); // Limit between 20% and 80%

    setSplitPosition(newSplitPosition);
  }, []);

  const stopSplitResize = useCallback(() => {
    document.removeEventListener("mousemove", handleSplitResize);
    document.removeEventListener("mouseup", stopSplitResize);
  }, []);

  const proOptions = { hideAttribution: true };

  const updateNodeLabel = useCallback((nodeId, newLabel) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, label: newLabel } }
          : node,
      ),
    );
  }, []);

  const nodeTypes = creatorMode
    ? {
        default: EditableNode,
        input: InputNode,
        output: EditableNode,
      }
    : {
        default: CustomNode,
        input: InputNode,
        output: CustomNode,
      };

  // Filter out the test node when not in creator mode for display
  const filteredNodesForDisplay = creatorMode
    ? nodes
    : nodes.filter((node) => node.id !== "test");

  const nodesWithCallback = creatorMode
    ? filteredNodesForDisplay.map((node) => ({
        ...node,
        data: { ...node.data, onLabelChange: updateNodeLabel },
      }))
    : filteredNodesForDisplay;
  function getTestNode(nodes) {
    const data = nodes.filter((node) => node.id === "test");
    return JSON.parse(data[0].code);
  }

  const addBlankNode = () => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: "default",
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: creatorMode
        ? { label: "New Node", onLabelChange: updateNodeLabel }
        : { label: "New Node" },
      code: "# Write your code here\n\nreturn None",
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // If maintenance mode is active, show maintenance screen
  if (maintenanceMode) {
    return (
      <div className="mocha h-dvh w-screen bg-gradient-to-br from-login-start to-login-end flex items-center justify-center">
        <div className="bg-login-popup rounded-2xl p-8 max-w-md text-center border border-white/10">
          <div className="text-6xl mb-4">&#128679;</div>
          <h1 className="text-3xl font-bold text-text-dark mb-4">
            Maintenance Mode
          </h1>
          <p className="text-text-dark/70 mb-6">
            The application is currently undergoing maintenance. Please check back later.
          </p>
          <button
            onClick={logout}
            className="px-6 py-3 bg-login-button hover:bg-login-button-hover text-black rounded-lg transition-all"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${theme} h-dvh overflow-x-clip overflow-y-hidden w-full max-w-full`}
    >
      {/* Toast for announcements */}
      {showAnnouncement && (
        <Toast 
          message={announcement} 
          onClose={() => setShowAnnouncement(false)}
          onDismiss={async () => {
            // Clear announcement on server when timer expires
            try {
              await fetch(`${API_BASE}/api/admin/settings/announcement/clear`, {
                method: "POST",
              });
              setAnnouncement("");
            } catch (err) {
              console.error("Failed to clear announcement");
            }
          }}
          duration={30000}
        />
      )}
      
      {/* Notifications (role changes, etc.) */}
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className="fixed z-50 max-w-md transition-all duration-300"
          style={{ top: `${4 + index * 5}rem`, right: '1rem' }}
        >
          <div className={`bg-login-popup border rounded-xl shadow-lg p-4 ${
            notification.type === 'role_change' 
              ? 'border-yellow-500/50' 
              : 'border-blue-500/50'
          }`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {notification.type === 'role_change' ? (
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  notification.type === 'role_change' ? 'text-yellow-300' : 'text-blue-300'
                }`}>
                  {notification.type === 'role_change' ? 'Role Changed' : 'Notification'}
                </p>
                <p className="text-text-dark mt-1">{notification.message}</p>
              </div>
              <button
                onClick={() => dismissNotification(notification.id)}
                className="flex-shrink-0 text-text-dark/60 hover:text-text-dark transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
      
      <div className="bg-bg h-dvh w-full max-w-full overflow-hidden">
        <div className="flex w-full max-w-full">
          <Sidebar logout={logout} selectTheme={updateTheme} theme={theme} userInfo={userInfo} />
          <div className="flex flex-col h-dvh w-full min-w-0">
            <Navbar
              name={creatorMode ? levelName : name}
              description={creatorMode ? levelDescription : levelDescription}
              creatorMode={creatorMode}
              onNameChange={setLevelName}
              onDescriptionChange={setLevelDescription}
            />
            <div className="w-full flex h-full">
              <div
                className="relative flex flex-col h-full"
                style={{ width: `${splitPosition}%` }}
              >
                <ReactFlow
                  nodes={nodesWithCallback}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onEdgeClick={onEdgeClick}
                  onChange={onChange}
                  proOptions={proOptions}
                  edgeTypes={edgeTypes}
                  nodeTypes={nodeTypes}
                >
                  <Background />
                </ReactFlow>
                {showTerm ? (
                  <Terminal
                    input={input}
                    hide={() => {
                      setShowTerm(false);
                    }}
                    graph={{ nodes, connections: edges }}
                  />
                ) : (
                  <div />
                )}

                <div className="absolute right-5 bottom-5 z-100">
                  {creatorMode && (
                    <button
                      className="m-2 rounded-xl p-4 text-xl hover:bg-button-hover transition-all bg-button"
                      onClick={addBlankNode}
                    >
                      Add Node
                    </button>
                  )}
                  <button
                    className="m-2 rounded-xl p-4 text-xl hover:bg-button-hover transition-all bg-button"
                    onClick={() => {
                      console.log("Nodes");
                      console.log(nodes);
                      console.log("Edging");
                      console.log(edges);

                      const exportData = {
                        name: creatorMode ? levelName : name,
                        levelDescription: creatorMode
                          ? levelDescription
                          : levelDescription,
                        nodes: nodes, // Always include all nodes in export (including test nodes) when in creator mode
                        edges: edges,
                        tags: creatorMode
                          ? ["creator-mode", new Date().toISOString()]
                          : ["lesson-mode"],
                      };

                      console.log(
                        "%c↓↓↓ JSON copy this ↓↓↓",
                        "color: red; font-weight: bold;",
                      );
                      console.log(exportData);
                      console.log(
                        "%c↑↑↑ JSON copy this ↑↑↑",
                        "color: green; font-weight: bold;",
                      );
                      setShowTerm(true);
                    }}
                  >
                    Run Code
                  </button>
                  <button
                    className="m-2 rounded-xl p-4 text-xl hover:bg-button-hover transition-all bg-button"
                    onClick={() => {
                      setNextScren(true);
                    }}
                  >
                    Submit
                  </button>
                </div>
              </div>

              {/* Resize handle between nodes and code editor */}
              <div
                className="w-1 cursor-col-resize hover:bg-ctp-surface1 transition-colors"
                onMouseDown={startSplitResize}
              >
                <div className="w-full h-full flex justify-center">
                  <div className="w-0.5 h-6 bg-transparent hover:bg-ctp-overlay2 rounded-full mt-10 opacity-0 hover:opacity-100 transition-all"></div>
                </div>
              </div>

              <div
                className="flex flex-col h-full border-l border-white overflow-hidden"
                style={{ width: `${100 - splitPosition}%` }}
              >
                {/* EDITOR */}
                <div
                  className={`transition-all duration-300 ease-in-out ${expanded ? "flex-[0.5]" : "flex-1"} overflow-hidden`}
                >
                  {selectedNodes &&
                  selectedNodes.length === 1 &&
                  selectedNodes[0] &&
                  selectedNodes[0].type != "input" &&
                  selectedNodes[0].type != "output" ? (
                    <CodeMirror
                      value={selectedNodes[0].code}
                      height="100%"
                      theme="dark"
                      className="h-full"
                      extensions={[python()]}
                      onChange={(val, viewUpdate) => {
                        console.log("key press in editor");
                        const nodesClone = [...nodes];
                        const index = nodesClone.findIndex(
                          (n) => selectedNodes[0].id === n.id,
                        );
                        if (index !== -1) {
                          nodesClone[index].code = val;
                          setNodes(nodesClone);
                        }
                      }}
                    />
                  ) : (
                    <div
                      className={`flex items-center justify-center ${expanded ? "h-0 overflow-hidden" : "h-full"} text-4xl text-ctp-mauve-900`}
                    >
                      Select node to display code
                    </div>
                  )}
                </div>

                {/* AI PANEL */}
                <div
                  className={`transition-all duration-300 ease-in-out ${expanded && selectedNodes.length ? "flex-[0.5]" : expanded ? "h-full" : "h-8"} overflow-hidden`}
                >
                  <StupidAI
                    expanded={expanded}
                    setExpanded={setExpanded}
                    isEditor={selectedNodes.length === 1}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {nextScreen ? (
        <NextLevel
          hide={() => {
            setNextScren(false);
          }}
          graph={{ nodes, connections: edges }}
          tests={getTestNode(nodes)}
          input={input}
        />
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default Home;
