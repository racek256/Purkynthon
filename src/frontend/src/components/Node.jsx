import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

import '@xyflow/react/dist/style.css';
const DEFAULT_HANDLE_STYLE = {
  width: 10,
  height: 10,
  bottom: -5,
};

export default memo(({ data, isConnectable }) => {
  console.log(data.inputs)
  return (
    <>
      <div style={{ padding: 15 }}  >
        <div>{data.label}</div>





        <Handle
          type="target"
          id="a"
          position={Position.Left}
          style={{ ...DEFAULT_HANDLE_STYLE, top: '25%', background: 'black' }}
          onConnect={(params) => console.log('handle onConnect', params)}
          isConnectable={isConnectable}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="b"
          style={{ ...DEFAULT_HANDLE_STYLE, top: '75%', background: 'black' }}
          isConnectable={isConnectable}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="c"
          style={{ ...DEFAULT_HANDLE_STYLE, top: '50%', background: 'black' }}
          isConnectable={isConnectable}
        />
      </div>
    </>
  );
});

