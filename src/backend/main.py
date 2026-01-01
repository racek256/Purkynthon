from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict, List, cast
from ollama import ChatResponse, Client
from modules.block_class import Block
from modules.standard_stuff import get_ollama_client_ip
import uvicorn
import io
import contextlib
import sqlite3
from modules.db import router
from modules.admin import router as admin_router

global_output_memory: Dict[str, Any] = {}

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




def execute_graph(block):
    result = block.execute()
    for nxt in block.output_nodes:
        if len(nxt.input_nodes) > 1:
            input_keys = {node.id for node in nxt.input_nodes}
            for node in nxt.input_nodes:
                if node.id not in global_output_memory:
                    execute_graph(node)
            nxt.input_values = {k: v for k, v in global_output_memory.items() if k in input_keys}
        else:
            nxt.input_values = result

        execute_graph(nxt)
    return result

class GraphRequest(BaseModel):
    graph: Dict[str, Any]  # i like my json raw


class GraphResponse(BaseModel):
    success: bool
    logs: str
    returnValue: Any

class ExecOnceRequest(BaseModel):
    code: str

class ChatRequest(BaseModel):
    history: List[Any]

class ChatResponseModel(BaseModel):
    message: str


client = Client(host=get_ollama_client_ip())


app = FastAPI()
app.include_router(router, prefix="/api/auth", tags=["users"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/run-graph", response_model=GraphResponse)
async def run_graph(request: GraphRequest):
    log_capture = io.StringIO()

    try:
        # actually fr ong spawn a new stdout
        with contextlib.redirect_stdout(log_capture):
            blocks = load_blocks_from_json(request.graph)
            result = execute_graph(blocks["n1"])

        logs_text = log_capture.getvalue().strip().split("\n")

        logs = "\n".join(logs_text[:-1]) if len(logs_text) > 1 else ""
        return_value = logs_text[-1] if logs_text else str(result)

        return GraphResponse(
            success=True,
            logs=logs,
            returnValue=return_value
        )

    except Exception as e:
        return GraphResponse(
            success=False,
            logs=log_capture.getvalue(),
            returnValue=str(e)
        )

@app.post("/exec-one", response_model=GraphResponse)
async def exec_one(request: ExecOnceRequest):
    log_capt = io.StringIO()

    try:
        with contextlib.redirect_stdout(log_capt):
            result = Block(request, 0, "test", {"input_value": "plinK"}, global_output_memory).execute()

        logs_text = log_capt.getvalue().strip().split("\n")

        logs = "\n".join(logs_text[:-1]) if len(logs_text) > 1 else ""
        return_value = logs_text[-1] if logs_text else str(result)

        return GraphResponse(
            success=True,
            logs=logs,
            returnValue=return_value
        )
    except Exception as e:
        return GraphResponse(
            success = False,
            logs = log_capt.getvalue(),
            returnValue = str(e)
        )
    

DB_FILE = "db.db"

def is_ai_enabled():
    """Check if AI is enabled in settings."""
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("SELECT value FROM settings WHERE key='ai_enabled'")
    result = cur.fetchone()
    conn.close()
    return result[0] == "true" if result else True

@app.post("/api/chat", response_model=ChatResponseModel)
async def chatwithAI(data: ChatRequest):
    # Check if AI is enabled
    if not is_ai_enabled():
        raise HTTPException(status_code=503, detail="AI is currently disabled by administrator")
    
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
