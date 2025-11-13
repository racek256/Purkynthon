import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const DEFAULT_HANDLE_STYLE = {
  width: 10,
  height: 10,
  background: 'black',
};

export default memo(({ data, isConnectable }) => {
  const { label, inputs = 0, outputs = 0 } = data;

  // Calculate handle positions dynamically (evenly spaced)
  const getHandlePositions = (count) => {
    if (count <= 0) return [];
    const step = 100 / (count + 1);
    return Array.from({ length: count }, (_, i) => `${(i + 1) * step}%`);
  };

  const inputPositions = getHandlePositions(inputs);
  const outputPositions = getHandlePositions(outputs);

  return (
    <div style={{ padding: 15 }}>
      <div>{label}</div>

      {/* Render input handles */}
      {inputPositions.map((pos, index) => (
        <Handle
          key={`input-${index}`}
          type="target"
          id={`input-${index}`}
          position={Position.Left}
          style={{ ...DEFAULT_HANDLE_STYLE, top: pos }}
          isConnectable={isConnectable}
          onConnect={(params) => console.log('input onConnect', params)}
        />
      ))}

      {/* Render output handles */}
      {outputPositions.map((pos, index) => (
        <Handle
          key={`output-${index}`}
          type="source"
          id={`output-${index}`}
          position={Position.Right}
          style={{ ...DEFAULT_HANDLE_STYLE, top: pos }}
          isConnectable={isConnectable}
          onConnect={(params) => console.log('output onConnect', params)}
        />
      ))}
    </div>
  );
});
