const { SpotifyApi } = require('./spotify')
const songsService = require('./songsService')

exports.Playback = class Playback {
    constructor(accessToken, refreshToken, hash) {
        this.songQueue = []
        this.playbackInterval = false
        this.spotifyApi = new SpotifyApi(accessToken, refreshToken)
        this.hash = hash
        this.startInterval()
        this.currentSong = null
        this.currentProgress = 0
        this.savedContext = null

        this.spotifyApi.getUserInfo()
            .then(data => this.hostName = data.body.display_name)
            .catch(err => console.log(err))
    }

    addSong = (song) => {
        this.songQueue.push(song)
    }

    removeNextSong = () => {
        if (this.songQueue.length > 0) {
            return this.songQueue.shift()
        }
    }

    playNextSong = () => {
        const nextSongId = this.songQueue.shift().uri
        songsService.updateSongs(nextSongId)
        console.log("Playing next song")
        return this.spotifyApi.playSongById(nextSongId)
            .then(() => new Promise(resolve => setTimeout(resolve, 3000)))
            .catch(err => console.log(err.message))
    }

    playSavedContext = () => {
        console.log("Playing by saved context")
        console.log(this.savedContext)
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
            console.log(`Songs still in queue: ${this.songQueue.map(song => "\n" + song.name)}`)
            if (remainingDuration < 3000) {
                console.log("Duration < 3s")
                if (this.songQueue.length > 0) {
                    return this.playNextSong()
                }
                if (!res.body.context && this.savedContext) {
                    return this.playSavedContext()
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
}

