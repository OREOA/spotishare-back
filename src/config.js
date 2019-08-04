require('dotenv').config()

let clientId = process.env.CLIENTID
let clientSecret = process.env.CLIENTSECRET
let redirectUri = process.env.REDIRECTURI
let frontUri = process.env.FRONTURI
let cookieSecret = process.env.COOKIESECRET

module.exports = {
    clientId,
    clientSecret,
    redirectUri,
    frontUri,
    cookieSecret
}