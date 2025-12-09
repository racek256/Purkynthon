import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  useReactFlow,
} from '@xyflow/react';
import TrashIcon from "../assets/trash_icon.svg"
export default function CustomEdge({ id, sourceX, sourceY, targetX, targetY }) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <button
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan bg-ctp-mauve-700 hover:bg-ctp-mauve-900   aspect-square rounded-xl cursor-pointer"
          onClick={() => {
            setEdges((es) => es.filter((e) => e.id !== id));
          }}
        >
	  <img src={TrashIcon}/>
        </button>
      </EdgeLabelRenderer>
    </>
  );
}

