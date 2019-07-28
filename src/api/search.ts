import express from 'express'
import { hostHandler } from '../middlewares'

const router = express.Router()

router.use(hostHandler)

router.get('/', (req, res) => {
    const host = req.sessionHost

    if (!req.query.searchQuery) {
        return res.status(400).send('Missing query parameter')
    }

    return host.spotifyApi.searchByQuery(req.query.searchQuery)
        .then((responseObject: {}) => res.json(responseObject))
        .catch((err: Error) => res.send(err))
})


export default router
