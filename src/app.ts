import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import * as middlewares from './middlewares'
import song from './api/song'
import search from './api/search'
import session from './api/session'
import user from './api/user'
import login from './api/login'
import * as config from './config'
import clientSession from 'client-sessions'
import cookieParser from 'cookie-parser'

const app = express()

app.use(morgan('dev'))
app.use(
    cors({
        origin: config.frontUri,
        credentials: true,
    }),
)
app.use(helmet())
app.use(bodyParser.json())
if (!config.cookieSecret) {
    throw new Error('No process.env.COOKIE_SECRET defined!')
}
app.use(
    clientSession({
        cookieName: 'spotishare',
        secret: config.cookieSecret,
    }),
)
app.use(cookieParser())

app.use('/login', login)

app.use(middlewares.authentication)

app.use('/api/me', user)
app.use('/api/song', song)
app.use('/api/session', session)
app.use('/api/search', search)

app.use(middlewares.notFound)
app.use(middlewares.errorHandler)

export default app
