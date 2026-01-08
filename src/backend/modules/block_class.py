from typing import Any, List, Self, Optional, Tuple, Dict
from modules.sanitization import check_code_validity, replace_final_return
from modules.standard_stuff import get_return_statement_sub, get_return_statement_sub_name

class BlockException(Exception):
    def __init__(self, node_name: str, node_id: str, message: str, exec_step: str) -> None:
        self.message = f'Node "{node_name}"(id: {node_id}) raised an exception while {exec_step}: "{message}"'
    def __str__(self) -> str:
        return self.message

class Block:
    def __init__(
        self,
        code: str,  # Stores the code that this block executes
        id: str,
        name: str,
        input_values: Dict[str, Any],
        output_memory: Dict[str, Any],
        output_nodes: Optional[List[Self]] = None,
        input_nodes: Optional[List[Self]] = None,
    ) -> None:
        self.output_nodes = output_nodes
        self.input_nodes = input_nodes
        self.input_values = input_values
        self.name = name
        self.id = id
        self.output_memory = output_memory
        code_safety = check_code_validity(code)
        if not code_safety[1]:
            raise self.exception_maker(f"Your code contains code that isn't allowed to be executed: '{code_safety[0]}' on line {code_safety[2]}",
                                       "executing")
        self.code = replace_final_return(code, get_return_statement_sub())
        # if self.id == "output":
        #     self.code = self.code + "\nreturn 'gg'"
    
    def execute(self) -> Any:
        input_safety = self.eval_input_value_safety()
        if not input_safety[1]:
            raise self.exception_maker(input_safety[0], "evaluating input safety")
        
        output_values = {} 
        try: 
            if self.id != "output":
                exec(self.code, {"input_value": self.input_values}, output_values)
            else:
                exec(self.code, {"original_input_value": self.output_memory["n1"], "input_value": self.input_values}, output_values)
        except Exception as e:
            raise self.exception_maker(f"Your code ran into an error: {e}", "executing")
        
        try:
            out = output_values[get_return_statement_sub_name()]
        except KeyError:
            out = None
        
        self.output_memory[self.id] = out

        return out

    def get_output_nodes(self) -> Optional[List[Self]]:
        return self.output_nodes

    def eval_input_value_safety(self) -> Tuple[str, bool]:
        if not isinstance(self.input_values, (int, float)):
            for input_val in self.input_values:
                if not check_code_validity(input_val)[1]:
                    return (f"Code sanitization check failed at input value: {input_val}", False)
        return ("", True)  
    
    def exception_maker(self, message: str, exec_step: str) -> BlockException:
        return BlockException(self.name, self.id, message, exec_step)


def load_blocks_from_json(data: Dict[str, Any], global_output_memory: Dict[str, Any]):
    nodes = data["nodes"]
    connections = data["connections"]

    block_map = {}

    for node in nodes:
        block = Block(
            code=node.get("code", ""),
            id=node["id"],
            name=node["data"]["label"],
            input_values={},
            output_nodes=[],
            input_nodes=[],
            output_memory=global_output_memory
)
        block_map[node["id"]] = block

    for connection in connections:
        src_id = connection["source"]
        dst_id = connection["target"]

        if src_id not in block_map:
            raise KeyError(f"Connection source '{src_id}' not found in nodes")

        if dst_id not in block_map:
            raise KeyError(f"Connection target '{dst_id}' not found in nodes")

        src_block = block_map[src_id]
        dst_block = block_map[dst_id]
        
        
        src_block.output_nodes.append(dst_block)
        for block in src_block.output_nodes:
            block.input_nodes.append(src_block)

    return block_map


def execute_graph(block, global_output_memory: Dict[str, Any]):
    result = block.execute()
    for nxt in block.output_nodes:
        if len(nxt.input_nodes) > 1:
            input_keys = {node.id for node in nxt.input_nodes}
            for node in nxt.input_nodes:
                if node.id not in global_output_memory:
                    execute_graph(node, global_output_memory)
            nxt.input_values = {k: v for k, v in global_output_memory.items() if k in input_keys}
        else:
            nxt.input_values = result

        execute_graph(nxt, global_output_memory)
    return result

