import { Client } from "whatsapp-web.js";
import sequelize from "../../../db.js";
import qrcode from "qrcode-terminal"
import { Configuration,OpenAIApi } from "openai";
import { makronexaPersonality } from "../../utils/data.js";
import express from "express";
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {ConversationChain} from "langchain/chains"
import { BufferMemory } from 'langchain/memory';
import {
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
} from 'langchain/prompts';
import UserModel from "../../users/model.js";
const Op = sequelize.Op;
// import fetch from 'node-fetch';
const client=new Client()
const whatsAppRouter=express.Router()
const token = process.env.WHATSAPP_VERIFY_TOKEN;

const configuration = new Configuration({
  organization:process.env.OPENAI_ORGANIZATION_KEY,
  apiKey: process.env.OPENAI_API_KEY,
});

  const openai = new OpenAIApi(configuration);
export const sendWhatsAppMessageWithTemplate= async(url, headers, phone,name,languageCode="en_US")=> {
  const messagePayload = {
    "messaging_product": "whatsapp",
    "to": phone, 
    "type": "template",
    "template": {
      "name": name,
      "language": {
        "code": languageCode
      }
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(messagePayload),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    } else {
      throw new Error('API request failed');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}



  whatsAppRouter.get('/webhooks', (req, res) => {
    if (
      req.query['hub.mode'] == 'subscribe' &&
      req.query['hub.verify_token'] == token
    ) {
      res.send(req.query['hub.challenge']);
    } else {
      res.sendStatus(400);
    }
  });
  whatsAppRouter.post('/whatsapp-message', async (req, res) => {
    try {
    const phone="+48794144892"
    const url = process.env.BUSINESS_WHATSAPP_URL;
    const headers = {
      'Authorization': `Bearer ${process.env.BUSINESS_WHATSAPP_BEARER_TOKEN}`, 
      'Content-Type': 'application/json',
    }; 
  
 sendWhatsAppMessageWithTemplate(url,headers,phone,"makronexus_intro","en")
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


whatsAppRouter.post('/webhooks', async (req, res) => {
  try {
    const chat = new ChatOpenAI({ temperature: 0 });
      const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(
        `You are a Socratic tutor. Use the following principles in responding to students:\n
        - Ask thought-provoking, open-ended questions that challenge students' preconceptions and encourage them to engage in deeper reflection and critical thinking.\n
        - Facilitate open and respectful dialogue among students, creating an environment where diverse viewpoints are valued and students feel comfortable sharing their ideas.\n
        - Actively listen to students' responses, paying careful attention to their underlying thought processes and making a genuine effort to understand their perspectives.\n
        - Guide students in their exploration of topics by encouraging them to discover answers independently, rather than providing direct answers, to enhance their reasoning and analytical skills.\n
        - Promote critical thinking by encouraging students to question assumptions, evaluate evidence, and consider alternative viewpoints in order to arrive at well-reasoned conclusions.\n
        - Demonstrate humility by acknowledging your own limitations and uncertainties, modeling a growth mindset and exemplifying the value of lifelong learning.`
      ),
      new MessagesPlaceholder('history'),
      HumanMessagePromptTemplate.fromTemplate('{input}'),
    ]);
    const chain = new ConversationChain({
      memory: new BufferMemory({ returnMessages: true, memoryKey: 'history' }),
      prompt: chatPrompt,
      llm: chat,
    });
    
    const bodyParam = req.body;
    console.log(JSON.stringify(bodyParam, null, 2));

    if (isValidWebhookRequest(bodyParam)) {
      
      const messageData = extractMessageData(bodyParam);

      if (messageData) {
        const { from, text } = messageData;
const user = await UserModel.findOne({
  where: {
    [Op.and]: [
      sequelize.literal(`CONCAT(country_code, phone_number) = '+${from}'`),
    ],
  },
});
if(!user){
  const url = process.env.BUSINESS_WHATSAPP_URL;
  const headers = {
    'Authorization': `Bearer ${process.env.BUSINESS_WHATSAPP_BEARER_TOKEN}`,
    'Content-Type': 'application/json',
  };
sendWhatsAppMessageWithTemplate(url,headers,"+"+from,"call_to_register","en_US")
}

        // const response = await openai.createChatCompletion({
        //   model: "gpt-3.5-turbo", 
        //   messages:[
        //     {
        //       "role":"system","content":`${makronexaPersonality}`
        //     },
        //     {
        //       role:"user",
        //       content:text,
        //     }
        //   ] ,
        //   max_tokens: 300,
        //   temperature: 0.8,
        // });
        const response = await chain.call({
      input: text,
    });
        const replyMessage = response

        // Send a reply message
        await sendWhatsAppMessage(from, replyMessage);
        res.status(200).json({ message: 'Message sent' });
        console.log("YES MESSAGE SENT");
      } else {
        res.status(400).json({ error: 'Invalid message data' });
        console.log("Invalid message data");
      }
    } else {
      res.status(403).json({ error: 'Invalid webhook request' });
      console.log("Invalid webhook request");
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    console.log("Internal Server Error");
  }
});

function isValidWebhookRequest(body) {
  return (
    body &&
    body.entry &&
    Array.isArray(body.entry) &&
    body.entry.length > 0 &&
    body.entry[0].changes &&
    Array.isArray(body.entry[0].changes) &&
    body.entry[0].changes.length > 0 &&
    body.entry[0].changes[0].value &&
    body.entry[0].changes[0].value.messages &&
    Array.isArray(body.entry[0].changes[0].value.messages) &&
    body.entry[0].changes[0].value.messages.length > 0 &&
    body.entry[0].changes[0].value.messages[0].text &&
    body.entry[0].changes[0].value.messages[0].text.body
  );
}

function extractMessageData(body) {
  const message = body.entry[0].changes[0].value.messages[0];
  const from = message.from;
  const text = message.text.body;

  return { from, text };
}

async function sendWhatsAppMessage(recipient, message) {
  const url = process.env.BUSINESS_WHATSAPP_URL;
  const headers = {
    'Authorization': `Bearer ${process.env.BUSINESS_WHATSAPP_BEARER_TOKEN}`,
    'Content-Type': 'application/json',
  };

  const messagePayload = {
    "messaging_product": "whatsapp",
    "to": "+" + recipient,
    "text": { "body": message },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(messagePayload),
  });

  console.log(response, "RESPONSE");

  if (response.ok) {
    const responseData = await response.json();
    return responseData;
  } else {
    throw new Error('API request failed');
  }
}


  export default whatsAppRouter