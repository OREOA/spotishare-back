import express from 'express'
import getSpotify from '../services/spotify'

const router = express.Router()

router.get('/', (req, res) => {
    const token = req.spotishare.access_token
    const s = getSpotify({
        accessToken: token,
    })
    s.getMe().then(({ body }) => {
        res.json(body)
    })
})

export default router
