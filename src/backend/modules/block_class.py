from typing import Any, List, Self, Optional, Tuple, Dict
from modules.sanitization import check_code_validity, replace_final_return
from modules.standard_stuff import get_return_statement_sub, get_return_statement_sub_name

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
        input_values: Dict[str, Any],
        output_nodes: Optional[List[Self]] = None,
    ) -> None:
        self.output_nodes = output_nodes
        self.input_values = input_values
        code_safety = check_code_validity(code)
        if not code_safety[1]:
            raise self.exception_maker(f"Your code contains code that isn't allowed to be executed: \n '{code_safety[0]}' on line {code_safety[2]}",
                                       "executing")
        self.code = replace_final_return(code, get_return_statement_sub())
        self.name = name
        self.id = id
    
    def execute(self) -> Any:
        
        input_safety = self.eval_input_value_safety()
        if not input_safety[1]:
            raise self.exception_maker(input_safety[0], "evaluating input safety")
        
        output_values = {} 
        try: 
            exec(self.code, {"input_value": self.input_values}, output_values) 
        except Exception as e:
            raise self.exception_maker(f"Your code ran into an error: {e}", "executing")
        
        try:
            out = output_values[get_return_statement_sub_name()]
        except KeyError:
            out = None

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

# test_code = """
# print('e')
# for i in range(5):
#     print('xddd')
# print('xd')
#
# return 1
# """
# ts1 = """
# return input_value + 1
# """
# test_node = Block(test_code, 1, "test", {})
# test_node1 = Block(ts1, 2, "test2", test_node.execute())
# test_node3 = Block("print(input_value)", 3, "test3", test_node1.execute()).execute()
