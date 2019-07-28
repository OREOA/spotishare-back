import { Playback } from './services/playback'
import { User } from './types/user'

declare global {
    declare namespace Express {
        interface Request {
            sessionHost: Playback
            spotishare: {
                access_token: string
                refresh_token: string
            }
            user: User
            spotishare: {
                access_token?: string
                refresh_token?: string
            }
        }

        interface Response {

        }
    }
}
