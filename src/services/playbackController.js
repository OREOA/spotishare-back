const { Playback } = require('./playback')
const crypto = require('crypto')
let activeHosts = []

exports.addHost = (accessToken, refreshToken) => new Promise((resolve, reject) => {
    const hash = crypto.randomBytes(10).toString('hex')
    const playback = new Playback(accessToken, refreshToken, hash)
    activeHosts.push(playback)
    playback
        .on('ready', () => {
            resolve(hash)
        })
        .on('error', (error) => {
            reject(error)
        })
})

exports.deleteHost = host  => {
    host.terminate()
    activeHosts = activeHosts.filter(activeHost => activeHost !== host)
}

exports.getHosts = () => activeHosts

exports.getHostByHash = hash => {
    const filteredHosts = activeHosts.filter(host => host.hash === hash)
    return filteredHosts.length > 0 ? filteredHosts[0] : null
}

exports.getHostByRefreshToken = token => activeHosts.find(host => host.spotifyApi.spotifyWebApi.getRefreshToken() === token) || null
