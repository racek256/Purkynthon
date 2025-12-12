from ollama import chat
from ollama import Client
from ollama import ChatResponse
from flask_cors import CORS

client = Client(
        host='http://192.168.0.125:11434')
from flask import Flask, jsonify, request

app = Flask(__name__)
CORS(app)

@app.route('/api/chat', methods=['POST'])
def chatwithAI():
    data = request.get_json()
    history = data.get("history")
    
    response: ChatResponse = client.chat(model='gemma3:1b-it-qat', messages=history)
    return jsonify(message=response.message.content)


if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True, port=5068)  # Run the Flask server

