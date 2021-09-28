const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const middlewares = require("./middlewares");
const song = require("./api/song");
const search = require("./api/search");
const session = require("./api/session");
const config = require("./config");
const clientSession = require("client-sessions");
const { getSpotify, getMe } = require("./services/spotify");
const sessionService = require("./services/session");
cookieParser = require("cookie-parser");

const app = express();

const spotifyApi = getSpotify();
sessionService.startInterval();

app.use(morgan("dev"));
app.use(
  cors({
    origin: config.frontUri,
    credentials: true,
  })
);
app.use(helmet());
app.use(bodyParser.json());
app.use(
  clientSession({
    cookieName: "spotishare",
    secret: config.cookieSecret,
  })
);
app.use(cookieParser());

app.get("/login", (req, res) => {
  const scopes = ["user-modify-playback-state", "user-read-playback-state"];
  const { redirectUrl } = req.query;
  const url = spotifyApi.createAuthorizeURL(
    scopes,
    JSON.stringify({ redirectUrl })
  );
  res.redirect(url);
});

app.get("/ok", (req, res, next) => {
  const { code, state: stateAsString } = req.query;
  const state = stateAsString && JSON.parse(stateAsString);
  const redirectUrl = (state && state.redirectUrl) || config.frontUri;
  spotifyApi
    .authorizationCodeGrant(code)
    .then(({ body, headers }) => {
      const now = new Date(headers.date).getTime();
      const expirationTimestampMs = now + body.expires_in * 1000;
      req.spotishare.accessToken = body.access_token;
      req.spotishare.refreshToken = body.refresh_token;
      req.spotishare.expirationTime = expirationTimestampMs;
      return getMe(body.access_token);
    })
    .then(({ id }) => {
      req.spotishare.userId = id;
      res.redirect(redirectUrl);
    })
    .catch(next);
});

app.use(middlewares.authentication);

app.get("/api/me", (req, res, next) => {
  const token = req.spotishare.accessToken;
  getMe(token)
    .then((me) => res.json(me))
    .catch(next);
});

app.use("/api/song", song);
app.use("/api/session", session);
app.use("/api/search", search);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
