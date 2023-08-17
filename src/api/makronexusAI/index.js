
import { Configuration, OpenAIApi } from "openai";
import express from "express";
import ApplicantModel from "../applicants/model.js";
import MakronexaQA from "./model.js";
import aiChatModel from "./chats/model.js";
import sequelize from "../../db.js";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const AiRouter = express.Router();

AiRouter.post("/chats/:chat_id/messages", async (req, res, next) => {
  

  try {
    const { message, model, applicant_id, question } = req.body;
    const { chat_id } = req.params;

    // Call OpenAI API to generate response
    const response = await openai.createCompletion({
      model: model,
      prompt: message,
      max_tokens: 20,
      temperature: 0.5,
    });
    const user=await ApplicantModel.findByPk(applicant_id)
    const chat = await aiChatModel.findByPk(chat_id);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }
     if(!user) return res.status(404).json({error:"Applicant not found"})
    const aiResponseText = response.data.choices[0].text;

    // Create a new MakronexaQA instance for the user's input
    const newMakronexaQA = await MakronexaQA.create({
      type: "text",
      message: question,
      from:"user",
      model: model,
      user_id: applicant_id,
      chat_id: chat_id,
    });

    // Associate the user's input with the applicant
    const applicant = await ApplicantModel.findByPk(applicant_id);
    await newMakronexaQA.setApplicant(applicant);

    // Create a new MakronexaQA instance for the AI response
    const newResponseMakronexaQA = await MakronexaQA.create({
      type: "text",
      message: aiResponseText.trim(),
      model: model,
      user_id: "36f23860-1052-40bd-886d-c3b96970e215",
      chat_id: chat_id,
    });
   
    console.log(newResponseMakronexaQA, "newResponseMakronexaQA");

    res.json({
      message: aiResponseText,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

AiRouter.get("/models", async (req, res, next) => {
  try {
    const response = await openai.listEngines();
    res.json({ models: response.data.data });
  } catch (error) {
    console.error(error);
    next(error);
  }
});


// Get all messages
AiRouter.get("/chats/messages", async (req, res, next) => {
  try {
    const messages = await MakronexaQA.findAll();
    res.json(messages);
  } catch (error) {
    console.error(error);
    next(error);
  }
});




export default AiRouter;
