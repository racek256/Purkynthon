from typing import Any, List, Self, Optional, Tuple
from sanitization import check_code_sanitization

class BlockException(Exception):
    def __init__(self, node_name: str, node_id: int, message: str, exec_step: str) -> None:
        self.message = f'Node "{node_name}"(id: {node_id}) raised an exception while {exec_step}: "{message}"'
    def __str__(self) -> str:
        return self.message

class Block:
    def __init__(
        self,
        code: str,  # Stores the code that this block executes
        id: int,
        name: str,
        input_values: List[Any],
        # input_nodes: List[Self],
        output_nodes: Optional[List[Self]] = None,
    ) -> None:
        self.output_nodes = output_nodes
        self.input_values = input_values
        # self.input_nodes = input_nodes
        self.code = code
        self.name = name
        self.id = id
    
    def execute(self) -> Any:
        
        input_safety = self.eval_input_value_safety()
        if not input_safety[1]:
            raise self.exception_maker(input_safety[0], "evaluating input safety")
        
        code_safety = check_code_sanitization(self.code)
        if not code_safety[1]:
            raise self.exception_maker(f"Your code contains code that isn't allowed to be executed: \n '{code_safety[0]}' on line {code_safety[2]}",
                                       "executing")

        return exec(self.code)

    def get_output_nodes(self) -> Optional[List[Self]]:
        return self.output_nodes

    def eval_input_value_safety(self) -> Tuple[str, bool]:
          for input_val in self.input_values:
            if not check_code_sanitization(input_val)[1]:
                return (f"Code sanitization check failed at input value: {input_val}", False)
          return ("", True)  
    
    def exception_maker(self, message: str, exec_step: str) -> BlockException:
        return BlockException(self.name, self.id, message, exec_step)


test_code = """
print('xd')
"""
test_node = Block(test_code, 1, "test", [])
test_node.execute()
