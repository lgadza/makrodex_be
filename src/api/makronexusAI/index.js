import { Configuration, OpenAIApi } from "openai";
import express from "express";
import ApplicantModel from "../applicants/model.js";
import MakronexaQA from "./model.js";
import AiResponse from "./aiResponseModel.js";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,

});
const openai = new OpenAIApi(configuration);

const AiRouter = express.Router();

AiRouter.post("/", async (req, res, next) => {
  try {
    const { message,model } = req.body;
    console.log(model,"MODEL")
    const response = await openai.createCompletion({
      model: `${model}`,
      prompt: `${message}`,
      max_tokens: 20,
      temperature: 0.5,
    });
    const newMakronexaQA = await MakronexaQA.create({
      type: "text", // Assuming it's always text
      content: message,
      model: model,
    });
    console.log(message);
    const newAiResponse = await AiResponse.create({
      type: "text",
      content: response.data.choices[0].text,
      model: model,
    });
      // Associate the AI response with the original message
      await newMakronexaQA.setAiResponse(newAiResponse);

      // Associate the original message with the Applicant
      await newMakronexaQA.setApplicant(ApplicantModel);
    res.json({
      message: response.data.choices[0].text,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});
AiRouter.get("/models",async(req,res,next)=>{
  const response=await openai.listEngines()
  res.json({models:response.data.data})
})

export default AiRouter;
