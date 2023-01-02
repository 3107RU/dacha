import os
import sys
import configparser
from loguru import logger
from flask import Flask, current_app, send_from_directory
import service

SERVER_VERSION = '1.0.0'
CONFIG_FILE_NAME = 'server.ini'

class NoConfigException(Exception):
    def __init__(self, paths):
        super().__init__("""Server config file '{}' not found in:\n{}""".format(
            CONFIG_FILE_NAME, '\n'.join(paths)))

@logger.catch
def main():
    logger.remove()
    logger.add(sys.stdout, level='INFO') # TRACE, DEBUG, INFO, SUCESS, WARNING, ERROR, CRITICAL

    logger.info('Server started')

    config = configparser.ConfigParser()
    configPaths = [os.path.join(os.getcwd(), CONFIG_FILE_NAME), os.path.join(
        sys.path[0], CONFIG_FILE_NAME)]
    configPath = config.read(configPaths)
    if not configPath:
        raise NoConfigException(configPaths)
    logger.info(f'Loaded config from {configPath}')

    app = Flask(__name__)
    app.config['SECRET_KEY'] = config['Settings']['SocketIoKey']

    @app.route('/')
    def send_index():
        return current_app.send_static_file('client/index.html')

    @app.route('/<path:path>')
    def send_client(path):
        return send_from_directory('static/client', path)

    service.run(app, SERVER_VERSION, config['Settings']['Mode'])

    logger.info('Server finished')

if __name__ == '__main__':
    main()