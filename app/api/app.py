from flask import Flask
app = Flask(__name__)

@app.route('/api/hello', methods=['GET'])
def process_video():
    

if __name__ == '__main__':
    app.run(port=5328)