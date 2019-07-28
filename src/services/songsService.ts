import Song from '../models/song'

export async function updateSongs(song: Song) {
  try {
    await Song.sync()
    return Song.create({song_id: song})
  } catch (error) {
    return { error: error }
  }
}
