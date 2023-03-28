import os from 'os'
import onvif from 'onvif'
import urllib from 'urllib'
import jimp from 'jimp'

const api = {
    discovery(timeout) {
        const promises = []
        for (const net of Object.keys(os.networkInterfaces())) {
            promises.push(new Promise(resolve => {
                onvif.Discovery.probe({ timeout: timeout, device: net },
                    (err, devices) => resolve({
                        net: net, err: err,
                        devices: devices.map(el => ({ host: el.hostname, port: el.port }))
                    }))
            }))
        }
        return Promise.all(promises)
    },
    config(params) {
        const result = {...params}
        return new Promise(resolve => {
            const cam = new onvif.Cam({
                hostname: params.host,
                port: params.port,
                username: params.login,
                password: params.password
            }, err => {
                if (err) {
                    result.err = err
                    resolve(result)
                    return
                }
                result.capabilities = cam.capabilities
                result.profiles = cam.profiles
                cam.getDeviceInformation((err, device) => {
                    if (err) {
                        result.err = err
                        resolve(result)
                        return
                    }
                    result.device = device
                    const getStream = i => {
                        if (i >= cam.profiles.length) {
                            resolve(result)
                            return
                        }
                        cam.getStreamUri({ protocol: 'RTSP', profileToken: cam.profiles[i].$.token },
                            (err, stream) => {
                                result.profiles[i].err = err
                                result.profiles[i].stream = stream
                                getStream(i + 1)
                            })
                    }
                    getStream(0)
                })
            })
        })
    },
    snapshot(params) {
        const result = {...params}
        return new Promise(resolve => {
            const cam = new onvif.Cam({
                hostname: params.host,
                port: params.port,
                username: params.login,
                password: params.password
            }, err => {
                if (err) {
                    result.err = err
                    resolve(result)
                    return
                }
                cam.getSnapshotUri((err, snapshot) => {
                    if (err) {
                        result.err = err
                        resolve(result)
                        return
                    }
                    result.snapshot = snapshot
                    const opt = cam.password ? { digestAuth: `${cam.username}:${cam.password}` } : {}
                    urllib.request(snapshot.uri, opt, (err, data) => {
                        if (err) {
                            result.err = err
                            resolve(result)
                            return
                        }
                        jimp.read(data, (err, img) => {
                            if (err) {
                                result.err = err
                                resolve(result)
                                return
                            }
                            const base64 = jpeg => {
                                jpeg.getBase64('image/jpeg', (err, str) => {
                                    if (err) result.err = err
                                    else result.img = str
                                    resolve(result)
                                })
                            }
                            if (!size) {
                                base64(img)
                                return
                            }
                            img.resize(size, jimp.AUTO, (err, im) => {
                                if (err) {
                                    result.err = err
                                    resolve(result)
                                    return
                                }
                                base64(im)
                            })
                        })
                    })
                })
            })
        })
    }
}

export default api
