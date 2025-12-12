import { BaseEdge, getStraightPath } from "@xyflow/react";

export default function CustomEdge({ id, sourceX, sourceY, targetX, targetY }) {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        cursor: "pointer",
        strokeWidth: 3,
        transition: "stroke-width 0.2s ease, stroke 0.2s ease",
      }}
      className="hover:stroke-ctp-red-500 hover:stroke-width-4"
    />
  );
}
