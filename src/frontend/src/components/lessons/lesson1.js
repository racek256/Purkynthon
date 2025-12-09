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
    code: `const number = 5;

return number;`,
    ...nodeDefaults,
  },
  {
    id: 'n2',
    position: { x: X_START + GAP, y: Y_CENTER },
    data: { label: 'Double Processor' },
    // Kód ukazuje jednoduchou matematiku
    code: `input = receive();

result = input * 2;

send(result);`,
    ...nodeDefaults,
  },
  {
    id: 'n3',
    type: 'output',
    position: { x: X_START + GAP * 2, y: Y_CENTER },
    data: { label: 'Console Output' },
    // Kód ukazuje výsledek
    code: `final_value = receive();

print(final_value);
// Expected: 10`,
    ...nodeDefaults,
  }
];

const initialEdges = [
  {
    id: 'e1-2',
    source: 'n1',
    target: 'n2',
    animated: true, // Animace pomáhá pochopit směr toku v první lekci
  },
  {
    id: 'e2-3',
    source: 'n2',
    target: 'n3',
    animated: true,
  }
];

export { initialNodes, initialEdges };
