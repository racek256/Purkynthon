
	import { useNavigate } from 'react-router-dom'
import { useCookies } from "react-cookie"
import { useState, useCallback } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import Navbar from '../components/Navbar.jsx'
import { ReactFlow,Position, Background,applyEdgeChanges, applyNodeChanges, addEdge, useOnSelectionChange } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Editor from '@monaco-editor/react';
import StupidAI from '../components/StupidAI.jsx'

import { initialEdges, initialNodes } from '../components/lessons/lesson1.js';

function Home() {
	const cookies = useCookies()
	const [selectedNodes, setSelectedNodes] = useState([]);
	const [nodes, setNodes] = useState(initialNodes);
  	const [edges, setEdges] = useState(initialEdges);
	const [theme, setTheme] = useState("mocha");

	const onNodesChange = useCallback(
    (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
const onEdgesChange = useCallback(
    (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );
	const navigate = useNavigate();
		if(cookies[0]?.session?.token == 'tester'){
		console.log('logged in ')
	} else {
		navigate('/login')
		}


  const onChange = useCallback(({ nodes, edges }) => {
	  console.log("THERE WAS CHANGE")
	  console.log(nodes)
    setSelectedNodes(nodes);
	  console.log(selectedNodes)
  }, []);
 
  useOnSelectionChange({
    onChange,
  });


const proOptions = {hideAttribution:true}
	

  return (
	<div className={`  ${theme}  h-dvh w-screen`}>
		<div className="  bg-ctp-base  h-dvh w-screen">
	  	<div className="flex">
			<Sidebar selectTheme={setTheme} />		
	  		<div className="flex flex-col h-dvh w-full">
				<Navbar />
	  			<div className=" w-full flex h-full ">
					<div className='relative h-full w-1/2' >
					      <ReactFlow nodes={nodes} edges={edges}
	  					  onNodesChange={onNodesChange}
  						  onEdgesChange={onEdgesChange}
  						  onConnect={onConnect}
	  					  onChange={onChange}
	  					  proOptions={proOptions}
	  					  >
						<Background />
					      </ReactFlow>
					
	  <button className="absolute rounded-xl p-4 text-xl right-5 bottom-5 z-100 hover:bg-ctp-green-950 transition-all bg-ctp-green-900">Run Code</button>
					</div>

  			<div className="h-full w-1/2 border-l border-white">
          <div className="flex-col flex w-full h-full">
            {selectedNodes.length == 1 ?  <div className="h-full"><Editor key={selectedNodes[0].id} onChange={e=>{
            console.log(e)
            const nodesClone = [...nodes]
            let index = nodesClone.findIndex(e=> selectedNodes[0].id == e.id)
            nodesClone[index].code = e
          }} defaultValue={selectedNodes[0].code}  language="python" theme="vs-dark" /></div>: 
            <div className="flex items-center justify-center h-full text-4xl text-ctp-mauve-900 ">Select node to display code</div>
          }
            <StupidAI/> 
            </div>
  				  	  			</div>
  			</div>
  		</div>
  	</div>
  	</div>
    </div>
  )
}

export default Home
