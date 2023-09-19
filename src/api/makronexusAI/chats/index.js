import express from "express";
import MakronexaQA from "../model.js";
import aiChatModel from "./model.js";
import UserModel from "../../users/model.js";
import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js";

const chatRouter = express.Router();

// Get all chat messages
chatRouter.get("/:user_id/chats/:chat_id",JWTAuthMiddleware, async (req, res, next) => {
  
  try {
    const {user_id,chat_id}=req.params
  const user=await UserModel.findByPk(user_id)
  if(!user){return res.status(404).json({error:"User not found!"})}

    const chat = await aiChatModel.findAll({include:{
      model: MakronexaQA,
        where: {
          chat_id: chat_id,
        },
      order: [["createdAt", "ASC"]],//"DESC"
    } 
  });
  if (chat.length===0) {
    return res.status(404).json({ error: "No messages available for this chat" });
  }
    res.json(chat);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Create a new chat
chatRouter.post("/:user_id/chats",JWTAuthMiddleware, async (req, res, next) => {
  try {
    const {user_id}=req.params
    const user=await UserModel.findByPk(user_id)
    if(!user){return res.status(404).json({error:"User not found!"})}
    const newChat = await aiChatModel.create();
    await user.addAiChat(newChat);
    res.json(newChat);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Get all chats for a specific user
chatRouter.get("/:user_id/chats",JWTAuthMiddleware, async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const user = await UserModel.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }
    const chats = await aiChatModel.findAll( {
      include: {
        model: MakronexaQA,
        where: {
          user_id: user_id,
        },
      },
    });
    if (chats.length === 0) {
      return res.status(404).json({ error: "No Chats available, create a new chat" });
    }
    res.json(chats);
  
  } catch (error) {
    console.error(error);
    next(error);
  }
});
// Delete a chat
chatRouter.delete("/:user_id/chats/:chat_id",JWTAuthMiddleware, async (req, res, next) => {
  try {
    const { chat_id, user_id } = req.params;
if(!user_id){
  return res.status(404).json({error:"User not found"})
}
const relatedQAs = await MakronexaQA.findAll({
  where: { chat_id: chat_id,user_id:user_id },
});

for (const qa of relatedQAs) {
  await qa.destroy(); // Or update references if needed
}

    const deletedChat = await aiChatModel.destroy({ where: { id: chat_id }});

    if (deletedChat === 0) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error(error);
    next(error);
  }
});



export default chatRouter;
