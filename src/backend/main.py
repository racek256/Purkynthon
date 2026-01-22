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
from modules.discord_logger import DiscordLogger

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
        DiscordLogger.send("running", "Code Execution Started", "Running graph execution", "general")
        
        # actually fr ong spawn a new stdout
        with contextlib.redirect_stdout(log_capture):
            blocks = load_blocks_from_json(request.graph, global_output_memory)
            result = execute_graph(blocks["n1"], global_output_memory)

        logs_text = log_capture.getvalue().strip().split("\n")

        logs = "\n".join(logs_text[:-1]) if len(logs_text) > 1 else ""
        return_value = logs_text[-1] if logs_text else str(result)

        DiscordLogger.send("running", "Code Execution Completed", f"Execution successful\nReturn value: {return_value[:100]}", "success")
        
        return GraphResponse(
            success=True,
            logs=logs,
            returnValue=return_value
        )

    except Exception as e:
        DiscordLogger.send("running", "Code Execution Failed", f"Error: {str(e)}", "error")
        return GraphResponse(
            success=False,
            logs=log_capture.getvalue(),
            returnValue=str(e)
        )

@app.post("/exec-one", response_model=GraphResponse)
async def exec_one(request: ExecOnceRequest):
    log_capt = io.StringIO()

    try:
        DiscordLogger.send("running", "Single Block Execution Started", "Executing single block", "general")
        
        with contextlib.redirect_stdout(log_capt):
            result = Block(request, "0", "test", {"input_value": "plinK"}, global_output_memory).execute()

        logs_text = log_capt.getvalue().strip().split("\n")

        logs = "\n".join(logs_text[:-1]) if len(logs_text) > 1 else ""
        return_value = logs_text[-1] if logs_text else str(result)

        DiscordLogger.send("running", "Single Block Execution Completed", f"Execution successful\nReturn value: {return_value[:100]}", "success")
        
        return GraphResponse(
            success=True,
            logs=logs,
            returnValue=return_value
        )
    except Exception as e:
        DiscordLogger.send("running", "Single Block Execution Failed", f"Error: {str(e)}", "error")
        return GraphResponse(
            success = False,
            logs = log_capt.getvalue(),
            returnValue = str(e)
        )
    

@app.post("/api/chat", response_model=ChatResponseModel)
async def chatwithAI(data: ChatRequest):
    try:
        DiscordLogger.send("ai", "AI Chat Request", f"Processing chat request", "general")
        
        response: ChatResponse = client.chat(
            model='gemma3:1b-it-qat',
            messages=data.history
        )
        
        DiscordLogger.send("ai", "AI Chat Response", "Chat completed successfully", "success")
        
        return ChatResponseModel(message=response.message.content) if response.message.content else ""
    except Exception as e:
        DiscordLogger.send("ai", "AI Chat Error", f"Error: {str(e)}", "error")
        raise


if __name__ == "__main__":
    print("Sending startup test messages to Discord webhooks...")
    DiscordLogger.send_startup_tests()
    print("Test messages sent. Starting server...")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=2069,
        reload=False
    )
