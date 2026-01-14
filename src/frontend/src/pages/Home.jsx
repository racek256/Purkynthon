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

import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import loadLesson from "../components/lessons/lessonLoader.js";

const edgeTypes = {
  default: CustomEdge,
};

function Home() {
  const [expanded, setExpanded] = useState(true);
  const [cookies, setCookies] = useCookies();
  const [selectedNodes, setSelectedNodes] = useState([]);
  // State for resizable split between nodes and code editor
  const [splitPosition, setSplitPosition] = useState(60); // Percentage of width for nodes panel
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [theme, setTheme] = useState(cookies?.theme?.currTheme || "fire");

  const [nextScreen, setNextScren] = useState(false);
  const [showTerm, setShowTerm] = useState(false);

  const [input, setInput] = useState(0);
  // Creator Mode states
  const [creatorMode, setCreatorMode] = useState(false);
  const [levelName, setLevelName] = useState("loading");
  const [levelDescription, setLevelDescription] = useState("loading");
  const [konamiCode, setKonamiCode] = useState([]);
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [startTime, setStartTime] = useState(Date.now())
  const [buttonActive, setButtonActive] = useState(false)

  const navigate = useNavigate();
  function logout() {
    setCookies("session", { token: "nope" }, {});
    navigate("/login");
  }

  // verify login
  useEffect(() => {
    async function callMe() {
      if (!cookies?.session?.token) {
        navigate("/login");
      } else {
        const data = await fetch(
          "https://aiserver.purkynthon.online/api/auth/verify",
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
        }
      }
    }
    callMe();
  }, []);

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
    (params) => setEdges((edgesSnapshot) => addEdge({...params, animated:true}, edgesSnapshot)),
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

  return (
    <div
      className={`${theme} h-dvh overflow-x-clip overflow-y-hidden w-full max-w-full`}
    >
      <div className="bg-bg h-dvh w-full max-w-full overflow-hidden">
        <div className="flex w-full max-w-full">
          <Sidebar logout={logout} selectTheme={updateTheme} theme={theme} />
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
					activate={setButtonActive}
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
                    className="m-2 rounded-xl p-4 text-xl hover:bg-button-hover transition-all bg-button cursor-pointer"
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
                    className={`m-2 rounded-xl p-4 text-xl ${buttonActive ? "hover:bg-button-hover transition-all bg-button cursor-pointer" : "bg-gray-300 pointer-events-none cursor-not-allowed  "} `}
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
                  selectedNodes[0].type != "input" | creatorMode &&
                  selectedNodes[0].type != "output"  | creatorMode ? (
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
		  time={startTime}
        />
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default Home;
