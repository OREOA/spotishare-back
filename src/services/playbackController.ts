import crypto from 'crypto'
import { Playback } from './playback'
import { Session } from '../types/session'

const activeHosts: Playback[] = []

export const addHost = (accessToken: string, refreshToken: string) => {
    const hash = crypto.randomBytes(10).toString('hex')
    activeHosts.push(new Playback(accessToken, refreshToken, hash))
    return hash
}

export const getHosts = () => activeHosts

export const getHostByHash = (hash: Session['hash']) => {
    const filteredHosts = activeHosts.filter(host => host.hash === hash)
    return filteredHosts.length > 0 ? filteredHosts[0] : null
}
