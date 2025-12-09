
import os



from ollama import chat
from ollama import Client
from ollama import ChatResponse
from flask_cors import CORS


client = Client(
        host='http://192.168.0.125:11434')

from flask import Flask, jsonify, request

app = Flask(__name__)
CORS(app)

SystemPrompt = {
        'role':"system",
        'content':"You are friendly Ai assistant you respond top users question as simply as possible."
}

@app.route('/api/chat', methods=['POST'])
def chatwithAI():
    data = request.get_json()
    print(f"recived data: {data}")
    history = data.get("history")
    if history:
        print("history recived ignoring system prompt")
    else:
        print("")
        history = [SystemPrompt, {'role':"user", 'content': data.get("question")}]
    
    response: ChatResponse = client.chat(model='gemma3:1b-it-qat', messages=history)
    print(response.message.content)
    return jsonify(message=response.message.content)


if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True, port=5068)  # Run the Flask server

