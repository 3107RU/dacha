import run from './run.js'
import api from './api.js'
import log from './logger.js'
import proxy from './proxy.js'
import server from './server.js'

async function main() {
    log.info('Dacha server loading...')
    const env = process.env.NODE_ENV || 'development'    
    const srv = await server.start()
    proxy.start(srv)
    api.start(srv)
    log.info('Dacha server ready.')
    const signal = await run()
    log.info(`Dacha server stopping (signal: ${signal})...`)
    await api.stop()
    await proxy.stop()
    await server.stop()
    log.info('Dacha server finished.')
}

main()
