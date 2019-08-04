import SpotifyWebApi from 'spotify-web-api-node'
import * as config from '../config'

const getSpotify = (options = {}) => new SpotifyWebApi({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: config.redirectUri,
    ...options
})

export default getSpotify
