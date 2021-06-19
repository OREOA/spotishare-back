exports.SongQueue = class SongQueue {
    songs = []
    
    getLength = () => this.songs.length

    getSongs = () => this.songs

    addSong = (song) => this.songs.push(song)

    hasSong = (song) => this.songs.includes(song)

    removeNextSong = () => {
        if (this.songs.length > 0) {
            return this.songs.shift()
        }
    }
}