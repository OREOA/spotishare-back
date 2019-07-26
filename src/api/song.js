const express = require('express')

const router = express.Router()

const { getHostByHash } = require('../services/playbackController')

router.post('/:hash', (req, res) => {
    if (!req.params.hash) {
        return res.send('Missing hash', 400)
    }

    const host = getHostByHash(req.params.hash)

    if (!host) {
        return res.status(400).send('Invalid hash')
    }

    return host.spotifyApi.getSongById(req.body.songId)
        .then(responseObject => {
            if (responseObject.statusCode === 200) {
                if (host.songQueue.includes(responseObject.body)) {
                    return res.status(418).send('Hyvää juhannusta')
                }
                return res.json(host.addSong(responseObject.body))
            } else {
                return res.status(400).send('Song id not found')
            }
        })
        .catch(err => res.send(err))
})

router.post('/removeNext/:hash', (req, res) => {
    if (!req.params.hash) {
        return res.send('Missing hash', 400)
    }

    const host = getHostByHash(req.params.hash)

    if (!host) {
        return res.status(400).send('Invalid hash')
    }

    if (host.songQueue.length > 0) {
        return res.json(host.removeNextSong())
    }
    return res.send('Whats the correct status code', 400)
})

router.post('/next/:hash', (req, res) => {
    if (!req.params.hash) {
        return res.send('Missing hash', 400)
    }

    const host = getHostByHash(req.params.hash)

    if (!host) {
        return res.status(400).send('Invalid hash')
    }

    if (host.songQueue.length > 0) {
        host.playNextSong()
            .then(res.send(200))
    }
    return res.send('Whats the correct status code', 400)
})

router.get('/:hash', (req, res) => {

    if (!req.params.hash) {
        return res.status(400).send('Missing hash')
    }

    const host = getHostByHash(req.params.hash)

    if (!host) {
        return res.status(400).send('Invalid hash')
    }

    return res.json(host.songQueue)
})

router.get('/current/:hash', (req, res) => {

    if (!req.params.hash) {
        return res.status(400).send('Missing hash')
    }

    const host = getHostByHash(req.params.hash)

    if (!host) {
        return res.status(400).send('Invalid hash')
    }

    return res.json({
        song: host.currentSong,
        progress: host.currentProgress
    })
})

/* needs to be refactored to use class based playback
router.post('/move', (req, res) => {
   if (!req.params.hash) {
       return res.send('Missing hash', 400)
   }

   const host = getHostByHash(req.params.hash)
   
   if (!host) {
       return res.status(400).send('Invalid hash')
   }

   const { songId, moveUp } = req.body
   const songIndex = songQueue.findIndex(songObject => songObject.uri === songId)

   if (songIndex === -1) {
       return res.send('Song not in queue', 400)
   }

   if ((moveUp === true && songIndex <= 0) || (moveUp === false && songIndex >= songQueue.length - 1)) {
       return res.send('Invalid move', 400)
   }

   const nextIndex = moveUp ? songIndex -1 : songIndex + 1
   const swapSong = songQueue[nextIndex]
   songQueue[nextIndex] = songQueue[songIndex]
   songQueue[songIndex] = swapSong

   res.send(200)
})*/

module.exports = router
