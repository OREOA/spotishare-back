exports.SongQueue = class SongQueue {
    // TODO: make these into actual database
    songs = []

    getLength = () => this.songs.length

    getSongs = () => this.songs.map(song => song.songObject)

    getSongQueue = () => this.songs

    addSong = (song) => this.songs.push({
        songObject: song,
        votes: []
    })

    findSongById = (songId) => this.songs.find(song => song.songObject.id === songId)

    removeNextSong = () => {
        if (this.songs.length > 0) {
            return this.songs.shift().songObject
        }
    }

    voteSong = (songId, voterId) => {
        const song = this.songs.find(song => song.songObject.id === songId)
        song.votes.push({ voterId })
        this.orderSongs()
    }

    orderSongs = () => this.songs.sort((a, b) => b.votes.length - a.votes.length)
}