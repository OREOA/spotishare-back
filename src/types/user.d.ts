export interface User {
    display_name?: string,
    external_urls: ExternalUrlObject,
    followers?: FollowersObject,
    href: string,
    id: string,
    images?: ImageObject[],
    type: "user",
    uri: string
}

export interface Profile extends User{
    birthdate: string,
    country: string,
    email: string,
    product: string
}