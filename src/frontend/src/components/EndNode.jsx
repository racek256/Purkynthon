import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

import '@xyflow/react/dist/style.css';
const DEFAULT_HANDLE_STYLE = {
  width: 10,
  height: 10,
  bottom: -5,
};

export default memo(({ data, isConnectable }) => {
  return (
    <>
      <div style={{ paddingLeft: 15, paddingRight: 15 }}  >
        <div>{data.label}</div>
        <Handle
          type="target"
          id="a"
          position={Position.Left}
          style={{ ...DEFAULT_HANDLE_STYLE, top: '50%', background: 'black' }}
          onConnect={(params) => console.log('handle onConnect', params)}
          isConnectable={isConnectable}
        />
      </div>
    </>
  );
});

