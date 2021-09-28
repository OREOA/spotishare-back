const SpotifyWebApi = require("spotify-web-api-node");
const config = require("../config");

const getSpotify = (options = {}) =>
  new SpotifyWebApi({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: config.redirectUri,
    ...options,
  });

const getMe = async (tokenOrInstance) => {
  const isToken =
    typeof tokenOrInstance === "string" || tokenOrInstance instanceof String;
  const s = isToken
    ? getSpotify({
        accessToken: tokenOrInstance,
      })
    : tokenOrInstance.spotifyWebApi;
  const { body } = await s.getMe();
  return body;
};

module.exports = {
  getSpotify,
  getMe,
};
