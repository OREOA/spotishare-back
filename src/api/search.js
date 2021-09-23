const express = require('express')
const { hostHandler } = require('../middlewares')
const { convertCurrentSong } = require('../utils/convert')

const router = express.Router()

router.use(hostHandler)


router.get('/', (req, res) => {
    const host = req.sessionHost

    if (!req.query.searchQuery) {
        return res.status(400).send('Missing query parameter')
    }

    return host.spotifyApi.searchByQuery(req.query.searchQuery)
        .then(responseObject => {
            const tracks = responseObject.body.tracks.items.map(convertCurrentSong)
            return res.json(tracks)
        })
        .catch(err => res.send(err))
})


module.exports = router
