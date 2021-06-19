exports.SongQueue = class SongQueue {
    songs = []
    
    getLength = () => this.songs.length

    getSongs = () => this.songs.map(song => song.songObject)

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
            const updatedSong = {
                ...song,
                votes: [
                    ...song.votes,
                    {
                        voterId,
                        isPositive: true
                    }
                ]

            }
            this.songs = this.songs.map(song => song.songObject.id === songId ? updatedSong : song)
        }
        console.log(this.songs)
    }
}