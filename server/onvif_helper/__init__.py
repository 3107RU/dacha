from .discovery import discovery as discovery_start, stop as discovery_stop
from .settings import load as settings_load, stop as settings_stop

def open():
    pass

def close():
    settings_stop()
    discovery_stop()

def discovery(cb, timeout):
    discovery_start(cb, timeout)

def load_camera_settings(cb, device, login, password):
    settings_load(cb, device, login, password)