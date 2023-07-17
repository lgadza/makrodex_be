import express from "express"
import cors from "cors"
import listEndpoints from "express-list-endpoints"
import { pgConnect, syncModels } from "./db.js"
import {
  badRequestErrorHandler,
  forbiddenErrorHandler,
  genericErrorHandler,
  notFoundErrorHandler,
  unauthorizedErrorHandler,
} from "./errorHandlers.js"
import fileRouter from "./api/file/index.js"
import guardiansRouter from "./api/guardians/index.js"
import applicantRouter from "./api/applicants/applicants.js"
import addressRouter from "./api/address/index.js"
import applicationRouter from "./api/applications/index.js"
import guardianTypeRouter from "./api/guardians/guardian_type.js"


const server = express()
const port = process.env.PORT || 3001

// ********************************* MIDDLEWARES ***************************************
server.use(cors())
server.use(express.json())

// ********************************** ENDPOINTS ****************************************

server.use("/applicants",applicantRouter)
server.use("/address", addressRouter)
server.use("/guardians",guardiansRouter)
server.use("/applicants/files",fileRouter)
server.use("/applications",applicationRouter)
server.use("/guardians/types",guardianTypeRouter)

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
