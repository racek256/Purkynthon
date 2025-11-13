import { useState, useCallback } from 'react';
import { ReactFlow, ReactFlowProvider, applyNodeChanges, applyEdgeChanges, addEdge, Position, useReactFlow } from '@xyflow/react';
import nodesList from './nodes.js' 
import Sidebar from './components/Sidebar.jsx'
import Editor from './Editor.jsx'



export default function App() { // Default Entry


  

  return (
    <div className="flex" style={{ width: '100vw', height: '100vh' }}>
      <ReactFlowProvider>      
        <Editor/>
      </ReactFlowProvider>

    </div>
  );
}
