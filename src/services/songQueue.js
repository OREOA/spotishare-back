const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getLength = async () => await prisma.song.count();

const getSongQueue = async (hash) => {
  const songs = await prisma.song.findMany({
    select: {
      songId: true,
      name: true,
      album: true,
      albumImg: true,
      duration: true,
      artist: {
        select: {
          name: true,
        },
      },
      _count: {
        select: { Vote: true },
      },
    },
    where: {
      sessionId: hash,
    },
    orderBy: [
      {
        createdAt: "asc",
      },
    ],
  });

  return songs
    .map((song) => ({ ...song, votes: song._count.Vote }))
    .sort((a, b) => b.votes - a.votes);
};

const addSong = async (hash, song) => {
  const artistId = await getArtistId(hash, song);
  return await prisma.song.create({
    data: {
      songId: song.id,
      name: song.name,
      album: song.album.name,
      albumImg: song.album.images[song.album.images.length - 1].url,
      duration: song.duration_ms,
      artistId,
      sessionId: hash,
    },
  });
};

const getArtistId = async (hash, song) => {
  const songArtist = song.artists[0];
  const artist = await prisma.artist.findFirst({
    where: {
      sessionId: hash,
      artistId: songArtist.id || "",
    },
  });
  if (artist) {
    return artist.id;
  }
  const newArtist = await prisma.artist.create({
    data: {
      name: songArtist.name,
      artistId: songArtist.id,
      sessionId: hash,
    },
  });
  return newArtist.id;
};

const getArtists = async (hash) => {
  const artists = await prisma.artist.findMany({
    select: {
      artistId: true,
      _count: {
        select: { Vote: true },
      },
    },
    where: {
      sessionId: hash,
    },
  });

  return artists
    .map((artist) => ({ id: artist.artistId, votes: artist._count.Vote }))
    .sort((a, b) => b.votes - a.votes);
};

const findSongById = async (hash, songId) =>
  await prisma.song.findFirst({
    where: {
      sessionId: hash,
      songId,
    },
    include: {
      Vote: true,
      artist: true,
    },
  });

const removeNextSong = async (hash) => {
  const queue = await getSongQueue(hash);
  if (queue.length > 0) {
    await prisma.song.deleteMany({
      where: {
        songId: queue[0].songId,
        sessionId: hash,
      },
    });
    return `spotify:track:${queue[0].songId}`;
  }
};

const voteSong = async (hash, song, voterId) => {
  await prisma.vote.create({
    data: {
      songId: song.id,
      user: voterId,
      sessionId: hash,
    },
  });
  await prisma.vote.create({
    data: {
      artistId: song.artist.id,
      user: voterId,
      sessionId: hash,
    },
  });
};

module.exports = {
  getLength,
  getSongQueue,
  addSong,
  getArtists,
  findSongById,
  removeNextSong,
  voteSong,
};
