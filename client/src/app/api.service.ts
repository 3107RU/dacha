import { Injectable } from '@angular/core'
import { Socket } from 'ngx-socket-io'

const api = require('../proto/api_pb')

export const enum ApiEvent {
  Connect,
  Disconnect,
  Welcome,
  OnvifDiscoveryResult,
  OnvifCameraSettingsResult,
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private callbacks: { [key: number]: { callback: Function, scope: object }[] } = {}

  constructor(private socket: Socket) {
    const emit = (type: ApiEvent, object: any) => {
      if (!this.callbacks[type])
        return
      for (const cb of this.callbacks[type])
        cb.callback.apply(cb.scope, [object])
    }
    this.socket.on('connect', () => emit(ApiEvent.Connect, {}))
    this.socket.on('disconnect', () => emit(ApiEvent.Disconnect, {}))
    this.socket.on('Welcome', (data: Int8Array) =>
      emit(ApiEvent.Welcome, api.Welcome.deserializeBinary(data).toObject()))
    this.socket.on('OnvifDiscoveryResult', (data: Int8Array) =>
      emit(ApiEvent.OnvifDiscoveryResult, api.OnvifDiscoveryResult.deserializeBinary(data).toObject()))
    this.socket.on('OnvifCameraSettingsResult', (data: Int8Array) =>
      emit(ApiEvent.OnvifCameraSettingsResult, api.OnvifCameraSettingsResult.deserializeBinary(data).toObject()))
  }

  on(type: ApiEvent, callback: Function, scope: object) {
    if (!this.callbacks[type])
      this.callbacks[type] = [] as { callback: Function, scope: object }[]
    this.callbacks[type].push({ callback, scope })
  }

  off(type: ApiEvent, callback: Function, scope: object) {
    if (!this.callbacks[type])
      return
    this.callbacks[type] = this.callbacks[type].filter(cb => cb.callback !== callback || cb.scope !== scope)
  }

  sendHello(version: string) {
    const h = new api.Hello()
    h.setVersion(version)
    this.socket.emit('Hello', h.serializeBinary())
  }

  startOnvifDiscovery() {
    const s = new api.StartOnvifDiscovery()
    s.setTimeout(3)
    this.socket.emit('StartOnvifDiscovery', s.serializeBinary())

  }

  loadOnvifCameraSettings(device: string, login: string, password: string) {
    const s = new api.LoadOnvifCameraSettings()
    s.setDevice(device)
    s.setLogin(login)
    s.setPassword(password)
    this.socket.emit('LoadOnvifCameraSettings', s.serializeBinary())
  }

}
