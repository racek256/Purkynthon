import { Position } from '@xyflow/react';

// Konstanty pro čistší layout
const Y_CENTER = 200;
const X_START = 100;
const GAP = 300;

const nodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
};

const initialNodes = [
  {
    id: 'n1',
    type: 'input',
    position: { x: X_START, y: Y_CENTER },
    data: { label: 'Input Number' },
    // Kód ukazuje, že zde vzniká hodnota
    code: `number = 2;

return number`,
    ...nodeDefaults,
  },
  {
    id: 'n2',
    position: { x: X_START + GAP, y: Y_CENTER },
    data: { label: 'Double Processor' },
    // Kód ukazuje jednoduchou matematiku
    code: `input = input_value 

result = input * 2;

return result`,
    ...nodeDefaults,
  },
  {
    id: 'n3',
    type: 'output',
    position: { x: X_START + GAP * 2, y: Y_CENTER },
    data: { label: 'Console Output' },
    // Kód ukazuje výsledek
    code: `final_value = input_value 

print(final_value);
return final_value`,
    ...nodeDefaults,
  }
];

const initialEdges = [
  {
    id: 'e1-2',
    source: 'n1',
    target: 'n2',
  },
  {
    id: 'e2-3',
    source: 'n2',
    target: 'n3',
  }
];

export { initialNodes, initialEdges };
