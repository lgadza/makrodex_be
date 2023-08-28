// // import pkg from 'pg';
// // const { Pool } = pkg;
// import { Sequelize } from "sequelize"

// const { PG_DB, PG_USER, PG_PASSWORD, PG_HOST, PG_PORT } = process.env

// const sequelize = new Sequelize(PG_DB, PG_USER, PG_PASSWORD, {
//   host: PG_HOST,
//   port: PG_PORT,
//   dialect: "postgres",
//   logging:false,
//   // logging:console.log,
  
// })

// export const pgConnect = async () => {
//   try {
//     await sequelize.authenticate()
//     console.log("Successfully connected to Postgres!")
//   } catch (error) {
//     console.log(error)
//     process.exit(1) // kills node.js process
//   }
// }

// export const syncModels = async () => {
//   await sequelize.sync({ alter: true })
//   console.log("All tables successfully synchronized!")
// }
// // FOR VERCEL
// // export const pool = new Pool({
// //   connectionString: process.env.POSTGRES_URL + "?sslmode=require",
// // }) 
// // pool.connect((error)=>{
// //   if(error) throw error
// //   console.log("Pool Connection to Postgres successful")
// // })
// export default sequelize
import { Sequelize } from "sequelize"

// const { PG_DB, PG_USER, PG_PASSWORD, PG_HOST, PG_PORT } = process.env
const connectionString = "postgres://makronexus_user:RDc7oMPcZ1FFdS4JnxS8CI3IgJGsJnhv@dpg-cjlnbsnv9s6c73b1p92g-a/makronexus";
const sequelize = new Sequelize(connectionString,{
  dialect: "postgres",
  logging: false,
})
// const sequelize = new Sequelize({
//   database: PG_DB,
//   username: PG_USER,
//   password: PG_PASSWORD,
//   host: PG_HOST,
//   port: PG_PORT,
//   dialect: "postgres",
//   logging: false,
// })
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
    process.exit(1) // kills node.js process
  }
}

export const syncModels = async () => {
  await sequelize.sync({ alter: true })
  console.log("All tables successfully synchronized!")
}

export default sequelize
