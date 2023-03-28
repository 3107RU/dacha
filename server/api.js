import MSG from '../proto/messages.js'
import { Server } from 'socket.io'
import onvif from './onvif.js'

function handler(io, socket) {
  socket.on(MSG.HELLO, data => 
    socket.emit(MSG.HELLO, data)
  )
  socket.on(MSG.ONVIF_DISCOVERY, data => 
    onvif.discovery(data).then(result => socket.emit(MSG.ONVIF_DISCOVERY, result))
  )
  socket.on(MSG.ONVIF_DEVICE_CONFIG, data => 
    onvif.config(data).then(result => socket.emit(MSG.ONVIF_DEVICE_CONFIG, result))
  )
}

const state = {
  io: null
}

const api = {
  start(root) {
    state.io = new Server(root)
    state.io.on('connection', socket => handler(state.io, socket))
  },
  stop() {
    if (state.io) {
      return new Promise(resolve => {
        state.io.close(() => {
          state.io = null
          resolve()
        })
      })
    }
  }
}

export default api
