from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Any, Dict, List, cast
from ollama import ChatResponse, Client
from modules.block_class import Block, load_blocks_from_json, execute_graph
from modules.standard_stuff import get_ollama_client_ip, GraphRequest, GraphResponse, ExecOnceRequest, ChatRequest, ChatResponseModel
import uvicorn
import io
import contextlib
from modules.db import router

global_output_memory: Dict[str, Any] = {}



client = Client(host=get_ollama_client_ip())


app = FastAPI()
app.include_router(router, prefix="/api/auth", tags=["users"])


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
            blocks = load_blocks_from_json(request.graph, global_output_memory)
            result = execute_graph(blocks["n1"], global_output_memory)

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
            result = Block(request, "0", "test", {"input_value": "plinK"}, global_output_memory).execute()

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
