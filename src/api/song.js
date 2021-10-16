const express = require("express");
const { hostHandler } = require("../middlewares");
const songQueue = require("../services/songQueue");
const playbackService = require("../services/playback");
const { convertCurrentSong } = require("../utils/convert");
const cache = require("memory-cache");

const router = express.Router();

router.use(hostHandler);

router.post("/", async (req, res) => {
  const hash = req.session;
  const spotify = req.spotify;
  const { songId } = req.body;
  if (!songId) {
    return res.status(400).send("Invalid input");
  }
  if (await songQueue.findSongById(hash, songId)) {
    return res.status(400).send("Song already in the queue");
  }

  const { statusCode, body: song } = await spotify.getSongById(songId);

  if (statusCode !== 200) {
    if (statusCode === 400) {
      return res.status(400).send("Song id not found");
    }
    return res.status(500).send("Something went wrong");
  }

  return res.json(await songQueue.addSong(hash, song));
});

router.post("/removeNext", async (req, res) => {
  const hash = req.session;
  if ((await songQueue.getLength(hash)) > 0) {
    await songQueue.removeNextSong(hash);
    return res.sendStatus(200);
  }
  return res.status(400).send("No songs in the list");
});

router.post("/next", async (req, res) => {
  const hash = req.session;
  const spotify = req.spotify;
  if ((await songQueue.getLength(hash)) > 0) {
    const nextSongId = await songQueue.removeNextSong(hash);
    await spotify.addToQueue(nextSongId);
    await spotify.skipToNext();

    return res.sendStatus(200);
  }
  return res.status(400).send("No songs in the list");
});

router.post("/recommendation", async (req, res) => {
  const hash = req.session;
  const spotify = req.spotify;
  try {
    await playbackService.addRecommendation(hash, spotify);
    return res.status(204).send();
  } catch (e) {
    return res.status(400).send(e);
  }
});

router.get("/recommendation", async (req, res) => {
  const hash = req.session;
  const spotify = req.spotify;
  try {
    const recommendation = await playbackService.getRecommendation(
      hash,
      spotify
    );
    if (recommendation) {
      return res.json(convertCurrentSong(recommendation, true));
    }
    return res.sendStatus(204);
  } catch (e) {
    return res.status(400).send(e);
  }
});

router.get("/", async (req, res) => {
  const hash = req.session;
  const queue = await songQueue.getSongQueue(hash);
  const current = JSON.parse(cache.get(hash));

  return res.json({
    song: current && current.current,
    progress: current && current.progress,
    queue: queue,
  });
});

router.post("/:id/vote", async (req, res) => {
  const hash = req.session;
  const { userId } = req.spotishare;
  const songId = req.params.id;
  if (!songId) {
    return res.status(400).send("Song id missing");
  }

  const song = await songQueue.findSongById(hash, songId);
  if (!song) {
    return res.status(400).send("Song not in queue");
  }
  if (song.Vote.find((vote) => vote.user === userId)) {
    return res.status(400).send("User already voted");
  }
  await songQueue.voteSong(hash, song, userId);
  return res.sendStatus(204);
});

/* needs to be refactored to use class based playback
router.post('/move', (req, res) => {
   if (!req.params.hash) {
       return res.status(400).send('Missing hash')
   }

   const host = getHostByHash(req.params.hash)
   
   if (!host) {
       return res.status(400).send('Invalid hash')
   }

   const { songId, moveUp } = req.body
   const songIndex = songQueue.findIndex(songObject => songObject.uri === songId)

   if (songIndex === -1) {
       return res.status(400).send('Song not in queue')
   }

   if ((moveUp === true && songIndex <= 0) || (moveUp === false && songIndex >= songQueue.length - 1)) {
       return res.status(400).send('Invalid move')
   }

   const nextIndex = moveUp ? songIndex -1 : songIndex + 1
   const swapSong = songQueue[nextIndex]
   songQueue[nextIndex] = songQueue[songIndex]
   songQueue[songIndex] = swapSong

   res.sendStatus(200)
})*/

module.exports = router;
