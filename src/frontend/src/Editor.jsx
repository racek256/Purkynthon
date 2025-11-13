import { useState, useCallback } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Position, Background, Controls, useReactFlow } from '@xyflow/react';
import nodesList from './nodes.js'
import Sidebar from './components/Sidebar.jsx'
import '@xyflow/react/dist/style.css';
import CustomNode from './components/Node.jsx';
import StartNode from './components/StartNode.jsx'
import EndNode from './components/EndNode.jsx'

const nodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
};

const nodeTypes = {
  custom: CustomNode,
  start: StartNode,
  end: EndNode
};
const initialNodes = [
  { id: 'n-start', type: "start", position: { x: 0, y: 0 }, data: { label: 'Start', inputs: 0, outputs: 1 }, ...nodeDefaults },
  { id: 'n-end', type: "end", position: { x: 200, y: 0 }, data: { label: 'End', inputs: 1, outputs: 0 }, ...nodeDefaults },
];
const initialEdges = [{ id: 'n1-n2', source: 'n1', target: 'n2' }];

export default function Editor() { // Default Entry
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const { screenToFlowPosition } = useReactFlow();

  function addNode(label) {
    setNodes([...nodes, { id: `n${Math.floor(Math.random() * 9999999)}`, position: { x: Math.floor(Math.random() * 200), y: Math.floor(Math.random() * 200) }, data: { label, }, ...nodeDefaults }])
    console.log("it ran")
  }
  const onNodesChange = useCallback(
    (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [setEdges],
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );


  const onDrop = useCallback(
    (event) => {
      console.log("dropping")

      // check if the dropped element is valid


      // project was renamed to screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: getId(),
        position,
        data: { label: ` node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
  );
  function drop(e) {
    console.log("big drop ahhh")


    const data = e.dataTransfer.getData("text/plain");

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    const newNode = {
      id: `n${Math.floor(Math.random() * 9999)}`,
      type: "custom",
      position,
      data: { label: data },
      ...nodeDefaults
    };

    setNodes((nds) => nds.concat(newNode));

  }



  return (
    <div className="flex" style={{ width: '100vw', height: '100vh' }}>
      <Sidebar nodes={nodesList} addNode={addNode} />
      <ReactFlow
        onDrop={drop}
        onDragEnter={() => { console.log("Something is above me ") }}
        className="w-full"
        onDragOver={e => {
          let event = e;
          event.stopPropagation();
          event.preventDefault();
        }}
        nodes={nodes}
        nodeTypes={nodeTypes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      />
      <Controls />
      <Background />
    </div>
  );
}
