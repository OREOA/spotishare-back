const { SpotifyApi } = require('./spotifyApi')
const { getMe } = require('./spotify')
const songsService = require('./songsService')
const { SongQueue } = require('./songQueue')

exports.Playback = class Playback {
    songQueue = new SongQueue()
    playbackInterval = false
    currentSong = null
    currentProgress = 0
    savedContext = null
    owner = null
    constructor(accessToken, refreshToken, hash, userId) {
        this.spotifyApi = new SpotifyApi(accessToken, refreshToken)
        this.hash = hash
        this.owner = {
            id: userId
        }
        this.startInterval()
    }

    initOwner = () => {
        return getMe(this.spotifyApi)
            .then(me => {
                this.owner = {
                    ...this.owner,
                    ...me,
                }
            })
    }

    terminate = () => {
        this.stopInterval()
        this.spotifyApi.terminate()
    }

    addSong = (song) => this.songQueue.addSong(song)

    removeNextSong = () => this.songQueue.removeNextSong()

    playNextSong = () => {
        const nextSongId = this.removeNextSong().uri
        songsService.updateSongs(nextSongId.split(':')[2])
        console.log("Playing next song")
        return this.spotifyApi.playSongById(nextSongId)
            .then(() => new Promise(resolve => setTimeout(resolve, 3000)))
            .catch(err => console.log(err.message))
    }

    playSavedContext = () => {
        console.log("Playing by saved context")
        return this.spotifyApi.setShuffle()
            .then(this.spotifyApi.playSongByContext(this.savedContext))
            .then(() => new Promise(resolve => setTimeout(resolve, 3000)))
            .catch(err => console.log(err.message))
    }

    pollPlayback = () => this.spotifyApi.getPlaybackState()
        .then(res => {
            if (res.body.context) {
                this.savedContext = res.body.context
            }
            this.currentSong = res.body.item
            if (!this.currentSong) {
                return
            }
            this.currentProgress = res.body.progress_ms
            const remainingDuration = this.currentSong.duration_ms - this.currentProgress
            console.log(`Listening to ${res.body.item.name} on ${res.body.device.name}(${res.body.device.type}). Next song in ${parseInt(remainingDuration / 1000) - 3}s`)
            console.log(`Songs still in queue: ${this.songQueue.getSongs().map(song => "\n" + song.name)}`)
            if (remainingDuration < 3000) {
                console.log("Duration < 3s")
                if (this.songQueue.getLength() > 0) {
                    return this.playNextSong()
                }
                if (!res.body.context && this.savedContext) {
                    return this.playSavedContext()
                        .then(() => {
                            // Play saved context only once
                            this.savedContext = null
                        })
                }
            }
        })
        .catch(err => console.log(err.message))

    startInterval = () => {
        this.playbackInterval = true
        const interval = () => {
            if (this.playbackInterval) {
                Promise.all([
                    this.pollPlayback(),
                    new Promise((resolve) => setTimeout(resolve, 1000))
                ]).then(interval)
            }
        }
        interval()
    }

    stopInterval = () => {
        this.playbackInterval = false
    }
}

