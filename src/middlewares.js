const { getSpotify } = require('./services/spotify')

const { getHostByHash } = require('./services/playbackController')

function notFound(req, res, next) {
  res.status(404)
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`)
  next(error)
}

// eslint-disable-next-line no-unused-vars */
function errorHandler(err, req, res, next) {
  console.error(err)
  const statusCode = err.status
    ? err.status
    : res.statusCode !== 200
      ? res.statusCode
      : 500
  res.status(statusCode)
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  })
}

async function authentication(req, res, next) {
  const { accessToken, refreshToken, expirationTime } = req.spotishare

  if (!accessToken) {
    const err = new Error('Not authorized')
    err.status = 400
    return next(err)
  }

  // Hasn't expired
  if (new Date(expirationTime) > new Date()) {
    return next()
  }

  const s = getSpotify({
    accessToken,
    refreshToken
  })

  try {
    const { body: { access_token } } = await s.refreshAccessToken()
    req.spotishare.accessToken = access_token
    next()
  } catch (error) {
    console.error(error)
    const err = new Error('Failed to request new access token')
    err.status = 400
    return next(err)
  }
}

async function hostHandler(req, res, next) {
  const session = req.method === 'GET' ? req.query.session : req.body.session
  if (!session) {
    return res.status(400).send('Missing session hash')
  }
  const host = await getHostByHash(session)
  if (!host) {
    return res.status(400).send('Invalid hash')
  }
  req.sessionHost = host
  return next()
}

module.exports = {
  notFound,
  errorHandler,
  authentication,
  hostHandler
}
