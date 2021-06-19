exports.SongQueue = class SongQueue {
    songs = []

    getLength = () => this.songs.length

    getSongs = () => this.songs.map(song => song.songObject)

    getSongQueue = () => this.songs

    addSong = (song) => this.songs.push({
        songObject: song,
        votes: []
    })

    hasSong = (song) => this.songs.map(song => song.songObject).includes(song)

    removeNextSong = () => {
        if (this.songs.length > 0) {
            return this.songs.shift().songObject
        }
    }

    voteSong = (songId, voterId) => {
        const song = this.songs.find(song => song.songObject.id === songId)
        console.log(song.songObject.id)
        if (!song) {
            throw new Error('Song not in queue')
        }

        if (song.votes.map(vote => vote.voterId).includes(voterId)) {
            throw new Error(`User with id ${voterId} has already voted this song`)
        } else {

            // this sometimes generates more than 1 vote
            const testingAloneWithoutFriends = true
            if (testingAloneWithoutFriends) {
                while (Math.random() > 0.5) {
                    song.votes.push(Math.random().toString(36).substring(7))
                }
            }

            song.votes.push({ voterId })
            this.orderSongs()
        }
    }

    orderSongs = () => this.songs.sort((a,b) => b.votes.length - a.votes.length)
}