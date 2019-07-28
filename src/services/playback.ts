import { SpotifyApi, Context } from './spotify'
import * as songsService from './songsService'
import { Session } from '../types/session'
import { Song } from '../types/song'

export class Playback {
    songQueue: Song[] = []
    playbackInterval: boolean = false
    hash: Session['hash']
    currentSong: Song | null = null
    currentProgress: number = 0
    savedContext: Context | null = null
    spotifyApi: SpotifyApi
    hostName: string | undefined
    constructor(accessToken: string, refreshToken: string, hash: Session['hash']) {
        this.spotifyApi = new SpotifyApi(accessToken, refreshToken)
        this.hash = hash
        this.startInterval()

        this.spotifyApi.getUserInfo()
            .then(data => this.hostName = data.body.display_name)
            .catch(err => console.log(err))
    }

    addSong = (song: Song) => {
        this.songQueue.push(song)
    }

    removeNextSong = () => {
        if (this.songQueue.length > 0) {
            return this.songQueue.shift()
        }
    }

    playNextSong = () => {
        if (this.songQueue.length) {
            const next = this.songQueue.shift()
            const nextSongId = next ? next.uri : ''
            // TODO: this?
            // songsService.updateSongs(nextSongId)
            console.log("Playing next song")
            return this.spotifyApi.playSongById(nextSongId)
                .then(() => new Promise(resolve => setTimeout(resolve, 3000)))
                .catch(err => console.log(err.message))
        } else {
            throw new Error('No songs in the queue')
        }
    }

    playSavedContext = () => {
        console.log("Playing by saved context")
        if (!this.savedContext) {
            console.log('No Saved context')
            return
        }
        return this.spotifyApi.setShuffle()
            .then(() => this.spotifyApi.playSongByContext(this.savedContext!))
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
            this.currentProgress = res.body.progress_ms || 0
            const remainingDuration = this.currentSong.duration_ms - this.currentProgress
            if (res.body.item) {
                console.log(`Listening to ${res.body.item.name} on ${res.body.device.name}(${res.body.device.type}). Next song in ${parseInt((remainingDuration / 1000).toString()) - 3}s`)
            }
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

