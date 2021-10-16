const { PrismaClient } = require("@prisma/client");
const { SpotifyApi } = require("./spotifyApi");
const cache = require("memory-cache");
const moment = require("moment");
const { convertCurrentSong } = require("../utils/convert");
const songQueue = require("./songQueue");
const prisma = new PrismaClient();

const getSessions = async () => {
  return await prisma.session.findMany({
    select: {
      id: true,
      user: true,
      accessToken: true,
      refreshToken: true,
      updatedAt: true,
    },
  });
};

const updateToken = async (id, token) => {
  return await prisma.session.update({
    where: {
      id,
    },
    data: {
      accessToken: token,
    },
  });
};

const pollSessions = async () => {
  const sessions = await getSessions();
  sessions
    .map(async (session) => {
      const spotify = new SpotifyApi(session.accessToken, session.refreshToken);
      if (moment.duration(moment().diff(session.updatedAt)).asMinutes() > 50) {
        const response = await spotify.spotifyWebApi.refreshAccessToken();
        const updatedSession = await updateToken(
          session.id,
          response.body.access_token
        );
        spotify.spotifyWebApi.setAccessToken(updatedSession.accessToken);
      }
      const res = await spotify.getPlaybackState();
      const current = convertCurrentSong(res.body.item);
      //console.log(JSON.stringify({ current, progress: res.body.progress_ms }));

      cache.put(
        session.id,
        JSON.stringify({ current, progress: res.body.progress_ms })
      );
      const remainingDuration = current.duration - res.body.progress_ms;
      if (!cache.get(`${session.id}_lock`) && remainingDuration < 8000) {
        cache.put(`${session.id}_lock`, true, remainingDuration + 1000);
        const nextSongId = await songQueue.removeNextSong(session.id);
        if (nextSongId) {
          console.log("Playing next song");
          return await spotify.addToQueue(nextSongId);
        }
      }
    });
};

const startInterval = () => {
  const interval = () => {
    pollSessions();
    new Promise((resolve) => setTimeout(resolve, 4000)).then(interval);
  };
  interval();
};

module.exports = {
  getSessions,
  startInterval,
};
