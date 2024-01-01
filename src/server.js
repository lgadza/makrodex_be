import express from "express"
import cors from "cors"
import http from 'http';
import { Server } from "socket.io";
import morgan from "morgan";
import dotenv from "dotenv";
import { initializeSocket } from "./socket.js";
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
import messageRouter from "./api/messages/dual_messages/index.js";
import conversationRouter from "./api/messages/conversations/index.js";
import messengerParticipantRouter from "./api/messages/participants/index.js";
import usageRouter from "./api/makronexusAI/ai_usage/index.js";
import postRouter from "./api/connect_makronexus/posts/index.js";
import commentRouter from "./api/connect_makronexus/comments/index.js";
import followRouter from "./api/connect_makronexus/follows/index.js";
import groupRouter from "./api/connect_makronexus/groups/index.js";
import requestRouter from "./api/connect_makronexus/requests/index.js";
import groupMembershipRouter from "./api/connect_makronexus/group_memberships/index.js";
import categoriesRouter from "./api/educational_entities/categories/index.js";
import formRouter from "./api/educational_entities/forms/index.js";
import schoolLevelRouter from "./api/educational_entities/school_levels/index.js";
import subjectLevelRouter from "./api/educational_entities/subject_levels/index.js";
import subjectRouter from "./api/educational_entities/subjects/index.js";
import likeRouter from "./api/connect_makronexus/likes/index.js";
import mediaRouter from "./api/connect_makronexus/media/index.js";

// Load environment variables
dotenv.config();

const server = express()
const port = process.env.PORT || 3001 
// Create an HTTP server and pass the Express app
const httpServer = http.createServer(server);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:300'],
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log('Socket.IO client connected');
  initializeSocket(io); // Pass the io instance to your function
});

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
server.use(morgan('dev'));

// ********************************** ENDPOINTS ****************************************

server.use("/users",userRouter)
server.use("/categories",categoriesRouter)
server.use("/forms",formRouter)
server.use("/school_levels",schoolLevelRouter)
server.use("/subject_levels",subjectLevelRouter)
server.use("/subjects",subjectRouter)
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
// server.use('/create_checkout_section', stripeRouter);
// server.use("/stripe",stripeRouter);
// server.use("/file",fileSystemManagement);
// server.use("/messages",messageRouter);
// server.use("/conversations",conversationRouter);
// server.use("/messenger",messengerParticipantRouter);
// server.use("/ai_usage",usageRouter)
// server.use("/ai_usage",usageRouter)
// server.use("/settings",userSettingsRouter)
server.use("/posts",postRouter)
server.use("/comments",commentRouter)
server.use("/follows",followRouter)
server.use("/likes",likeRouter)
server.use("/groups",groupRouter)
server.use("/follow_request",requestRouter)
server.use("/group_membership",groupMembershipRouter)
server.use("/media",mediaRouter)

// ******************************* ERROR HANDLERS **************************************
server.use(badRequestErrorHandler)
server.use(notFoundErrorHandler)
server.use(unauthorizedErrorHandler)
server.use(forbiddenErrorHandler)
server.use(genericErrorHandler)

await pgConnect()
await syncModels()

httpServer.listen(port, () => {
  console.table(listEndpoints(server));
  console.log(`Server is running on port ${port}`);
});