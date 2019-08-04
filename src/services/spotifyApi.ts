import getSpotify from './spotify'
import SpotifyWebApi from 'spotify-web-api-node'
import Timeout = NodeJS.Timeout
import { Song } from '../types/song'

const FIFTY_MINUTES = 50 * 60 * 1000

export type Context = {
  uri: string
}

export class SpotifyApi {
  spotifyWebApi: SpotifyWebApi
  refreshTokenInterval: Timeout
  constructor(accessToken: string, refreshToken: string) {
    this.spotifyWebApi = getSpotify()
    this.spotifyWebApi.setAccessToken(accessToken)
    this.spotifyWebApi.setRefreshToken(refreshToken)
    this.refreshTokenInterval = setInterval(() => this.getNewAccessToken(), FIFTY_MINUTES)
  }

  terminate = () =>  {
    clearInterval(this.refreshTokenInterval)
    this.spotifyWebApi.setCredentials({
      accessToken: undefined,
      refreshToken: undefined
    })
  }
  
  getNewAccessToken = () => {
    this.spotifyWebApi.refreshAccessToken()
      .then(data => {
        console.log('The access token has been refreshed!')
        this.spotifyWebApi.setAccessToken(data.body['access_token'])
      })
      .catch(err => console.error('Could not refresh access token', err))
  }
  searchByQuery = (query: string) => this.spotifyWebApi.searchTracks(query)

  getPlaybackState = () => this.spotifyWebApi.getMyCurrentPlaybackState()

  playSongById = (songId: Song['id']) => this.spotifyWebApi.play({ "uris": [songId] })

  playSongByContext = (context: Context) => this.spotifyWebApi.play({ "context_uri": context.uri })

  setShuffle = () => this.spotifyWebApi.setShuffle({ "state": true })

  getSongById = (songId: Song['id']) => this.spotifyWebApi.getTrack(songId)

  getUserInfo = () => this.spotifyWebApi.getMe()
}
