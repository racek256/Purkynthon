from modules.block_class import Block
import json

def load_blocks(path: str):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    nodes = data["nodes"]
    connections = data["connections"]

    # Phase 1: create blocks without linking
    block_map = {}

    for node in nodes:
        block = Block(
            code=node.get("code", ""),
            id=node["id"],
            name=node["data"]["label"],
            input_values={},
            output_nodes=[]
        )
        block_map[node["id"]] = block

    for connection in connections:
        src_id = connection["source"]
        dst_id = connection["target"]

        if src_id not in block_map:
            raise KeyError(f"Connection source '{src_id}' not found in nodes :c")

        if dst_id not in block_map:
            raise KeyError(f"Connection target '{dst_id}' not found in nodes :c")

        src_block = block_map[src_id]
        dst_block = block_map[dst_id]

        src_block.output_nodes.append(dst_block)
   
    return block_map

def execute_graph(block):
    result = block.execute()
    for nxt in block.output_nodes:
        nxt.input_values = result
        execute_graph(nxt)


blocks = load_blocks("example.json")
execute_graph(blocks["n1"])
