const express = require('express')
const { hostHandler } = require('../middlewares')

const router = express.Router()

router.use(hostHandler)

router.post('/', async (req, res) => {
    const host = req.sessionHost
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

router.post('/removeNext', (req, res) => {
    const host = req.sessionHost
    if (host.songQueue.length > 0) {
        return res.json(host.removeNextSong())
    }
    return res.status(400).send('No songs in the list')
})

router.post('/next', async (req, res) => {
    const host = req.sessionHost
    if (host.songQueue.length > 0) {
        await host.playNextSong()
        res.sendStatus(200)
    }
    return res.status(400).send('No songs in the list')
})

router.get('/', (req, res) => {
    const host = req.sessionHost
    return res.json(host.songQueue)
})

router.get('/current', (req, res) => {
    const host = req.sessionHost
    return res.json({
        song: host.currentSong,
        progress: host.currentProgress
    })
})

/* needs to be refactored to use class based playback
router.post('/move', (req, res) => {
   if (!req.params.hash) {
       return res.status(400).send('Missing hash')
   }

   const host = getHostByHash(req.params.hash)
   
   if (!host) {
       return res.status(400).send('Invalid hash')
   }

   const { songId, moveUp } = req.body
   const songIndex = songQueue.findIndex(songObject => songObject.uri === songId)

   if (songIndex === -1) {
       return res.status(400).send('Song not in queue')
   }

   if ((moveUp === true && songIndex <= 0) || (moveUp === false && songIndex >= songQueue.length - 1)) {
       return res.status(400).send('Invalid move')
   }

   const nextIndex = moveUp ? songIndex -1 : songIndex + 1
   const swapSong = songQueue[nextIndex]
   songQueue[nextIndex] = songQueue[songIndex]
   songQueue[songIndex] = swapSong

   res.sendStatus(200)
})*/

module.exports = router
