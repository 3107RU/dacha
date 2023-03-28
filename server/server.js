import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import { createServer } from 'http'

const cfg = {
    port: 80,
    host: '0.0.0.0',
    public: path.join(path.dirname(path.dirname(fileURLToPath(import.meta.url))), 'public')
}

const state = {
    server: null
}

const server = {
    start() {
        const app = express()
        state.server = createServer(app)
        app.use(express.static(cfg.public))
        app.get('/', (req, res) => res.sendFile(path.join(cfg.public, 'index.html')))
        return new Promise((resolve, reject) => {
            state.server.listen(cfg.port, cfg.host, (err) => {
                if (err) reject(err)
                else resolve(state.server)
            })
        })
    },
    stop() {
        return new Promise(resolve => state.server.close(() => resolve()))
    }
}

export default server
