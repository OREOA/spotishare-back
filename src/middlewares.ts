import express, { RequestHandler, ErrorRequestHandler } from 'express'

import cache from 'memory-cache'
import getSpotify from './services/spotify'
import ApiError from './util/apiError'
import { getHostByHash } from './services/playbackController'

export const notFound: RequestHandler = (req, res, next) => {
  res.status(404)
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`)
  next(error)
}

// eslint-disable-next-line no-unused-vars */
export const errorHandler: ErrorRequestHandler = (err: ApiError, req, res, next) => {
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

const FIFTEEN_MINUTES = 15 * 60 * 1000

export const authentication: RequestHandler = async (req, res, next) => {
  try {
    // @ts-ignore
    const accessToken = req.spotishare.access_token
    // @ts-ignore
    const refreshToken = req.spotishare.refresh_token
    if (!accessToken) {
      const err = new ApiError('Not authorized', 400)
      return next(err)
    }

    if (cache.get(accessToken)) {
      return next()
    }

    const spotify = getSpotify({
      accessToken,
      refreshToken
    })

    let me
    try {
      const { body } = await spotify.getMe()
      me = body
    } catch (e) {
      try {
        const { body } = await spotify.refreshAccessToken()
        const { access_token } = body
        cache.put(access_token, true, FIFTEEN_MINUTES)
        spotify.setAccessToken(accessToken)
        // @ts-ignore
        req.spotishare.access_token = access_token
        const { body: body2 } = await spotify.getMe()
        me = body2
      } catch (e2) {
        const err = new ApiError('Failed to request new access token', 400)
        return next(err)
      }
    }
    // @ts-ignore
    req.user = me
    next()
  } catch (error) {
    return next(error)
  }
}

export const hostHandler: RequestHandler = (req, res, next) => {
  const session = req.method === 'GET' ? req.query.session : req.body.session
  if (!session) {
    return res.status(400).send('Missing session hash')
  }
  const host = getHostByHash(session)
  if (!host) {
    return res.status(400).send('Invalid hash')
  }
  // @ts-ignore
  req.sessionHost = host
  return next()
}
