from loguru import logger
from queue import Queue, Empty, Full
from threading import Thread, Event
from wsdiscovery import WSDiscovery, QName, Scope
import proto.api_pb2 as api

TYPES = [QName("http://www.onvif.org/ver10/network/wsdl", 'NetworkVideoTransmitter')]
SCOPES = [Scope('onvif://www.onvif.org/type/video_encoder')]

def work(queue, event):
    logger.trace('Onvif discovery thread started.')
    while True:
        try:
            cb, timeout = queue.get(timeout=1)
        except Empty:
            pass
        else:
            wsd = WSDiscovery()
            wsd.start()
            services = wsd.searchServices(types=TYPES, scopes=SCOPES, timeout=timeout)
            wsd.stop()
            devices = api.OnvifDiscoveryResult()
            for service in services:
                devices.device.append(service._xAddrs[0])
            cb.callback(devices)
        if event.wait(1):
            break
    logger.trace('Onvif discovery thread finished.')

queue = Queue(10)
event = Event()
worker = None

def discovery(cb, timeout):
    global worker
    if worker is None:
        worker = Thread(target=work, args=(queue, event), daemon=True, name='DiscoveryThread')
        worker.start()
    try:
        queue.put((cb, timeout), block=False)
    except Full:
        logger.debug('Onvif discovery queue full.')

def stop():
    global worker
    if worker is not None:
        event.set()
        worker.join()
