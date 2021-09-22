const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.SongQueue = class SongQueue {
  // TODO: make these into actual database
  songs = [];
  hash = null;
  constructor(hash) {
    this.hash = hash;
  }

  getLength = () => this.songs.length;

  getSongs = () => this.songs.map((song) => song.songObject);

  getSongQueue = async () => {
    const songs = await prisma.song.findMany({
      select: {
        songId: true,
        name: true,
        album: true,
        albumImg: true,
        votes: true,
        artist: {
          select: {
            name: true,
            votes: true
          },
        },
      },
      where: {
        sessionId: this.hash,
      },
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
    });
    console.log(songs);

    return this.songs;
  };

  addSong = async (song) => {
    const artistId = await this.getArtistId(song);
    await prisma.song.create({
      data: {
        songId: song.id,
        name: song.name,
        album: song.album.name,
        albumImg: song.album.images[song.album.images.length - 1].url,
        votes: 0,
        artistId,
        sessionId: this.hash,
      },
    });
    this.songs.push({
      songObject: song,
      votes: [],
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
        votes: 0,
        sessionId: this.hash,
      },
    });
    return newArtist.id;
  };

  findSongById = (songId) =>
    this.songs.find((song) => song.songObject.id === songId);

  removeNextSong = () => {
    if (this.songs.length > 0) {
      return this.songs.shift().songObject;
    }
  };

  voteSong = (songId, voterId) => {
    const song = this.songs.find((song) => song.songObject.id === songId);
    song.votes.push({ voterId });
    this.orderSongs();
  };

  orderSongs = () => this.songs.sort((a, b) => b.votes.length - a.votes.length);
};
