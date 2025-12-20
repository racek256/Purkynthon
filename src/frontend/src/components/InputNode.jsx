import { Position, Handle } from "@xyflow/react";
import { useCallback } from "react";	

export default function CustomNode(data) {
	const onChange = useCallback((evt) => {
		console.log(`input was changed to: ${evt.target.value}`)
		data.data.setInput(evt.target.value)	
  }, []);
  return (
    <div className="custom-node flex flex-col ">
      <div className="text-lg">Input:</div>
        <input id="text" name="text" placeholder="Enter input value" defaultValue={data.data.input}  onChange={onChange} className="nodrag border rounded-xs border-black ps-2" />
      {(data.type == "default") | (data.type == "input") ? (
        <Handle
          style={{
            width: "1em",
            height: "1em",
          }}
          type="source"
          position={Position.Right}
        />
      ) : (
        <div />
      )}

      {(data.type == "default") | (data.type == "output") ? (
        <Handle
          style={{
            width: "1em",
            height: "1em",
          }}
          type="target"
          position={Position.Left}
        />
      ) : (
        <div />
      )}
    </div>
  );
}
