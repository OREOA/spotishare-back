const express = require("express");
const { convertCurrentSong } = require("../utils/convert");
const { SpotifyApi } = require("../services/spotifyApi");

const router = express.Router();

router.get("/", async (req, res) => {
  if (!req.query.searchQuery) {
    return res.status(400).send("Missing query parameter");
  }
  const spotify = new SpotifyApi(
    req.spotishare.accessToken,
    req.spotishare.refreshToken
  );

  const response = await spotify.searchByQuery(req.query.searchQuery);
  const tracks = response.body.tracks.items.map(convertCurrentSong);
  res.json(tracks);
});

module.exports = router;
