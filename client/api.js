import { io } from 'socket.io-client'

const state = {
    socket: null,
    objects: {},
}

const api = {
    connect() {
        if (!state.socket) {
            state.socket = io()
            state.socket.onAny((msg, data) => {
                if (state.objects[msg]) state.objects[msg].forEach(object => {
                    let name = 'onApi'
                    for(const part of msg.split('-')) {
                        name += part.charAt(0).toUpperCase()
                        name += part.slice(1)
                    }
                    object[name](data)
                })
            })
        }
    },
    disconnect() {
        if (state.socket) {
            state.socket.disconnect()
            state.socket = null
        }
    },
    on() {
        const object = arguments[0]
        for (let i = 1; i < arguments.length; i++) {
            const msg = arguments[i]
            if (!state.objects[msg])
                state.objects[msg] = []
            state.objects[msg].push(object)
        }
    },
    off(object) {
        Object.keys(state.objects).forEach(msg => {
            state.objects[msg] = state.objects[msg].filter(el => el !== object)
        })
    },
    send(msg, data) {
        if (state.socket)
            state.socket.emit(msg, data)
    }
}

export default api
