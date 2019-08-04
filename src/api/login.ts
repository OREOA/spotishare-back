import express from 'express'
import getSpotify from '../services/spotify'
import * as config from '../config'

const spotifyApi = getSpotify()

const router = express.Router()

router.get('/', (req, res) => {
    const scopes = ['user-modify-playback-state', 'user-read-playback-state']
    const { redirectUrl } = req.query
    const url = spotifyApi.createAuthorizeURL(scopes, JSON.stringify({ redirectUrl }))
    res.redirect(url)
})

router.get('/ok', (req, res) => {
    const { code, state: stateAsString } = req.query
    const state = stateAsString && JSON.parse(stateAsString)
    if (!config.frontUri) {
        throw new Error('No config.frontUri defined!')
    }
    const redirectUrl = state && state.redirectUrl || config.frontUri
    spotifyApi.authorizationCodeGrant(code)
        .then(({ body }) => {
            req.spotishare.access_token = body.access_token
            req.spotishare.refresh_token = body.refresh_token
            res.redirect(redirectUrl)
        })
})

export default router
