import {Position, Handle } from '@xyflow/react'

export default function CustomNode(data){
	return(
		<div className='custom-node'>
		<div>{data.data.label}</div>
		{data.type == "default" | data.type == "input" ? (
		<Handle	
		style={{
			width:'1em',
			height:'1em',
		}}

		type="source" position={Position.Right}/>

		): <div/>}

		{data.type == "default" | data.type == "output" ? (
		<Handle	
		style={{
			width:'1em',
			height:'1em',
		}}

		type="target" position={Position.Left}/>

		): <div/>}


		



		</div>
	)
}
