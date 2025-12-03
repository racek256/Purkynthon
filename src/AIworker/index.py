from ollama import chat
from ollama import ChatResponse


from flask import Flask, jsonify, request

app = Flask(__name__)

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
    
    response: ChatResponse = chat(model='smollm2:135m', messages=history)
    print(response.message.content)
    return jsonify(message=response.message.content)


if __name__ == '__main__':
    app.run(debug=True)  # Run the Flask server

