from loguru import logger
from flask import request
from flask_socketio import SocketIO, emit
from queue import Queue, Empty
from threading import Event
import proto.api_pb2 as api
import onvif_helper


class OnvifDiscoveryCallback:
    def __init__(self, queue, sid):
        self.queue = queue
        self.sid = sid

    def callback(self, devices):
        self.queue.put(
            ('OnvifDiscoveryResult', devices.SerializeToString(), self.sid))


class OnvifCameraSettingsCallback:
    def __init__(self, queue, sid):
        self.queue = queue
        self.sid = sid

    def callback(self, settings):
        self.queue.put(('OnvifCameraSettingsResult',
                  settings.SerializeToString(), self.sid))


def run(app, version, mode):
    # Init onvif subsystem
    onvif_helper.open()

    if mode == 'dev':
        socketio = SocketIO(app, cors_allowed_origins="*",
                            logger=True, engineio_logger=True)
    else:
        socketio = SocketIO(app)

    queue = Queue()
    event = Event()

    def socketio_worker():
        logger.trace('Socketio worker thread started.')
        while True:
            try:
                name, data, sid = queue.get(False)
            except Empty:
                socketio.sleep(1)
            else:
                socketio.emit(name, data, room=sid)
            if event.is_set():
                break
        logger.trace('Socketio worker thread finished.')
    worker = socketio.start_background_task(socketio_worker)

    @socketio.on('connect')
    def client_connect(auth):
        logger.trace(f'Client connected: sid={request.sid}')

    @socketio.on('disconnect')
    def client_disconnect():
        logger.trace(f'Client disconnected: sid={request.sid}')

    @socketio.on('Hello')
    def handle_hello_message(data):
        h = api.Hello()
        h.ParseFromString(data)
        logger.trace(f'Received Hello message: version={h.version}')
        w = api.Welcome()
        w.version = version
        emit('Welcome', w.SerializeToString())

    @socketio.on('StartOnvifDiscovery')
    def handle_start_onvif_discovery_message(data):
        s = api.StartOnvifDiscovery()
        s.ParseFromString(data)
        logger.trace(
            f'Received StartOnvifDiscovery message: timeout={s.timeout}')
        onvif_helper.discovery(OnvifDiscoveryCallback(
            queue, request.sid), s.timeout)

    @socketio.on('LoadOnvifCameraSettings')
    def handle_load_onvif_camera_settings_message(data):
        s = api.LoadOnvifCameraSettings()
        s.ParseFromString(data)
        logger.trace(
            f'Received LoadOnvifCameraSettings message: device={s.device}, login={s.login}')
        onvif_helper.load_camera_settings(OnvifCameraSettingsCallback(
            queue, request.sid), s.device, s.login, s.password)

    # Start socketio app
    if mode == 'dev':
        socketio.run(app, debug=True, use_reloader=False)
    else:
        socketio.run(app)

    # Stop socketio worker
    event.set()
    worker.join()

    # Close onvif subsystem
    onvif_helper.close()
