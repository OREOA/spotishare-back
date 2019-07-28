import SpotifyWebApi from 'spotify-web-api-node'
import * as config from '../config'
import { Song } from '../types/song'

export type Context = {
  uri: string
}

export class SpotifyApi {
  spotifyWebApi: SpotifyWebApi
  constructor(accessToken: string, refreshToken: string) {
    this.spotifyWebApi = new SpotifyWebApi({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: config.redirectUri
    })
    this.spotifyWebApi.setAccessToken(accessToken)
    this.spotifyWebApi.setRefreshToken(refreshToken)
    setInterval(() => this.getNewAccessToken(), 3000000)
  }
  getNewAccessToken = () => {
    this.spotifyWebApi.refreshAccessToken()
      .then(data => {
        console.log('The access token has been refreshed!')
        this.spotifyWebApi.setAccessToken(data.body['access_token'])
      })
      .catch(err => console.log('Could not refresh access token', err))
  }

  searchByQuery = (query: string) => this.spotifyWebApi.searchTracks(query)

  getPlaybackState = () => this.spotifyWebApi.getMyCurrentPlaybackState()

  playSongById = (songId: Song['id']) => this.spotifyWebApi.play({ "uris": [songId] })

  playSongByContext = (context: { uri: string }) => this.spotifyWebApi.play({ "context_uri": context.uri })

  setShuffle = () => this.spotifyWebApi.setShuffle({ "state": true })

  getSongById = (songId: Song['id']) => this.spotifyWebApi.getTrack(songId)

  getUserInfo = () => this.spotifyWebApi.getMe()
}
