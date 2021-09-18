const express = require('express')
const { hostHandler } = require('../middlewares')

const router = express.Router()

router.use(hostHandler)

router.post('/', async (req, res) => {
    const host = req.sessionHost
    const { songId } = req.body
    if (!songId) {
        return res.status(400).send('Invalid input')
    }

    if (host.songQueue.findSongById(songId)) {
        return res.status(400).send('Song already in the queue')
    }

    const { statusCode, body: song } = await host.spotifyApi.getSongById(songId)
    if (statusCode !== 200) {
        if (statusCode === 400) {
            return res.status(400).send('Song id not found')
        }
        return res.status(500).send('Something went wrong')
    }

    return res.json(host.addSong(song))
})

router.post('/removeNext', (req, res) => {
    const host = req.sessionHost
    if (host.songQueue.getLength() > 0) {
        return res.json(host.removeNextSong())
    }
    return res.status(400).send('No songs in the list')
})

router.post('/next', async (req, res) => {
    const host = req.sessionHost
    if (host.songQueue.getLength() > 0) {
        await host.playNextSong()
        return res.sendStatus(200)
    }
    return res.status(400).send('No songs in the list')
})

router.post('/recommendation', async (req, res) => {
    const host = req.sessionHost
    try {
        await host.addRecommendation()
        return res.status(204).send()
    } catch (e) {
        return res.status(400).send(e)
    }
})

router.get('/recommendation', async (req, res) => {
    const host = req.sessionHost
    try {
        console.log(host)
        const recommendation = await host.getRecommendation()
        return res.json(recommendation)
    } catch (e) {
        return res.status(400).send(e)
    }
})


router.get('/', (req, res) => {
    const host = req.sessionHost
    return res.json({
        song: host.currentSong,
        progress: host.currentProgress,
        queue: host.songQueue.getSongQueue()
    })
})

router.post('/:id/vote', async (req, res) => {
    const host = req.sessionHost
    const { userId } = req.spotishare
    const songId = req.params.id
    if (!songId) {
        return res.status(400).send('Song id missing')
    }
    try {
        host.voteSong(songId, userId)
        return res.status(204).send()
    } catch (e) {
        console.log(e)
        return res.status(400).send(e)
    }
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
