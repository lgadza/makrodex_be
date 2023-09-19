

import { Sequelize } from "sequelize"

const connectionString = process.env.DATABASE_CONNECTION_STRING;
const sequelize = new Sequelize(connectionString,{
  dialect: "postgres",
  logging: false,
})
// const { PG_DB, PG_USER, PG_PASSWORD, PG_HOST, PG_PORT } = process.env
// const sequelize = new Sequelize({
//   database: PG_DB,
//   username: PG_USER,
//   password: PG_PASSWORD,
//   host: PG_HOST,
//   port: PG_PORT,
//   dialect: "postgres",
//   logging: false,
// })
export const pgConnect = async () => {
  try {
    await sequelize.authenticate()
    console.log("Successfully connected to Postgres!")
  } catch (error) {
    console.log(error)
    process.exit(1) 
  }
}
export const syncModels = async () => {
  await sequelize.sync({ alter: true })
  console.log("All tables successfully synchronized!")
}
export default sequelize
