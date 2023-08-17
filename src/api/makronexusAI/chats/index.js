import express from "express";
import MakronexaQA from "../model.js";
import aiChatModel from "./model.js";
import ApplicantModel from "../../applicants/model.js";

const chatRouter = express.Router();

// Get all chat messages
chatRouter.get("/:user_id/chats/:chat_id", async (req, res, next) => {
  
  try {
    const {user_id,chat_id}=req.params
    const chat=await aiChatModel.findByPk(chat_id)
  const user=await ApplicantModel.findByPk(user_id)
  if(!user || !chat){return res.status(404).json({error:"User or Chat not found!"})}

    const chats = await aiChatModel.findByPk(chat_id,{include:{

      model:MakronexaQA,
      order: [["createdAt", "ASC"]],//"DESC"
    } 
  });
    res.json(chats);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Create a new chat
chatRouter.post("/:user_id/chats", async (req, res, next) => {
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

// Get all chats
chatRouter.get("/:user_id/chats", async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const user = await ApplicantModel.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }
    const chats = await aiChatModel.findAll( {
      include: MakronexaQA,
    });
    if(chats){
      res.json(chats);
    }else(
      res.status(404).json({error:"No Chats available, make new chat"})
    )
  } catch (error) {
    console.error(error);
    next(error);
  }
});
// Delete a chat
chatRouter.delete("/:user_id/chats/:chat_id", async (req, res, next) => {
  try {
    const { chat_id, user_id } = req.params;
if(!user_id){
  return res.status(404).json({error:"User not found"})
}
const relatedQAs = await MakronexaQA.findAll({
  where: { chat_id: chat_id },
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
