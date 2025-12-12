import { useNavigate } from "react-router-dom";

import { useCookies } from "react-cookie";
import { useState, useCallback } from "react";
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
import Editor from "@monaco-editor/react";
import StupidAI from "../components/StupidAI.jsx";
import CustomEdge from "../components/CustomEdge.jsx";
import CustomNode from "../components/CustomNode.jsx";
import { initialEdges, initialNodes } from "../components/lessons/lesson1.js";
import NextLevel from "../components/NextLevelScreen.jsx";
import Terminal from "../components/CodeExecutionScreen.jsx";
const edgeTypes = {
  default: CustomEdge,
};
const nodeTypes = {
  default: CustomNode,
  input: CustomNode,
  output: CustomNode,
};
function Home() {
  const [expanded, setExpanded] = useState(false);
  const cookies = useCookies();
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [theme, setTheme] = useState("mocha");
  const [nextScreen, setNextScren] = useState(false);
  const [showTerm, setShowTerm] = useState(false);

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
  const navigate = useNavigate();
  if (cookies[0]?.session?.token == "tester") {
    console.log("logged in ");
  } else {
    navigate("/login");
  }

  const onChange = useCallback(({ nodes, edges }) => {
    setSelectedNodes(nodes);
  }, []);

  useOnSelectionChange({
    onChange,
  });

  const proOptions = { hideAttribution: true };

  return (
    <div className={`  ${theme}  h-dvh overflow-hidden w-screen`}>
      <div className="  bg-bg  h-dvh w-screen">
        <div className="flex">
          <Sidebar selectTheme={setTheme} />
          <div className="flex flex-col h-dvh w-full">
            <Navbar />
            <div className=" w-full flex h-full ">
              <div className="relative flex flex-col h-full w-1/2">
                <ReactFlow
                  nodes={nodes}
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
                    hide={() => {
                      setShowTerm(false);
                    }}
                  />
                ) : (
                  <div />
                )}

                <div className="absolute right-5 bottom-5 z-100">
                  <button
                    className=" m-2 rounded-xl p-4 text-xl  hover:bg-button-hover transition-all bg-button"
                    onClick={() => {
                      console.log("Nodes");
                      console.log(nodes);
                      console.log("Edging");
                      console.log(edges);
                      setShowTerm(true);
                    }}
                  >
                    Run Code
                  </button>
                  <button
                    className=" m-2 rounded-xl p-4 text-xl  hover:bg-button-hover transition-all bg-button"
                    onClick={() => {
                      setNextScren(true);
                    }}
                  >
                    Submit
                  </button>
                </div>
              </div>

              <div className="flex flex-col w-1/2 h-full border-l border-white  overflow-hidden">
                {/* EDITOR */}
                <div
                  className={`transition-all duration-300 ease-in-out ${expanded ? "flex-[0.5]" : "flex-1"} overflow-hidden`}
                >
                  {selectedNodes.length === 1 ? (
                    <Editor
                      className="h-full"
                      key={selectedNodes[0].id}
                      onChange={(e) => {
                        const nodesClone = [...nodes];
                        const index = nodesClone.findIndex(
                          (n) => selectedNodes[0].id === n.id,
                        );
                        nodesClone[index].code = e;
                      }}
                      defaultValue={selectedNodes[0].code}
                      language="python"
                      theme="vs-dark"
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
        />
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default Home;
