let nodes = [
  { label: "Start", inputs: 0, outputs: 1 },
  { label: "End", inputs: 1, outputs: 0 },
  { label: "AND", inputs: 2 },
  { label: "OR", inputs: 2 },
  { label: "NOT", inputs: 1 },
  { label: "NAND", inputs: 2 },
  { label: "NOR", inputs: 2 },
  { label: "XOR", inputs: 2 },
  { label: "XNOR", inputs: 2 },
  { label: "BUFFER", inputs: 1 }
];

export default nodes;

