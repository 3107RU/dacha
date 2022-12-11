import configparser
from flask import Flask, current_app, send_from_directory
from flask_socketio import SocketIO

if __name__ == '__main__':
    config = configparser.ConfigParser()
    config.read('server.ini')

    app = Flask(__name__)
    app.config['SECRET_KEY'] = config['Settings']['SocketIoKey']
    if config['Settings']['Mode'] == 'dev':
        socketio = SocketIO(app, cors_allowed_origins="*", logger=True, engineio_logger=True)
    else:
        socketio = SocketIO(app)

    @app.route('/')
    def send_index():
        return current_app.send_static_file('client/index.html')

    @app.route('/<path:path>')
    def send_client(path):
        return send_from_directory('static/client', path)

    @socketio.on('message')
    def handle_message(data):
        print('received message: ' + data)

    socketio.run(app, debug=config['Settings']['Mode'] == 'dev')
