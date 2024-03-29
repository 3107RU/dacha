import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console()
  ]
})

if (process.env.NODE_ENV === 'production')
  logger.add(new winston.transports.File({ filename: 'error.log', level: 'error' }))

export default logger
