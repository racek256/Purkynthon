import { Position, Handle } from "@xyflow/react";
import { useState } from "react";

export default function EditableNode({ data, type, id }) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  const handleBlur = () => {
    setIsEditing(false);
    if (data.onLabelChange) {
      data.onLabelChange(id, label);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setLabel(data.label);
    }
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setLabel(data.label);
    setIsEditing(true);
  };

  return (
    <div className="custom-node">
      {isEditing ? (
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="nodrag bg-transparent border border-border px-2 py-1 rounded"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div onDoubleClick={handleDoubleClick}>
          {label}
        </div>
      )}
      
      {(type === "default" || type === "input") && (
        <Handle
          style={{
            width: "1em",
            height: "1em",
          }}
          type="source"
          position={Position.Right}
        />
      )}
      {(type === "default" || type === "output") && (
        <Handle
          style={{
            width: "1em",
            height: "1em",
          }}
          type="target"
          position={Position.Left}
        />
      )}
    </div>
  );
}
