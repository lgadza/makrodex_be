import express from "express";
import MakronexaQA from "../model.js";
import aiChatModel from "./model.js";
import ApplicantModel from "../../applicants/model.js";

const chatRouter = express.Router();

// Get all chats
chatRouter.get("/:user_id/chat", async (req, res, next) => {
  
  try {
    const {user_id}=req.params
  const user=await ApplicantModel.findByPk(user_id)
  if(!user){return res.status(404).json({error:"User not found!"})}
    const chats = await aiChatModel.findAll();
    res.json(chats);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Create a new chat
chatRouter.post("/:user_id/chat", async (req, res, next) => {
  try {
    const {user_id}=req.params
    const user=await ApplicantModel.findByPk(user_id)
    if(!user){return res.status(404).json({error:"User not found!"})}
    const newChat = await aiChatModel.create();
    await user.addAiChat(newChat);
    res.json(newChat);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Get all messages in a chat
chatRouter.get("/:user_id/chat/:chatId/messages", async (req, res, next) => {
  try {
    const { chatId } = req.params;

    const chat = await aiChatModel.findByPk(chatId, {
      include: MakronexaQA,
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json(chat. MakronexaQAs);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Add other chat-related routes (update, delete, etc.)

export default chatRouter;
