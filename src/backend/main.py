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
from fastapi import Header, HTTPException
import jwt
from modules.db import SECRET_KEY, ALGORITHM
from fastapi.responses import JSONResponse

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

def get_username_from_header(authorization: str | None) -> str | JSONResponse:
    if not authorization:
        return JSONResponse(status_code=401, content={"message": "Missing token"})
    token = authorization[7:] if authorization.lower().startswith("bearer ") else authorization
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("username")
        if not username:
            return JSONResponse(status_code=401, content={"message": "Invalid token"})
        return username
    except jwt.PyJWTError:
        return JSONResponse(status_code=401, content={"message": "Invalid token"})


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

        # Prepare detailed log message
        graph_str = str(request.graph)[:500]
        logs_str = logs[:500] if logs else "No logs"
        outcome_str = return_value[:500] if return_value else "No return value"
        
        log_message = f"**Graph Code:**\n```json\n{graph_str}\n```\n**Logs:**\n```\n{logs_str}\n```\n**Outcome:**\n```\n{outcome_str}\n```"
        
        DiscordLogger.send("running", "Code Execution Completed", log_message, "success")
        
        return GraphResponse(
            success=True,
            logs=logs,
            returnValue=return_value
        )

    except Exception as e:
        error_logs = log_capture.getvalue()[:500]
        error_message = f"**Error:**\n```\n{str(e)}\n```\n**Logs:**\n```\n{error_logs}\n```"
        DiscordLogger.send("running", "Code Execution Failed", error_message, "error")
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

        # Prepare detailed log message
        code_str = request.code[:500] if request.code else "No code"
        logs_str = logs[:500] if logs else "No logs"
        outcome_str = return_value[:500] if return_value else "No return value"
        
        log_message = f"**Code:**\n```python\n{code_str}\n```\n**Logs:**\n```\n{logs_str}\n```\n**Outcome:**\n```\n{outcome_str}\n```"
        
        DiscordLogger.send("running", "Single Block Execution Completed", log_message, "success")
        
        return GraphResponse(
            success=True,
            logs=logs,
            returnValue=return_value
        )
    except Exception as e:
        error_logs = log_capt.getvalue()[:500]
        code_str = request.code[:500] if request.code else "No code"
        error_message = f"**Code:**\n```python\n{code_str}\n```\n**Error:**\n```\n{str(e)}\n```\n**Logs:**\n```\n{error_logs}\n```"
        DiscordLogger.send("running", "Single Block Execution Failed", error_message, "error")
        return GraphResponse(
            success = False,
            logs = log_capt.getvalue(),
            returnValue = str(e)
        )

@app.post("/api/chat", response_model=ChatResponseModel)
async def chatwithAI(data: ChatRequest, authorization: str | None = Header(default=None)):
    username = get_username_from_header(authorization)
    try:
        # Get the last user message from history
        user_message = ""
        if data.history and len(data.history) > 0:
            last_msg = data.history[-1]
            if isinstance(last_msg, dict) and 'content' in last_msg:
                user_message = last_msg['content'][:500]
            else:
                user_message = str(last_msg)[:500]
        
        response: ChatResponse = client.chat(
            model='gemma3:1b-it-qat',
            messages=data.history
        )
        
        ai_response = response.message.content[:500] if response.message.content else "No response"
        
        log_message = f"**User '{username}' Message:**\n```\n{user_message}\n```\n**AI Response:**\n```\n{ai_response}\n```"
        DiscordLogger.send("ai", "AI Chat Completed", log_message, "success")
        
        return ChatResponseModel(message=response.message.content) if response.message.content else ""
    except Exception as e:
        error_message = f"**Error:**\n```\n{str(e)}\n```"
        DiscordLogger.send("ai", "AI Chat Error", error_message, "error")
        raise


if __name__ == "__main__":
    print("Discord webhook starting")
    DiscordLogger.send_startup_tests()
    print("Discord webhook started sucessfully")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=2069,
        reload=False
    )
