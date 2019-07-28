type Artist = {
    name: string
}

type Image = {
    width?: number | undefined
    height?: number | undefined
    url: string
}

type Album = {
    href: string,
    id: string,
    images: Image[],
    name: string,
    uri: string
}

export interface Song {
    id: string
    name: string
    artists: Artist[]
    album: Album
    duration_ms: number
    uri: string
}