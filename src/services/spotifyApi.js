const { getSpotify } = require('./spotify')

const FIFTY_MINUTES = 50 * 60 * 1000

exports.SpotifyApi = class SpotifyApi {
  constructor(accessToken, refreshToken) {
    this.spotifyWebApi = getSpotify()
    this.spotifyWebApi.setAccessToken(accessToken)
    this.spotifyWebApi.setRefreshToken(refreshToken)
    this.refreshTokenInterval = setInterval(() => this.getNewAccessToken(), FIFTY_MINUTES)
  }

  terminate = () => {
    clearInterval(this.refreshTokenInterval)
    this.spotifyWebApi = null
  }

  getNewAccessToken = () => {
    this.spotifyWebApi.refreshAccessToken()
      .then(data => {
        console.log('The access token has been refreshed!')
        this.spotifyWebApi.setAccessToken(data.body['access_token'])
      })
      .catch(err => console.error('Could not refresh access token', err))
  }
  searchByQuery = (query) => this.spotifyWebApi.searchTracks(query)

  getPlaybackState = () => this.spotifyWebApi.getMyCurrentPlaybackState()

  playSongById = (songId) => this.spotifyWebApi.play({ "uris": [songId] })

  playSongByContext = (context) => this.spotifyWebApi.play({ "context_uri": context.uri })

  setShuffle = () => this.spotifyWebApi.setShuffle({ "state": true })

  getSongById = (songId) => this.spotifyWebApi.getTrack(songId)

  getUserInfo = () => this.spotifyWebApi.getMe()

  // this doesn't seem to work with both artists and songs, problem with the wrapper?
  getRecommendations = (seed) => this.spotifyWebApi.getRecommendations({
    ...seed,
    min_energy: 0.4,
    min_danceability: 0.4,
    min_popularity: 30
  })
}
