const { getSpotify } = require("./spotify");
const got = require("got");

exports.SpotifyApi = class SpotifyApi {
  constructor(accessToken, refreshToken) {
    this.spotifyWebApi = getSpotify();
    this.spotifyWebApi.setAccessToken(accessToken);
    this.spotifyWebApi.setRefreshToken(refreshToken);
  }
  searchByQuery = (query) => this.spotifyWebApi.searchTracks(query);

  getPlaybackState = () => this.spotifyWebApi.getMyCurrentPlaybackState();

  playSongById = (songId) => this.spotifyWebApi.play({ uris: [songId] });

  playSongByContext = (context) =>
    this.spotifyWebApi.play({ context_uri: context.uri });

  setShuffle = () => this.spotifyWebApi.setShuffle({ state: true });

  getSongById = (songId) => this.spotifyWebApi.getTrack(songId);

  getUserInfo = () => this.spotifyWebApi.getMe();

  skipToNext = () => this.spotifyWebApi.skipToNext();

  addToQueue = (songId) =>
    got.post(`https://api.spotify.com/v1/me/player/queue?uri=${songId}`, {
      headers: {
        Authorization: `Bearer ${this.spotifyWebApi._credentials.accessToken}`,
      },
    });

  // this doesn't seem to work with both artists and songs, problem with the wrapper?
  getRecommendations = (seed) =>
    this.spotifyWebApi.getRecommendations({
      ...seed,
      min_energy: 0.4,
      min_danceability: 0.4,
      min_popularity: 30,
    });
};
