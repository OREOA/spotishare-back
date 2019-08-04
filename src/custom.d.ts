declare namespace Express {
    export interface Request {
        user: import('./types/user').default
        spotishare: {
            access_token?: string
            refresh_token?: string
        }
        sessionHost: import('./services/playback').default
    }
}