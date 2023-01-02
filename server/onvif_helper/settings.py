from loguru import logger
from queue import Queue, Empty, Full
from threading import Thread, Event
from onvif import ONVIFCamera
from urllib.parse import urlparse
import proto.api_pb2 as api

def load_settings(device, login, password):
    settings = api.OnvifCameraSettingsResult()
    settings.device = device
    try:
        url = urlparse(device)
        mycam = ONVIFCamera(url.hostname, url.port, login,
                            password, 'C:/Python311/Lib/site-packages/wsdl')
        info = mycam.devicemgmt.GetDeviceInformation()
        settings.make = info['Manufacturer']
        settings.model = info['Model']
        media_service = mycam.create_media_service()
        rtsp = media_service.create_type('GetStreamUri')
        rtsp.StreamSetup = {'Stream': 'RTP-Unicast',
                            'Transport': {'Protocol': 'RTSP'}}
        for profile in media_service.GetProfiles():
            try:
                p = api.OnvifCameraProfile()
                p.name = profile['Name']
                ve = profile['VideoEncoderConfiguration']
                if (ve):
                    p.encoding = ve['Encoding']
                    res = ve['Resolution']
                    if (res):
                        p.width = int(res['Width'])
                        p.height = int(res['Height'])
                    rate = ve['RateControl']
                    if (rate):
                        p.framerate = float(rate['FrameRateLimit'])
                        p.bitrate = float(rate['BitrateLimit'])
                ptz = profile['PTZConfiguration']
                if (ptz):
                    pass
                rtsp.ProfileToken = profile.token
                uri = media_service.GetStreamUri(rtsp)
                p.url = uri['Uri']
                settings.profile.append(p)
            except:
                pass
    except Exception as e:
        settings.error = str(e)
    return settings


def work(queue, event):
    logger.trace('Onvif load settings thread started.')
    while True:
        try:
            cb, device, login, password = queue.get(timeout=1)
        except Empty:
            pass
        else:
            cb.callback(load_settings(device, login, password))
        if event.wait(1):
            break
    logger.trace('Onvif load settings thread finished.')


queue = Queue(10)
event = Event()
worker = None


def load(cb, device, login, password):
    global worker
    if worker is None:
        worker = Thread(target=work, args=(queue, event),
                        daemon=True, name='LoadCameraSettingsThread')
        worker.start()
    try:
        queue.put((cb, device, login, password), block=False)
    except Full:
        logger.debug('Onvif load settings queue full.')


def stop():
    global worker
    if worker is not None:
        event.set()
        worker.join()
