import { Position, Handle } from "@xyflow/react";

export default function CustomNode({ data, type }) {
  const normalizedType = type?.toLowerCase();
  return (
    <div className="custom-node">
      <div>{data.label}</div>
      {normalizedType == "default" ||
      normalizedType == "staticnode" ||
      normalizedType == "input" ? (
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
      {normalizedType == "default" ||
      normalizedType == "staticnode" ||
      normalizedType == "output" ? (
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
