import { Client } from "whatsapp-web.js";
import qrcode from "qrcode-terminal"
import { Configuration,OpenAIApi } from "openai";
import { makronexaPersonality } from "../../utils/data.js";
import express from "express";
// import fetch from 'node-fetch';
const client=new Client()
const whatsAppRouter=express.Router()
const token = process.env.WHATSAPP_VERIFY_TOKEN;
const configuration = new Configuration({
  organization:process.env.OPENAI_ORGANIZATION_KEY,
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
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
    
    const url = process.env.BUSINESS_WHATSAPP_URL;
    const headers = {
      'Authorization': `Bearer ${process.env.BUSINESS_WHATSAPP_BEARER_TOKEN}`, 
      'Content-Type': 'application/json',
    };

    
    const messagePayload = {
      "messaging_product": "whatsapp",
      "to": "+48794144892", 
      "type": "template",
      "template": {
        "name": "hello_world",
        "language": {
          "code": "en_US"
        }
      }
    };

    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(messagePayload),
    });

 
    if (response.ok) {
      const responseData = await response.json();
      res.status(response.status).json(responseData);
    } else {
      res.status(response.status).json({ error: 'API request failed',response });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


whatsAppRouter.post('/webhooks', async (req, res) => {
  try {
    const bodyParam = req.body;
    console.log(JSON.stringify(bodyParam, null, 2));

    // Handle incoming messages
    if (isValidWebhookRequest(bodyParam)) {
      
      const messageData = extractMessageData(bodyParam);

      if (messageData) {
        const { from, text } = messageData;

        const response = await openai.createChatCompletion({
          model: "gpt-3.5-turbo", 
          messages:[
            {
              "role":"system","content":`${makronexaPersonality}`
            },
            {
              role:"user",
              content:text,
            }
          ] ,
          max_tokens: 300,
          temperature: 0.8,
        });
        
        const replyMessage = response.data.choices[0].message.content;

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