import Sequelize, { Model } from 'sequelize'
import database from '../db'

class Song extends Model {
  song_id!: string
}

Song.init({
  song_id: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
  sequelize: database
})

export default Song
