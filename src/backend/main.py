from fastapi import FastAPI
from pydantic import BaseModel
from typing import Any, Dict, List, cast
from ollama import ChatResponse, Client
import uvicorn
import sys
import traceback
import io
from modules.block_class import Block
from modules.standard_stuff import get_ollama_client_ip


def load_blocks_from_json(data: Dict[str, Any]):
    nodes = data["nodes"]
    connections = data["connections"]

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
            raise KeyError(f"Connection source '{src_id}' not found in nodes")

        if dst_id not in block_map:
            raise KeyError(f"Connection target '{dst_id}' not found in nodes")

        src_block = block_map[src_id]
        dst_block = block_map[dst_id]

        src_block.output_nodes.append(dst_block)

    return block_map


def execute_graph(block):
    result = block.execute()
    for nxt in block.output_nodes:
        nxt.input_values = result
        execute_graph(nxt)
    return result

class GraphRequest(BaseModel):
    graph: Dict[str, Any]  # i like my json raw


class GraphResponse(BaseModel):
    success: bool
    logs: str
    returnValue: Any

class ChatRequest(BaseModel):
    history: List[Any]

class ChatResponseModel(BaseModel):
    message: str


client = Client(host=get_ollama_client_ip())
app = FastAPI()

@app.post("/run-graph", response_model=GraphResponse)
async def run_graph(request: GraphRequest):

    # every request spawns a new stdout(gl to the server hosting ts)
    log_capture = io.StringIO()
    real_stdout = sys.stdout
    sys.stdout = log_capture

    try:
        blocks = load_blocks_from_json(request.graph)
        result = execute_graph(blocks["n1"])

        # steal the logs
        sys.stdout = real_stdout
        logs_text = log_capture.getvalue().strip().split("\n")

        logs = "\n".join(logs_text[:-1]) if len(logs_text) > 1 else ""
        return_value = logs_text[-1] if logs_text else str(result)

        return GraphResponse(
            success=True,
            logs=logs,
            returnValue=return_value
        )

    except Exception as e:
        sys.stdout = real_stdout
        tb = traceback.format_exc()
        return GraphResponse(
            success=False,
            logs=tb,
            returnValue=""
        )


@app.post("/api/chat", response_model=ChatResponseModel)
async def chatwithAI(data: ChatRequest):
    response: ChatResponse = client.chat(
        model='gemma3:1b-it-qat',
        messages=data.history
    )
    
    return ChatResponseModel(message=response.message.content) if response.message.content else ""


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=2069,
        reload=False
    )
