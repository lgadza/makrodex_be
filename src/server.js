import express from "express"
import cors from "cors"
import listEndpoints from "express-list-endpoints"
import { pgConnect, syncModels } from "./db.js"
// import usersRouter from "./api/users/index.js"
// import blogsRouter from "./api/blogs/index.js"
// import categoriesRouter from "./api/categories/index.js"
import applicantRouter from "./api/admissions/applicants/index.js"
import {
  badRequestErrorHandler,
  forbiddenErrorHandler,
  genericErrorHandler,
  notFoundErrorHandler,
  unauthorizedErrorHandler,
} from "./errorHandlers.js"
import fileRouter from "./api/file/index.js"
import parentsRouter from "./api/parents/index.js"
import candidate_router from "./api/admissions/applicants/candidate-registration.js"

const server = express()
const port = process.env.PORT || 3001

// ********************************* MIDDLEWARES ***************************************
server.use(cors())
server.use(express.json())

// ********************************** ENDPOINTS ****************************************
// server.use("/users", usersRouter)
// server.use("/blogs", blogsRouter)
// server.use("/categories", categoriesRouter)
server.use("/applicants",applicantRouter)
server.use("/parents",parentsRouter)
server.use("/applicants/files",fileRouter)
server.use("/applicants/registration",candidate_router)

// ******************************* ERROR HANDLERS **************************************
server.use(badRequestErrorHandler)
server.use(notFoundErrorHandler)
server.use(unauthorizedErrorHandler)
server.use(forbiddenErrorHandler)
server.use(genericErrorHandler)

await pgConnect()
await syncModels()

server.listen(port, () => {
  console.table(listEndpoints(server))
  console.log(`Server is running on port ${port}`)
})
