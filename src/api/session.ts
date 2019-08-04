import express from 'express'
import * as playbackController from '../services/playbackController'

const router = express.Router()

router.get('/', (req, res) => {
    const session = playbackController.getHostByRefreshToken(req.spotishare.refresh_token)
    res.json(session && {
        owner: session.owner,
        hash: session.hash
    })
})

router.get('/:hash', (req, res) => {
    const session = playbackController.getHostByHash(req.params.hash)
    res.json(session && {
        owner: session.owner,
        hash: session.hash
    })
})

router.post('/', (req, res) => {
    if (playbackController.getHostByRefreshToken(req.spotishare.refresh_token)) {
        return res.status(400).send('Active session already exists for host')
    }
    const hash = playbackController.addHost(req.spotishare.access_token, req.spotishare.refresh_token)
    res.json({ hash })
})

router.delete('/', (req, res) => {
    const session = playbackController.getHostByRefreshToken(req.spotishare.refresh_token)
    if (session) {
        playbackController.deleteHost(session)
        return res.sendStatus(200)
    }
    res.status(400).send('No active session for host')
})

export default router