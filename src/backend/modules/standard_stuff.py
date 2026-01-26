from pydantic import BaseModel
from typing import Dict, List, Any
from threading import Lock

return_statement_sub_name: str = "resultxyzplink"
ollama_client_ip: str = "http://100.106.120.85:11434"
ollama_client_ip_secondary: str = "http://192.168.0.125:11434"
_ollama_rr_index: int = 0
_ollama_rr_lock = Lock()

def get_return_statement_sub() -> str:
    return f"{return_statement_sub_name} = "

def get_return_statement_sub_name() -> str:
    return return_statement_sub_name

def get_ollama_client_ip() -> str:
    return ollama_client_ip

def get_ollama_client_hosts() -> List[str]:
    hosts = [ollama_client_ip]
    if ollama_client_ip_secondary and ollama_client_ip_secondary != ollama_client_ip:
        hosts.append(ollama_client_ip_secondary)
    return hosts

def get_next_ollama_client_host() -> str:
    hosts = get_ollama_client_hosts()
    if not hosts:
        raise ValueError("No Ollama client hosts configured")
    global _ollama_rr_index
    with _ollama_rr_lock:
        host = hosts[_ollama_rr_index % len(hosts)]
        _ollama_rr_index = (_ollama_rr_index + 1) % len(hosts)
    return host

# main.py
class GraphRequest(BaseModel):
    graph: Dict[str, Any]  # i like my json raw
    username: str = "Unknown"

class GraphResponse(BaseModel):
    success: bool
    logs: str
    returnValue: Any

class ExecOnceRequest(BaseModel):
    code: str
    username: str = "Unknown"

class ChatRequest(BaseModel):
    history: List[Any]
    username: str = "Unknown"

class ChatResponseModel(BaseModel):
    message: str


# db.py
class JWT(BaseModel):
    jwt_token: str

class LoginData(BaseModel):
    username: str
    password: str

class LessonData(BaseModel):
    user_id: str
    score: int 
    time: int 
    lesson_id: int

class ThemeChangeRequest(BaseModel):
    username: str
    theme: str

class LogoutRequest(BaseModel):
    username: str

class UserStatusUpdate(BaseModel):
    username: str
    logged_in: bool = None
    points: int = None
    theme: str = None


