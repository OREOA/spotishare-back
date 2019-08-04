const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const middlewares = require('./middlewares')
const song = require('./api/song')
const search = require('./api/search')
const session = require('./api/session')
const config = require('./config')
const clientSession = require('client-sessions')
const getSpotify = require('./services/spotify')
cookieParser = require('cookie-parser')

const app = express()

const spotifyApi = getSpotify()

app.use(morgan('dev'))
app.use(
    cors({
        origin: config.frontUri,
        credentials: true,
    }),
)
app.use(helmet())
app.use(bodyParser.json())
app.use(
    clientSession({
        cookieName: 'spotishare',
        secret: 'lihapulle',
    }),
)
app.use(cookieParser())

app.get('/login', (req, res) => {
    const scopes = ['user-modify-playback-state', 'user-read-playback-state']
    const url = spotifyApi.createAuthorizeURL(scopes)
    res.redirect(url)
})

app.get('/ok', (req, res) => {
    const { code } = req.query
    spotifyApi.authorizationCodeGrant(code)
        .then(({ body }) => {
            req.spotishare.access_token = body.access_token
            req.spotishare.refresh_token = body.refresh_token
            res.redirect(config.frontUri)
        })
})

app.use(middlewares.authentication)

app.get('/api/me', (req, res) => {
    const token = req.spotishare.access_token
    const s = getSpotify({
        accessToken: token,
    })
    s.getMe().then(({ body }) => {
        res.json(body)
    })
})

app.use('/api/song', song)
app.use('/api/session', session)
app.use('/api/search', search)

app.use(middlewares.notFound)
app.use(middlewares.errorHandler)


module.exports = app
