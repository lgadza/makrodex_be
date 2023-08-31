
import { Configuration, OpenAIApi } from "openai";
import express from "express";
import ApplicantModel from "../applicants/model.js";
import MakronexaQA from "./model.js";
import aiChatModel from "./chats/model.js";
import sequelize from "../../db.js";
import { JWTAuthMiddleware } from "../lib/auth/jwtAuth.js";

const configuration = new Configuration({
  organization:"org-OteAk3qMx5pQ9EiVVSKsenQG",
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const AiRouter = express.Router();
const promptDALLE=async(prompt)=>{
  try{
    const response=await openai.createImage({
      prompt,
      n:2,
      size:"512x512",
    });
    return response.data.data;
  }catch(error){
    console.log(error)
  }
}
AiRouter.post("/chats/:chat_id/messages",JWTAuthMiddleware, async (req, res, next) => {
  try {
    const { message, applicant_id, question,model } = req.body;
    const { chat_id } = req.params;


        const makronexaPersonality=`
        Louis Gadza is the owner and CEO at Makronexus tech campany. You're developed at Makronexus and your name is Makronexa

        You are a Socratic tutor. Use the following principles in responding to students:

    - Ask thought-provoking, open-ended questions that challenge students' preconceptions and encourage them to engage in deeper reflection and critical thinking.
    - Facilitate open and respectful dialogue among students, creating an environment where diverse viewpoints are valued and students feel comfortable sharing their ideas.
    - Actively listen to students' responses, paying careful attention to their underlying thought processes and making a genuine effort to understand their perspectives.
    - Guide students in their exploration of topics by encouraging them to discover answers independently, rather than providing direct answers, to enhance their reasoning and analytical skills.
    - Promote critical thinking by encouraging students to question assumptions, evaluate evidence, and consider alternative viewpoints in order to arrive at well-reasoned conclusions.
    - Demonstrate humility by acknowledging your own limitations and uncertainties, modeling a growth mindset and exemplifying the value of lifelong learning.`

    // Call OpenAI API to generate response
    const response = await openai.createChatCompletion({
      model: model, // Use the correct model name
      messages:[
        {
          "role":"system","content":`${makronexaPersonality}`
        },
        {
          role:"user",
          content:message,
        }
      ] ,
      max_tokens: 200,
      temperature: 0.8,
    });

    const user = await ApplicantModel.findByPk(applicant_id);
    const chat = await aiChatModel.findByPk(chat_id);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    if (!user) {
      return res.status(404).json({ error: "Applicant not found" });
    }
    function formatMathExpressions(response) {
      const formattedResponse = response
        .replace(/\b(x\^2)\b/g, 'x²')
        .replace(/\b(x\^\d+)\b/g, 'x<sup>$1</sup>')
        .replace(/\b(-\d+)\b/g, '₋$1')
        .replace(/\(([^()]+)\)\(([^()]+)\)/g, '($1)($2)');
    
      return formattedResponse;
    }
    
    const aiResponseText = response.data.choices[0].message.content;
    const formattedResponse = formatMathExpressions(aiResponseText);

    // Create a new MakronexaQA instance for the user's input
    const newMakronexaQA = await MakronexaQA.create({
      type: "text",
      message: question,
      from: "user",
      model: "gpt-3.5-turbo",
      user_id: applicant_id,
      chat_id: chat_id,
    });

    // Associate the user's input with the applicant
    await newMakronexaQA.setApplicant(user);

    // Create a new MakronexaQA instance for the AI response
    const newResponseMakronexaQA = await MakronexaQA.create({
      type: "text",
      message: formattedResponse,
      model: "gpt-3.5-turbo",
      user_id: "adf0fea2-3693-4385-ab0f-bb3b81a20279",
      // user_id: "5217fbc5-0ce1-4d2b-b966-5ce56da155c1",
      chat_id: chat_id,
    });

    console.log(newResponseMakronexaQA, "newResponseMakronexaQA");

    res.json({
      message: formattedResponse,
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
AiRouter.post("/chats/:chat_id/image-search", async (req, res, next) => {
  try {
    const { message, applicant_id,model } = req.body;
    const { chat_id } = req.params;
    const user = await ApplicantModel.findByPk(applicant_id);
    const chat = await aiChatModel.findByPk(chat_id);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }
    if(req.body.prompt){
    const prompt=req.body.prompt
    const response=await promptDALLE(prompt)
    const newMakronexaQA = await MakronexaQA.create({
      type: "text",
      message: prompt,
      from: "user",
      model: "dalle",
      user_id: applicant_id,
      chat_id: chat_id,
    });

    // Associate the user's input with the applicant
    await newMakronexaQA.setApplicant(user);
    const responseString = JSON.stringify(response);
    const newResponseMakronexaQA = await MakronexaQA.create({
      type: "imageUrl",
      message: responseString,
      model: "dalle",
      user_id: "adf0fea2-3693-4385-ab0f-bb3b81a20279",
      chat_id: chat_id,
    });
    console.log(newResponseMakronexaQA, "newResponseMakronexaQA");
    res.send({message:responseString})
  }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

AiRouter.get("/chats/messages",JWTAuthMiddleware, async (req, res, next) => {
  try {
    const messages = await MakronexaQA.findAll();
    res.json(messages);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

export default AiRouter;
