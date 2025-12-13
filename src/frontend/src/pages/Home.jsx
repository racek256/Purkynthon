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
import Editor from "@monaco-editor/react";
import StupidAI from "../components/StupidAI.jsx";
import CustomEdge from "../components/CustomEdge.jsx";
import CustomNode from "../components/CustomNode.jsx";
import EditableNode from "../components/EditableNode.jsx";
import { initialEdges, initialNodes, name, description } from "../components/lessons/lesson1.js";
import NextLevel from "../components/NextLevelScreen.jsx";
import Terminal from "../components/CodeExecutionScreen.jsx";

import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import React from 'react'

const CREATOR_MODE = false;

const edgeTypes = {
  default: CustomEdge,
};

function Home() {
  const [expanded, setExpanded] = useState(false);
  const [cookies, setCookies] = useCookies();
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [theme, setTheme] = useState(cookies?.theme?.currTheme);

  const [nextScreen, setNextScren] = useState(false);
  const [showTerm, setShowTerm] = useState(false);

  // Creator Mode states
  const [creatorMode, setCreatorMode] = useState(false);
  const [levelName, setLevelName] = useState(name);
  const [levelDescription, setLevelDescription] = useState(description);
  const [konamiCode, setKonamiCode] = useState([]);
 
const [code, setCode] = React.useState("console.log('hello world!');");
  const onCodeChange = React.useCallback((val, viewUpdate) => {
    setCode(val);
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
  const navigate = useNavigate();
  if (cookies?.session?.token != "tester") {
    navigate("/login");
  }

  const onChange = useCallback(({ nodes: selectedNodesArray }) => {
    setSelectedNodes(selectedNodesArray || []);
  }, []);

  useOnSelectionChange({
    onChange,
  });

  // Secret cheat detection
  /*useEffect(() => {
    const SECRET_SEQUENCE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    
    const handleKeyPress = (e) => {
	

      const newSequence = [...konamiCode, e.key];
      
      if (newSequence.length > SECRET_SEQUENCE.length) {
        newSequence.shift();
      }
      
      setKonamiCode(newSequence);
      
      if (newSequence.join('') === SECRET_SEQUENCE.join('')) {
        setCreatorMode(!creatorMode);
        setKonamiCode([]);
        if (!creatorMode) {
          console.log('%c🎨 Creator Mode Activated! 🎨', 'color: #ff6b6b; font-size: 16px; font-weight: bold;');
        } else {
          console.log('%cCreator Mode Deactivated', 'color: #666; font-size: 14px;');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [konamiCode, creatorMode]);*/

  const proOptions = { hideAttribution: true };

  const updateNodeLabel = useCallback((nodeId, newLabel) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, label: newLabel } }
          : node
      )
    );
  }, []);

  const nodeTypes = creatorMode ? {
    default: EditableNode,
    input: EditableNode,
    output: EditableNode,
  } : {
    default: CustomNode,
    input: CustomNode,
    output: CustomNode,
  };

  const nodesWithCallback = creatorMode
    ? nodes.map((node) => ({
        ...node,
        data: { ...node.data, onLabelChange: updateNodeLabel },
      }))
    : nodes;

  const addBlankNode = () => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: creatorMode 
        ? { label: 'New Node', onLabelChange: updateNodeLabel }
        : { label: 'New Node' },
      code: '# Write your code here\n\nreturn None',
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className={`  ${theme}  h-dvh overflow-hidden w-screen `}>
      <div className="  bg-bg  h-dvh w-screen">
        <div className="flex">
          <Sidebar selectTheme={updateTheme} theme={theme} />
          <div className="flex flex-col h-dvh w-full">
            <Navbar 
              name={creatorMode ? levelName : name} 
              description={creatorMode ? levelDescription : description}
              creatorMode={creatorMode}
              onNameChange={setLevelName}
              onDescriptionChange={setLevelDescription}
            />
            <div className=" w-full flex h-full ">
              <div className="relative flex flex-col h-full w-1/2">
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
                    hide={() => {
                      setShowTerm(false);
                    }}
					graph={{nodes, connections:edges}}

                  />
                ) : (
                  <div />
                )}

                <div className="absolute right-5 bottom-5 z-100">
                  {creatorMode && (
                    <button
                      className=" m-2 rounded-xl p-4 text-xl  hover:bg-button-hover transition-all bg-button"
                      onClick={addBlankNode}
                    >
                      Add Node
                    </button>
                  )}
                  <button
                    className=" m-2 rounded-xl p-4 text-xl  hover:bg-button-hover transition-all bg-button"
                    onClick={() => {
                      console.log("Nodes");
                      console.log(nodes);
                      console.log("Edging");
                      console.log(edges);
                      
                      const exportData = {
                        name: creatorMode ? levelName : name,
                        description: creatorMode ? levelDescription : description,
                        nodes: nodes,
                        edges: edges,
                        tags: creatorMode ? ["creator-mode", new Date().toISOString()] : ["lesson-mode"]
                      };
                      
                      console.log("%c↓↓↓ JSON copy this ↓↓↓", "color: red; font-weight: bold;");
                      console.log(exportData);
                      console.log("%c↑↑↑ JSON copy this ↑↑↑", "color: green; font-weight: bold;");
                      
                      /*// Copy to clipboard
                      navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
                        .then(() => {
                          console.log('%c✅ JSON copied to clipboard!', 'color: #4caf50; font-weight: bold;');
                        })
                        .catch(() => {
                          console.log('%c❌ Failed to copy to clipboard', 'color: #f44336; font-weight: bold;');
                        });*/

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
                  {selectedNodes && selectedNodes.length === 1 && selectedNodes[0] ? (
					<CodeMirror value={selectedNodes[0].code} height="100%" theme="dark" className="h-full" extensions={[python()]}     onChange={(val, viewUpdate) => {
						setCode(val)
						console.log("key press in editor")
                        const nodesClone = [...nodes];
                        const index = nodesClone.findIndex(
                          (n) => selectedNodes[0].id === n.id,
                        );
                        if (index !== -1) {
                          nodesClone[index].code = val;
                          //setNodes(nodesClone);
                        }
					}} />
                    /*<Editor
                      //className="h-full"
                      //key={selectedNodes[0].id}
					  //onMount={handleEditorDidMount}
                      onChange={(e) => {
						console.log("key press in editor")
                        const nodesClone = [...nodes];
                        const index = nodesClone.findIndex(
                          (n) => selectedNodes[0].id === n.id,
                        );
                        if (index !== -1) {
                          nodesClone[index].code = e;
                          //setNodes(nodesClone);
                        }
                      }}
					  
                      //defaultValue={selectedNodes[0].code}
                      //language="python"
                      //theme="vs-dark"
                    />*/
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
