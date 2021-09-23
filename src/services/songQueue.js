const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.SongQueue = class SongQueue {
  hash = null;
  constructor(hash) {
    this.hash = hash;
  }

  getLength = async () => await prisma.song.count();

  getSongQueue = async () => {
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
        sessionId: this.hash,
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

  addSong = async (song) => {
    const artistId = await this.getArtistId(song);
    await prisma.song.create({
      data: {
        songId: song.id,
        name: song.name,
        album: song.album.name,
        albumImg: song.album.images[song.album.images.length - 1].url,
        duration: song.duration_ms,
        artistId,
        sessionId: this.hash,
      },
    });
  };

  getArtistId = async (song) => {
    const songArtist = song.artists[0];
    const artist = await prisma.artist.findFirst({
      where: {
        sessionId: this.hash,
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
        sessionId: this.hash,
      },
    });
    return newArtist.id;
  };

  getArtists = async () => {
    const artists = await prisma.artist.findMany({
      select: {
        artistId: true,
        _count: {
          select: { Vote: true },
        },
      },
      where: {
        sessionId: this.hash,
      },
    });

    return artists
      .map((artist) => ({ id: artist.artistId, votes: artist._count.Vote }))
      .sort((a, b) => b.votes - a.votes);
  };

  findSongById = async (songId) =>
    await prisma.song.findFirst({
      where: {
        sessionId: this.hash,
        songId,
      },
      include: {
        Vote: true,
        artist: true,
      },
    });

  removeNextSong = async () => {
    const queue = await this.getSongQueue();
    if (queue.length > 0) {
      await prisma.song.deleteMany({
        where: {
          songId: queue[0].songId,
          sessionId: this.hash,
        },
      });
      return `spotify:track:${queue[0].songId}`;
    }
  };

  voteSong = async (song, voterId) => {
    await prisma.vote.create({
      data: {
        songId: song.id,
        user: voterId,
        sessionId: this.hash,
      },
    });
    await prisma.vote.create({
      data: {
        artistId: song.artist.id,
        user: voterId,
        sessionId: this.hash,
      },
    });
  };
};
