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
import whatsAppRouter from "./api/makronexusAI/whatsapp/index.js"
import schoolRouter from "./api/schools/index.js"
import userAISettingsRouter from "./api/makronexusAI/userAISettings/index.js"
import AIFileRouter from "./api/makronexusAI/files/index.js"
import datasetChatRouter from "./api/makronexusAI/datasetChats/index.js"
import stripeRouter from "./api/payment_gateways/index.js"
import fileSystemManagement from "./api/file/filesystem-server.js"

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
server.use(bodyParser.urlencoded({
  extended: true
}));

// ********************************** ENDPOINTS ****************************************

server.use("/users",userRouter)
server.use("/schools",schoolRouter)
server.use("/address", addressRouter)
server.use("/guardians",guardiansRouter)
server.use("/applications",applicationRouter)
server.use("/users/files",fileRouter)
server.use("/applications",applicationRouter)
server.use("/guardians/types",guardianTypeRouter)
server.use("/ai",AiRouter)
server.use("/ai",chatRouter)
server.use("/ai/dataset",datasetChatRouter)
server.use('/ai', whatsAppRouter);
server.use('/langchain/qdrant', router);
server.use('/langchain/qdrant', AIFileRouter);
server.use('/makronexa', userAISettingsRouter);
server.use('/create_checkout_section', stripeRouter);
server.use("/stripe",stripeRouter);
server.use("/fileManager",fileSystemManagement);

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