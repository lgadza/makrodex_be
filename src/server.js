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
import guardiansRouter from "./api/guardians/index.js"
import userRouter from "./api/users/index.js"
import addressRouter from "./api/address/index.js"
import applicationRouter from "./api/applications/index.js"
import guardianTypeRouter from "./api/guardians/guardian_type.js"
import fileRouter from "./api/file/index.js"
import AiRouter from "./api/makronexusAI/index.js"
import bodyParser from "body-parser"
import chatRouter from "./api/makronexusAI/chats/index.js"
import router from "./api/makronexusAI/langchain/index.js"
import aiSettingsRouter from "./api/makronexusAI/aiSettings/index.js"
import whatsAppRouter from "./api/makronexusAI/whatsapp/index.js"

const server = express()
const port = process.env.PORT || 3001

// ********************************* MIDDLEWARES ***************************************
server.use(cors(
  {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  }
))
// server.use(express.json())
server.use(bodyParser.json())

// ********************************** ENDPOINTS ****************************************

server.use("/users",userRouter)
server.use("/address", addressRouter)
server.use("/guardians",guardiansRouter)
server.use("/users/files",fileRouter)
server.use("/applications",applicationRouter)
server.use("/guardians/types",guardianTypeRouter)
server.use("/ai",AiRouter)
server.use("/ai",chatRouter)
server.use('/ai', whatsAppRouter);
server.use('/langchain/qdrant', router);
server.use('/makronexa', aiSettingsRouter);

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
// await pool()