import pino from 'pino';

export const logger = pino({
    level: process.env.LEVEL ?? 'info',
    transport: {
        target: 'pino-pretty'
    },
})

