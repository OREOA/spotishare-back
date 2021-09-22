const { SpotifyApi } = require("./spotifyApi");
const { getMe } = require("./spotify");
const { SongQueue } = require("./songQueue");
const groupBy = require("lodash/groupBy");

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
    albumImg: this.currentSong.album.images[this.currentSong.album.images.length - 1].url,
    votes: 0,
    artist: { name: this.currentSong.artists[0].name, votes: 0 },
  });

  addSong = (song) => this.songQueue.addSong(song);

  getRecommendation = async () => {
    //get array of most voted artists and songs
    const artistsAndVotes = groupBy(this.artistVotes, "artistId");
    const topArtists = Object.keys(artistsAndVotes)
      .sort(
        (a, b) =>
          artistsAndVotes[b].map((arr) => arr.length) -
          artistsAndVotes[a].map((arr) => arr.length)
      )
      .slice(0, 5);
    const songsAndVotes = groupBy(this.songVotes, "songId");
    const topSongs = Object.keys(songsAndVotes)
      .sort(
        (a, b) =>
          songsAndVotes[b].map((arr) => arr.length) -
          songsAndVotes[a].map((arr) => arr.length)
      )
      .slice(0, 5);

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
      this.addSong(song);
    } catch (e) {
      console.log(e);
    }
  };

  voteSong = (songId, voterId) => {
    const song = this.songQueue.findSongById(songId);
    if (!song) {
      throw new Error("Song not in queue");
    }

    if (song.votes.map((vote) => vote.voterId).includes(voterId)) {
      throw new Error(`User with id ${voterId} has already voted this song`);
    } else {
      // this sometimes generates more than 1 vote
      const testingAloneWithoutFriends = true;
      if (testingAloneWithoutFriends) {
        while (Math.random() > 0.5) {
          song.votes.push(Math.random().toString(36).substring(7));
        }
      }

      // looks boilerplate-y, would be clearer with actual db
      this.songQueue.voteSong(songId, voterId);
      this.songVotes.push({
        voterId,
        songId,
        timestamp: Date.now(),
      });
      song.songObject.artists.forEach((artist) =>
        this.artistVotes.push({
          voterId,
          artistId: artist.id,
          timestamp: Date.now(),
        })
      );
    }
  };

  removeNextSong = () => this.songQueue.removeNextSong();

  playNextSong = () => {
    const nextSongId = this.removeNextSong().uri;
    console.log("Playing next song");
    return this.spotifyApi
      .playSongById(nextSongId)
      .then(() => new Promise((resolve) => setTimeout(resolve, 3000)))
      .catch((err) => console.log(err.message));
  };

  playSavedContext = () => {
    console.log("Playing by saved context");
    return this.spotifyApi
      .setShuffle()
      .then(this.spotifyApi.playSongByContext(this.savedContext))
      .then(() => new Promise((resolve) => setTimeout(resolve, 3000)))
      .catch((err) => console.log(err.message));
  };

  pollPlayback = () =>
    this.spotifyApi
      .getPlaybackState()
      .then((res) => {
        if (res.body.context) {
          this.savedContext = res.body.context;
        }
        this.currentSong = res.body.item;
        if (!this.currentSong) {
          return;
        }
        this.currentProgress = res.body.progress_ms;
        const remainingDuration =
          this.currentSong.duration_ms - this.currentProgress;
        //console.log(`Listening to ${res.body.item.name} on ${res.body.device.name}(${res.body.device.type}). Next song in ${parseInt(remainingDuration / 1000) - 3}s`)
        //console.log(`Songs still in queue: ${this.songQueue.getSongs().map(song => "\n" + song.name)}`)
        if (remainingDuration < 3000) {
          console.log("Duration < 3s");
          if (this.songQueue.getLength() > 0) {
            return this.playNextSong();
          }
          if (!res.body.context && this.savedContext) {
            return this.playSavedContext().then(() => {
              // Play saved context only once
              this.savedContext = null;
            });
          }
        }
      })
      .catch((err) => console.log(err.message));

  startInterval = () => {
    this.playbackInterval = true;
    const interval = () => {
      if (this.playbackInterval) {
        Promise.all([
          this.pollPlayback(),
          new Promise((resolve) => setTimeout(resolve, 1000)),
        ]).then(interval);
      }
    };
    interval();
  };

  stopInterval = () => {
    this.playbackInterval = false;
  };
};
