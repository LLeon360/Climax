from flask import Flask
app = Flask(__name__)

@app.route('/api/hello', methods=['GET'])
def hello():
    return '<h1>Hello World!</h1>'

@app.route('/api/process_video', methods=['POST'])
def process_video():
    return 'Hello World!'

if __name__ == '__main__':
    app.run(port=5328)