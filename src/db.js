import fs from "fs"
import { Sequelize } from "sequelize"
const { PG_DB, PG_USER, PG_PASSWORD, PG_HOST, PG_PORT } = process.env
const sequelize = new Sequelize({
  host: PG_HOST,
  password: PG_PASSWORD,
  port: PG_PORT,
  database: PG_DB,
  username: PG_USER,
  dialect: "postgres",
  // dialectOptions: {
  //   ssl: {
  //     require: true,
  //     rejectUnauthorized: true,
  //     ca: fs.readFileSync("./us-east-1-bundle.pem")
  //   }
  // },
  logging: false,
})
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
