import { Configuration, OpenAIApi } from "openai";
import express from "express";
import ApplicantModel from "../applicants/model.js";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
//   apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const AiRouter = express.Router();

AiRouter.post("/", async (req, res, next) => {
  try {
    const { message } = req.body;
    
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${message}`,
      max_tokens: 20,
      temperature: 0.5,
    });

    console.log(message);

    res.json({
      message: response.data.choices[0].text,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

export default AiRouter;
