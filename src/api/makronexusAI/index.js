
import { Configuration, OpenAIApi } from "openai";
import express from "express";
import UserModel from "../users/model.js";
import MakronexaQA from "./model.js";
import aiChatModel from "./chats/model.js";
import sequelize from "../../db.js";
import { JWTAuthMiddleware } from "../lib/auth/jwtAuth.js";
import UserAISettingsModel from "./userAISettings/model.js";
const makronexaPersonality=`
Louis Gadza is the owner and CEO at Makronexus tech campany. You're developed at Makronexus and your name is Makronexa
All mathematical expressions and all equations should be written in latex in your response.

You are a Socratic tutor. Use the following principles in responding to students:

- Every time respond Ask thought-provoking, open-ended questions that challenge students' preconceptions and encourage them to engage in deeper reflection and critical thinking.
- Facilitate open and respectful dialogue among students, creating an environment where diverse viewpoints are valued and students feel comfortable sharing their ideas.
- Actively listen to students' responses, paying careful attention to their underlying thought processes and making a genuine effort to understand their perspectives.
- Guide students in their exploration of topics by encouraging them to discover answers independently, rather than providing direct answers, to enhance their reasoning and analytical skills.
- Promote critical thinking by encouraging students to question assumptions, evaluate evidence, and consider alternative viewpoints in order to arrive at well-reasoned conclusions.
- Demonstrate humility by acknowledging your own limitations and uncertainties, modeling a growth mindset and exemplifying the value of lifelong learning.`

const configuration = new Configuration({
  organization:process.env.OPENAI_ORGANIZATION_KEY,
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

export const imageSearch = async (query, page = 1, perPage = 10) => {
  const apiKey = process.env.UNSPLASH_ACCESS_KEY; 
  const apiUrl = `https://api.unsplash.com/search/photos/?query=${query}&page=${page}&per_page=${perPage}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Client-ID ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return data.results; // Return the array of image results
  } catch (error) {
    console.error('Error fetching Unsplash images:', error);
    throw error; // Rethrow the error for handling in the calling code
  }
};

AiRouter.post("/chats/:chat_id/messages", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const { message, user_id, question, model } = req.body;
    const { chat_id } = req.params;
    // Call OpenAI API to generate response
    const response = await openai.createChatCompletion({
      model: model, // Use the correct model name
      messages: [
        {
          role: "system",
          content: `${makronexaPersonality}`
        },
        {
          role: "user",
          content: message,
        }
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    const user = await UserModel.findByPk(user_id);
    const chat = await aiChatModel.findByPk(chat_id);


    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const aiResponseText = response.data.choices[0].message.content;

    // Create a new MakronexaQA instance for the user's input
    const newMakronexaQA = await MakronexaQA.create({
      type: "text",
      message: question,
      from: "user",
      model: "gpt-3.5-turbo",
      user_id: user_id,
      chat_id: chat_id,
      // dataset_id: dataset_id // This can be null
    });

    // Associate the user's input with the user
    await newMakronexaQA.setUser(user);

    // Create a new MakronexaQA instance for the AI response
    const newResponseMakronexaQA = await MakronexaQA.create({
      type: "text",
      message: aiResponseText,
      model: "gpt-3.5-turbo",
      user_id: "5959acb3-5469-459c-9387-f9af3970c853", //cloud
      // user_id: "5217fbc5-0ce1-4d2b-b966-5ce56da155c1",
      chat_id: chat_id,
      // dataset_id: dataset_id // This can be null
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
// AiRouter.post("/chats/:chat_id/image-search", async (req, res, next) => {
//   try {
//     const {user_id } = req.body;
//     const { chat_id } = req.params;
//     const user = await UserModel.findByPk(user_id);
//     const chat = await aiChatModel.findByPk(chat_id);
//     if (!chat) {
//       return res.status(404).json({ error: "Chat not found" });
//     }
//     if(req.body.prompt){
//     const prompt=req.body.prompt
//     // const response=await promptDALLE(prompt)
//     const response=await imageSearch(prompt)
//     const smallImageUrls = response.map((image) => image.urls.small);

//     console.log(response,"smallImageUrls")
//     const newMakronexaQA = await MakronexaQA.create({
//       type: "text",
//       message: prompt,
//       from: "user",
//       model: "dalle",
//       user_id: user_id,
//       chat_id: chat_id,
//     });

//     // Associate the user's input with the user
//     await newMakronexaQA.setUser(user);
//     const responseString = JSON.stringify(smallImageUrls);
//     const newResponseMakronexaQA = await MakronexaQA.create({
//       type: "imageUrl",
//       message: responseString,
//       model: "dalle",
//       user_id: "5959acb3-5469-459c-9387-f9af3970c853", //cloud
//       // user_id: "5217fbc5-0ce1-4d2b-b966-5ce56da155c1",
//       chat_id: chat_id,
//     });
//     console.log(newResponseMakronexaQA, "newResponseMakronexaQA");
//     // res.send({message:response})
//     res.send({ message: responseString });

//   }
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// });


// GOOGLE IMAGE SEARCH
AiRouter.post('/chats/:chat_id/image-search', async (req, res,next) => {
  const apiKey=process.env.GOOGLE_IMAGE_SEARCH_KEY
  const cx=process.env.GOOGLE_IMAGE_SEARCH_ENGINE_ID
  const safeSearch = 'medium';
  const {user_id,query } = req.body;
  const { chat_id } = req.params;
  const user = await UserModel.findByPk(user_id);
    const chat = await aiChatModel.findByPk(chat_id);

  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required.' });
  }
  if (!chat) {
    return res.status(404).json({ error: "Chat not found" });
  }

  const baseUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&searchType=image&q=${query}&safe=${safeSearch}`;

  try {
    const response = await fetch(baseUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    console.log("SAFE SEARCH RESPONSE:",response)

    const data = await response.json();
    const images = data.items.map(item => ({
      title: item.title,
      link: item.link,
      thumbnail: item.image.thumbnailLink,
      context: item.image.contextLink,
    }));
    const newMakronexaQA = await MakronexaQA.create({
      type: "text",
      message: query,
      from: "user",
      model: "dalle",
      user_id: user_id,
      chat_id: chat_id,
    });
    await newMakronexaQA.setUser(user);
    const responseString = JSON.stringify(images);
    const newResponseMakronexaQA = await MakronexaQA.create({
      type: "imageUrl",
      message: responseString,
      model: "dalle",
      user_id: "5959acb3-5469-459c-9387-f9af3970c853", //cloud
      // user_id: "5217fbc5-0ce1-4d2b-b966-5ce56da155c1",
      chat_id: chat_id,
    });
    console.log(newResponseMakronexaQA, "newResponseMakronexaQA");
    res.send({ message: responseString });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'An error occurred while fetching images.' });
  }
});
// GOOGLE IMAGE SEARCH
export default AiRouter;
