const { SpotifyApi } = require("./spotifyApi");
const { getMe } = require("./spotify");
const { SongQueue } = require("./songQueue");
const groupBy = require("lodash/groupBy");
const got = require("got");
const { convertCurrentSong } = require("../utils/convert");

exports.Playback = class Playback {
  songQueue = null;
  playbackInterval = false;
  currentSong = null;
  currentProgress = 0;
  savedContext = null;
  owner = null;
  songVotes = [];
  artistVotes = [];
  constructor(accessToken, refreshToken, hash, userId) {
    this.spotifyApi = new SpotifyApi(accessToken, refreshToken);
    this.hash = hash;
    this.songQueue = new SongQueue(hash);
    this.owner = {
      id: userId,
    };
    this.startInterval();
  }

  initOwner = () => {
    return getMe(this.spotifyApi).then((me) => {
      this.owner = {
        ...this.owner,
        ...me,
      };
    });
  };

  terminate = () => {
    this.stopInterval();
    this.spotifyApi.terminate();
  };

  getCurrent = () => ({
    songId: this.currentSong.id,
    name: this.currentSong.name,
    album: this.currentSong.album.name,
    albumImg:
      this.currentSong.album.images[this.currentSong.album.images.length - 1]
        .url,
    votes: 0,
    artist: { name: this.currentSong.artists[0].name, votes: 0 },
  });

  addSong = async (song) => await this.songQueue.addSong(song);

  getRecommendation = async () => {
    const artistsAndVotes = await this.songQueue.getArtists();
    const topArtists = artistsAndVotes.map((artist) => artist.id).slice(0, 5);
    const songsAndVotes = await this.songQueue.getSongQueue();
    const topSongs = songsAndVotes.map((song) => song.songId).slice(0, 5);

    try {
      if (Math.random() > 0.5) {
        const {
          body: { tracks: songsRecommendedByArtist },
        } = await this.spotifyApi.getRecommendations({
          seed_artists: topArtists,
        });
        return songsRecommendedByArtist[0];
      } else {
        const {
          body: { tracks: songsRecommendedBySong },
        } = await this.spotifyApi.getRecommendations({ seed_tracks: topSongs });
        return songsRecommendedBySong[0];
      }
    } catch (e) {
      console.log(e);
    }
  };

  addRecommendation = async () => {
    try {
      const song = await this.getRecommendation();
      if (song) {
        await this.addSong(song);
      }
    } catch (e) {
      console.log(e);
    }
  };

  voteSong = async (songId, voterId) => {
    const song = await this.songQueue.findSongById(songId);
    if (!song) {
      throw new Error("Song not in queue");
    }
    if (song.Vote.find((vote) => vote.user === voterId)) {
      throw new Error(`User with id ${voterId} has already voted this song`);
    }
    await this.songQueue.voteSong(song, voterId);
    const testingAloneWithoutFriends = false;
    if (testingAloneWithoutFriends) {
      while (Math.random() > 0.5) {
        await this.songQueue.voteSong(
          song,
          Math.random().toString(36).substring(7)
        );
      }
    }
  };

  //removeNextSong = () => this.songQueue.removeNextSong();

  playNextSong = async (force) => {
    const nextSongId = await this.songQueue.removeNextSong();
    console.log("Playing next song");
    const response = await got.post(
      `https://api.spotify.com/v1/me/player/queue?uri=${nextSongId}`,
      {
        headers: {
          Authorization: `Bearer ${this.spotifyApi.spotifyWebApi._credentials.accessToken}`,
        },
      }
    );
    if (force) {
      this.spotifyApi.skipToNext();
    }
    return new Promise((resolve) => setTimeout(resolve, 8000));
  };

  playSavedContext = () => {
    console.log("Playing by saved context");
    return this.spotifyApi
      .setShuffle()
      .then(this.spotifyApi.playSongByContext(this.savedContext))
      .then(() => new Promise((resolve) => setTimeout(resolve, 8000)))
      .catch((err) => console.log(err.message));
  };

  pollPlayback = () =>
    this.spotifyApi
      .getPlaybackState()
      .then((res) => {
        if (res.body.context) {
          this.savedContext = res.body.context;
        }
        this.currentSong = convertCurrentSong(res.body.item);
        if (!this.currentSong) {
          return;
        }
        this.currentProgress = res.body.progress_ms;
        const remainingDuration =
          this.currentSong.duration - this.currentProgress;
        //console.log(`Listening to ${res.body.item.name} on ${res.body.device.name}(${res.body.device.type}). Next song in ${parseInt(remainingDuration / 1000) - 8}s`)
        if (remainingDuration < 8000) {
          return this.songQueue
            .getLength()
            .then((length) => {
              if (length > 0) {
                return this.playNextSong();
              }
              if (!res.body.context && this.savedContext) {
                return this.playSavedContext().then(() => {
                  // Play saved context only once
                  this.savedContext = null;
                });
              }
            })
            .catch((err) => console.log(err.message));
        }
      })
      .catch((err) => console.log(err.message));

  startInterval = () => {
    this.playbackInterval = true;
    const interval = () => {
      if (this.playbackInterval) {
        Promise.all([
          this.pollPlayback(),
          new Promise((resolve) => setTimeout(resolve, 4000)),
        ]).then(interval);
      }
    };
    interval();
  };

  stopInterval = () => {
    this.playbackInterval = false;
  };
};
