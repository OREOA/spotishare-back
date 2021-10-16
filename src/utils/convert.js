const convertCurrentSong = (song, largeImg) => ({
  songId: song.id,
  name: song.name,
  album: song.album.name,
  albumImg: song.album.images[largeImg ? 1 : song.album.images.length - 1].url,
  duration: song.duration_ms,
  votes: 0,
  artist: {
    name: song.artists[0].name,
  },
});

module.exports = {
  convertCurrentSong,
};
