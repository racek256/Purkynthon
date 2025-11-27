
import { Position} from '@xyflow/react';
const nodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
};

const initialNodes = [
  {
    id: 'n1',
    position: { x: 100, y: 200 },
    data: { label: 'Input' },
    type: 'input', 
	code:
`main()`,
	...nodeDefaults,
  },
  {
    id: 'n2',
    position: { x: 300, y: 200 },
    data: { label: 'Main function' },
    code:
`if text.contains('+'):
	add()`,
	...nodeDefaults
  },
  {
    id: 'n3',
    position: { x: 500, y: 100 },
    data: { label: 'Add' },
	code:
`string = mainInput.string;

output(exec(string))
`,
	...nodeDefaults
  },
  {
    id: 'n4',
    position: { x: 500, y: 300 },
    data: { label: 'Subtract' },
	code:
`string = mainInput.string;

output(exec(string))
`,
	...nodeDefaults
  },
  {
    id: 'n5',
    position: { x: 600, y: 200 },
    data: { label: 'output' },
	type:"output",
	...nodeDefaults
  }
];
 
const initialEdges = [
  {
    id: 'n1-n2',
    source: 'n1',
    target: 'n2',
  },
{
id:'n2-n3',
source:'n2',
target:'n3'
},
{
id:'n2-n4',
source: 'n2',
target: 'n4'
},
{
id:'n3-n5',
source: 'n3',
target: 'n5'
},
{
id:'n4-n5',
source: 'n4',
target: 'n5'
}
];


export {initialNodes, initialEdges}
