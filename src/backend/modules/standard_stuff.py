from pydantic import BaseModel
from typing import Dict, List, Any

return_statement_sub_name: str = "resultxyzplink"
ollama_client_ip: str = "http://100.106.120.85:11434"

def get_return_statement_sub() -> str:
    return f"{return_statement_sub_name} = "

def get_return_statement_sub_name() -> str:
    return return_statement_sub_name

def get_ollama_client_ip() -> str:
    return ollama_client_ip

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


