const songQueue = require("./songQueue");

const getRecommendation = async (hash, spotify) => {
  const artistsAndVotes = await songQueue.getArtists(hash);
  const topArtists = artistsAndVotes.map((artist) => artist.id).slice(0, 5);
  const songsAndVotes = await songQueue.getSongQueue(hash);
  const topSongs = songsAndVotes.map((song) => song.songId).slice(0, 5);
  try {
    if (Math.random() > 0.5) {
      const {
        body: { tracks: songsRecommendedByArtist },
      } = await spotify.getRecommendations({
        seed_artists: topArtists,
      });
      return songsRecommendedByArtist[0];
    } else {
      const {
        body: { tracks: songsRecommendedBySong },
      } = await spotify.getRecommendations({ seed_tracks: topSongs });
      return songsRecommendedBySong[0];
    }
  } catch (e) {
    console.log(e);
  }
};

const addRecommendation = async (hash, spotify) => {
  try {
    const song = await getRecommendation(hash, spotify);
    if (song) {
      await songQueue.addSong(hash, song);
    }
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  getRecommendation,
  addRecommendation,
};
