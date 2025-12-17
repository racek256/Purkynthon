from modules.block_class import Block

test_code = """
import random
print('e')
for i in range(5):
    print('xddd')
print('xd')

return 1
"""
ts1 = """
return input_value + 1
"""
test_node = Block(test_code, 1, "test", {})
test_node1 = Block(ts1, 2, "test2", test_node.execute())
test_node3 = Block("print(input_value)", 3, "test3", test_node1.execute()).execute()

