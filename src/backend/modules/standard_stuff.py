return_statement_sub_name: str = "resultxyzplink"
ollama_client_ip: str = "http://192.168.0.125:11434"

def get_return_statement_sub() -> str:
    return f"{return_statement_sub_name} = "

def get_return_statement_sub_name() -> str:
    return return_statement_sub_name

def get_ollama_client_ip() -> str:
    return ollama_client_ip
