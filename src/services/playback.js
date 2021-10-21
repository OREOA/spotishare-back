const songQueue = require("./songQueue");

const getRecommendation = async (hash, spotify) => {
  const artistsAndVotes = await songQueue.getArtists(hash);
  const topArtists = artistsAndVotes.map((artist) => artist.id).slice(0, 3);
  const songsAndVotes = await songQueue.getSongs(hash);
  const topSongs = songsAndVotes.map((song) => song.songId).slice(0, 2);

  try {
    const {
      body: { tracks },
    } = await spotify.getRecommendations({
      seed_artists: topArtists,
      seed_tracks: topSongs,
    });
    return tracks.slice(0, 1);
  } catch (e) {
    console.log(e);
  }
};

const addRecommendation = async (hash, spotify) => {
  try {
    const song = await getRecommendation(hash, spotify);
    if (song) {
      await songQueue.addSong(hash, song[0]);
    }
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  getRecommendation,
  addRecommendation,
};
