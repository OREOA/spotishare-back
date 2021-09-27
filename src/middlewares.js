const { getSpotify } = require("./services/spotify");
const { SpotifyApi } = require("./services/spotifyApi");

function notFound(req, res, next) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

// eslint-disable-next-line no-unused-vars */
function errorHandler(err, req, res, next) {
  console.error(err);
  const statusCode = err.status
    ? err.status
    : res.statusCode !== 200
    ? res.statusCode
    : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
}

async function authentication(req, res, next) {
  const { accessToken, refreshToken, expirationTime } = req.spotishare;

  if (!accessToken) {
    const err = new Error("Not authorized");
    err.status = 400;
    return next(err);
  }

  // Hasn't expired
  if (new Date(expirationTime) > new Date()) {
    return next();
  }

  const s = getSpotify({
    accessToken,
    refreshToken,
  });

  try {
    const {
      body: { access_token },
    } = await s.refreshAccessToken();
    req.spotishare.accessToken = access_token;
    next();
  } catch (error) {
    console.error(error);
    const err = new Error("Failed to request new access token");
    err.status = 400;
    return next(err);
  }
}

function hostHandler(req, res, next) {
  const session = req.method === "GET" ? req.query.session : req.body.session;
  req.session = session;
  req.spotify = new SpotifyApi(
    req.spotishare.accessToken,
    req.spotishare.refreshToken
  );
  return next();
}

module.exports = {
  notFound,
  errorHandler,
  authentication,
  hostHandler,
};
