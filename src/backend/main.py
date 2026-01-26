from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from typing import Any, Dict, List, cast
from ollama import ChatResponse, Client
from modules.block_class import Block, load_blocks_from_json, execute_graph
from modules.standard_stuff import get_ollama_client_hosts, get_next_ollama_client_host, get_ollama_client_ip, GraphRequest, GraphResponse, ExecOnceRequest, ChatRequest, ChatResponseModel, ThemeChangeRequest, LogoutRequest, UserStatusUpdate

import uvicorn
import io
import contextlib
import json
import jwt
from modules.db import router, SECRET_KEY, ALGORITHM
from modules.discord_logger import DiscordLogger
from modules.user_tracker import UserTracker
from modules.discord_bot import DiscordBot

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


def format_graph_for_log(graph: Dict[str, Any]) -> str:
    nodes = graph.get("nodes", [])
    lines = ["Nodes:"]
    for node in nodes:
        node_type = node.get("type", "default")
        label = node.get("data", {}).get("label", node.get("id", "unknown"))
        if node_type in ("input", "output"):
            lines.append(f"- {label} ({node_type})")
            continue

        code = node.get("code", "")
        if "\\n" in code:
            code = code.replace("\\n", "\n")
        lines.append(f"- {label} (editable)")
        lines.append(f"```python\n{code}\n```")

    return "\n".join(lines)


def get_ollama_chat_stream(history: List[Any], model: str):
    hosts = get_ollama_client_hosts()
    if not hosts:
        raise ValueError("No Ollama client hosts configured")
    primary_host = get_next_ollama_client_host()
    ordered_hosts = [primary_host] + [host for host in hosts if host != primary_host]
    last_error = None
    for host in ordered_hosts:
        try:
            client = Client(host=host)
            stream = client.chat(
                model=model,
                messages=history,
                stream=True
            )
            first_chunk = next(stream)
            return stream, first_chunk
        except Exception as e:
            last_error = e
    if last_error:
        raise last_error
    raise RuntimeError("No Ollama client hosts configured")


@app.post("/run-graph", response_model=GraphResponse)
async def run_graph(request: GraphRequest, authorization: str | None = Header(default=None)):
    username = get_username_from_header(authorization)
    if isinstance(username, JSONResponse):
        return username
    log_capture = io.StringIO()

    try:
        # actually fr ong spawn a new stdout
        with contextlib.redirect_stdout(log_capture):
            global_output_memory: Dict[str, Any] = {}  # New global output memory for every run :3
            blocks = load_blocks_from_json(request.graph, global_output_memory)
            result = execute_graph(blocks["n1"], global_output_memory)

        logs_text = log_capture.getvalue().strip().split("\n")

        logs = "\n".join(logs_text[:-1]) if len(logs_text) > 1 else ""
        return_value = logs_text[-1] if logs_text else str(result)

        # Prepare detailed log message
        graph_str = format_graph_for_log(request.graph)[:1500]
        logs_str = logs if logs else "No logs"
        outcome_str = return_value if return_value else "No return value"
        
        log_message = f"**Graph Blocks:**\n{graph_str}\n**Logs:**\n```\n{logs_str}\n```\n**Outcome:**\n```\n{outcome_str}\n```"
        
        DiscordLogger.send("running", "Code Execution Completed", log_message, "success", username)
        
        return GraphResponse(
            success=True,
            logs=logs,
            returnValue=return_value
        )

    except Exception as e:
        error_logs = log_capture.getvalue()
        error_message = f"**Error:**\n```\n{str(e)}\n```\n**Logs:**\n```\n{error_logs}\n```"
        DiscordLogger.send("running", "Code Execution Failed", error_message, "error", request.username)
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
        code_str = request.code if request.code else "No code"
        logs_str = logs if logs else "No logs"
        outcome_str = return_value if return_value else "No return value"
        
        log_message = f"**Code:**\n```python\n{code_str}\n```\n**Logs:**\n```\n{logs_str}\n```\n**Outcome:**\n```\n{outcome_str}\n```"
        
        DiscordLogger.send("running", "Single Block Execution Completed", log_message, "success", request.username)
        
        return GraphResponse(
            success=True,
            logs=logs,
            returnValue=return_value
        )
    except Exception as e:
        error_logs = log_capt.getvalue()
        code_str = request.code if request.code else "No code"
        error_message = f"**Code:**\n```python\n{code_str}\n```\n**Error:**\n```\n{str(e)}\n```\n**Logs:**\n```\n{error_logs}\n```"
        DiscordLogger.send("running", "Single Block Execution Failed", error_message, "error", request.username)
        return GraphResponse(
            success = False,
            logs = log_capt.getvalue(),
            returnValue = str(e)
        )
