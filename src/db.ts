import { Sequelize } from 'sequelize'

if (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASSWORD) {
    throw new Error('No DB_NAME, DB_USER and/or DB_PASSWORD defined!')
}

const database = new Sequelize(process.env.DB_NAME || '', process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
})

export default database
