import dotenv from 'dotenv'

dotenv.config()

export const clientId = process.env.CLIENTID
export const clientSecret = process.env.CLIENTSECRET
export const redirectUri = process.env.REDIRECTURI
export const frontUri = process.env.FRONTURI
export const cookieSecret = process.env.COOKIE_SECRET