@app.post("/api/chat")
async def chatwithAI(data: ChatRequest, authorization: str | None = Header(default=None)):
    username = get_username_from_header(authorization)
    if isinstance(username, JSONResponse):
        return username
    try:
        user_message = ""
        if data.history and len(data.history) > 0:
            last_msg = data.history[-1]
            if isinstance(last_msg, dict) and "content" in last_msg:
                user_message = last_msg["content"][:1000]
            else:
                user_message = str(last_msg)[:1000]
        try:
            stream, first_chunk = get_ollama_chat_stream(data.history, "gemma3:4b-it-qat")
        except Exception as e:
            error_message = f"**Error:**\n```\n{str(e)}\n```"
            DiscordLogger.send("ai", f"AI Chat Error for '{username}'", error_message, "error")
            return JSONResponse(status_code=503, content={"message": "Oopsie woopsie, our AI is taking a lil nap :3 It'll work again... sometime maybe :3"})

        def gen():
            full = []
            if first_chunk and first_chunk.message and first_chunk.message.content:
                full.append(first_chunk.message.content)
                payload = {"message": first_chunk.message.content}
                yield f"data: {json.dumps(payload)}\n\n"
            for chunk in stream:
                if chunk.message and chunk.message.content:
                    full.append(chunk.message.content)
                    payload = {"message": chunk.message.content}
                    yield f"data: {json.dumps(payload)}\n\n"
            ai_response = "".join(full)[:4000]
            log_message = f"**User '{username}' Message:**\n```\n{user_message}\n```\n**AI Response:**\n```\n{ai_response}\n```"
            DiscordLogger.send("ai", "AI Chat Completed", log_message, "success")
        return StreamingResponse(
            gen(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
                "Connection": "keep-alive",
            },
)
    except Exception as e:
        status_code = getattr(e, "status_code", None)
        if status_code is None:
            response = getattr(e, "response", None)
            status_code = getattr(response, "status_code", None)
        if status_code and status_code not in (200, 401):
            error_message = f"**Error:**\n```\n{str(e)}\n```"
            DiscordLogger.send("ai", f"AI Chat Error for '{username}'", error_message, "error")
            return JSONResponse(status_code=503, content={"message": "Oopsie woopsie, our AI is taking a lil nap :3 It'll work again... sometime maybe :3"})
        error_message = f"**Error:**\n```\n{str(e)}\n```"
        DiscordLogger.send("ai", f"AI Chat Error for '{username}'", error_message, "error")
        raise

@app.post("/api/theme")
async def change_theme(data: ThemeChangeRequest):
    """Log theme changes to Discord"""
    DiscordLogger.log_theme_change(data.username, data.theme)
    UserTracker.update_user(data.username, theme=data.theme)
    return {"success": True, "message": "Theme change logged"}

@app.post("/api/logout")
async def logout(data: LogoutRequest):
    """Log user logout to Discord"""
    DiscordLogger.send("login", "User Logout", f"User logged out successfully", "general", data.username)
    UserTracker.update_user(data.username, logged_in=False)
    return {"success": True, "message": "Logout logged"}

@app.post("/api/user/status")
async def update_user_status(data: UserStatusUpdate):
    """Update user status in the Discord chart"""
    UserTracker.update_user(
        username=data.username,
        logged_in=data.logged_in,
        points=data.points,
        theme=data.theme
    )
    return {"success": True, "message": "User status updated"}

if __name__ == "__main__":
    print("Starting Discord bot...")
    DiscordBot.start()
    print("Discord bot started successfully")
    
    print("Sending test message...")
    DiscordLogger.send_startup_test("system")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=2069,
        reload=False
    )
